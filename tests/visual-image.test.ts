import { Buffer } from 'node:buffer';
import { crc32, deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { readPngDensity, withPngDensity } from './visual/png-density';

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function chunk(type: string, data = Buffer.alloc(0)): Buffer {
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length, 0);
  result.write(type, 4, 'ascii');
  data.copy(result, 8);
  result.writeUInt32BE(crc32(result.subarray(4, -4)), result.length - 4);
  return result;
}
const header = Buffer.from('00000001000000010806000000', 'hex');
const ihdr = chunk('IHDR', header);
const compressed = deflateSync(Buffer.from([0, 32, 64, 96, 255]));
// Split IDAT verifies that stamping preserves individual chunks, not just decoded pixels.
const idat = [chunk('IDAT', compressed.subarray(0, 5)), chunk('IDAT', compressed.subarray(5))];
const text = chunk('tEXt', Buffer.from('Comment\0Visual reference'));
const iend = chunk('IEND');
const png = Buffer.concat([signature, ihdr, text, ...idat, iend]);
function physical(x: number, y: number, unit = 1): Buffer {
  const data = Buffer.alloc(9);
  data.writeUInt32BE(x, 0);
  data.writeUInt32BE(y, 4);
  data[8] = unit;
  return chunk('pHYs', data);
}
function image(...parts: Buffer[]): Buffer {
  return Buffer.concat([signature, ...parts]);
}

describe('PNG physical resolution', () => {
  it('reads missing and existing square or non-square density', () => {
    expect(readPngDensity(png)).toBeUndefined();
    expect(readPngDensity(image(ihdr, physical(3780, 1890, 0), ...idat, iend))).toEqual({ x: 3780, y: 1890, unit: 0 });
  });

  it('inserts 300 DPI after IHDR with a correct CRC and unchanged image chunks', () => {
    const original = Buffer.from(png);
    const result = withPngDensity(png, 300);
    expect(readPngDensity(result)).toEqual({ x: 11811, y: 11811, unit: 1 });
    expect(result.subarray(0, 33)).toEqual(png.subarray(0, 33));
    expect(result.toString('ascii', 37, 41)).toBe('pHYs');
    expect(result.readUInt32BE(33)).toBe(9);
    expect(result.readUInt32BE(50)).toBe(crc32(result.subarray(37, 50)));
    expect(result.subarray(54)).toEqual(png.subarray(33));
    for (const dataChunk of idat) expect(result.includes(dataChunk)).toBe(true);
    expect(png).toEqual(original);
  });

  it('replaces an existing density and moves it immediately after IHDR', () => {
    const source = image(ihdr, text, physical(2835, 2835), ...idat, iend);
    const result = withPngDensity(source, 300);
    expect(result).toEqual(withPngDensity(png, 300));
    expect(readPngDensity(result)).toEqual({ x: 11811, y: 11811, unit: 1 });
  });

  it('is byte-for-byte idempotent and rounds fractional DPI', () => {
    const first = withPngDensity(png, 96.5);
    expect(readPngDensity(first)).toEqual({ x: 3799, y: 3799, unit: 1 });
    expect(withPngDensity(first, 96.5)).toEqual(first);
    expect(readPngDensity(withPngDensity(first, 300))?.x).toBe(11811);
  });

  it.each([0, -1, NaN, Infinity, -Infinity, Number.MAX_VALUE, 0.0001, 0x100000000 * 0.0254])('rejects invalid DPI %s', dpi => {
    expect(() => withPngDensity(png, dpi)).toThrow(RangeError);
  });

  const wrongCrc = Buffer.from(png);
  wrongCrc[wrongCrc.length - 1] ^= 1;
  const tooLong = Buffer.from(png);
  tooLong.writeUInt32BE(0x7fffffff, 8);
  const zeroWidth = Buffer.from(header);
  zeroWidth.writeUInt32BE(0, 0);
  const invalidDepth = Buffer.from(header);
  invalidDepth[8] = 3;
  it.each([
    ['empty input', Buffer.alloc(0)],
    ['wrong signature', Buffer.concat([Buffer.alloc(8), png.subarray(8)])],
    ['truncated header', png.subarray(0, 12)],
    ['truncated chunk', png.subarray(0, -2)],
    ['missing IEND', png.subarray(0, -12)],
    ['bad CRC', wrongCrc],
    ['oversized chunk', tooLong],
    ['IHDR not first', image(text, ihdr, ...idat, iend)],
    ['duplicate IHDR', image(ihdr, ihdr, ...idat, iend)],
    ['short IHDR', image(chunk('IHDR', header.subarray(0, 12)), ...idat, iend)],
    ['zero image width', image(chunk('IHDR', zeroWidth), ...idat, iend)],
    ['invalid bit depth', image(chunk('IHDR', invalidDepth), ...idat, iend)],
    ['missing IDAT', image(ihdr, iend)],
    ['nonconsecutive IDAT', image(ihdr, idat[0], text, idat[1], iend)],
    ['invalid chunk type', image(ihdr, chunk('te?t'), ...idat, iend)],
    ['short pHYs', image(ihdr, chunk('pHYs', Buffer.alloc(8)), ...idat, iend)],
    ['invalid density unit', image(ihdr, physical(1, 1, 2), ...idat, iend)],
    ['duplicate pHYs', image(ihdr, physical(1, 1), physical(2, 2), ...idat, iend)],
    ['pHYs after IDAT', image(ihdr, ...idat, physical(1, 1), iend)],
    ['nonempty IEND', image(ihdr, ...idat, chunk('IEND', Buffer.from([0])))],
    ['trailing bytes', Buffer.concat([png, Buffer.from([0])])],
  ])('rejects malformed PNG: %s', (_name, malformed) => {
    expect(() => readPngDensity(malformed)).toThrow(/PNG/);
    expect(() => withPngDensity(malformed, 300)).toThrow(/PNG/);
  });
});

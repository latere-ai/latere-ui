import { crc32 } from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const UINT32_MAX = 0xffffffff;

type Chunk = { type: string; bytes: Buffer; data: Buffer };
export type PngDensity = { x: number; y: number; unit: number };

/** Validate the PNG container and CRCs before reading or changing metadata. */
function chunks(png: Buffer): Chunk[] {
  if (png.length < SIGNATURE.length || !png.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }
  const result: Chunk[] = [];
  let offset = 8;
  let seenImage = false;
  let imageEnded = false;
  let seenDensity = false;
  while (offset < png.length) {
    if (png.length - offset < 12) throw new Error('Truncated PNG chunk');
    const length = png.readUInt32BE(offset);
    if (length > 0x7fffffff || length > png.length - offset - 12) {
      throw new Error('Invalid PNG chunk length');
    }
    const end = offset + length + 12;
    const type = png.toString('ascii', offset + 4, offset + 8);
    if (!/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type) ||
        png.subarray(offset + 4, offset + 8).some(byte => byte > 127)) {
      throw new Error('Invalid PNG chunk type');
    }
    if (crc32(png.subarray(offset + 4, end - 4)) !== png.readUInt32BE(end - 4)) {
      throw new Error(`Invalid PNG ${type} CRC`);
    }
    const data = png.subarray(offset + 8, end - 4);
    if (!result.length && type !== 'IHDR') throw new Error('PNG must start with IHDR');
    if (type === 'IHDR') {
      if (result.length || length !== 13) throw new Error('Invalid PNG IHDR');
      const width = data.readUInt32BE(0);
      const height = data.readUInt32BE(4);
      const depths: Record<number, number[]> = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
      if (!width || !height || width > 0x7fffffff || height > 0x7fffffff ||
          !depths[data[9]]?.includes(data[8]) || data[10] !== 0 || data[11] !== 0 || data[12] > 1) {
        throw new Error('Invalid PNG image header');
      }
    }
    if (type === 'pHYs') {
      if (seenDensity || seenImage || length !== 9 || data[8] > 1) throw new Error('Invalid PNG pHYs');
      seenDensity = true;
    }
    if (type === 'IDAT') {
      if (imageEnded) throw new Error('PNG IDAT chunks must be consecutive');
      seenImage = true;
    } else if (seenImage) imageEnded = true;
    result.push({ type, bytes: png.subarray(offset, end), data });
    if (type === 'IEND') {
      if (length !== 0 || !seenImage || end !== png.length) throw new Error('Invalid PNG IEND');
      return result;
    }
    offset = end;
  }
  throw new Error('PNG is missing IEND');
}

/** Return physical pixel density, or undefined when the PNG has no pHYs chunk. */
export function readPngDensity(png: Buffer): PngDensity | undefined {
  const density = chunks(png).find(chunk => chunk.type === 'pHYs');
  return density ? { x: density.data.readUInt32BE(0), y: density.data.readUInt32BE(4), unit: density.data[8] } : undefined;
}

/** Set physical DPI without changing rendered pixels or any non-density chunks. */
export function withPngDensity(png: Buffer, dpi: number): Buffer {
  const pixelsPerMetre = Math.round(dpi / 0.0254);
  if (!Number.isFinite(dpi) || dpi <= 0 || pixelsPerMetre < 1 || pixelsPerMetre > UINT32_MAX) {
    throw new RangeError('PNG DPI must be positive and representable as pixels per metre');
  }
  const source = chunks(png);
  const density = Buffer.alloc(21);
  density.writeUInt32BE(9, 0);
  density.write('pHYs', 4, 'ascii');
  density.writeUInt32BE(pixelsPerMetre, 8);
  density.writeUInt32BE(pixelsPerMetre, 12);
  density[16] = 1;
  density.writeUInt32BE(crc32(density.subarray(4, 17)), 17);
  return Buffer.concat([
    SIGNATURE,
    source[0].bytes,
    density,
    ...source.slice(1).filter(chunk => chunk.type !== 'pHYs').map(chunk => chunk.bytes),
  ]);
}

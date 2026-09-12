import { describe, expect, it } from 'vitest';
import { PNG } from 'pngjs';
import { comparePixels } from './visual/exact-pixels';
import { withPngDensity } from './visual/png-density';

const encode = (values: number[], width = values.length / 4) => PNG.sync.write({ width, height: 1, data: Buffer.from(values) } as PNG);
describe('exact image comparison', () => {
  it('compares pixels rather than PNG compression or density metadata', () => {
    const png = encode([50, 60, 70, 255]);
    expect(comparePixels(png, withPngDensity(png, 300)).changedPixels).toBe(0);
  });
  it.each([0, 1, 2, 3])('rejects a one-level change to channel %i of one pixel', channel => {
    const pixels = [100, 100, 100, 255, 40, 50, 60, 200];
    const changed = [...pixels]; changed[4 + channel] -= 1;
    const result = comparePixels(encode(pixels), encode(changed));
    expect(result.equal).toBe(false);
    expect(result.changedPixels).toBe(1);
    expect(result.firstDifference).toEqual({ x: 1, y: 0, expected: pixels.slice(4), actual: changed.slice(4) });
    expect(PNG.sync.read(result.diff!).data.subarray(4, 8)).toEqual(Buffer.from([255, 0, 255, 255]));
  });
  it('does not ignore antialiased edges or transparent color channels', () => {
    expect(comparePixels(encode([0, 0, 0, 0]), encode([1, 0, 0, 0])).equal).toBe(false);
  });
  it('rejects different dimensions even with identical RGBA byte sequences', () => {
    const a = encode([1, 2, 3, 255, 1, 2, 3, 255]);
    const b = PNG.sync.write({ width: 1, height: 2, data: PNG.sync.read(a).data } as PNG);
    expect(comparePixels(a, b).equal).toBe(false);
    expect(comparePixels(a, b).message).toContain('2×1');
  });
  it('rejects corrupt image data', () => {
    expect(() => comparePixels(Buffer.from('invalid'), encode([0, 0, 0, 255]))).toThrow();
  });
});

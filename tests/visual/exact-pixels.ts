import { PNG } from 'pngjs';

export function comparePixels(expected: Buffer, actual: Buffer) {
  const a = PNG.sync.read(expected); const b = PNG.sync.read(actual);
  if (a.width !== b.width || a.height !== b.height) return {
    equal: false, changedPixels: Math.max(a.width * a.height, b.width * b.height),
    message: `Dimensions differ: expected ${a.width}×${a.height}, actual ${b.width}×${b.height}`,
    firstDifference: undefined, diff: undefined,
  };
  if (a.data.equals(b.data)) return { equal: true, changedPixels: 0, message: 'All RGBA pixels are identical', firstDifference: undefined, diff: undefined };
  let changedPixels = 0;
  let firstDifference: { x: number; y: number; expected: number[]; actual: number[] } | undefined;
  const diff = new PNG({ width: a.width, height: a.height });
  for (let i = 0; i < a.data.length; i += 4) {
    const changed = a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3];
    if (changed) {
      changedPixels++;
      firstDifference ??= { x: (i / 4) % a.width, y: Math.floor(i / 4 / a.width), expected: [...a.data.subarray(i, i + 4)], actual: [...b.data.subarray(i, i + 4)] };
      diff.data.set([255, 0, 255, 255], i);
    } else {
      const gray = Math.round((a.data[i] + a.data[i + 1] + a.data[i + 2]) / 6 + 127);
      diff.data.set([gray, gray, gray, 255], i);
    }
  }
  return { equal: changedPixels === 0, changedPixels, firstDifference,
    message: changedPixels ? `${changedPixels} pixels differ; first at (${firstDifference!.x}, ${firstDifference!.y}): ${firstDifference!.expected} → ${firstDifference!.actual}` : 'All RGBA pixels are identical',
    diff: changedPixels ? PNG.sync.write(diff) : undefined,
  };
}

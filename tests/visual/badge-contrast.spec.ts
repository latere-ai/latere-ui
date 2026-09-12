import { expect, test } from '@playwright/test';

for (const framework of ['vue', 'react']) {
  for (const theme of ['light', 'dark']) {
    test(`${framework} ${theme} badge labels meet default text contrast`, async ({ page }) => {
      await page.goto(`/?framework=${framework}&scenario=feedback&theme=${theme}`);
      const badges = page.locator('[data-component="GlassBadge"] .lu-badge');
      await expect(badges.first()).toBeVisible();
      const values = await badges.evaluateAll(elements => {
        function rgba(value: string): number[] {
          const channels = value.match(/[\d.]+/g)!.map(Number);
          return [channels[0], channels[1], channels[2], channels[3] ?? 1];
        }
        function composite(front: number[], back: number[]): number[] {
          return front.slice(0, 3).map((channel, i) => channel * front[3] + back[i] * (1 - front[3]));
        }
        function luminance(color: number[]): number {
          const linear = color.slice(0, 3).map(channel => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        }
        return elements.map(element => {
          const ancestors: Element[] = [];
          for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node);
          const background = ancestors.reduce((color, ancestor) => composite(rgba(getComputedStyle(ancestor).backgroundColor), color), [255, 255, 255]);
          const ink = rgba(getComputedStyle(element).color);
          const light = luminance(composite(ink, background));
          const dark = luminance(background);
          return {
            tone: element.textContent!.trim(), solid: element.classList.contains('is-solid'),
            ratio: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
          };
        });
      });
      for (const solid of [false, true]) {
        expect(new Set(values.filter(value => value.solid === solid).map(value => value.tone)).size).toBe(6);
      }
      for (const value of values) {
        expect.soft(value.ratio, `${value.tone}, ${value.solid ? 'solid' : 'glass'}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
}

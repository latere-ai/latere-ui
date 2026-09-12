import { test, expect, visit, setPreferences } from './fixtures';

for (const theme of ['light', 'dark']) {
  for (const reducedTransparency of [false, true]) {
    test(`tooltip text contrast in ${theme}${reducedTransparency ? ' with reduced transparency' : ''}`, async ({ page }) => {
      if (reducedTransparency) {
        await setPreferences(page, { transparency: 'reduce' });
      }
      await visit(page, 'vue', 'tooltip', theme);
      await page.getByRole('button', { name: 'Top tooltip' }).focus();
      const tooltip = page.getByRole('tooltip', { name: 'Copy workspace link' });
      await expect(tooltip).toHaveCSS('opacity', '1');
      const rendered = await tooltip.evaluate(el => {
        const rgba = (value: string) => {
          const channels = value.match(/[\d.]+/g)!.map(Number);
          return { rgb: channels.slice(0, 3), alpha: channels[3] ?? 1 };
        };
        const over = (foreground: ReturnType<typeof rgba>, background: number[]) =>
          foreground.rgb.map((channel, i) => channel * foreground.alpha + background[i] * (1 - foreground.alpha));
        const luminance = (rgb: number[]) => rgb.map(channel => {
          const s = channel / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
        // The fixture places the tooltip over the plain --bg canvas. Resolve
        // that token through CSS, then composite the translucent tooltip fill.
        const probe = document.createElement('span');
        probe.style.backgroundColor = 'var(--bg)';
        document.body.append(probe);
        const canvas = rgba(getComputedStyle(probe).backgroundColor).rgb;
        probe.remove();
        const styles = getComputedStyle(el);
        const fill = rgba(styles.backgroundColor);
        const background = over(fill, canvas);
        const text = over(rgba(styles.color), background);
        const a = luminance(background);
        const b = luminance(text);
        return { contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), alpha: fill.alpha };
      });
      expect(rendered.contrast, 'Tooltip text must meet 4.5:1 after alpha compositing').toBeGreaterThanOrEqual(4.5);
      if (reducedTransparency) {
        await expect(tooltip).toHaveCSS('backdrop-filter', 'none');
        expect(rendered.alpha, 'Reduced transparency requires an opaque tooltip').toBe(1);
      }
    });
  }
}

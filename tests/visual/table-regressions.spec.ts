import { test, expect, visit } from './fixtures';

for (const framework of ['vue', 'react']) for (const theme of ['light', 'dark']) {
  test(`${framework} ${theme} table has one rounded outline and balanced cell insets`, async ({ page }) => {
    await visit(page, framework, 'containers', theme);
    const geometry = await page.locator('.lu-table-wrap').evaluate(wrap => {
      const head = wrap.querySelector('.lu-table-head')!;
      const th = head.querySelector('th')!;
      const td = wrap.querySelector('tbody td')!;
      const textLeft = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().left;
      };
      return {
        radius: parseFloat(getComputedStyle(wrap).borderTopLeftRadius),
        inset: textLeft(th) - wrap.getBoundingClientRect().left,
        headerHeight: head.getBoundingClientRect().height,
        alignment: Math.abs(textLeft(th) - textLeft(td)),
        headRadius: getComputedStyle(head).borderTopLeftRadius,
        headShadow: getComputedStyle(head).boxShadow,
        lastDivider: getComputedStyle(wrap.querySelector('tbody tr:last-child td')!).borderBottomWidth,
      };
    });
    // The label starts beyond the curved corner, with the same inset as rows.
    expect(geometry.radius).toBeLessThanOrEqual(geometry.inset);
    expect(geometry.radius).toBeLessThanOrEqual(geometry.headerHeight / 2);
    expect(geometry.alignment).toBeLessThanOrEqual(0.5);
    expect(geometry.headRadius).toBe('0px');
    expect(geometry.headShadow).toBe('none');
    expect(geometry.lastDivider).toBe('0px');
  });

  test(`${framework} ${theme} table header material stays attached while scrolling`, async ({ page }) => {
    await visit(page, framework, 'containers', theme);
    await page.locator('.lu-table-wrap').evaluate(wrap => {
      const body = wrap.querySelector('tbody')!;
      const row = body.firstElementChild!;
      for (let i = 0; i < 20; i++) body.append(row.cloneNode(true));
      (wrap as HTMLElement).style.maxHeight = '180px';
      wrap.scrollTop = 240;
    });
    await expect.poll(() => page.locator('.lu-table-wrap').evaluate(wrap => {
      const top = wrap.getBoundingClientRect().top + parseFloat(getComputedStyle(wrap).borderTopWidth);
      return Math.abs(wrap.querySelector('.lu-table-head')!.getBoundingClientRect().top - top);
    })).toBeLessThanOrEqual(1);
  });
}

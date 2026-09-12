import type { Locator } from '@playwright/test';
import { test, expect, visit } from './fixtures';

async function contrast(locator: Locator, property: 'borderTopColor' | 'boxShadow' | 'backgroundColor' | 'color' | 'placeholder') {
  return locator.evaluate((element, property) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    function rgba(value: string): number[] {
      context.clearRect(0, 0, 1, 1); context.fillStyle = value; context.fillRect(0, 0, 1, 1);
      const data = [...context.getImageData(0, 0, 1, 1).data]; data[3] /= 255; return data;
    }
    function over(front: number[], back: number[]) { return front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3])); }
    function luminance(rgb: number[]) {
      const linear = rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
    }
    const ancestors: Element[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) ancestors.unshift(node);
    const background = ancestors.filter(node => property !== 'backgroundColor' || node !== element).reduce((bg, node) => over(rgba(getComputedStyle(node).backgroundColor), bg), [255, 255, 255]);
    const styleColor = property === 'placeholder' ? getComputedStyle(element, '::placeholder').color : getComputedStyle(element)[property];
    const color = property === 'boxShadow' ? styleColor.match(/^(?:rgba?|color)\([^)]*\)/)?.[0] ?? 'transparent' : styleColor;
    const a = luminance(over(rgba(color), background)), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }, property);
}

for (const framework of ['vue', 'react']) {
  for (const theme of ['light', 'dark']) {
    test(`${framework} ${theme} resting controls and form hints remain visible`, async ({ page }) => {
      await visit(page, framework, 'forms', theme);
      const input = page.locator('.lu-field:not(.is-invalid) input:not(:disabled)').first();
      const check = page.locator('.lu-check:not(.is-disabled) .lu-check-native:not(:checked) + .lu-check-box').first();
      expect.soft(await contrast(input, 'borderTopColor'), 'input boundary').toBeGreaterThanOrEqual(3);
      expect.soft(await contrast(check, 'borderTopColor'), 'unchecked boundary').toBeGreaterThanOrEqual(3);
      expect.soft(await contrast(page.locator('.lu-field-control[placeholder]').first(), 'placeholder'), 'placeholder').toBeGreaterThanOrEqual(4.5);
      expect.soft(await contrast(page.locator('.lu-field-error').first(), 'color'), 'error message').toBeGreaterThanOrEqual(4.5);
      await visit(page, framework, framework === 'vue' ? 'select' : 'forms', theme);
      expect.soft(await contrast(page.locator('.lu-select-trigger:not(:disabled)').first(), 'borderTopColor'), 'select boundary').toBeGreaterThanOrEqual(3);
      expect.soft(await contrast(page.locator('.lu-select-value.is-placeholder').first(), 'color'), 'select placeholder').toBeGreaterThanOrEqual(4.5);
    });
  }

  test(`${framework} field error spacing and disabled styling match the form states`, async ({ page }) => {
    await visit(page, framework, 'forms');
    const error = page.locator('.lu-field-error').first();
    const geometry = await error.evaluate(el => ({ gap: el.getBoundingClientRect().top - el.previousElementSibling!.getBoundingClientRect().bottom, intended: parseFloat(getComputedStyle(el.parentElement!).rowGap), bottomMargin: getComputedStyle(el).marginBottom }));
    expect.soft(geometry.gap).toBe(geometry.intended);
    expect.soft(geometry.bottomMargin).toBe('0px');
    const disabled = page.locator('.lu-field-control:disabled');
    await expect.soft(disabled).toHaveCSS('cursor', 'not-allowed');
    expect.soft(await disabled.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThan(1);
  });

  test(`${framework} loading preserves button height and disabled buttons ignore hover`, async ({ page }) => {
    await visit(page, framework, 'buttons');
    for (const variant of ['glass', 'primary', 'ghost', 'danger']) {
      const normal = page.locator(`.lu-btn-${variant}.lu-btn-md:not(:disabled)`).first();
      const loading = page.locator(`.lu-btn-${variant}.lu-btn-md.is-loading`).first();
      expect.soft((await loading.boundingBox())!.height, `${variant} loading height`).toBe((await normal.boundingBox())!.height);
      const disabled = page.locator(`.lu-btn-${variant}:disabled:not(.is-loading)`).first();
      const before = await disabled.evaluate(el => { const cs = getComputedStyle(el); return [cs.backgroundColor, cs.boxShadow, cs.filter]; });
      await disabled.hover({ force: true });
      await page.waitForTimeout(200);
      const after = await disabled.evaluate(el => { const cs = getComputedStyle(el); return [cs.backgroundColor, cs.boxShadow, cs.filter]; });
      expect.soft(after, `${variant} disabled hover`).toEqual(before);
    }
  });

  test(`${framework} long labels preserve checkbox geometry and select affordance`, async ({ page }) => {
    await visit(page, framework, 'forms');
    const check = page.locator('.lu-check:not(.is-disabled)').first();
    const before = (await check.locator('.lu-check-box').boundingBox())!.width;
    await check.evaluate(el => { (el as HTMLElement).style.width = '160px'; el.querySelector('.lu-check-label')!.textContent = 'Receive notifications about all workspace activity'; });
    expect.soft((await check.locator('.lu-check-box').boundingBox())!.width).toBe(before);
    await visit(page, framework, framework === 'vue' ? 'select' : 'forms');
    const select = page.locator('.lu-select').first();
    await select.evaluate(el => { (el as HTMLElement).style.width = '200px'; el.querySelector('.lu-select-value')!.textContent = 'AnExtremelyLongUnbrokenWorkspaceNameThatMustNotHideTheChevron'; });
    const geometry = await select.evaluate(el => {
      const trigger = el.querySelector('.lu-select-trigger')!.getBoundingClientRect();
      const arrow = el.querySelector('.lu-select-chevron')!.getBoundingClientRect();
      return { right: trigger.right, arrowRight: arrow.right, overflow: el.scrollWidth - el.clientWidth };
    });
    expect.soft(geometry.arrowRight).toBeLessThanOrEqual(geometry.right);
    expect.soft(geometry.overflow).toBeLessThanOrEqual(1);
    await expect.soft(select.locator('.lu-select-value')).toHaveCSS('text-overflow', 'ellipsis');
    await select.locator('.lu-select-trigger').click();
    const option = select.locator('.lu-select-option').first();
    await option.evaluate(el => { el.textContent = 'AnExtremelyLongUnbrokenWorkspaceNameThatMustRemainInsideTheMenu'; });
    expect.soft(await option.evaluate(el => el.scrollWidth - el.clientWidth), 'option label overflow').toBeLessThanOrEqual(1);
  });
}

for (const theme of ['light', 'dark']) {
  test(`vue ${theme} radio and switch keep visible tracks and stable selection geometry`, async ({ page }) => {
    await visit(page, 'vue', 'forms', theme);
    const radio = page.locator('.lu-radio:not(.is-disabled)').nth(1);
    const radioDot = radio.locator('.lu-radio-dot');
    expect.soft(await contrast(radioDot, 'borderTopColor'), 'unchecked radio boundary').toBeGreaterThanOrEqual(3);
    const radioBefore = await radioDot.boundingBox();
    await radio.click();
    const radioAfter = await radioDot.boundingBox();
    expect.soft(radioAfter!.width, 'radio width').toBe(radioBefore!.width);
    expect.soft(radioAfter!.height, 'radio height').toBe(radioBefore!.height);
    const control = page.getByRole('switch', { name: 'Notifications' });
    const track = control.locator('.lu-switch-track');
    const on = await track.boundingBox();
    await control.click();
    await track.evaluate(el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    const off = await track.boundingBox();
    expect.soft(off!.width, 'switch track width').toBe(on!.width);
    expect.soft(off!.height, 'switch track height').toBe(on!.height);
    expect.soft(await contrast(track, 'borderTopColor'), 'off switch boundary').toBeGreaterThanOrEqual(3);
    const thumb = control.locator('.lu-switch-thumb');
    if (theme === 'dark') expect.soft(await contrast(thumb, 'backgroundColor'), 'off switch thumb').toBeGreaterThanOrEqual(3);
    else expect.soft(await contrast(thumb, 'boxShadow'), 'off switch thumb edge').toBeGreaterThanOrEqual(3);
    for (const [parent, indicator, label] of [[radio, '.lu-radio-dot', '.lu-radio-label'], [control, '.lu-switch-track', '.lu-switch-label']] as const) {
      const before = (await parent.locator(indicator).boundingBox())!.width;
      await parent.evaluate((el, label) => { (el as HTMLElement).style.width = '160px'; el.querySelector(label)!.textContent = 'Receive notifications about all workspace activity'; }, label);
      expect.soft((await parent.locator(indicator).boundingBox())!.width, `${indicator} long label`).toBe(before);
    }
  });
}

for (const framework of ['vue', 'react']) {
  for (const theme of ['light', 'dark']) {
    test(`${framework} ${theme} segmented selection remains visible`, async ({ page }) => {
      await visit(page, framework, 'forms', theme);
      const segmented = page.locator('.lu-seg').first();
      expect.soft(await contrast(segmented, 'borderTopColor'), 'segmented boundary').toBeGreaterThanOrEqual(3);
      const selected = segmented.locator('.lu-seg-item.is-active');
      expect.soft(await selected.evaluate(el => getComputedStyle(el).boxShadow)).toContain('inset');
      expect.soft(await contrast(selected, 'boxShadow'), 'selected segment boundary').toBeGreaterThanOrEqual(3);
      const next = segmented.locator('.lu-seg-item').nth(1);
      await next.click();
      await expect(next).toHaveClass(/is-active/);
      expect(await next.evaluate(el => getComputedStyle(el).boxShadow)).toContain('inset');
      await next.evaluate(el => (el as HTMLElement).style.setProperty('--focus-outline', '3px solid rgb(127, 45, 233)'));
      await page.keyboard.press('Tab');
      await next.focus();
      await expect(next).toHaveCSS('outline-width', '3px');
      await expect(next).toHaveCSS('outline-color', 'rgb(127, 45, 233)');
    });
  }
  test(`${framework} alert heading aligns with the dismissal control`, async ({ page }) => {
    await visit(page, framework, 'feedback');
    const alert = page.locator('.lu-alert').filter({ has: page.locator('.lu-alert-close') }).first();
    const geometry = await alert.evaluate(el => {
      const heading = el.querySelector('.lu-alert-title')!;
      const dismiss = el.querySelector('.lu-alert-close')!;
      return { titleTop: heading.getBoundingClientRect().top, dismissTop: dismiss.getBoundingClientRect().top, margin: getComputedStyle(heading).marginTop };
    });
    expect.soft(geometry.margin).toBe('0px');
    expect.soft(geometry.titleTop).toBe(geometry.dismissTop);
  });
}

for (const theme of ['light', 'dark']) {
  test(`vue ${theme} progress track reveals the unfilled extent`, async ({ page }) => {
    await visit(page, 'vue', 'feedback', theme);
    for (const bar of await page.locator('.lu-progress').all()) {
      expect.soft(await contrast(bar, 'borderTopColor')).toBeGreaterThanOrEqual(3);
    }
  });
}

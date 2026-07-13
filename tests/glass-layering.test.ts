// Overlay layering: a confirm raised while a content modal is open must
// paint above it, and toasts above everything. Both teleported scrims carry
// z-index 1000 historically, so DOM order decided — the earlier-mounted
// confirm host lost and was fully occluded (drive's share-dialog revoke).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import GlassConfirmHost from '../src/components/GlassConfirmHost.vue';
import { confirm, resolveConfirm } from '../src/glass/confirm';

const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('overlay layering scale', () => {
  it('defines the ladder in glass.css with confirm above modal, toast on top', () => {
    const css = read('src/styles/glass.css');
    const token = (name: string): number => {
      const m = css.match(new RegExp(`${name}:\\s*(\\d+)`));
      if (!m) throw new Error(`missing ${name}`);
      return Number(m[1]);
    };
    const popover = token('--lu-z-popover');
    const tooltip = token('--lu-z-tooltip');
    const modal = token('--lu-z-modal');
    const confirmZ = token('--lu-z-confirm');
    const toast = token('--lu-z-toast');
    expect(popover).toBeLessThan(tooltip);
    expect(tooltip).toBeLessThan(modal);
    expect(modal).toBeLessThan(confirmZ);
    expect(confirmZ).toBeLessThan(toast);
  });

  it('every floating surface reads the scale (no hardcoded z-index)', () => {
    // GlassModal's styles are de-scoped into the shared component sheet
    // (react-support v1.27); the layering contract moved with them.
    expect(read('src/styles/components/glass-modal.css')).toMatch(/z-index:\s*var\(--lu-z-modal/);
    expect(read('src/styles/components/glass-modal.css')).toMatch(/scrim--confirm\s*\{\s*z-index:\s*var\(--lu-z-confirm/);
    expect(read('src/components/GlassToaster.vue')).toMatch(/z-index:\s*var\(--lu-z-toast/);
    expect(read('src/components/GlassPopover.vue')).toMatch(/z-index:\s*var\(--lu-z-popover/);
    expect(read('src/components/GlassTooltip.vue')).toMatch(/z-index:\s*var\(--lu-z-tooltip/);
    expect(read('src/components/GlassDrawer.vue')).toMatch(/z-index:\s*var\(--lu-z-modal/);
  });

  it('GlassConfirmHost renders its modal on the confirm layer', async () => {
    const w = mount(GlassConfirmHost, { attachTo: document.body });
    const p = confirm({ message: 'sure?' });
    await nextTick();
    const scrim = document.body.querySelector('.lu-modal-scrim');
    expect(scrim).not.toBeNull();
    expect(scrim!.classList.contains('lu-modal-scrim--confirm')).toBe(true);
    resolveConfirm(false);
    await expect(p).resolves.toBe(false);
    w.unmount();
  });
});

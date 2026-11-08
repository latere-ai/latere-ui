// @vitest-environment node
// React 18's server renderer logs a warning for every useLayoutEffect a
// component calls, since layout effects never run on the server. Components
// use the isomorphic layout effect instead, which is a plain effect when there
// is no window. The test counts layout effects during server rendering.
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const layoutEffects = vi.hoisted(() => ({ calls: 0 }));

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>();
  const useLayoutEffect: typeof react.useLayoutEffect = (effect, deps) => {
    layoutEffects.calls += 1;
    react.useLayoutEffect(effect, deps);
  };
  return { ...react, default: { ...react, useLayoutEffect }, useLayoutEffect };
});

const { GlassToaster } = await import('../GlassToaster');
const { GlassModal } = await import('../GlassModal');
const { GlassPopover } = await import('../GlassPopover');
const { GlassSelect } = await import('../GlassSelect');

describe('server rendering', () => {
  it.each([
    ['GlassToaster', () => <GlassToaster />],
    ['GlassModal', () => <GlassModal open title="Rename">Body</GlassModal>],
    ['GlassPopover', () => <GlassPopover open trigger={<button type="button">Open</button>}>Panel</GlassPopover>],
    ['GlassSelect', () => <GlassSelect value="a" options={[{ value: 'a', label: 'A' }]} onChange={() => undefined} />],
  ])('%s calls no layout effect', (_name, element) => {
    expect(typeof window).toBe('undefined');
    layoutEffects.calls = 0;
    renderToString(element());
    expect(layoutEffects.calls).toBe(0);
  });
});

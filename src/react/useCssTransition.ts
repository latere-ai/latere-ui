import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** Vue-compatible CSS enter/leave classes; retain the DOM through its exit. */
export function useCssTransition(open: boolean, name: string, root: RefObject<HTMLElement | null>): boolean {
  const [present, setPresent] = useState(open);
  const previous = useRef(open);
  useLayoutEffect(() => {
    if (previous.current === open) return;
    previous.current = open;
    const element = root.current;
    if (!element) return;
    setPresent(true);
    const direction = open ? 'enter' : 'leave';
    const from = `${name}-${direction}-from`;
    const active = `${name}-${direction}-active`;
    const to = `${name}-${direction}-to`;
    let first = 0;
    let second = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(timer);
      element.removeEventListener('transitionend', onEnd);
      element.classList.remove(from, active, to);
    };
    const finish = () => {
      cleanup();
      setPresent(open);
    };
    const onEnd = (event: TransitionEvent) => { if (event.target === element) finish(); };
    element.classList.add(from);
    // A leave starts from the rendered position before its active class is applied.
    if (!open) void element.offsetHeight;
    element.classList.add(active);
    first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        element.classList.remove(from);
        element.classList.add(to);
        const style = getComputedStyle(element);
        const milliseconds = (value: string) => value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
        const durations = style.transitionDuration.split(',').map(milliseconds);
        const delays = style.transitionDelay.split(',').map(milliseconds);
        const timeout = Math.max(0, ...durations.map((duration, index) => duration + (delays[index % delays.length] || 0)));
        if (!timeout) finish();
        else {
          element.addEventListener('transitionend', onEnd);
          timer = setTimeout(finish, timeout + 1);
        }
      });
    });
    return cleanup;
  }, [open, name, root]);
  return open || present;
}

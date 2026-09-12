/** Reserve caption space below the real fixed-position notification stack. */
export function observeToastDemo(root: HTMLElement) {
  root.dataset.demo = 'toast';
  let stack: HTMLElement | null = null;
  const resize = new ResizeObserver(() => {
    const offset = stack?.children.length ? Math.ceil(stack.getBoundingClientRect().bottom) : 0;
    root.style.setProperty('--toast-demo-offset', `${offset}px`);
  });
  const mutations = new MutationObserver(() => {
    const current = document.querySelector<HTMLElement>('.lu-toaster');
    if (current === stack) return;
    resize.disconnect();
    stack = current;
    if (stack) resize.observe(stack);
    else root.style.removeProperty('--toast-demo-offset');
  });
  mutations.observe(document.body, { childList: true, subtree: true });
}

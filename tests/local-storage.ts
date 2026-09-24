// Node 22+ defines a global `localStorage` getter that answers undefined
// unless Node starts with --localstorage-file, and it shadows happy-dom's.
// Tests that exercise persistence install an in-memory Storage in its place.
export function installLocalStorage(): Storage {
  const store = new Storage();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, enumerable: true, value: store });
  return store;
}

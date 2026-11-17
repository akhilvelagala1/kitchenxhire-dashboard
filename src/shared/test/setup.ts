import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 10_000 });

/** Node 22+ may run Vitest without a full Storage implementation. */
function ensureStorage(name: 'localStorage' | 'sessionStorage') {
  const target = globalThis as typeof globalThis & Record<string, Storage | undefined>;
  if (
    target[name] &&
    typeof target[name]?.clear === 'function' &&
    typeof target[name]?.getItem === 'function'
  )
    return;
  const store = new Map<string, string>();
  const storageInstance: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(target, name, {
    value: storageInstance,
    writable: true,
    configurable: true
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      value: storageInstance,
      writable: true,
      configurable: true
    });
  }
}

ensureStorage('localStorage');
ensureStorage('sessionStorage');

/** Recharts ResponsiveContainer expects ResizeObserver in the browser. */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom has no <dialog> modal API.
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  this.open = false;
};

export interface ToastItem {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function push(kind: ToastItem['kind'], message: string) {
  const id = nextId++;
  items = [...items, { id, kind, message }];
  emit();
  setTimeout(
    () => {
      items = items.filter((t) => t.id !== id);
      emit();
    },
    kind === 'error' ? 8_000 : 4_000
  );
}

export const toast = {
  success: (message: string) => push('success', message),
  error: (message: string) => push('error', message)
};

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): ToastItem[] {
  return items;
}

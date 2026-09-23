export function notify<T>(
  observer: ((value: T) => void) | undefined,
  value: T,
): void {
  try {
    observer?.(value);
  } catch {}
}

export function retryAfterMs(
  value: string | null,
  now = Date.now(),
): number | undefined {
  if (value === null) return undefined;
  const text = value.trim();
  if (/^\d+$/.test(text)) {
    const duration = Number(text) * 1000;
    return Number.isSafeInteger(duration) ? duration : undefined;
  }
  if (
    !/^(?:[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT|[A-Za-z]+, \d{2}-[A-Za-z]{3}-\d{2} \d{2}:\d{2}:\d{2} GMT|[A-Za-z]{3} [A-Za-z]{3} [ \d]\d \d{2}:\d{2}:\d{2} \d{4})$/.test(
      text,
    )
  )
    return undefined;
  const date = Date.parse(text.endsWith("GMT") ? text : `${text} GMT`);
  if (!Number.isFinite(date)) return undefined;
  return Math.max(0, date - now);
}

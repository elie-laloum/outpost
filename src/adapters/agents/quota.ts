export function quotaMatcher(
  patterns: readonly RegExp[],
): (text: string) => boolean {
  return (text) => patterns.some((pattern) => pattern.test(text));
}

export function textMatcher(
  patterns: readonly RegExp[],
  ignored: readonly RegExp[] = [],
): (text: string) => boolean {
  return (text) =>
    patterns.some((pattern) => pattern.test(text)) &&
    !ignored.some((pattern) => pattern.test(text));
}

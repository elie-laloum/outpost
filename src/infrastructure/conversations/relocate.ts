export function relocateTranscript(
  text: string,
  destination: string,
  source?: string,
): string {
  const records = text.split("\n");
  const origin =
    source ??
    records.reduce<string | undefined>((found, line) => {
      if (found) return found;
      try {
        const item = JSON.parse(line);
        return item.cwd ?? item.payload?.cwd;
      } catch {
        return undefined;
      }
    }, undefined);
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          key === "cwd" && typeof item === "string" && item === origin
            ? destination
            : visit(item),
        ]),
      );
    return value;
  }
  return records
    .map((line) => {
      if (!line.trim()) return line;
      try {
        const value = JSON.parse(line);
        const rewritten = visit(value);
        return JSON.stringify(value) === JSON.stringify(rewritten)
          ? line
          : JSON.stringify(rewritten);
      } catch {
        return line;
      }
    })
    .join("\n");
}

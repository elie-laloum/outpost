// Emulate terminal capabilities over pipes for portable CLI dialogue tests.
// Real terminal behavior is checked separately; this fixture never allocates a PTY.
Object.defineProperties(process.stdin, {
  isTTY: { value: true },
  setRawMode: {
    value: (enabled: boolean) =>
      enabled ? process.stdin.ref() : process.stdin.unref(),
  },
});
Object.defineProperties(process.stderr, {
  isTTY: { value: true },
  columns: { value: 80 },
});
await import("../../src/cli/main.ts");

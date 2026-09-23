import type { TerminalState } from "./terminal.types.ts";

export type { TerminalState } from "./terminal.types.ts";

export function restoreTerminal(
  terminal: TerminalState = { input: process.stdin, output: process.stdout },
): void {
  if (terminal.input.isTTY) {
    try {
      terminal.input.setRawMode?.(false);
    } catch {}
  }
  if (terminal.output.isTTY) {
    try {
      terminal.output.write("\u001b[?25h");
    } catch {}
  }
}

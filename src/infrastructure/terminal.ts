export interface TerminalState {
  readonly input: {
    readonly isTTY?: boolean;
    setRawMode?(mode: boolean): unknown;
  };
  readonly output: { readonly isTTY?: boolean; write(text: string): unknown };
}

export function restoreTerminal(
  terminal: TerminalState = { input: process.stdin, output: process.stdout },
): void {
  if (terminal.input.isTTY) {
    try {
      terminal.input.setRawMode?.(false);
    } catch {
      /* The terminal may already be disconnected. */
    }
  }
  if (terminal.output.isTTY) {
    try {
      terminal.output.write("\u001b[?25h");
    } catch {
      /* Cursor restoration is best effort after disconnect. */
    }
  }
}

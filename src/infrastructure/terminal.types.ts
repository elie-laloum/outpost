export interface TerminalState {
  readonly input: {
    readonly isTTY?: boolean;
    setRawMode?(mode: boolean): unknown;
  };
  readonly output: { readonly isTTY?: boolean; write(text: string): unknown };
}

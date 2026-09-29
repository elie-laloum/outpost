export interface McpPromptOptions {
  readonly server: string;
  readonly name: string;
  readonly arguments?: Readonly<Record<string, string>>;
}

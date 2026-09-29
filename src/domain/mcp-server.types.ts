export interface McpToolFilter {
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
}

export interface McpStdioServer {
  readonly command: string;
  readonly arguments?: readonly string[];
  readonly environment?: Readonly<Record<string, string>>;
  readonly variables?: readonly string[];
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}

export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
  readonly oauth?: "login";
  readonly tools?: McpToolFilter;
  readonly startupTimeoutMs?: number;
}

export type McpServer = McpStdioServer | McpHttpServer;

export type McpServers = {
  readonly [name: string]: McpServer;
};

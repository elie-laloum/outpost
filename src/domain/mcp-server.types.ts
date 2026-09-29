export interface McpStdioServer {
  readonly command: string;
  readonly arguments?: readonly string[];
  readonly environment?: Readonly<Record<string, string>>;
  readonly variables?: readonly string[];
}

export interface McpHttpServer {
  readonly url: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly bearerTokenVariable?: string;
}

export type McpServer = McpStdioServer | McpHttpServer;

export type McpServers = {
  readonly [name: string]: McpServer;
};

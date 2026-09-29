export interface McpCliSupport {
  readonly agent: string;
  readonly includeTools: boolean;
  readonly excludeTools: boolean;
  readonly startupTimeout: "server" | "shared" | false;
  readonly oauthLogin: boolean;
}

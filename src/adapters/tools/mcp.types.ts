import type { HarnessTool } from "../../domain/tool.types.ts";

export interface JsonRpcError {
  readonly code: number;
  readonly message: string;
  readonly data?: unknown;
}

export interface PendingRequest {
  resolve(value: unknown): void;
  reject(error: unknown): void;
}

export type McpContentBlock = Readonly<Record<string, unknown>>;

export interface McpConnection {
  request(
    method: string,
    params?: unknown,
    signal?: AbortSignal,
  ): Promise<unknown>;
  notify(method: string, params?: unknown): void;
  receive(line: string): void;
  fail(error: unknown): void;
}

export interface McpProcess {
  readonly connection: McpConnection;
  close(): Promise<void>;
}

export interface McpToolDescription {
  readonly name: string;
  readonly title?: string;
  readonly description?: string;
  readonly inputSchema: Readonly<Record<string, unknown>>;
}

export interface McpToolResult {
  readonly content?: readonly unknown[];
  readonly structuredContent?: unknown;
  readonly isError?: boolean;
}

export interface OpenedMcpServers {
  readonly tools: readonly HarnessTool[];
  close(): Promise<void>;
}

import { OutpostError } from "../../domain/errors.ts";
import { MCP_METHOD_NOT_FOUND } from "./mcp.constants.ts";
import type {
  JsonRpcError,
  McpConnection,
  PendingRequest,
} from "./mcp.types.ts";

const serverRequests: Readonly<Record<string, () => unknown>> = {
  ping: () => ({}),
};

export function mcpConnection(
  server: string,
  write: (line: string) => void,
): McpConnection {
  let next = 1;
  let failure: unknown;
  const pending = new Map<number, PendingRequest>();
  const send = (message: Record<string, unknown>) =>
    write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
  const answer = (id: unknown, method: string) =>
    send(
      Object.hasOwn(serverRequests, method)
        ? { id, result: serverRequests[method]!() }
        : {
            id,
            error: {
              code: MCP_METHOD_NOT_FOUND,
              message: `Outpost does not support ${method}`,
            },
          },
    );
  return {
    request(method, params, signal) {
      if (failure !== undefined) return Promise.reject(failure);
      if (signal?.aborted) return Promise.reject(signal.reason);
      const id = next++;
      return new Promise((resolve, reject) => {
        const cancel = () => {
          pending.delete(id);
          if (failure === undefined)
            send({
              method: "notifications/cancelled",
              params: { requestId: id, reason: String(signal?.reason) },
            });
          reject(signal?.reason);
        };
        const settle =
          <T>(done: (value: T) => void) =>
          (value: T) => {
            signal?.removeEventListener("abort", cancel);
            done(value);
          };
        pending.set(id, { resolve: settle(resolve), reject: settle(reject) });
        signal?.addEventListener("abort", cancel, { once: true });
        send({ id, method, ...(params === undefined ? {} : { params }) });
      });
    },
    notify(method, params) {
      if (failure === undefined)
        send({ method, ...(params === undefined ? {} : { params }) });
    },
    receive(line) {
      const message = parse(line);
      if (!message) return;
      if (typeof message.method === "string") {
        if (message.id !== undefined && message.id !== null)
          answer(message.id, message.method);
        return;
      }
      const entry =
        typeof message.id === "number" ? pending.get(message.id) : undefined;
      if (!entry) return;
      pending.delete(message.id as number);
      if (message.error === undefined) entry.resolve(message.result);
      else entry.reject(rpcError(server, message.error));
    },
    fail(error) {
      if (failure !== undefined) return;
      failure = error;
      for (const entry of pending.values()) entry.reject(error);
      pending.clear();
    },
  };
}

function parse(line: string): Record<string, unknown> | undefined {
  try {
    const value: unknown = JSON.parse(line);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function rpcError(server: string, value: unknown): OutpostError {
  const error = (
    value !== null && typeof value === "object" ? value : {}
  ) as Partial<JsonRpcError>;
  return new OutpostError(
    "response",
    `MCP server ${server} returned error ${String(error.code)}: ${String(error.message)}`,
    { server, rpcCode: error.code },
  );
}

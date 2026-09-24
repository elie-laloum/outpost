import {
  queueHttpTimeoutMs,
  queueHttpMaxHeaderBytes,
} from "./task-queue-http.constants.ts";
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { queueMaxBytes } from "../domain/task-queue.constants.ts";
import {
  queueClaim,
  queueJob,
  queueLease,
  queueLeaseMs,
  queueNumber,
  queueObject,
  queueRequest,
  queueResult,
  queueString,
} from "../domain/task-queue.ts";
import type { TaskQueue } from "../domain/task-queue.types.ts";
import type {
  QueueClientOptions,
  QueueServer,
  QueueServerOptions,
} from "./task-queue-http.types.ts";

function tokenValue(token: string): string {
  if (
    typeof token !== "string" ||
    token.length < 32 ||
    token.length > 512 ||
    /\s/.test(token)
  )
    throw new Error(
      "Queue bearer token must contain 32 to 512 non-whitespace characters",
    );
  return `Bearer ${token}`;
}
async function message(stream: AsyncIterable<Uint8Array>): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of stream) {
    size += chunk.byteLength;
    if (size > queueMaxBytes)
      throw new Error("Queue message exceeds size limit");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export async function serveTaskQueue(
  options: QueueServerOptions,
): Promise<QueueServer> {
  const expected = Buffer.from(tokenValue(options.token));
  const queue = options.queue;
  const server = createServer(
    {
      requestTimeout: queueHttpTimeoutMs,
      headersTimeout: queueHttpTimeoutMs,
      maxHeaderSize: queueHttpMaxHeaderBytes,
    },
    async (request, response) => {
      const supplied = Buffer.from(request.headers.authorization ?? "");
      if (
        supplied.length !== expected.length ||
        !timingSafeEqual(supplied, expected)
      ) {
        response.writeHead(401).end();
        request.resume();
        return;
      }
      if (request.method !== "POST" || request.url !== "/queue") {
        response.writeHead(404).end();
        request.resume();
        return;
      }
      try {
        const data = queueObject(await message(request));
        const operations = new Map<string, () => Promise<unknown>>([
          ["enqueue", () => queue.enqueue(queueRequest(data.request))],
          ["get", () => queue.get(queueString(data.id))],
          ["claim", () => queue.claim(queueClaim(data.request))],
          [
            "renew",
            () =>
              queue.renew(queueLease(data.lease), queueLeaseMs(data.leaseMs)),
          ],
          [
            "complete",
            () =>
              queue.complete(queueLease(data.lease), queueResult(data.result)),
          ],
          [
            "cancel",
            () => queue.cancel(queueString(data.id), queueNumber(data.fence)),
          ],
        ]);
        const operation = operations.get(queueString(data.operation));
        if (!operation) throw new Error("Unknown queue operation");
        const body = JSON.stringify((await operation()) ?? null);
        if (Buffer.byteLength(body) > queueMaxBytes)
          throw new Error("Queue response exceeds size limit");
        response
          .writeHead(200, {
            "content-type": "application/json",
            "cache-control": "no-store",
          })
          .end(body);
      } catch {
        response.writeHead(400).end("Queue request rejected");
      }
    },
  );
  server.setTimeout(queueHttpTimeoutMs, (socket) => socket.destroy());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, options.host ?? "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Queue server address unavailable");
  const host =
    address.family === "IPv6" ? `[${address.address}]` : address.address;
  return {
    url: `http://${host}:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections();
      }),
  };
}
export function httpTaskQueue(options: QueueClientOptions): TaskQueue {
  const authorization = tokenValue(options.token);
  const url = new URL(options.url);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid queue URL");
  const endpoint = new URL("queue", `${url.href.replace(/\/$/, "")}/`);
  const timeoutMs = options.timeoutMs ?? queueHttpTimeoutMs;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0)
    throw new Error("Invalid queue request timeout");
  async function call(data: unknown) {
    const body = JSON.stringify(data);
    if (Buffer.byteLength(body) > queueMaxBytes)
      throw new Error("Queue message exceeds size limit");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization, "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "error",
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Queue request rejected (${response.status})`);
    }
    if (!response.body) throw new Error("Missing queue response");
    const value = await message(response.body);
    return value === null ? undefined : queueJob(value);
  }
  async function required(data: unknown) {
    const job = await call(data);
    if (!job) throw new Error("Missing queue job");
    return job;
  }
  return {
    enqueue: (request) =>
      required({ operation: "enqueue", request: queueRequest(request) }),
    get: (id) => call({ operation: "get", id: queueString(id) }),
    claim: (request) =>
      call({ operation: "claim", request: queueClaim(request) }),
    renew: (lease, leaseMs) =>
      required({
        operation: "renew",
        lease: queueLease(lease),
        leaseMs: queueLeaseMs(leaseMs),
      }),
    complete: (lease, result) =>
      required({
        operation: "complete",
        lease: queueLease(lease),
        result: queueResult(result),
      }),
    cancel: (id, fence) =>
      required({
        operation: "cancel",
        id: queueString(id),
        fence: queueNumber(fence),
      }),
  };
}

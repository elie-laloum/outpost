import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { triggerQueueRequest } from "../domain/trigger-job.ts";
import {
  triggerDefaultMaxBytes,
  triggerMaxBytes,
  triggerPathPattern,
} from "../domain/trigger.constants.ts";
import type {
  TriggerEvent,
  TriggerHttpRequest,
  TriggerOutcome,
  TriggerReply,
} from "../domain/trigger.types.ts";
import {
  triggerHttpMaxHeaderBytes,
  triggerHttpTimeoutMs,
} from "./trigger-server.constants.ts";
import type {
  TriggerFailure,
  TriggerRoute,
  TriggerServer,
  TriggerServerOptions,
} from "./trigger-server.types.ts";

class RequestTooLarge extends Error {}

function routeTable(routes: readonly TriggerRoute[]) {
  if (!Array.isArray(routes) || !routes.length)
    throw new Error("serveTriggers() requires at least one route");
  const table = new Map<string, TriggerRoute>();
  for (const route of routes) {
    if (!triggerPathPattern.test(route.path) || table.has(route.path))
      throw new Error(`Invalid or duplicate trigger path: ${route.path}`);
    if (
      typeof route.source?.verify !== "function" ||
      typeof route.on !== "function"
    )
      throw new Error(`Trigger route ${route.path} requires a source and on()`);
    table.set(route.path, route);
  }
  return table;
}

function bodyLimit(value: number | undefined): number {
  const limit = value ?? triggerDefaultMaxBytes;
  if (!Number.isSafeInteger(limit) || limit <= 0 || limit > triggerMaxBytes)
    throw new Error("Trigger body limit must be between 1 byte and 25 MiB");
  return limit;
}

async function body(request: IncomingMessage, limit: number) {
  const declared = Number(request.headers["content-length"] ?? 0);
  if (declared > limit) throw new RequestTooLarge();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes: Buffer = chunk;
    size += bytes.byteLength;
    if (size > limit) throw new RequestTooLarge();
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

function headers(request: IncomingMessage) {
  return Object.fromEntries(
    Object.entries(request.headers).map(([name, value]) => [
      name,
      Array.isArray(value) ? value.join(", ") : value,
    ]),
  );
}

function send(response: ServerResponse, reply: TriggerReply) {
  response
    .writeHead(reply.status, {
      "cache-control": "no-store",
      ...(reply.contentType ? { "content-type": reply.contentType } : {}),
    })
    .end(reply.body);
}

function defaultReply(outcome: TriggerOutcome, job?: string): TriggerReply {
  if (outcome === "ignored") return { status: 204 };
  return {
    status: 202,
    contentType: "application/json",
    body: JSON.stringify({ job }),
  };
}

/** Serve verified webhooks and publish the jobs their routes select. */
export async function serveTriggers(
  options: TriggerServerOptions,
): Promise<TriggerServer> {
  const routes = routeTable(options.routes);
  const limit = bodyLimit(options.maxBytes);
  function report(error: unknown, failure: TriggerFailure) {
    try {
      options.onError?.(error, failure);
    } catch {
      /* Observer failures must not change responses. */
    }
  }
  async function handle(
    route: TriggerRoute,
    request: TriggerHttpRequest,
  ): Promise<TriggerReply> {
    let event: TriggerEvent;
    try {
      event = await route.source.verify(request, Date.now());
    } catch (error) {
      report(error, { path: route.path, stage: "verify" });
      return { status: 401 };
    }
    const failure = { path: route.path, delivery: event.delivery };
    const reply = (outcome: TriggerOutcome, job?: string) =>
      route.source.reply?.(outcome, job) ?? defaultReply(outcome, job);
    let queued;
    try {
      const job = await route.on(event);
      if (job === undefined) return reply("ignored");
      queued = triggerQueueRequest(
        `trigger:${route.path}:${event.delivery}`,
        job,
      );
    } catch (error) {
      report(error, { ...failure, stage: "route" });
      return { status: 500 };
    }
    try {
      await options.queue.enqueue(queued);
    } catch (error) {
      report(error, { ...failure, stage: "enqueue" });
      return { status: 503 };
    }
    return reply("accepted", queued.id);
  }
  const server = createServer(
    {
      requestTimeout: triggerHttpTimeoutMs,
      headersTimeout: triggerHttpTimeoutMs,
      maxHeaderSize: triggerHttpMaxHeaderBytes,
    },
    async (request, response) => {
      const path = new URL(request.url ?? "/", "http://trigger").pathname;
      const route = routes.get(path);
      if (!route || request.method !== "POST") {
        request.resume();
        send(response, { status: route ? 405 : 404 });
        return;
      }
      try {
        const content = await body(request, limit);
        send(
          response,
          await handle(route, {
            method: request.method,
            path,
            headers: headers(request),
            body: content,
          }),
        );
      } catch (error) {
        response.setHeader("connection", "close");
        send(response, {
          status: error instanceof RequestTooLarge ? 413 : 400,
        });
      }
    },
  );
  server.setTimeout(triggerHttpTimeoutMs, (socket) => socket.destroy());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, options.host ?? "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Trigger server address unavailable");
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

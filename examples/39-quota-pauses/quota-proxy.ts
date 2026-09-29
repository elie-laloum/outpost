// A proxy in front of the real model service that can simulate a quota:
// after N requests, the next one gets "429 Too Many Requests" with a Retry-After,
// or every request gets it for a while. It can also play an outage: "503 Service Unavailable".

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export async function quotaProxy(target: string) {
  const upstream = new URL(target);
  let limit: { after: number; seconds: number } | undefined;
  let blockedUntil = 0;
  let downUntil = 0;
  let requests = 0;

  const server = createServer(async (request, reply) => {
    requests++;
    if (limit && limit.after-- === 0) {
      reply.writeHead(429, { "retry-after": String(limit.seconds) }).end("quota exceeded");
      limit = undefined;
      return;
    }

    if (downUntil > Date.now()) {
      reply.writeHead(503).end("service unavailable");
      return;
    }

    const blockedMs = blockedUntil - Date.now();
    if (blockedMs > 0) {
      reply.writeHead(429, { "retry-after": String(Math.ceil(blockedMs / 1000)) }).end("quota exceeded");
      return;
    }

    const body = Buffer.concat(await Array.fromAsync(request));
    const answer = await fetch(new URL(request.url!, upstream.origin), {
      method: request.method,
      headers: { authorization: request.headers.authorization!, "content-type": "application/json" },
      body: body.length ? body : undefined,
    });

    reply.writeHead(answer.status, { "content-type": answer.headers.get("content-type") ?? "application/json" });
    reply.end(Buffer.from(await answer.arrayBuffer()));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}${upstream.pathname}`,
    /** The request after the next `after` ones is refused; the limit resets `seconds` later. */
    limitAfter: (after: number, seconds: number) => void (limit = { after, seconds }),
    /** Every request is refused for `seconds`. */
    limitFor: (seconds: number) => void (blockedUntil = Date.now() + seconds * 1000),
    /** Every request gets "503 Service Unavailable" for `seconds`. */
    downFor: (seconds: number) => void (downUntil = Date.now() + seconds * 1000),
    requests: () => requests,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

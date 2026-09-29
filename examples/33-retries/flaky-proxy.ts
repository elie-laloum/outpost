// A proxy in front of the real model service that refuses the first requests
// with "429 Too Many Requests" and a Retry-After header, like a rate-limited API.

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export async function flakyProxy(
  target: string,
  refusals: number,
  retryAfterSeconds: number,
) {
  const upstream = new URL(target);
  let seen = 0;

  const server = createServer(async (request, reply) => {
    if (seen++ < refusals) {
      reply
        .writeHead(429, { "retry-after": String(retryAfterSeconds) })
        .end("slow down");
      return;
    }

    const body = Buffer.concat(await Array.fromAsync(request));
    const answer = await fetch(new URL(request.url!, upstream.origin), {
      method: request.method,
      headers: {
        authorization: request.headers.authorization!,
        "content-type": "application/json",
      },
      body: body.length ? body : undefined,
    });

    reply.writeHead(answer.status, {
      "content-type": answer.headers.get("content-type") ?? "application/json",
    });
    reply.end(Buffer.from(await answer.arrayBuffer()));
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}${upstream.pathname}`, // same /v1 path, served by the proxy
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

import { createServer, request } from "node:http";
import { connect, isIP } from "node:net";
import type { Duplex } from "node:stream";
import { egressRuntime } from "./egress.constants.ts";
import type { Allowlist, EgressResolver } from "./egress.types.ts";
import { egressAccess } from "./policy.ts";
import { tlsServerName } from "./tls-hello.ts";

function reject(socket: Duplex): void {
  socket.end(
    "HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
  );
}

export function createEgressProxy(
  policy: Allowlist,
  resolver?: EgressResolver,
) {
  const access = egressAccess(policy);
  const server = createServer(
    { maxHeaderSize: egressRuntime.maxHeaderBytes },
    (incoming, outgoing) => {
      void (async () => {
        const target = new URL(incoming.url ?? "");
        if (
          target.protocol !== "http:" ||
          (target.port && target.port !== "80") ||
          target.username ||
          target.password
        )
          throw new Error("HTTP destination required");
        const hostname = target.hostname.replace(/^\[|\]$/g, "");
        const address = await access.resolve(hostname, resolver);
        if (incoming.destroyed || outgoing.destroyed) return;
        const headers = {
          ...incoming.headers,
          host: target.host,
          connection: "close",
        };
        for (const key of [
          "proxy-authorization",
          "proxy-connection",
          "upgrade",
          ...(incoming.headers.connection ?? "")
            .toLowerCase()
            .split(",")
            .map((value) => value.trim()),
        ])
          delete headers[key as keyof typeof headers];
        headers.host = target.host;
        headers.connection = "close";
        const upstream = request(
          {
            hostname: address.address,
            family: address.family,
            port: 80,
            method: incoming.method,
            path: target.pathname + target.search,
            headers,
            agent: false,
          },
          (response) => {
            outgoing.writeHead(response.statusCode ?? 502, response.headers);
            response.pipe(outgoing);
            response.on("error", () => outgoing.destroy());
          },
        );
        upstream.setTimeout(egressRuntime.idleMs, () => upstream.destroy());
        upstream.on("error", () => {
          if (outgoing.headersSent) {
            outgoing.destroy();
            return;
          }
          outgoing.writeHead(502).end();
        });
        incoming.on("aborted", () => upstream.destroy());
        outgoing.on("close", () => upstream.destroy());
        incoming.pipe(upstream);
      })().catch(() => outgoing.writeHead(403).end());
    },
  );
  server.on("connect", (request, socket, head) => {
    socket.on("error", () => socket.destroy());
    void (async () => {
      const authority = request.url ?? "";
      const target = new URL(`https://${authority}`);
      if (
        target.username ||
        target.password ||
        target.pathname !== "/" ||
        target.search ||
        target.hash ||
        !authority.endsWith(":443")
      )
        throw new Error("HTTPS destination required");
      const hostname = target.hostname.replace(/^\[|\]$/g, "");
      const address = await access.resolve(hostname, resolver);
      if (socket.destroyed) return;
      socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      let buffered = head;
      const timeout = setTimeout(
        () => socket.destroy(),
        egressRuntime.connectMs,
      );
      socket.once("close", () => clearTimeout(timeout));
      const receive = (chunk: Buffer) => {
        try {
          buffered = Buffer.concat([buffered, chunk]);
          if (!isIP(hostname)) {
            const name = tlsServerName(buffered);
            if (name === undefined) return;
            if (name !== hostname.toLowerCase())
              throw new Error("TLS server name mismatch");
          }
          socket.pause();
          socket.removeListener("data", receive);
          const upstream = connect({
            host: address.address,
            family: address.family,
            port: 443,
          });
          upstream.on("error", () => socket.destroy());
          socket.once("close", () => upstream.destroy());
          upstream.once("close", () => socket.end());
          upstream.setTimeout(egressRuntime.idleMs, () => upstream.destroy());
          upstream.once("connect", () => {
            clearTimeout(timeout);
            upstream.write(buffered);
            socket.pipe(upstream).pipe(socket);
            socket.resume();
          });
        } catch {
          socket.destroy();
        }
      };
      socket.on("data", receive);
      receive(Buffer.alloc(0));
    })().catch(() => reject(socket));
  });
  server.on("upgrade", (_request, socket) => reject(socket));
  server.on("clientError", (_error, socket) => reject(socket));
  server.requestTimeout = egressRuntime.idleMs;
  server.headersTimeout = egressRuntime.connectMs;
  server.maxConnections = egressRuntime.maxConnections;
  return server;
}

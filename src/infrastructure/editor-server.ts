import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  editorContentTypes,
  editorServerLimits,
} from "./editor-server.constants.ts";
import type {
  EditorEventStream,
  EditorEventsResponse,
  EditorServer,
  EditorServerOptions,
} from "./editor-server.types.ts";

class HttpFailure extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function bearer(request: IncomingMessage): string {
  const header = request.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
}

async function body(request: IncomingMessage, limit: number): Promise<unknown> {
  if (Number(request.headers["content-length"] ?? 0) > limit)
    throw new HttpFailure(413, "Request body too large");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes: Buffer = chunk;
    size += bytes.byteLength;
    if (size > limit) throw new HttpFailure(413, "Request body too large");
    chunks.push(bytes);
  }
  if (!size) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpFailure(400, "Request body is not valid JSON");
  }
}

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "cross-origin-resource-policy": "same-origin",
};

function json(response: ServerResponse, status: number, value: unknown) {
  response
    .writeHead(status, {
      ...securityHeaders,
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    })
    .end(JSON.stringify(value));
}

/** Allows only the page's own scripts, including the inline bootstrap of the built shell. */
function contentSecurityPolicy(html: string): string {
  const hashes = [
    ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
  ].map(
    (match) =>
      `'sha256-${createHash("sha256").update(match[1]!).digest("base64")}'`,
  );
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

async function asset(root: string, path: string) {
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    throw new HttpFailure(400, "Invalid path");
  }
  const target = resolve(root, `.${decoded}`);
  const inside = relative(root, target);
  if (inside.startsWith(`..${sep}`) || inside === ".." || isAbsolute(inside))
    throw new HttpFailure(404, "Not found");
  const info = await stat(target).catch(() => undefined);
  if (info?.isFile()) return target;
  if (extname(decoded)) throw new HttpFailure(404, "Not found");
  return resolve(root, "index.html");
}

/** Serves the editor application and its API on the loopback interface only. */
export async function serveEditor(
  options: EditorServerOptions,
): Promise<EditorServer> {
  const expected = digest(options.token);
  const limit = options.maxBytes ?? editorServerLimits.bodyBytes;
  const closing = new AbortController();
  let port = 0;
  const hosts = () => new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  const origins = () =>
    new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`]);

  function authorize(request: IncomingMessage, api: boolean): void {
    if (!hosts().has(request.headers.host ?? ""))
      throw new HttpFailure(403, "Unexpected Host header");
    if (!api) return;
    const origin = request.headers.origin;
    if (origin !== undefined && !origins().has(origin))
      throw new HttpFailure(403, "Cross-origin requests are refused");
    if (!timingSafeEqual(digest(bearer(request)), expected))
      throw new HttpFailure(401, "Missing or invalid editor token");
    if (
      request.method !== "GET" &&
      !(request.headers["content-type"] ?? "").startsWith("application/json")
    )
      throw new HttpFailure(415, "API requests must send application/json");
  }

  async function stream(response: ServerResponse, reply: EditorEventsResponse) {
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, closing.signal]);
    response.writeHead(200, {
      ...securityHeaders,
      "cache-control": "no-store",
      "content-type": "text/event-stream; charset=utf-8",
      connection: "keep-alive",
    });
    response.write("retry: 2000\n\n");
    const heartbeat = setInterval(
      () => response.write(": ping\n\n"),
      editorServerLimits.heartbeatMs,
    );
    heartbeat.unref();
    response.once("close", () => controller.abort());
    const events: EditorEventStream = {
      send: (event, data) => {
        if (signal.aborted) return;
        response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      },
    };
    try {
      await Promise.race([
        reply.events(events, signal),
        new Promise((done) =>
          signal.addEventListener("abort", done, { once: true }),
        ),
      ]);
    } finally {
      clearInterval(heartbeat);
      controller.abort();
      response.end();
    }
  }

  async function serveAsset(
    request: IncomingMessage,
    response: ServerResponse,
    path: string,
  ) {
    if (request.method !== "GET" && request.method !== "HEAD")
      throw new HttpFailure(405, "Method not allowed");
    if (!options.assets) throw new HttpFailure(404, "Not found");
    const file = await asset(options.assets, path);
    const content = await readFile(file).catch(() => {
      throw new HttpFailure(404, "Not found");
    });
    const type =
      editorContentTypes[extname(file) as keyof typeof editorContentTypes] ??
      "application/octet-stream";
    const html = type.startsWith("text/html");
    response.writeHead(200, {
      ...securityHeaders,
      "content-type": type,
      "cache-control": path.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-store",
      ...(html
        ? {
            "content-security-policy": contentSecurityPolicy(
              content.toString("utf8"),
            ),
          }
        : {}),
    });
    response.end(request.method === "HEAD" ? undefined : content);
  }

  const server = createServer(
    {
      headersTimeout: editorServerLimits.headersTimeoutMs,
      requestTimeout: 0,
      maxHeaderSize: editorServerLimits.headerBytes,
    },
    async (request, response) => {
      try {
        const url = new URL(request.url ?? "/", "http://editor");
        const api = url.pathname.startsWith("/api/");
        authorize(request, api);
        if (!api) return await serveAsset(request, response, url.pathname);
        const route = options.routes[`${request.method} ${url.pathname}`];
        if (!route) throw new HttpFailure(404, "Unknown API route");
        const disconnected = new AbortController();
        // The request closes once its body is read; only an unfinished response means a disconnect.
        response.once("close", () => {
          if (!response.writableFinished) disconnected.abort();
        });
        const reply = await route({
          method: request.method ?? "GET",
          path: url.pathname,
          query: url.searchParams,
          body: await body(request, limit),
          signal: AbortSignal.any([disconnected.signal, closing.signal]),
        });
        if ("events" in reply) return await stream(response, reply);
        json(response, reply.status ?? 200, reply.json);
      } catch (error) {
        request.resume();
        if (response.headersSent) {
          response.end();
          return;
        }
        const status = error instanceof HttpFailure ? error.status : 500;
        json(response, status, {
          error: {
            message: error instanceof Error ? error.message : String(error),
          },
        });
      }
    },
  );
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, "127.0.0.1", () => {
      server.off("error", reject);
      done();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Editor server address unavailable");
  port = address.port;
  let closed: Promise<void> | undefined;
  return {
    url: `http://127.0.0.1:${port}`,
    port,
    close: () =>
      (closed ??= new Promise<void>((done, reject) => {
        closing.abort();
        server.close((error) => (error ? reject(error) : done()));
        // Event streams end asynchronously; their sockets become idle afterwards.
        setImmediate(() => server.closeIdleConnections());
      })),
  };
}

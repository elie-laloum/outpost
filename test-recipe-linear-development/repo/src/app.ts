import { createServer } from "node:http";

export function createApp() {
  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    if (request.method !== "GET") {
      response
        .writeHead(405)
        .end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    if (url.pathname === "/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (url.pathname === "/hello") {
      const name = url.searchParams.get("name")?.trim() || "world";
      response.end(JSON.stringify({ message: `Hello, ${name}!` }));
      return;
    }
    response.writeHead(404).end(JSON.stringify({ error: "Not found" }));
  });
}

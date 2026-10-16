import { createServer, connect } from "node:net";
import type { Socket } from "node:net";

export async function redisProxy(host: string, port: number) {
  const sockets = new Set<Socket>();
  let available = true;
  const server = createServer((client) => {
    if (!available) {
      client.destroy();
      return;
    }
    const upstream = connect({ host, port });
    for (const socket of [client, upstream]) {
      sockets.add(socket);
      socket.on("error", () => {
        client.destroy();
        upstream.destroy();
      });
      socket.on("close", () => {
        sockets.delete(socket);
        client.destroy();
        upstream.destroy();
      });
    }
    client.pipe(upstream).pipe(client);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing proxy address");
  return {
    connection: { host: "127.0.0.1", port: address.port },
    disconnect() {
      available = false;
      for (const socket of sockets) socket.destroy();
    },
    reconnect() {
      available = true;
    },
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
  };
}

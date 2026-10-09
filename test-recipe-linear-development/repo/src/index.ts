import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535)
  throw new Error("PORT must be an integer between 0 and 65535");
const server = createApp();
server.listen(port, "0.0.0.0", () => {
  const address = server.address();
  if (address && typeof address === "object")
    process.stdout.write(
      `TypeScript demo: http://localhost:${address.port}/hello?name=Jean\n`,
    );
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => server.close());

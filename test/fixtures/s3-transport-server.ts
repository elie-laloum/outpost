import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";
import type { TestContext } from "node:test";
import { s3Transport } from "../../src/infrastructure/s3-transport.ts";

export async function s3Fixture(t: TestContext) {
  const objects = new Map<
    string,
    { bytes: Buffer; etag: string; date: Date }
  >();
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url!, "http://localhost");
      const key = decodeURIComponent(url.pathname.replace(/^\/bucket\//, ""));
      const error = (status: number, code: string) => {
        response.writeHead(status, { "Content-Type": "application/xml" });
        response.end(
          `<Error><Code>${code}</Code><Message>${code}</Message></Error>`,
        );
      };
      if (url.searchParams.has("list-type")) {
        const prefix = url.searchParams.get("prefix") ?? "";
        const from = Number(url.searchParams.get("continuation-token") ?? "0");
        const entries = [...objects]
          .filter(([key]) => key.startsWith(prefix))
          .sort(([a], [b]) => a.localeCompare(b));
        const page = entries.slice(from, from + 2);
        const next = from + page.length;
        const xml = page
          .map(
            ([key, item]) =>
              `<Contents><Key>${key}</Key><ETag>${item.etag}</ETag><Size>${item.bytes.length}</Size><LastModified>${item.date.toISOString()}</LastModified></Contents>`,
          )
          .join("");
        response.setHeader("Content-Type", "application/xml");
        response.end(
          `<ListBucketResult><IsTruncated>${next < entries.length}</IsTruncated>${next < entries.length ? `<NextContinuationToken>${next}</NextContinuationToken>` : ""}${xml}</ListBucketResult>`,
        );
        return;
      }
      const existing = objects.get(key);
      if (request.method === "PUT") {
        if (request.headers["if-none-match"] === "*" && existing)
          return error(412, "PreconditionFailed");
        if (
          request.headers["if-match"] &&
          request.headers["if-match"] !== existing?.etag
        )
          return error(412, "PreconditionFailed");
        const chunks = [];
        for await (const chunk of request) chunks.push(Buffer.from(chunk));
        const bytes = Buffer.concat(chunks);
        const etag = '"' + createHash("md5").update(bytes).digest("hex") + '"';
        objects.set(key, { bytes, etag, date: new Date() });
        response.setHeader("ETag", etag);
        response.end();
        return;
      }
      if (request.method === "DELETE") {
        if (request.headers["if-match"] !== existing?.etag)
          return error(412, "PreconditionFailed");
        objects.delete(key);
        response.writeHead(204);
        response.end();
        return;
      }
      if (!existing) return error(404, "NoSuchKey");
      response.setHeader("ETag", existing.etag);
      response.setHeader("Content-Length", existing.bytes.length);
      response.end(existing.bytes);
    } catch {
      response.writeHead(500);
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing fixture address");
  const client = new S3Client({
    endpoint: `http://127.0.0.1:${address.port}`,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId: "fixture", secretAccessKey: "fixture" },
    maxAttempts: 1,
  });
  t.after(async () => {
    client.destroy();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
  return {
    transporter: s3Transport({ client, bucket: "bucket", prefix: "project" }),
    objects,
  };
}

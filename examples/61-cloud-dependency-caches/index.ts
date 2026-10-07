// Reuse an npm download in a second cloud sandbox through a private S3 cache.
// Set OUTPOST_CACHE_BUCKET and host AWS/Vercel or Daytona allocation credentials.

import assert from "node:assert/strict";
import { S3Client } from "@aws-sdk/client-s3";
import { createSandbox } from "@elie-laloum/outpost";
import { createS3Transport } from "@elie-laloum/outpost/transports/s3";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";
import { demoRepository } from "../shared/repository.ts";

const bucket = process.env.OUTPOST_CACHE_BUCKET;
assert.ok(
  bucket,
  "Set OUTPOST_CACHE_BUCKET to a private S3 bucket; configure AWS and cloud allocation credentials on the host.",
);
const provider = process.argv[2] ?? "vercel";
assert.ok(
  provider === "vercel" || provider === "daytona",
  "Run node examples/61-cloud-dependency-caches/index.ts [vercel|daytona].",
);
const client = new S3Client({});
const transport = createS3Transport({
  client,
  bucket,
  prefix: "outpost-download-demo",
});
const caches = [{ name: "npm", key: "app-node24", transport }];
const variables = { npm_config_cache: "/outpost/cache/npm" };
const sandboxProvider =
  provider === "vercel"
    ? createVercelSandboxProvider({
        create: { runtime: "node24" },
        caches,
        variables,
      })
    : createDaytonaSandboxProvider({
        create: { image: "node:24" },
        caches,
        variables,
      });
const repository = demoRepository(import.meta.dirname);
try {
  for (const offline of [false, true]) {
    await using sandbox = await createSandbox({ sandboxProvider, repository });
    const result = await sandbox.command({
      executable: "npm",
      arguments: [
        "cache",
        "add",
        "is-number@7.0.0",
        ...(offline ? ["--offline"] : []),
      ],
    });
    assert.equal(result.status, 0, result.stderr);
    console.log(
      offline
        ? "New sandbox reused the archived package offline."
        : "Downloaded package; closing archives the cache.",
    );
  }
} finally {
  client.destroy();
}

import { agent as composeAgent } from "../../src/domain/agent.ts";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { codexHarness } from "../../src/index.ts";
import { dockerSandboxProvider } from "../../src/providers/docker.ts";
import { podmanSandboxProvider } from "../../src/providers/podman.ts";

const directory = await mkdtemp(join(tmpdir(), "outpost-compatible-native-"));
const factory =
  process.env.OUTPOST_CONTAINER_ENGINE === "podman"
    ? podmanSandboxProvider
    : dockerSandboxProvider;
try {
  const lease = await factory({
    image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
    networks: "none",
  }).acquire({
    repository: directory,
    directory,
    gitDirectories: [],
    variables: {},
  });
  try {
    const request = composeAgent({
      harness: codexHarness({
        modelProvider: {
          baseUrl: "http://127.0.0.1:18181/v1",
          apiKeyEnvironment: false,
        },
        saveConversations: false,
      }),
      model: "fixture-model",
    }).request({ text: "Reply with OUTPOST_COMPATIBLE_OK" });
    const script = await readFile(
      new URL("codex-compatible-server.mjs", import.meta.url),
      "utf8",
    );
    const result = await lease.invoke({
      executable: "node",
      arguments: ["--input-type=module", "-e", script, JSON.stringify(request)],
      deadlineMs: 60_000,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /OUTPOST_COMPATIBLE_OK/);
    console.log(
      "Native Codex accepted a custom Responses provider without OpenAI credentials.",
    );
  } finally {
    await lease.release();
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

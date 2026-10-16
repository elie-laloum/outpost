import assert from "node:assert/strict";
import { test } from "node:test";
import { createDockerSandboxProvider } from "../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../src/providers/podman.ts";
import { defineClaudeHook } from "../src/index.ts";
import { openCliHooks } from "../src/application/cli-hooks.ts";
import { repository } from "./helpers.ts";

test(
  "native hook callbacks run through real container streams with cancellation and reuse",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE },
  async (t) => {
    const root = await repository(t);
    const factory =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman"
        ? createPodmanSandboxProvider
        : createDockerSandboxProvider;
    const lease = await factory({
      image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
      networks: "none",
    }).acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    t.after(() => lease.release());
    let client = "";
    const stop = new AbortController();
    const installation = await openCliHooks(
      {
        handlers: [
          defineClaudeHook({
            on: "PreToolUse",
            async run({ sandbox, event }) {
              const output = await sandbox.invoke({
                executable: "node",
                arguments: [
                  "-e",
                  "process.stdout.write('container');process.exitCode=7",
                ],
              });
              assert.equal(output.status, 7);
              assert.equal(output.stdout, "container");
              return {
                hookSpecificOutput: {
                  hookEventName: "PreToolUse",
                  permissionDecision: "deny",
                  permissionDecisionReason: event.tool_name,
                },
              };
            },
          }),
        ],
        async prepare(_sandbox, commands) {
          client = commands[0]!;
          return { command: (c) => c, close: async () => undefined };
        },
      },
      lease,
      stop.signal,
      (error) => stop.abort(error),
    );
    t.after(() => installation.close());
    const result = await lease.invoke(
      installation.command({
        executable: "sh",
        arguments: ["-c", client],
        stdin: JSON.stringify({
          hook_event_name: "PreToolUse",
          session_id: "s",
          cwd: lease.root,
          tool_name: "Bash",
          tool_input: {},
        }),
        deadlineMs: 10_000,
      }),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      JSON.parse(result.stdout).hookSpecificOutput.permissionDecision,
      "deny",
    );
    stop.abort(new Error("cancel bridge"));
    await installation.close();
    assert.equal((await lease.invoke({ executable: "true" })).status, 0);
  },
);

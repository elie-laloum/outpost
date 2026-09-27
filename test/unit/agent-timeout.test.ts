import assert from "node:assert/strict";
import { test } from "node:test";
import { turn } from "../../src/application/agent-turn.ts";
import { OutpostError } from "../../src/domain/errors.ts";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { scripted } from "../helpers.ts";

for (const diagnostic of [
  "Reconnecting... waiting for network (Connection failed: error sending request)",
  "connect ECONNREFUSED http://example.test?token=private-canary",
]) {
  test(`agent timeout preserves the connection diagnosis: ${diagnostic.split(" ")[0]}`, async () => {
    const original = new OutpostError("timeout", "Command exceeded 1000 ms", {
      deadlineMs: 1000,
    });
    const lease: SandboxLease = {
      root: "/fixture",
      home: "/fixture",
      async invoke(command) {
        command.observe?.(
          "stdout",
          JSON.stringify({ kind: "failure", message: diagnostic }) + "\n",
        );
        throw original;
      },
      async upload() {},
      async download() {},
      async release() {},
    };
    await assert.rejects(
      turn(
        lease,
        scripted(""),
        "test",
        { brief: { text: "test" } },
        undefined,
        [],
        1,
        { repository: "/fixture", repair: false },
      ),
      (error: unknown) => {
        assert.ok(error instanceof OutpostError);
        assert.equal(error.code, "timeout");
        assert.match(
          error.message,
          /Command exceeded 1000 ms.*connection.*endpoint.*network/,
        );
        assert.equal(error.details.deadlineMs, 1000);
        assert.equal(error.details.agentDiagnostic, "connection");
        assert.equal(error.cause, original);
        assert.doesNotMatch(
          JSON.stringify(error),
          /private-canary|example.test/,
        );
        return true;
      },
    );
  });
}

for (const code of ["timeout", "aborted", "process"] as const) {
  test(`${code} is preserved without a matching latest connection failure`, async () => {
    const original = new OutpostError(code, "original failure");
    const lease: SandboxLease = {
      root: "/fixture",
      home: "/fixture",
      async invoke(command) {
        command.observe?.(
          "stdout",
          JSON.stringify({ kind: "failure", message: "Connection failed" }) +
            "\n",
        );
        if (code === "timeout")
          command.observe?.(
            "stdout",
            JSON.stringify({ kind: "failure", message: "401 Unauthorized" }) +
              "\n",
          );
        throw original;
      },
      async upload() {},
      async download() {},
      async release() {},
    };
    await assert.rejects(
      turn(
        lease,
        scripted(""),
        "test",
        { brief: { text: "test" } },
        undefined,
        [],
        1,
        { repository: "/fixture", repair: false },
      ),
      (error) => error === original,
    );
  });
}

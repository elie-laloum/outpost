import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createWorkspace,
  createLocalTransport,
  prepareWorkspaceOutputs,
  publishWorkspaceOutputs,
} from "../../src/index.ts";
import { refreshFilePublicationReport } from "../../src/application/recipes/file-publication-report.ts";
import type { Transport } from "../../src/domain/transport.types.ts";
import type { RecipeReport } from "../../src/application/recipe-report.types.ts";

test("an explicitly repeated rolled-back publication completes its original report without replaying tasks", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-publication-receipt-"));
  try {
    await using workspace = await createWorkspace({
      source: { kind: "ephemeral" },
      runtime: { directory: join(root, "control") },
    });
    const output = {
      paths: ["result.json"],
      destination: join(root, "published"),
      policy: "create" as const,
    };
    await prepareWorkspaceOutputs(workspace, [output]);
    await writeFile(join(workspace.directory, "result.json"), "ready");
    const storage = createLocalTransport({
      directory: join(workspace.runtime.directory, "storage"),
    });
    let rejected = false;
    const fault: Transport = {
      ...storage,
      async write(key, bytes, options) {
        const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
        if (
          !rejected &&
          value &&
          typeof value === "object" &&
          "state" in value &&
          value.state === "complete"
        ) {
          rejected = true;
          throw new Error("Publication interrupted");
        }
        return storage.write(key, bytes, options);
      },
    };
    await assert.rejects(publishWorkspaceOutputs(workspace, output, fault));
    const record = await workspace.checkpoint();
    const publication = record.publications?.[0];
    assert.ok(publication);
    assert.equal(publication.state, "rolled-back");
    const report: RecipeReport = {
      name: "recovery",
      executionId: "finished",
      status: "failed",
      workflowStatus: "done",
      workspaceInfo: record,
      fileOutputs: [],
      tasks: [{ key: "produce", status: "done", attempts: 1 }],
      outputs: { produce: { status: 0 } },
      errors: [
        {
          code: "workspace",
          publicationId: publication.id,
          publicationState: "rolled-back",
          message: "Publication failed",
        },
      ],
    };
    const refused = await refreshFilePublicationReport(report, 1);
    assert.equal(refused.status, "failed");
    const replacement = await publishWorkspaceOutputs(workspace, output);
    const recovered = await refreshFilePublicationReport(report, 1);
    assert.equal(recovered.status, "done");
    assert.equal(recovered.fileOutputs?.[0]?.id, replacement.id);
    assert.equal(recovered.tasks, report.tasks);
    assert.deepEqual(recovered.errors, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

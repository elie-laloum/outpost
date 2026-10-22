import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  createWorkspace,
  prepareWorkspaceOutputs,
  publishWorkspaceOutputs,
} from "../../src/workspaces.ts";
import { createLocalTransport } from "../../src/core.ts";
import {
  refreshFilePublicationReport,
  refreshRecipeFilePublications,
} from "../../src/application/recipes/file-publication-report.ts";
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
    const single = await refreshRecipeFilePublications(report, {
      workspace: { outputs: 1 },
    });
    assert.equal(single.fileOutputs?.[0]?.id, replacement.id);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("publication errors of a named workspace refresh against that workspace only", async () => {
  const root = await mkdtemp(join(tmpdir(), "outpost-publication-zones-"));
  try {
    const open = (name: string) =>
      createWorkspace({
        source: { kind: "ephemeral" },
        runtime: { directory: join(root, name) },
      });
    await using main = await open("main");
    await using scratch = await open("scratch");
    const output = (name: string) => ({
      paths: ["result.json"],
      destination: join(root, `published-${name}`),
      policy: "create" as const,
    });
    await prepareWorkspaceOutputs(main, [output("main")]);
    await prepareWorkspaceOutputs(scratch, [output("scratch")]);
    await writeFile(join(main.directory, "result.json"), "main");
    await writeFile(join(scratch.directory, "result.json"), "scratch");
    const published = await publishWorkspaceOutputs(main, output("main"));
    const storage = createLocalTransport({
      directory: join(scratch.runtime.directory, "storage"),
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
    await assert.rejects(
      publishWorkspaceOutputs(scratch, output("scratch"), fault),
    );
    const record = await scratch.checkpoint();
    const failed = record.publications?.[0];
    assert.ok(failed);
    const report: RecipeReport = {
      name: "zones",
      executionId: "finished",
      status: "failed",
      workflowStatus: "done",
      workspaceInfo: await main.checkpoint(),
      fileOutputs: [published],
      workspaces: {
        scratch: { kind: "files", workspaceInfo: record, fileOutputs: [] },
      },
      tasks: [{ key: "produce", status: "done", attempts: 1 }],
      outputs: { produce: { status: 0 } },
      errors: [
        {
          code: "workspace",
          publicationId: failed.id,
          publicationState: failed.state,
          message: "Publication failed",
        },
      ],
    };
    const expected = {
      workspace: { outputs: 1 },
      "workspaces.scratch": { outputs: 1 },
    };
    const refused = await refreshRecipeFilePublications(report, expected);
    assert.equal(refused.status, "failed");
    assert.equal(refused.errors[0]?.publicationId, failed.id);
    assert.equal(refused.fileOutputs?.[0]?.id, published.id);
    const replacement = await publishWorkspaceOutputs(
      scratch,
      output("scratch"),
    );
    const recovered = await refreshRecipeFilePublications(report, expected);
    assert.equal(recovered.status, "done", JSON.stringify(recovered.errors));
    const zone = recovered.workspaces?.scratch;
    assert.equal(
      zone?.kind === "files" && zone.fileOutputs[0]?.id,
      replacement.id,
    );
    assert.equal(recovered.fileOutputs?.[0]?.id, published.id);
    const { workspaceInfo: _main, ...unopened } = report;
    const namedOnly = await refreshRecipeFilePublications(
      { ...unopened, fileOutputs: [] },
      { "workspaces.scratch": { outputs: 1 } },
    );
    assert.equal(namedOnly.status, "done", JSON.stringify(namedOnly.errors));
    assert.equal(namedOnly.workspaceInfo, undefined);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

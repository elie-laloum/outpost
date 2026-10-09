import { join } from "node:path";
import { invariant } from "../../domain/errors.ts";
import { createLocalTransport } from "../../infrastructure/local-transport.ts";
import { workspaceFileLimits } from "../../infrastructure/workspace-files.constants.ts";
import { inspectWorkspacePublication } from "../workspace-publication.ts";
import { inspectFileWorkspace } from "../file-workspace-recovery.ts";
import { workspaceOutputIdentity } from "../workspace-output-baseline.ts";
import { pendingFilePublicationsMessage } from "./file-publication-report.constants.ts";
import type { RecipeReport, RecipeDiagnostic } from "../recipe-report.types.ts";
import type { WorkspacePublication } from "../../domain/file-workspace.types.ts";
import type {
  Transport,
  TransportReference,
} from "../../domain/transport.types.ts";
import type { PublicationJournal } from "../workspace-publication.types.ts";

export async function refreshFilePublicationReport(
  report: RecipeReport,
  expectedOutputs: number,
  publicationTransport?: Transport,
): Promise<RecipeReport> {
  invariant(
    report.workspaceInfo && report.workflowStatus === "done",
    "Publication recovery requires completed workflow tasks and a retained file record",
  );
  const workspaceInfo = report.workspaceInfo;
  const transporter =
    publicationTransport ??
    createLocalTransport({
      directory: join(report.workspaceInfo.runtime.directory, "storage"),
    });
  const fileOutputs = new Map(
    (report.fileOutputs ?? []).map((output) => [`id:${output.id}`, output]),
  );
  const publications = [...(report.workspaceInfo.publications ?? [])];
  const errors: RecipeDiagnostic[] = [];
  const rolledBack = new Map<string, string>();
  const read = async (id: string) => {
    const key = `publications/${workspaceInfo.runtime.namespace}/${id}`;
    const value = await transporter.read(key, {
      maxBytes: workspaceFileLimits.manifestBytes,
    });
    invariant(
      value,
      "Publication journal is unavailable; completed tasks will not be replayed",
    );
    const reference = { key, revision: value.revision };
    const journal = await inspectWorkspacePublication(transporter, reference);
    invariant(
      journal.id === id && journal.workspaceId === workspaceInfo.id,
      "Publication recovery workspace identity mismatch",
    );
    return { journal, reference };
  };
  const observe = (
    journal: PublicationJournal,
    reference: TransportReference,
  ) => {
    const observed = { id: journal.id, state: journal.state, reference };
    const recorded = publications.findIndex((entry) => entry.id === journal.id);
    if (recorded >= 0) publications[recorded] = observed;
    if (recorded < 0) publications.push(observed);
  };
  const completed = (
    journal: PublicationJournal,
    reference: TransportReference,
  ) => {
    const publication: WorkspacePublication = {
      id: journal.id,
      destination: journal.options.destination,
      state: "complete",
      created: journal.operations
        .filter((op) => !op.previous && op.incoming)
        .map((op) => op.path),
      replaced: journal.operations
        .filter((op) => op.previous && op.incoming)
        .map((op) => op.path),
      deleted: journal.operations
        .filter((op) => !op.incoming)
        .map((op) => op.path),
      reference,
    };
    fileOutputs.delete(`id:${journal.id}`);
    fileOutputs.set(workspaceOutputIdentity(journal.options), publication);
  };
  for (const error of report.errors) {
    if (
      error.code === "workspace" &&
      error.message === pendingFilePublicationsMessage
    )
      continue;
    if (!error.publicationId) {
      errors.push(error);
      continue;
    }
    const { journal, reference } = await read(error.publicationId);
    observe(journal, reference);
    if (journal.state !== "complete") {
      if (journal.state === "rolled-back")
        rolledBack.set(journal.id, workspaceOutputIdentity(journal.options));
      errors.push({ ...error, publicationState: journal.state });
      continue;
    }
    completed(journal, reference);
  }
  const current = await inspectFileWorkspace({
    id: workspaceInfo.id,
    runtime: workspaceInfo.runtime,
    transporter,
  });
  invariant(
    current.record.kind === workspaceInfo.kind &&
      current.record.inputFingerprint === workspaceInfo.inputFingerprint,
    "Publication recovery input identity mismatch",
  );
  const expected = new Set(
    (workspaceInfo.publicationBaselines ?? []).map((baseline) =>
      workspaceOutputIdentity(baseline.options),
    ),
  );
  for (const publication of current.record.publications ?? []) {
    const { journal, reference } = await read(publication.id);
    observe(journal, reference);
    if (
      journal.state === "complete" &&
      expected.has(workspaceOutputIdentity(journal.options))
    )
      completed(journal, reference);
  }
  const remainingErrors = errors.filter((error) => {
    const output = error.publicationId
      ? rolledBack.get(error.publicationId)
      : undefined;
    return !output || !fileOutputs.has(output);
  });
  if (!remainingErrors.length && fileOutputs.size !== expectedOutputs)
    remainingErrors.push({
      code: "workspace",
      message: pendingFilePublicationsMessage,
    });
  return {
    ...report,
    workspaceInfo: { ...report.workspaceInfo, publications },
    fileOutputs: [...fileOutputs.values()],
    errors: remainingErrors,
    status: remainingErrors.length ? "failed" : "done",
  };
}

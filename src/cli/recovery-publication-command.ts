import { invariant } from "../domain/errors.ts";
import {
  inspectWorkspacePublication,
  recoverWorkspacePublication,
} from "../application/workspace-publication.ts";
import type { CliInvocation } from "./main.types.ts";
import { useFileRecoveryTransport } from "./recovery-file-transport.ts";
import { workspaceFileLimits } from "../infrastructure/workspace-files.constants.ts";
import { createRecipeRuntime } from "../application/recipes/runtime.ts";

export async function recoveryPublicationCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  const action = positionals[2];
  invariant(
    positionals.length === 3 &&
      (action === "inspect" || action === "finish" || action === "rollback"),
    "Usage: outpost recovery publication inspect|finish|rollback --runtime-directory PATH --namespace NAME --publication-id ID [--json]",
  );
  invariant(
    values["runtime-directory"] && values.namespace && values["publication-id"],
    "Publication recovery requires runtime directory, namespace and publication ID",
  );
  const refresh = action !== "inspect" && !!values["run-id"];
  if (refresh)
    invariant(
      values.file && values.config,
      "Recipe publication state refresh requires --file, --config and --run-id together",
    );
  await useFileRecoveryTransport(values, async (transporter) => {
    const key = `publications/${values.namespace}/${values["publication-id"]}`;
    const current = await transporter.read(key, {
      maxBytes: workspaceFileLimits.manifestBytes,
    });
    invariant(current, "Publication journal was not found");
    if (refresh) {
      invariant(
        values.file && values.config && values["run-id"],
        "Recipe publication state refresh requires --file, --config and --run-id together",
      );
      await using runtime = await createRecipeRuntime({
        file: values.file,
        config: values.config,
      });
      const previous = await runtime.status(values["run-id"]);
      invariant(
        previous?.report?.errors.some(
          (error) => error.publicationId === values["publication-id"],
        ),
        "Publication does not belong to the selected failed recipe report",
      );
    }
    let reference = { key, revision: current.revision };
    if (action !== "inspect")
      reference = await recoverWorkspacePublication(
        transporter,
        reference,
        action,
        values["processes-stopped"] ? { processesStopped: true } : {},
      );
    const report = await inspectWorkspacePublication(transporter, reference);
    if (refresh) {
      await using runtime = await createRecipeRuntime({
        file: values.file!,
        config: values.config!,
      });
      await runtime.resume({ runId: values["run-id"]! });
    }
    process.stdout.write(
      values.json
        ? `${JSON.stringify(report)}\n`
        : `${report.id}: ${report.state}\nDestination: ${report.options.destination}\nBackup: ${report.backup}\n`,
    );
  });
}

import { resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import {
  inspectFileWorkspace,
  recoverFileWorkspace,
} from "../application/file-workspace-recovery.ts";
import { createDockerSandboxProvider } from "../providers/docker.ts";
import { createPodmanSandboxProvider } from "../providers/podman.ts";
import type { CliInvocation } from "./main.types.ts";
import { useFileRecoveryTransport } from "./recovery-file-transport.ts";

export async function recoveryWorkspaceCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  const action = positionals[2];
  invariant(
    positionals.length === 3 && (action === "inspect" || action === "recover"),
    "Usage: outpost recovery workspace inspect|recover --runtime-directory PATH --namespace NAME --workspace-id ID [--json]",
  );
  invariant(
    values["runtime-directory"] && values.namespace && values["workspace-id"],
    "Workspace recovery requires runtime directory, namespace and workspace ID",
  );
  const runtime = {
    directory: resolve(values["runtime-directory"]),
    namespace: values.namespace,
  };
  const workspaceId = values["workspace-id"];
  await useFileRecoveryTransport(values, async (transporter, retention) => {
    let inspection = await inspectFileWorkspace({
      runtime,
      id: workspaceId,
      transporter,
    });
    if (action === "recover") {
      invariant(
        values["processes-stopped"] && values.revision,
        "Workspace recovery requires --processes-stopped and the inspected --revision",
      );
      const factory = {
        docker: createDockerSandboxProvider,
        podman: createPodmanSandboxProvider,
      };
      const name = inspection.record.allocation?.provider;
      const provider =
        name === "docker" || name === "podman" ? factory[name]() : undefined;
      const workspace = await recoverFileWorkspace(inspection.record, {
        runtime,
        ...(retention ? { retention } : {}),
        ...(values.portable ? { portable: true } : {}),
        expectedRevision: values.revision,
        processesStopped: true,
        ...(provider ? { sandboxProvider: provider } : {}),
        recover: {
          processesStopped: true,
          ...(values["allocation-released"]
            ? { allocationReleased: true }
            : {}),
          ...(values["adopt-files"] ? { adoptInterruptedFiles: true } : {}),
          ...(values["adopt-source"] ? { adoptMountedSource: true } : {}),
        },
      });
      try {
        await workspace.checkpoint();
      } finally {
        await workspace.close({ preserve: true });
      }
      inspection = await inspectFileWorkspace({
        runtime,
        id: workspace.id,
        transporter,
      });
    }
    process.stdout.write(
      values.json
        ? `${JSON.stringify(inspection)}\n`
        : `${inspection.record.id}: ${inspection.record.owner.state}\nRevision: ${inspection.reference.revision}\nGeneration: ${inspection.record.generation}\nDirectory: ${inspection.record.directory}\n`,
    );
  });
}

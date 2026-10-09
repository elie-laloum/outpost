import { join, resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import type { Transport } from "../domain/transport.types.ts";
import type { WorkspaceRetention } from "../domain/file-workspace.types.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { readRecipeProject } from "../application/recipes/project.ts";
import { createRecipeComponentScope } from "../application/recipes/scope.ts";
import { nativeRecipeGuards } from "../application/recipes/native.ts";
import type { CliInvocation } from "./main.types.ts";

function isRecoveryTransport(value: unknown): value is Transport {
  return nativeRecipeGuards.transport!(value);
}

export async function useFileRecoveryTransport(
  values: CliInvocation["values"],
  inspect: (
    transporter: Transport,
    retention?: WorkspaceRetention,
  ) => Promise<void>,
): Promise<void> {
  const local = () =>
    createLocalTransport({
      directory: join(resolve(values["runtime-directory"]!), "storage"),
    });
  if (!values.file && !values.config) {
    await inspect(local());
    return;
  }
  invariant(
    values.file && values.config,
    "Configured file recovery requires --file and --config together",
  );
  const project = await readRecipeProject({
    file: values.file,
    config: values.config,
  });
  const scope = createRecipeComponentScope(
    project.graph,
    project.registry,
    project.directory,
    new AbortController().signal,
  );
  try {
    await scope.prepare();
    const retention = project.files?.retention;
    if (retention?.policy !== "portable") {
      await inspect(local());
      return;
    }
    invariant(
      project.files?.runtime.namespace === values.namespace,
      "Recovery namespace does not match configured portable workspace",
    );
    const transporter = await scope.resolve(retention.transporter, "transport");
    invariant(
      isRecoveryTransport(transporter),
      "Invalid configured recovery Transport",
    );
    await inspect(transporter, { policy: "portable", transporter });
  } finally {
    await scope.close();
  }
}

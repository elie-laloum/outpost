import { createDockerSandboxProvider } from "../providers/docker.ts";
import { createPodmanSandboxProvider } from "../providers/podman.ts";
import { createLocalSandboxProvider } from "../providers/local.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import type { Variables } from "../domain/command.types.ts";
import {
  configurationObject,
  configurationText,
  configurationNumber,
} from "./recipe-configuration-values.ts";
import { recipeConfigurationKeys } from "./recipe-configuration.constants.ts";

export async function configurationProvider(
  value: unknown,
  variables: Variables,
): Promise<SandboxProvider> {
  const record = configurationObject(
    value,
    "sandbox",
    recipeConfigurationKeys.sandbox,
  );
  const name = configurationText(record.provider, "sandbox.provider");
  const options = {
    variables,
    ...(record.image === undefined
      ? {}
      : { image: configurationText(record.image, "sandbox.image") }),
    ...(record.cpus === undefined
      ? {}
      : { cpus: configurationNumber(record.cpus, "sandbox.cpus") }),
    ...(record.memoryMb === undefined
      ? {}
      : { memoryMb: configurationNumber(record.memoryMb, "sandbox.memoryMb") }),
  };
  const containers = {
    docker: createDockerSandboxProvider,
    podman: createPodmanSandboxProvider,
  };
  if (name === "docker" || name === "podman") return containers[name](options);
  if (
    record.cpus !== undefined ||
    record.memoryMb !== undefined ||
    (record.image !== undefined && name !== "daytona")
  )
    throw new Error(`Unsupported sandbox options for ${name}`);
  const providers: Readonly<
    Record<string, () => SandboxProvider | Promise<SandboxProvider>>
  > = {
    local: () => createLocalSandboxProvider({ variables }),
    vercel: async () =>
      (await import("../providers/vercel.ts")).createVercelSandboxProvider({
        variables,
      }),
    daytona: async () =>
      (await import("../providers/daytona.ts")).createDaytonaSandboxProvider({
        variables,
        ...(options.image ? { create: { image: options.image } } : {}),
      }),
  };
  if (!Object.hasOwn(providers, name))
    throw new Error(`Unknown recipe sandbox provider: ${name}`);
  return providers[name]!();
}

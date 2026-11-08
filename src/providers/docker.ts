import { containerProvider } from "./container.ts";
import { listContainerSandboxes } from "./container-inventory.ts";
import type {
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";
import { recoverContainer } from "./container-recovery.ts";
import type {
  SandboxProvider,
  TransferOptions,
} from "../domain/sandbox.types.ts";
import { executeProcess } from "../infrastructure/process.ts";
import type { ContainerOptions } from "./container.types.ts";

export type { ContainerOptions } from "./container.ts";

export const createDockerSandboxProvider = (
  options: ContainerOptions = {},
): SandboxProvider => containerProvider("docker", options);

export const listDockerSandboxes = (
  query: ContainerSandboxQuery,
): Promise<ContainerSandbox[]> => listContainerSandboxes("docker", query);

export const removeDockerSandbox = (
  name: string,
  options: TransferOptions = {},
): Promise<void> => recoverContainer("docker", executeProcess, name, options);

export type { DependencyCache } from "./container-cache.types.ts";

export type {
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";

export type {
  ContainerImageMount,
  ContainerLabels,
} from "./container.types.ts";

export type { EgressPolicy } from "../domain/egress.types.ts";

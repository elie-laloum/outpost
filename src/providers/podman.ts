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

export const createPodmanSandboxProvider = (
  options: ContainerOptions = {},
): SandboxProvider => containerProvider("podman", options);

export const listPodmanSandboxes = (
  query: ContainerSandboxQuery,
): Promise<ContainerSandbox[]> => listContainerSandboxes("podman", query);

export const removePodmanSandbox = (
  name: string,
  options: TransferOptions = {},
): Promise<void> => recoverContainer("podman", executeProcess, name, options);

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

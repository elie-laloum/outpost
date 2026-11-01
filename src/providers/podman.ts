import { containerProvider } from "./container.ts";
import {
  listContainerSandboxes,
  removeContainerSandbox,
} from "./container-inventory.ts";
import type {
  ContainerInventoryOptions,
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";
import type { ContainerOptions } from "./container.types.ts";

export type { ContainerOptions } from "./container.ts";

export const createPodmanSandboxProvider = (options: ContainerOptions = {}) =>
  containerProvider("podman", options);

export const listPodmanSandboxes = (
  query: ContainerSandboxQuery,
): Promise<ContainerSandbox[]> => listContainerSandboxes("podman", query);

export const removePodmanSandbox = (
  name: string,
  options: ContainerInventoryOptions = {},
): Promise<void> => removeContainerSandbox("podman", name, options);

export type { DependencyCache } from "./container-cache.types.ts";

export type {
  ContainerInventoryOptions,
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";

export type { ContainerLabels } from "./container.types.ts";

export type { EgressPolicy } from "../domain/egress.types.ts";

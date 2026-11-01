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

export const createDockerSandboxProvider = (options: ContainerOptions = {}) =>
  containerProvider("docker", options);

export const listDockerSandboxes = (
  query: ContainerSandboxQuery,
): Promise<ContainerSandbox[]> => listContainerSandboxes("docker", query);

export const removeDockerSandbox = (
  name: string,
  options: ContainerInventoryOptions = {},
): Promise<void> => removeContainerSandbox("docker", name, options);

export type { DependencyCache } from "./container-cache.types.ts";

export type {
  ContainerInventoryOptions,
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";

export type { ContainerLabels } from "./container.types.ts";

export type { EgressPolicy } from "../domain/egress.types.ts";

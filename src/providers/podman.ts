import { containerProvider } from "./container.ts";
import type { ContainerOptions } from "./container.types.ts";

export type { ContainerOptions } from "./container.ts";

export const podman = (options: ContainerOptions = {}) =>
  containerProvider("podman", options);

export type { DependencyCache } from "./container-cache.types.ts";

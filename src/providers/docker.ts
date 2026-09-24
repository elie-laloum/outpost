import { containerProvider } from "./container.ts";
import type { ContainerOptions } from "./container.types.ts";

export type { ContainerOptions } from "./container.ts";

export const docker = (options: ContainerOptions = {}) =>
  containerProvider("docker", options);

export type { DependencyCache } from "./container-cache.types.ts";

import { containerProvider } from "./container.ts";
import type { ContainerOptions } from "./container.ts";
export type { ContainerOptions } from "./container.ts";
export const docker = (options: ContainerOptions = {}) =>
  containerProvider("docker", options);

import { containerProvider } from "./container.ts";
import type { ContainerOptions } from "./container.ts";
export type { ContainerOptions } from "./container.ts";
export const podman = (options: ContainerOptions = {}) =>
  containerProvider("podman", options);

import type { ContainerLabels } from "./container.types.ts";

export interface ContainerInventoryOptions {
  readonly signal?: AbortSignal;
  readonly deadlineMs?: number;
}

export interface ContainerSandboxQuery extends ContainerInventoryOptions {
  readonly labels: ContainerLabels;
}

export interface ContainerSandbox {
  readonly name: string;
  readonly labels: ContainerLabels;
}

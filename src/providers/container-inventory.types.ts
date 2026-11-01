import type { TransferOptions } from "../domain/sandbox.types.ts";
import type { ContainerLabels } from "./container.types.ts";

export interface ContainerSandboxQuery extends TransferOptions {
  readonly labels: ContainerLabels;
}

export interface ContainerSandbox {
  readonly name: string;
  readonly labels: ContainerLabels;
}

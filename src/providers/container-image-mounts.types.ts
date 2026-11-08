import type {
  ContainerEngine,
  ContainerImageMount,
} from "./container.types.ts";

export interface ContainerImageMountArgument {
  readonly image: string;
  readonly subpath?: string;
  readonly target: string;
}

export type ContainerImageMountFormat = (
  mount: ContainerImageMountArgument,
) => string;

export interface ContainerImageMountPlan {
  readonly engine: ContainerEngine;
  readonly mounts: readonly ContainerImageMount[];
  readonly root: string;
  readonly home: string;
}

/** A resolved image mount target with the fixed paths of its sandbox mode. */
export interface ContainerImageMountPlacement {
  readonly target: string;
  readonly root: string;
  readonly home: string;
  readonly isolated: boolean;
}

/** Returns why a target conflicts with Outpost's own paths, or nothing. */
export type ContainerImageMountTargetRule = (
  placement: ContainerImageMountPlacement,
) => string | undefined;

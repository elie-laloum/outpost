import type {
  Command,
  CommandResult,
  Variables,
} from "../domain/command.types.ts";
import type { Volume } from "../domain/sandbox.types.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import type { DependencyCache } from "./container-cache.types.ts";

export interface ContainerOptions {
  readonly repositoryMode?: "mounted" | "isolated";
  readonly caches?: readonly DependencyCache[];
  readonly image?: string;
  readonly user?: { readonly uid: number; readonly gid: number };
  readonly volumes?: readonly Volume[];
  readonly variables?: Variables;
  readonly networks?: string | readonly string[];
  readonly groups?: readonly (string | number)[];
  readonly devices?: readonly string[];
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly label?: "z" | "Z" | false;
  readonly retain?: number;
  readonly userns?: "keep-id" | false;
}

export type ContainerEngine = "docker" | "podman";
export type ContainerCall = (
  args: readonly string[],
  extra?: Partial<Command>,
) => Promise<CommandResult>;
export interface ContainerRuntime {
  readonly engine: ContainerEngine;
  readonly config: ContainerOptions;
  readonly executor: Executor;
  readonly root: string;
  readonly name: string;
  readonly env: Record<string, string>;
  readonly call: ContainerCall;
  readonly isClosed: () => boolean;
}
export interface ContainerMounts {
  readonly env: Record<string, string>;
  readonly volumes: string[];
  readonly fileParents: Set<string>;
}

export interface ContainerUser {
  readonly uid: number;
  readonly gid: number;
}
export interface ContainerPlanOptions {
  readonly config: ContainerOptions;
  readonly engine: ContainerEngine;
  readonly user: ContainerUser;
  readonly root: string;
  readonly name: string;
  readonly image: string;
  readonly volumes: readonly string[];
  readonly fileParents: ReadonlySet<string>;
}

import type { Variables } from "../domain/command.types.ts";
import type { Executor } from "../infrastructure/process.types.ts";

export interface FirecrackerOptions {
  readonly binary: string;
  readonly kernel: string;
  readonly rootfs: string;
  readonly tap: string;
  readonly guestMac: string;
  readonly bootArgs: string;
  readonly ssh: {
    readonly host: string;
    readonly user: string;
    readonly identity: string;
    readonly knownHosts: string;
    readonly port?: number;
    readonly binary?: string;
  };
  readonly root?: string;
  readonly home: string;
  readonly cpus?: number;
  readonly memoryMb?: number;
  readonly bootDeadlineMs?: number;
  readonly variables?: Variables;
  readonly jailer?: {
    readonly binary: string;
    readonly directory: string;
    readonly cgroup: string;
    readonly uid: number;
    readonly gid: number;
    readonly cpuQuotaUs: number;
    readonly memoryMaxMb: number;
    readonly processes: number;
  };
}

export interface FirecrackerRuntime {
  readonly options: FirecrackerOptions;
  readonly root: string;
  readonly variables: Variables;
  readonly isClosed: () => boolean;
  readonly executor: Executor;
}

export interface FirecrackerMachine {
  readonly directory: string;
  readonly isClosed: () => boolean;
  release(): Promise<void>;
}

export interface FirecrackerLaunch {
  readonly binary: string;
  readonly arguments: readonly string[];
  stop(): Promise<void>;
  cleanup(): Promise<void>;
}

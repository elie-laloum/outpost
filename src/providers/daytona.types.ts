import type {
  CreateSandboxFromImageParams,
  CreateSandboxFromSnapshotParams,
  DaytonaConfig,
  Sandbox as DaytonaSandbox,
} from "@daytona/sdk";
import type { Variables } from "../domain/command.types.ts";
import type { SandboxContext } from "../domain/sandbox.types.ts";

export interface DaytonaOptions {
  readonly connection?: DaytonaConfig;
  readonly create?:
    CreateSandboxFromImageParams | CreateSandboxFromSnapshotParams;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}

export interface DaytonaRuntime {
  readonly sandbox: DaytonaSandbox;
  readonly root: string;
  readonly options: DaytonaOptions;
  readonly context: SandboxContext;
  readonly isClosed: () => boolean;
}

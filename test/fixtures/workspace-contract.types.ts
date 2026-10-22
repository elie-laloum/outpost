import type { Command, CommandResult } from "../../src/domain/command.types.ts";
import type { SandboxProvider } from "../../src/domain/sandbox.types.ts";
import type { Disposal } from "../../src/domain/workspace.types.ts";

/** The sandbox surface Git and file sandboxes share. */
export interface ContractSandbox {
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
}

/** The workspace surface Git and file workspaces share. */
export interface ContractWorkspace {
  readonly directory: string;
  sandbox(options: {
    readonly sandboxProvider: SandboxProvider;
  }): Promise<ContractSandbox>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}

/** Cleanups run in reverse order after the workspace and its sandboxes close. */
export interface ContractScope {
  after(cleanup: () => Promise<unknown>): void;
}

export interface WorkspaceContractTarget {
  readonly name: string;
  readonly open: (scope: ContractScope) => Promise<ContractWorkspace>;
  readonly sandboxProvider: () => SandboxProvider;
  /** Executable that runs `-e` scripts inside the sandbox. */
  readonly node: string;
  /** Whether the workspace owns its directory and reports it when retained. */
  readonly owned: boolean;
  /** What close() without preservation does with uncommitted files the sandbox wrote. */
  readonly unpreserved: "retained" | "removed";
}

export interface WorkspaceContractEnvironment {
  readonly name: string;
  readonly node: string;
  readonly gitProvider: () => SandboxProvider;
  readonly fileProvider: () => SandboxProvider;
}

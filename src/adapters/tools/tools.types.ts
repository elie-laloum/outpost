import type { GIT_READ_COMMANDS } from "./tools.constants.ts";

export interface ReadFileInput {
  readonly path: string;
  readonly offset?: number;
  readonly limit?: number;
}

export interface ListFilesInput {
  readonly path?: string;
  readonly pattern?: string;
}

export interface WriteFileInput {
  readonly path: string;
  readonly content: string;
}

export interface EditFileInput {
  readonly path: string;
  readonly old_text: string;
  readonly new_text: string;
  readonly replace_all?: boolean;
}

export interface SearchInput {
  readonly pattern: string;
  readonly path?: string;
  readonly glob?: string;
  readonly ignore_case?: boolean;
  readonly max_results?: number;
}

export interface ShellInput {
  readonly command: string;
}

export interface GitInput {
  readonly command: (typeof GIT_READ_COMMANDS)[number];
  readonly arguments?: readonly string[];
}

export interface ShellToolsOptions {
  readonly deadlineMs?: number;
}

export interface SandboxFile {
  readonly staged: string;
  readonly bytes: Buffer;
}

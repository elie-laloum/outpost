import type { cliOptions } from "./main.constants.ts";

export type CliValues = {
  readonly [
    Key in keyof typeof cliOptions
  ]?: (typeof cliOptions)[Key]["type"] extends "boolean" ? boolean : string;
};
export interface CliInvocation {
  readonly values: CliValues;
  readonly positionals: readonly string[];
}
export type CliCommand = (invocation: CliInvocation) => Promise<void>;

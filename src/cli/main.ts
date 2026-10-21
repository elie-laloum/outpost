#!/usr/bin/env node
import { ConfigurationError } from "../domain/configuration-diagnostic.ts";
import { runCli } from "./commands.ts";

function errorText(error: unknown): string {
  if (error instanceof ConfigurationError && process.argv.includes("--json"))
    return JSON.stringify({ error: error.diagnostic });
  return error instanceof Error ? error.message : String(error);
}

try {
  await runCli();
} catch (error) {
  process.stderr.write(`${errorText(error)}\n`);
  if (!process.exitCode) process.exitCode = 1;
}

#!/usr/bin/env node
import { runCli } from "./commands.ts";

try {
  await runCli();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  if (!process.exitCode) process.exitCode = 1;
}

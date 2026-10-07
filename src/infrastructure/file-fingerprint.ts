import { OutpostError } from "../domain/errors.ts";
import type { Command } from "../domain/command.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { requireSuccess } from "./process.ts";
import {
  fingerprintRetainBytes,
  fingerprintScript,
} from "./file-fingerprint.constants.ts";

export async function fileFingerprint(
  files: readonly string[],
  command: Command,
  invoke: SandboxLease["invoke"],
): Promise<string> {
  const result = await requireSuccess(
    {
      executable: "node",
      arguments: ["-e", fingerprintScript, JSON.stringify(files)],
      ...(command.directory !== undefined
        ? { directory: command.directory }
        : {}),
      ...(command.variables ? { variables: command.variables } : {}),
      ...(command.signal ? { signal: command.signal } : {}),
      ...(command.deadlineMs !== undefined
        ? { deadlineMs: command.deadlineMs }
        : {}),
      ...(command.elevated ? { elevated: true } : {}),
      retain: fingerprintRetainBytes,
    },
    invoke,
  );
  if (!/^[a-f0-9]{64}$/.test(result.stdout))
    throw new OutpostError("process", "Invalid lifecycle file fingerprint");
  return result.stdout;
}

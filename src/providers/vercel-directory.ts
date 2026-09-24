import { OutpostError } from "../domain/errors.ts";
import type { VercelRuntime } from "./vercel.types.ts";

export async function vercelDirectory(
  sandbox: VercelRuntime["sandbox"],
  path: string,
): Promise<void> {
  const result = await sandbox.runCommand("mkdir", ["-p", "--", path]);
  if (result.exitCode !== 0)
    throw new OutpostError(
      "provider",
      `Could not create remote directory ${path}: ${await result.stderr()}`,
    );
}

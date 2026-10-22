import { rename } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { transportDefaults } from "./transport.constants.ts";

const lockedReplacement = new Set(["EPERM", "EACCES", "EBUSY"]);

export async function replaceFile(
  source: string,
  target: string,
  signal?: AbortSignal,
): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await rename(source, target);
    } catch (error) {
      // Windows refuses to replace a file while a concurrent reader holds it open.
      if (
        process.platform !== "win32" ||
        attempt >= transportDefaults.replaceAttempts ||
        !lockedReplacement.has((error as NodeJS.ErrnoException).code ?? "")
      )
        throw error;
      await setTimeout(transportDefaults.retryMs, undefined, { signal });
    }
  }
}

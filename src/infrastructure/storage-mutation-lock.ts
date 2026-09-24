import { setTimeout } from "node:timers/promises";
import { OutpostError } from "../domain/errors.ts";
import { lock } from "./git/lock.ts";
import { storageMutationLockDefaults as defaults } from "./storage-mutation-lock.constants.ts";

export async function lockStorageMutation(root: string, signal?: AbortSignal) {
  const deadline = Date.now() + defaults.lockWaitMs;
  while (true) {
    signal?.throwIfAborted();
    try {
      return await lock(root, defaults.lockKey);
    } catch (error) {
      if (
        !(error instanceof OutpostError) ||
        error.code !== "conflict" ||
        Date.now() >= deadline
      )
        throw error;
      await setTimeout(defaults.lockPollMs, undefined, { signal });
    }
  }
}

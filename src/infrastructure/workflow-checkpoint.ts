import { readInspectionFile } from "./inspection-file.ts";
import { workflowCheckpointMaxBytes } from "./workflow-checkpoint.constants.ts";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, realpath, rename, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { WorkflowCheckpointStore } from "../domain/workflow/checkpoint.types.ts";
import type { FileWorkflowCheckpointOptions } from "./workflow-checkpoint.types.ts";
import { lock } from "./git/lock.ts";

export function fileWorkflowCheckpointStore(
  options: FileWorkflowCheckpointOptions,
): WorkflowCheckpointStore {
  const configuredDirectory = resolve(options.directory);
  return {
    async acquire(runId) {
      if (!runId.trim()) throw new Error("Checkpoint runId must not be empty");
      await mkdir(configuredDirectory, { recursive: true, mode: 0o700 });
      const directory = await realpath(configuredDirectory);
      const release = await lock(directory, `workflow:${runId}`);
      const path = join(
        directory,
        `${createHash("sha256").update(runId).digest("hex")}.json`,
      );
      let released = false;
      const assertOwned = () => {
        if (released) throw new Error("Checkpoint lease has been released");
      };
      return {
        async read() {
          assertOwned();
          try {
            return JSON.parse(
              (
                await readInspectionFile(path, workflowCheckpointMaxBytes)
              ).toString("utf8"),
            ) as unknown;
          } catch (error) {
            if (
              error &&
              typeof error === "object" &&
              "code" in error &&
              error.code === "ENOENT"
            )
              return undefined;
            throw error;
          }
        },
        async write(checkpoint) {
          assertOwned();
          const data = JSON.stringify(checkpoint);
          if (Buffer.byteLength(data) > workflowCheckpointMaxBytes)
            throw new Error(
              "Workflow checkpoint exceeds 16 MiB; store large artifacts separately",
            );
          const temporary = `${path}.${randomUUID()}.tmp`;
          try {
            const file = await open(temporary, "wx", 0o600);
            try {
              await file.writeFile(data);
              await file.sync();
            } finally {
              await file.close();
            }
            await rename(temporary, path);
            if (process.platform !== "win32") {
              const parent = await open(directory, "r");
              try {
                await parent.sync();
              } finally {
                await parent.close();
              }
            }
          } finally {
            await rm(temporary, { force: true });
          }
        },
        async release() {
          if (released) return;
          released = true;
          await release();
        },
      };
    },
  };
}

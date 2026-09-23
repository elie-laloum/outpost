import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import { prepareBrief } from "../domain/prompts.ts";
import type { Brief } from "../domain/prompts.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type { WorkspaceRecord } from "../domain/workspace.types.ts";
import { shell } from "../infrastructure/process.ts";
import { executionDefaults } from "./execution.constants.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { notify } from "./observation.ts";

export async function renderBrief(
  brief: Brief,
  workspace: WorkspaceRecord,
  lease: SandboxLease,
  host: boolean,
  options: Pick<
    DispatchOptions,
    "signal" | "expansionMs" | "warn" | "diagnostic"
  >,
): Promise<string> {
  if (brief.text !== undefined) return brief.text;
  const source = await readFile(resolve(brief.file), "utf8");
  const prepared = prepareBrief(source, brief.values, {
    WORK_BRANCH: workspace.branch,
    BASE_BRANCH: workspace.baseBranch,
  });
  if (prepared.unused.length)
    notify(
      options.warn,
      `Unused prompt variables: ${prepared.unused.join(", ")}`,
    );
  const controller = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;
  const pending = prepared.fragments.map(async (fragment) => {
    if (fragment.kind === "literal") return fragment.value;
    try {
      const command = host
        ? shell(fragment.value)
        : { executable: "sh", arguments: ["-c", fragment.value] };
      const result = await lease.invoke({
        ...command,
        signal,
        deadlineMs: options.expansionMs ?? executionDefaults.expansionMs,
      });
      if (result.status !== 0)
        throw new OutpostError("prompt", "Prompt command failed", {
          command: fragment.value,
          ...result,
        });
      notify(
        options.diagnostic,
        `Prompt command expanded to approximately ${Math.ceil(result.stdout.length / 4)} tokens`,
      );
      return result.stdout.trimEnd();
    } catch (cause) {
      controller.abort(cause);
      throw cause;
    }
  });
  const results = await Promise.allSettled(pending);
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
  return results
    .map((result) => (result as PromiseFulfilledResult<string>).value)
    .join("");
}

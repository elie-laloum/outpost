import type { RequiredAgent } from "../domain/agent.types.ts";
import { invariant } from "../domain/errors.ts";
import { validateBrief } from "../domain/prompts.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { storageFor } from "./agent-storage.ts";
import { completeBrief } from "./interactive-brief.ts";
import type {
  AttachOptions,
  AttachResult,
  SandboxOptions,
} from "./outpost.types.ts";
import { createSandbox } from "./sandbox.ts";

export async function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult> {
  options.signal?.throwIfAborted();
  validateBrief(options.brief, true);
  const brief = await completeBrief(options.brief, options.signal, options.ask);
  if (brief) options = { ...options, brief };
  if (options.continuation) {
    const storage = storageFor(options.agent);
    invariant(storage, "This adapter does not support native conversations");
    await storage.locate(
      options.continuation.id,
      options.workspace?.repository ?? options.repository ?? process.cwd(),
      options.conversationHome,
    );
  }
  const sandbox = await createSandbox(options);
  let successful = false;
  try {
    const baseline = (
      await git(sandbox.workspace.directory, ["rev-parse", "HEAD"])
    ).trim();
    const result = await sandbox.attach(options);
    const changes = await commits(
      sandbox.workspace.directory,
      baseline,
      options.limits?.collectMs,
    );
    if (result.status === 0) await sandbox.workspace.integrate();
    const disposal = await sandbox.close({ preserve: result.status !== 0 });
    successful = true;
    return {
      ...result,
      ...disposal,
      branch: sandbox.workspace.branch,
      directory: sandbox.workspace.directory,
      commits: changes,
    };
  } finally {
    if (!successful) await sandbox.close({ preserve: true });
  }
}

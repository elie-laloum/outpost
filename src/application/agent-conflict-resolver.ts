import { invariant, recordRecovery } from "../domain/errors.ts";
import type { DispatchAgent } from "../domain/fallback-agent.types.ts";
import type { Sandbox } from "./outpost.types.ts";
import { createPreparedSandbox } from "./sandbox.ts";
import { prepareConflictMerge } from "./conflict-merge.ts";
import { verifyConflictResolution } from "./conflict-verification.ts";
import type {
  AgentConflictResolverOptions,
  ConflictContext,
  ConflictResolver,
} from "./conflict-resolution.types.ts";

export function createAgentConflictResolver(
  agent: DispatchAgent,
  options: AgentConflictResolverOptions,
): ConflictResolver {
  invariant(
    options.sandboxProvider,
    "Conflict resolution requires a sandboxProvider",
  );
  invariant(
    options.verify?.executable?.trim(),
    "Conflict resolution requires a verification executable",
  );
  invariant(
    options.verify.directory === undefined &&
      !options.verify.interactive &&
      !options.verify.terminal &&
      !options.verify.input,
    "Conflict verification must be a noninteractive command in the resolution workspace",
  );
  const configuration = {
    ...options,
    verify: {
      ...options.verify,
      ...(options.verify.arguments
        ? { arguments: [...options.verify.arguments] }
        : {}),
    },
  };
  return (context) => resolveConflict(agent, configuration, context);
}

async function resolveConflict(
  agent: DispatchAgent,
  options: AgentConflictResolverOptions,
  context: ConflictContext,
) {
  const { workspace, signal, observation } = context;
  const hooksPath =
    options.sandboxProvider.placement === "host" && process.platform === "win32"
      ? "NUL"
      : "/dev/null";
  let sandbox: Sandbox | undefined;
  try {
    sandbox = await createPreparedSandbox(
      {
        workspace,
        sandboxProvider: options.sandboxProvider,
        agent,
        signal,
        ...(observation ? { observation } : {}),
        ...(options.logging === undefined ? {} : { logging: options.logging }),
      },
      (lease) => prepareConflictMerge(lease, context, hooksPath),
    );
    const execution = await sandbox.dispatch({
      brief: {
        text: [
          `Resolve the pending Git merge in this workspace. Candidate commit: ${context.candidateCommit}. Host commit: ${context.hostCommit}.`,
          `Conflicting paths: ${JSON.stringify(context.conflicts)}. Preserve the intent of both branches.`,
          "Resolve every unmerged entry, stage the resolution and commit the merge. Do not abort the merge, rewrite history, change other branches or weaken tests to make them pass.",
          options.instructions ?? "",
        ].join("\n"),
      },
      signal,
      ...(observation ? { observation } : {}),
      ...(options.observe ? { observe: options.observe } : {}),
    });
    const verified = await verifyConflictResolution(
      sandbox,
      context,
      options.verify,
      hooksPath,
    );
    return {
      ...verified,
      branch: workspace.branch,
      directory: workspace.directory,
      usage: execution.usage,
      ...(execution.transcript ? { transcript: execution.transcript } : {}),
    };
  } catch (cause) {
    recordRecovery(cause, {
      branch: workspace.branch,
      directory: workspace.directory,
    });
    throw cause;
  } finally {
    await sandbox?.close({ preserve: true });
  }
}

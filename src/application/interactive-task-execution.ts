import { invariant } from "../domain/errors.ts";
import type { TaskContext } from "../domain/workflow.types.ts";
import { createSandbox } from "./sandbox.ts";
import { openWorkspace } from "./workspace.ts";
import { taskUsage } from "./task-usage.ts";
import { interactiveTurnInstructions } from "./interactive-task.constants.ts";
import { interactiveResponse } from "./interactive-task-protocol.ts";
import type {
  InteractiveAgentTaskOptions,
  InteractiveAgentState,
  InteractiveAgentTurnResult,
} from "./interactive-task.types.ts";

export async function executeInteractiveTurn(
  options: InteractiveAgentTaskOptions,
  context: TaskContext,
  branch: string,
  previous: InteractiveAgentState | undefined,
): Promise<InteractiveAgentTurnResult> {
  const interaction = context.interaction!;
  const workspace = await openWorkspace({
    repository: options.repository,
    branch: { mode: "named", name: branch },
    signal: context.signal,
    ...(context.observation ? { observation: context.observation } : {}),
  });
  try {
    if (previous)
      invariant(
        previous.directory === workspace.directory,
        "Interactive workspace moved; recover it explicitly",
      );
    const state: InteractiveAgentState = previous ?? {
      turns: 0,
      branch,
      directory: workspace.directory,
    };
    await interaction.save(state);
    const sandbox = await createSandbox({
      workspace,
      signal: context.signal,
      ...(context.observation ? { observation: context.observation } : {}),
      agent: options.agent,
      includeUncommitted: true,
      ...(options.sandboxProvider
        ? { sandboxProvider: options.sandboxProvider }
        : {}),
      ...(options.bootstrap !== undefined
        ? { bootstrap: options.bootstrap }
        : {}),
      ...(options.conversationHome
        ? { conversationHome: options.conversationHome }
        : {}),
    });
    try {
      const usage = taskUsage(context, undefined);
      const input = state.conversation
        ? `Human answer (JSON): ${JSON.stringify(interaction.answer!.value)}`
        : options.brief;
      const result = await sandbox.dispatch({
        brief: { text: `${input}\n\n${interactiveTurnInstructions}` },
        response: interactiveResponse,
        signal: context.signal,
        ...(context.observation ? { observation: context.observation } : {}),
        observe: usage.observe,
        ...(state.conversation
          ? { continuation: { id: state.conversation } }
          : {}),
      });
      usage.reconcile(result.usage);
      context.signal.throwIfAborted();
      invariant(
        result.conversation && result.transcript,
        "Interactive turn did not capture a portable conversation",
      );
      const next = {
        ...state,
        conversation: result.conversation,
        turns: state.turns + 1,
      };
      return { next, value: result.value };
    } finally {
      await sandbox.close({ preserve: true });
    }
  } finally {
    await workspace.close({ preserve: true });
  }
}

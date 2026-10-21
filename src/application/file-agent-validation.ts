import { readFile } from "node:fs/promises";
import { invariant } from "../domain/errors.ts";
import type { Agent } from "../domain/agent.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { preflightDispatch } from "./dispatch-validation.ts";

export async function validateFileAgent(
  agent: Agent,
  settings?: DispatchOptions<unknown>,
): Promise<void> {
  if (agent.kind === "custom")
    invariant(
      !agent.harness.tools.some((tool) => tool.workspace === "git"),
      "Git harness tools cannot run in file workspaces; select filesystem tools explicitly",
    );
  invariant(
    agent.kind !== "cli" || agent.fileWorkspaces?.dispatch,
    `${agent.name} has not declared validated support for file workspaces`,
  );
  invariant(
    agent.kind !== "replay" || agent.turns.every((turn) => !turn.changes),
    "Git replay effects cannot run in file workspaces",
  );
  if (!settings) return;
  if (agent.kind === "cli") {
    invariant(
      !settings.continuation || agent.fileWorkspaces?.continuation,
      "Agent continuation is not validated for file workspaces",
    );
    invariant(
      !settings.response?.repairs || agent.fileWorkspaces?.repairs,
      "Agent repairs are not validated for file workspaces",
    );
    invariant(
      !settings.steering || !agent.liveInput || agent.fileWorkspaces?.liveInput,
      "Agent live input is not validated for file workspaces",
    );
  }
  await preflightDispatch(settings, "", agent);
  const source =
    settings.brief.text ?? (await readFile(settings.brief.file, "utf8"));
  invariant(
    !/\{\{\s*(WORK_BRANCH|BASE_BRANCH)\s*\}\}/.test(source),
    "Git branch variables are unavailable in file workspaces",
  );
  invariant(
    !settings.logging ||
      typeof settings.logging !== "object" ||
      !("replayable" in settings.logging) ||
      !settings.logging.replayable,
    "Replayable file effects are not supported",
  );
}

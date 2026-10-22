import { readFile } from "node:fs/promises";
import { invariant } from "../domain/errors.ts";
import type { Agent } from "../domain/agent.types.ts";
import { fileAgentDiagnostics } from "../domain/file-agent-capabilities.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { fileDispatchRequirements } from "./execution-inspection.ts";

export async function validateFileAgent(
  agent: Agent,
  settings?: DispatchOptions<unknown>,
): Promise<void> {
  const [diagnostic] = fileAgentDiagnostics(
    agent,
    fileDispatchRequirements(agent, settings),
  );
  invariant(diagnostic === undefined, diagnostic?.message ?? "");
  if (!settings) return;
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

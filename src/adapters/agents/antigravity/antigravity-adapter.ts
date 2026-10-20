import { composedNativeHooks } from "../native-hooks.ts";
import { antigravityHookSchemas } from "./antigravity-hooks.constants.ts";
import { antigravityHookPlan } from "./antigravity-hook-plan.ts";
import { rejectProfileTools } from "../profile-support.ts";
import {
  mcpConfigurationPlanner,
  supportMcpServers,
} from "../mcp-configuration.ts";
import { antigravityMcpFile } from "./antigravity-mcp.ts";
import { textMatcher } from "../text-matcher.ts";
import { transientNoticePatterns } from "../unavailable.constants.ts";
import type { AgentAdapter, CliHarness } from "../../../domain/agent.types.ts";
import { invariant } from "../../../domain/errors.ts";
import type { AgentModel } from "../../../domain/model.types.ts";
import { antigravityCredentials } from "./antigravity-authentication.ts";
import {
  antigravityVariables,
  antigravityLabel,
  antigravityMcpSupport,
  antigravityModelSupport,
  antigravityQuotaPatterns,
  antigravityUnavailablePatterns,
} from "./antigravity.constants.ts";
import { antigravityEvents } from "./antigravity-events.ts";
import { antigravityRequest } from "./antigravity-request.ts";
import type { AntigravitySettings } from "./antigravity.types.ts";
import { credentialPlanner } from "../authentication.ts";
import {
  configuredSettings,
  harnessSettings,
  supportModel,
} from "../model-support.ts";
import type { Bound } from "../settings.types.ts";

function bindAntigravity(settings: Bound<AntigravitySettings>): AgentAdapter {
  supportModel(antigravityModelSupport, settings.model);
  rejectProfileTools(antigravityLabel, settings.profile);
  supportMcpServers(antigravityMcpSupport, settings.mcpServers);
  const credentials = credentialPlanner(
    antigravityLabel,
    antigravityCredentials,
    settings.authentication,
    settings.model,
  );
  const configuration = mcpConfigurationPlanner(
    antigravityLabel,
    settings.mcpServers,
    antigravityMcpFile,
  );
  return Object.freeze({
    ...(settings.hooks?.length
      ? { hooks: antigravityHookPlan(settings.hooks) }
      : {}),
    name: "antigravity",
    ...(credentials ? { credentials } : {}),
    ...(configuration ? { configuration } : {}),
    bootstrap: "antigravity",
    resumable: true,
    fileWorkspaces: Object.freeze({
      dispatch: true,
      repairs: true,
      interactive: true,
    }),
    forkable: false,
    capture: false,
    requiresFinishedEvent: true,
    variables: Object.freeze({
      ...antigravityVariables,
      ...settings.variables,
    }),
    request: (input) => antigravityRequest(settings, input),
    events: antigravityEvents,
    quota: textMatcher(antigravityQuotaPatterns),
    unavailable: textMatcher(
      antigravityUnavailablePatterns,
      transientNoticePatterns,
    ),
  } satisfies AgentAdapter);
}

export function createAntigravityHarness(
  settings: AntigravitySettings = {},
): CliHarness {
  harnessSettings(settings);
  invariant(
    !("conversations" in settings) || settings.conversations === undefined,
    "Antigravity has no portable conversation capture; conversations cannot be stored",
  );
  const configured = configuredSettings(settings);
  const hooks = composedNativeHooks(
    "antigravity",
    antigravityHookSchemas,
    configured.profile?.hooks?.antigravity,
    settings.hooks,
  );
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindAntigravity({
        ...configured,
        hooks,
        ...(model === undefined ? {} : { model }),
      }),
  });
}

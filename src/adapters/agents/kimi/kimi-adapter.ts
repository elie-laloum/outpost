import { rejectProfileTools } from "../profile-support.ts";
import {
  createKimiConversations,
  kimiSessionProfile,
} from "./kimi-conversations.ts";
import {
  mcpConfigurationPlanner,
  supportMcpServers,
} from "../mcp-configuration.ts";
import { kimiMcpFile, kimiMcpLogins } from "./kimi-mcp.ts";
import { textMatcher } from "../text-matcher.ts";
import {
  conversationSettings,
  conversationStorage,
} from "../conversation-settings.ts";
import { transientNoticePatterns } from "../unavailable.constants.ts";
import { kimiUsage } from "./kimi-usage.ts";
import { sessionUsageCommand, sessionUsageResult } from "../session-usage.ts";
import { forkKimi } from "./kimi-fork.ts";
import type { AgentAdapter, CliHarness } from "../../../domain/agent.types.ts";
import { invariant } from "../../../domain/errors.ts";
import { authenticationForm } from "../../../domain/authentication.ts";
import {
  kimiRegions,
  kimiLabel,
  kimiMcpSupport,
  kimiModelSupport,
  kimiQuotaPatterns,
  kimiUnavailablePatterns,
} from "./kimi.constants.ts";
import type { AgentModel } from "../../../domain/model.types.ts";
import { credentialPlanner } from "../authentication.ts";
import { kimiCredentials } from "./kimi-authentication.ts";
import { kimiEvents } from "./kimi-events.ts";
import { kimiRequest } from "./kimi-request.ts";
import type { KimiSettings } from "./kimi.types.ts";
import {
  configuredSettings,
  harnessSettings,
  supportModel,
} from "../model-support.ts";
import type { Bound } from "../settings.types.ts";

function bindKimi(settings: Bound<KimiSettings>): AgentAdapter {
  supportModel(kimiModelSupport, settings.model);
  rejectProfileTools(kimiLabel, settings.profile);
  supportMcpServers(kimiMcpSupport, settings.mcpServers);
  const credentials = credentialPlanner(
    kimiLabel,
    kimiCredentials(settings.region),
    settings.authentication,
    settings.model,
  );
  const configuration = mcpConfigurationPlanner(
    kimiLabel,
    settings.mcpServers,
    kimiMcpFile,
    kimiMcpLogins,
  );
  return Object.freeze({
    usageInput: "uncached",
    name: "kimi",
    ...(credentials ? { credentials } : {}),
    ...(configuration ? { configuration } : {}),
    bootstrap: "kimi",
    resumable: true,
    forkable: true,
    fork: forkKimi,
    ...conversationStorage(settings, createKimiConversations),
    variables: Object.freeze({
      KIMI_CODE_NO_AUTO_UPDATE: "1",
      ...settings.variables,
    }),
    request: (input) => kimiRequest(settings, input),
    events: kimiEvents,
    quota: textMatcher(kimiQuotaPatterns),
    unavailable: textMatcher(kimiUnavailablePatterns, transientNoticePatterns),
    usage: "session",
    usageCommand: (conversation) => sessionUsageCommand("kimi", conversation),
    usageResult: (text) => sessionUsageResult(text, kimiUsage),
  } satisfies AgentAdapter);
}

export function createKimiHarness(settings: KimiSettings = {}): CliHarness {
  harnessSettings(settings);
  conversationSettings(kimiLabel, kimiSessionProfile.format, settings);
  invariant(
    settings.region === undefined ||
      Object.hasOwn(kimiRegions, settings.region),
    'Kimi region must be "mainland-cn" or "global"',
  );
  invariant(
    settings.region === undefined ||
      settings.authentication === undefined ||
      !authenticationForm(settings.authentication).form.startsWith("usage"),
    "Kimi region selects account authentication; configure the API endpoint through variables for usage authentication",
  );
  const configured = configuredSettings(settings);
  return Object.freeze({
    kind: "cli",
    bind: (model?: AgentModel) =>
      bindKimi({ ...configured, ...(model === undefined ? {} : { model }) }),
  });
}

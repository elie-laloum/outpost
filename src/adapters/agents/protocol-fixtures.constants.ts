import { antigravityProtocolFixtures } from "./antigravity/antigravity-protocol.constants.ts";
import { copilotProtocolFixtures } from "./copilot/copilot-protocol.constants.ts";
import { kimiProtocolFixtures } from "./kimi/kimi-protocol.constants.ts";
import { codexProtocolFixtures } from "./codex/codex-protocol.constants.ts";
import { claudeProtocolFixtures } from "./claude/claude-protocol.constants.ts";
import type {
  AgentProtocolFixture,
  ProtocolAgent,
} from "./protocol-fixtures.types.ts";

export const protocolFixtures: Readonly<
  Record<ProtocolAgent, readonly AgentProtocolFixture[]>
> = {
  antigravity: antigravityProtocolFixtures,
  copilot: copilotProtocolFixtures,
  kimi: kimiProtocolFixtures,
  codex: codexProtocolFixtures,
  claude: claudeProtocolFixtures,
};

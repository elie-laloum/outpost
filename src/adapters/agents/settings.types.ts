import type { AgentAuthentication } from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import type { AgentModel, ModelReasoning } from "../../domain/model.types.ts";

export interface CommonAgentSettings {
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
  readonly saveConversations?: boolean;
}

export interface ClaudeSettings extends CommonAgentSettings {
  readonly permissions?:
    | "default"
    | "acceptEdits"
    | "plan"
    | "auto"
    | "dontAsk"
    | "bypassPermissions";
}

export interface CodexModelProvider {
  readonly baseUrl: string;
  readonly apiKeyEnvironment?: string | false;
}

export interface CodexSettings extends CommonAgentSettings {
  readonly modelProvider?: CodexModelProvider;
  readonly approvalReviewer?: "user" | "auto_review";
}

export type Bound<Settings> = Settings & { readonly model?: AgentModel };

export interface CliModelSupport {
  readonly agent: string;
  readonly reasoning: ReadonlySet<ModelReasoning>;
  readonly maxOutputTokens: boolean;
}

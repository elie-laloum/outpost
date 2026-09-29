import type {
  AgentAuthentication,
  CliHarness,
} from "../../domain/agent.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import type { NativeConversationStore } from "../../domain/conversation.types.ts";
import type { AgentCliDiagnostic } from "./cli-diagnostics.types.ts";
import type { AgentProtocolFixture } from "./protocol-fixtures.types.ts";

export interface AuthenticationChoice {
  readonly value: "account" | "account-token" | "usage";
  readonly label: string;
  readonly instructions: string;
  readonly variable?: string;
}

export type AgentInstaller =
  | {
      readonly kind: "npm";
      readonly package: string;
      readonly allowScripts?: boolean;
    }
  | {
      readonly kind: "script";
      /** Home-relative path where remote bootstrap installs the executable. */
      readonly installed: string;
      script(target: string): string;
    };

export interface AgentPresetSettings {
  readonly authentication?: AgentAuthentication;
  readonly modelProvider?: {
    readonly baseUrl: string;
    readonly apiKeyEnvironment?: string;
  };
}

export interface AgentImage {
  /** Comment written above the image environment variables. */
  readonly note?: string;
  readonly variables?: Variables;
}

export interface AgentDoctor {
  readonly variables?: Variables;
  diagnostics(): readonly AgentCliDiagnostic[];
}

export interface AgentDescriptor {
  /** Identifier used by --agent, doctor, bootstrap and native storage. */
  readonly name: string;
  readonly label: string;
  readonly executable: string;
  readonly version: string;
  /** Public export that generated workflows import to build the harness. */
  readonly harnessExport: string;
  harness(settings?: AgentPresetSettings): CliHarness;
  readonly install: AgentInstaller;
  readonly image?: AgentImage;
  readonly doctor: AgentDoctor;
  readonly protocol: readonly AgentProtocolFixture[];
  readonly authentication: readonly AuthenticationChoice[];
  /** Native store for portable conversations; absent when the CLI has none. */
  conversations?(): NativeConversationStore;
  /** Accepts a custom Responses-compatible model provider during init. */
  readonly customModelProvider?: boolean;
}

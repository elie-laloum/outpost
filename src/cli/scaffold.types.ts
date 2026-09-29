import type { AuthenticationChoice } from "../adapters/agents/agent-descriptor.types.ts";
import type { BuiltInAgentName } from "../adapters/agents/catalog.types.ts";

export interface InitOptions {
  readonly directory?: string;
  readonly repository?: string;
  readonly agent?: BuiltInAgentName;
  readonly sandboxProvider?:
    "docker" | "podman" | "vercel" | "daytona" | "local";
  readonly manager?: "npm" | "pnpm" | "yarn" | "bun";
  readonly model?: string;
  readonly baseUrl?: string;
  readonly apiKeyEnvironment?: string;
  readonly authentication?: AuthenticationChoice["value"];
  readonly install?: boolean;
  readonly build?: boolean;
  readonly image?: string;
}

export interface PackageManifest {
  readonly type?: string;
  readonly packageManager?: string;
}
export interface ProjectSettings {
  readonly extension: "ts" | "mts";
  readonly hasPackage: boolean;
  readonly manager: string;
}
export interface ScaffoldResult {
  files: readonly string[];
  run: string;
}

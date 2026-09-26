export interface InitOptions {
  readonly directory?: string;
  readonly repository?: string;
  readonly agent?: "claude" | "codex" | "antigravity" | "copilot" | "kimi";
  readonly sandboxProvider?:
    "docker" | "podman" | "vercel" | "daytona" | "local";
  readonly manager?: "npm" | "pnpm" | "yarn" | "bun";
  readonly model?: string;
  readonly baseUrl?: string;
  readonly apiKeyEnvironment?: string;
  readonly authentication?: "account" | "account-token" | "usage";
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

export interface AuthenticationChoice {
  readonly value: NonNullable<InitOptions["authentication"]>;
  readonly label: string;
  readonly instructions: string;
  readonly variable?: string;
}

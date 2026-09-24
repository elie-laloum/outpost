export interface InitOptions {
  readonly directory?: string;
  readonly repository?: string;
  readonly agent?: "claude" | "codex" | "gemini";
  readonly provider?: "docker" | "podman" | "vercel" | "daytona" | "local";
  readonly manager?: "npm" | "pnpm" | "yarn" | "bun";
  readonly model?: string;
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

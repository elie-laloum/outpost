export type Template = "blank" | "iterate" | "review" | "plan" | "plan-review";

export interface InitOptions {
  readonly directory?: string;
  readonly agent?: "claude" | "codex";
  readonly provider?: "docker" | "podman" | "vercel" | "daytona" | "local";
  readonly template?: Template;
  readonly tracker?: "github" | "beads" | "custom";
  readonly manager?: "npm" | "pnpm" | "yarn" | "bun";
  readonly model?: string;
  readonly install?: boolean;
  readonly label?: string;
  readonly build?: boolean;
  readonly image?: string;
}

export interface PackageManifest {
  readonly type?: string;
  readonly packageManager?: string;
}
export interface ProjectSettings {
  readonly extension: string;
  readonly manager: string;
}
export interface ScaffoldResult {
  files: readonly string[];
  run: string;
}

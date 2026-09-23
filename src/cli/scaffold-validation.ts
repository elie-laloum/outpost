import { invariant } from "../domain/errors.ts";
import type { InitOptions } from "./scaffold.types.ts";

export function validateInitialization(options: InitOptions): void {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  invariant(["codex", "claude"].includes(agent), "Choose codex or claude");
  invariant(
    ["docker", "podman", "vercel", "daytona", "local"].includes(provider),
    "Unknown sandbox provider",
  );
  invariant(
    ["blank", "iterate", "review", "plan", "plan-review"].includes(template),
    "Unknown starter template",
  );
  if (options.tracker)
    invariant(
      ["github", "beads", "custom"].includes(options.tracker),
      "Unknown tracker",
    );
}

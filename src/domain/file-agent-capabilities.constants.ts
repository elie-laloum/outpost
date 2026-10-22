import type { FileAgentCapability } from "./execution-plan.types.ts";

/** Refusal for each undemonstrated capability; dispatch names the agent in its message. */
export const fileAgentCapabilityRefusals: Readonly<
  Record<Exclude<FileAgentCapability, "dispatch">, string>
> = {
  continuation: "Agent continuation is not validated for file workspaces",
  repairs: "Agent repairs are not validated for file workspaces",
  liveInput: "Agent live input is not validated for file workspaces",
  interactive:
    "Interactive CLI support for file workspaces has not been validated",
};

export const interactiveCaptureRefusal =
  "Interactive tasks require portable conversation capture and resume";

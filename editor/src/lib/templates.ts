import type { ConfigurationNames, RecipeEditorAction } from "./types.ts";

type TaskBody = Readonly<Record<string, unknown>>;

interface TaskTemplate {
  readonly label: string;
  readonly description: string;
  readonly group: "Run" | "Data" | "Control" | "Scale";
  readonly body: (names: ConfigurationNames) => TaskBody;
}

const reference = (section: string, name: string) => ({
  $ref: `${section}.${name}`,
});

/** One starting point per task kind; references name configuration entries to declare. */
export const taskTemplates: Readonly<Record<RecipeEditorAction, TaskTemplate>> =
  {
    command: {
      label: "Command",
      description: "Run an executable in the sandbox",
      group: "Run",
      body: () => ({
        command: { executable: "node", arguments: ["--version"] },
      }),
    },
    agent: {
      label: "Agent",
      description: "Give a brief to a configured agent",
      group: "Run",
      body: (names) => ({
        agent: names.agents[0] ?? "coder",
        brief: "Describe the change to make.",
      }),
    },
    isolated: {
      label: "Isolated agent",
      description: "Run an agent in its own workspace and sandbox",
      group: "Run",
      body: (names) => ({
        isolated: {
          repository: ".",
          sandboxProvider: reference("sandboxProviders", "default"),
          agent: reference("agents", names.agents[0] ?? "coder"),
          brief: { text: "Describe the change to make." },
        },
      }),
    },
    interactive: {
      label: "Interactive",
      description: "Let an agent ask questions before it continues",
      group: "Run",
      body: (names) => ({
        interactive: {
          repository: ".",
          sandboxProvider: { type: "docker", image: "outpost-codex:dev" },
          agent: reference("agents", names.agents[0] ?? "coder"),
          brief: "Clarify the requested change before implementing it.",
          actors: ["maintainer"],
        },
      }),
    },
    value: {
      label: "Value",
      description: "Produce a literal or computed value",
      group: "Data",
      body: () => ({ value: { message: "Hello from Outpost" } }),
    },
    call: {
      label: "Function call",
      description: "Call a TypeScript extension",
      group: "Data",
      body: (names) => ({
        call: reference("functions", names.functions[0] ?? "example"),
        arguments: {},
      }),
    },
    artifact: {
      label: "Artifact",
      description: "Produce and store a typed artifact",
      group: "Data",
      body: () => ({ artifact: reference("artifacts", "example") }),
    },
    gate: {
      label: "Gate",
      description: "Pause or wait for an approval",
      group: "Control",
      body: () => ({
        gate: { kind: "approval", prompt: "Continue?", actors: ["maintainer"] },
      }),
    },
    decision: {
      label: "Decision",
      description: "Ask a decision model to choose",
      group: "Control",
      body: () => ({ decision: reference("decisions", "example") }),
    },
    loop: {
      label: "Loop",
      description: "Repeat an attempt until a check passes",
      group: "Control",
      body: (names) => ({
        loop: {
          maxRounds: 3,
          attempt: reference("functions", names.functions[0] ?? "attempt"),
          check: reference("functions", names.functions[1] ?? "check"),
        },
      }),
    },
    queued: {
      label: "Queued",
      description: "Hand the task to a job queue",
      group: "Scale",
      body: () => ({
        queued: { queue: reference("queues", "example"), handler: "example" },
      }),
    },
    speculation: {
      label: "Speculation",
      description: "Compare several candidate attempts",
      group: "Scale",
      body: () => ({ speculation: reference("speculations", "example") }),
    },
  };

/** The first free key derived from `base`, such as `command-2`. */
export function uniqueTaskKey(base: string, keys: readonly string[]): string {
  const taken = new Set(keys);
  if (!taken.has(base)) return base;
  let index = 2;
  while (taken.has(`${base}-${index}`)) index++;
  return `${base}-${index}`;
}

/** Agent and function names declared by a parsed configuration. */
export function configurationNames(config: unknown): ConfigurationNames {
  const section = (name: string): string[] => {
    if (!config || typeof config !== "object") return [];
    const value = (config as Record<string, unknown>)[name];
    return value && typeof value === "object" && !Array.isArray(value)
      ? Object.keys(value)
      : [];
  };
  return { agents: section("agents"), functions: section("functions") };
}

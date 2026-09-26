import { invariant } from "./errors.ts";
import { defineHarnessInstructions } from "./instructions.ts";
import { TOOL_NAME_PATTERN } from "./model.constants.ts";
import type { ModelMessage } from "./model.types.ts";
import { SKILL_FIELDS, SKILL_LOADER } from "./skill.constants.ts";
import type {
  HarnessSkill,
  HarnessSkillOptions,
  SkillLoaderInput,
} from "./skill.types.ts";
import { defineHarnessTool, harnessTools } from "./tool.ts";
import type { HarnessTool } from "./tool.types.ts";

export function defineHarnessSkill(options: HarnessSkillOptions): HarnessSkill {
  invariant(
    options !== null &&
      typeof options === "object" &&
      Object.keys(options).every((key) => SKILL_FIELDS.has(key)),
    "Skills accept name, description, instructions and tools",
  );
  invariant(
    typeof options.name === "string" && TOOL_NAME_PATTERN.test(options.name),
    "Skill names use 1 to 64 letters, digits, underscores or hyphens",
  );
  invariant(
    typeof options.description === "string" && options.description.trim(),
    "Skill description must be nonempty text",
  );
  return Object.freeze({
    kind: "skill",
    name: options.name,
    description: options.description,
    instructions: defineHarnessInstructions(options.instructions),
    tools: harnessTools(options.tools ?? []),
  });
}

export function harnessSkills(
  skills: readonly HarnessSkill[] | undefined,
): readonly HarnessSkill[] {
  if (skills === undefined) return [];
  invariant(Array.isArray(skills), "Skills must be an array");
  const names = new Set<string>();
  for (const skill of skills) {
    invariant(
      skill?.kind === "skill",
      "Declare skills with defineHarnessSkill",
    );
    invariant(!names.has(skill.name), `Duplicate skill name: ${skill.name}`);
    names.add(skill.name);
  }
  return Object.freeze([...skills]);
}

export function skillCatalog(skills: readonly HarnessSkill[]): string {
  return [
    `Skills are available on demand. Call ${SKILL_LOADER} with a skill name to read its instructions and enable its tools before using them:`,
    ...skills.map((skill) => `- ${skill.name}: ${skill.description}`),
  ].join("\n");
}

export function skillLoader(skills: readonly HarnessSkill[]): HarnessTool {
  const byName = new Map(skills.map((skill) => [skill.name, skill]));
  return defineHarnessTool({
    name: SKILL_LOADER,
    description:
      "Load a skill listed in the instructions: returns its instructions and enables its tools for the following steps.",
    readOnly: true,
    input: {
      type: "object",
      properties: { name: { enum: skills.map((skill) => skill.name) } },
      required: ["name"],
      additionalProperties: false,
    },
    async execute(input: SkillLoaderInput, context) {
      const skill = byName.get(input.name)!;
      const text = await skill.instructions.resolve({
        sandbox: context.sandbox,
        signal: context.signal,
        model: context.model,
      });
      const tools = skill.tools.map((tool) => tool.name);
      return tools.length
        ? `${text}\n\nTools now available: ${tools.join(", ")}.`
        : text;
    },
  });
}

export function loadedSkills(
  messages: readonly ModelMessage[],
): ReadonlySet<string> {
  const requested = new Map<string, string>();
  const loaded = new Set<string>();
  for (const message of messages)
    for (const block of message.content) {
      if (block.type === "tool-call" && block.name === SKILL_LOADER)
        requested.set(
          block.id,
          String((block.input as SkillLoaderInput)?.name),
        );
      if (block.type !== "tool-result" || block.isError) continue;
      const name = requested.get(block.callId);
      if (name !== undefined) loaded.add(name);
    }
  return loaded;
}

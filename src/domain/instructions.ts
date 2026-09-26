import { invariant } from "./errors.ts";
import type {
  HarnessInstructionContext,
  HarnessInstructions,
  HarnessInstructionSource,
  HarnessInstructionsOption,
} from "./harness.types.ts";

export function defineHarnessInstructions(
  source: HarnessInstructionSource,
): HarnessInstructions {
  invariant(
    typeof source === "function" ||
      (typeof source === "string" && source.trim()),
    "Instructions must be nonempty text or a function",
  );
  return Object.freeze({
    kind: "instructions",
    async resolve(context: HarnessInstructionContext) {
      const text = typeof source === "string" ? source : await source(context);
      invariant(typeof text === "string", "Instructions must resolve to text");
      return text;
    },
  });
}

export function harnessInstructions(
  option: HarnessInstructionsOption | undefined,
): readonly HarnessInstructions[] {
  if (option === undefined) return [];
  const entries = Array.isArray(option) ? option : [option];
  return Object.freeze(
    entries.map((entry: string | HarnessInstructions) => {
      if (typeof entry === "string") return defineHarnessInstructions(entry);
      invariant(
        entry?.kind === "instructions",
        "Declare instructions as text or with defineHarnessInstructions",
      );
      return entry;
    }),
  );
}

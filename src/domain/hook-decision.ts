import { HOOK_DECISION_FIELDS } from "./hook.constants.ts";
import { invariant } from "./errors.ts";
import type { HarnessHookPhase, HarnessHookResult } from "./hook.types.ts";

export function validateHookDecision<Phase extends HarnessHookPhase>(
  phase: Phase,
  value: unknown,
): asserts value is HarnessHookResult<Phase> {
  if (value === undefined) return;
  const allowed = HOOK_DECISION_FIELDS[phase];
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    phase === "before-tool"
      ? "before-tool hooks may return { deny } or { input }"
      : `${phase} hooks must return an object or nothing`,
  );
  const keys = Object.keys(value);
  invariant(
    keys.length > 0 && keys.every((key) => allowed.includes(key)),
    `${phase} hooks ${phase === "before-tool" ? "may return" : "may only return"} ${allowed.map((key) => `{ ${key} }`).join(" or ") || "nothing"}`,
  );
  invariant(
    phase === "before-model" || keys.length === 1,
    `${phase} hooks must return exactly one decision`,
  );
  for (const key of keys) {
    const field: unknown = Reflect.get(value, key);
    if (
      ["instructions", "prompt", "system", "deny", "continue", "text"].includes(
        key,
      )
    ) {
      invariant(typeof field === "string", `${phase} ${key} must be text`);
      if (key === "deny" || key === "continue")
        invariant(
          field.trim() !== "",
          key === "deny"
            ? `${phase} deny reasons must be nonempty text`
            : `${phase} hooks may only return { ${key} } with nonempty text`,
        );
    }
    if (key === "messages")
      invariant(Array.isArray(field), `${phase} messages must be an array`);
    if (key === "result") {
      if (phase === "after-tool" && typeof field === "string") continue;
      invariant(
        field !== null && typeof field === "object" && !Array.isArray(field),
        `${phase} result must be an object`,
      );
      const resultKeys =
        phase === "after-model" ? ["text", "content"] : ["content", "isError"];
      invariant(
        Object.keys(field).every((name) => resultKeys.includes(name)),
        `${phase} result contains unsupported fields`,
      );
      invariant(
        typeof Reflect.get(
          field,
          phase === "after-model" ? "text" : "content",
        ) === "string",
        `${phase} result must contain text`,
      );
      if (phase === "after-model" && Reflect.has(field, "content"))
        invariant(
          Array.isArray(Reflect.get(field, "content")),
          "after-model result content must be an array",
        );
      if (phase === "after-tool" && Reflect.has(field, "isError"))
        invariant(
          typeof Reflect.get(field, "isError") === "boolean",
          "after-tool result isError must be boolean",
        );
    }
  }
}

import { OutpostError, invariant } from "./errors.ts";

export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;
export type Brief =
  | { readonly text: string; readonly file?: never; readonly values?: never }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };

export interface PromptFragment {
  readonly kind: "literal" | "command";
  readonly value: string;
}

export function prepareBrief(
  source: string,
  values: PromptVariables = {},
  builtins: { WORK_BRANCH: string; BASE_BRANCH: string },
): { fragments: readonly PromptFragment[]; unused: readonly string[] } {
  for (const key of Object.keys(builtins))
    invariant(!(key in values), `Reserved prompt variable: ${key}`);
  const available = { ...values, ...builtins };
  invariant(
    Object.values(values).every(
      (value) =>
        typeof value === "string" ||
        typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value)),
    ),
    "Prompt variables must be finite numbers, strings or booleans",
  );
  const used = new Set<string>();
  const substitute = (text: string) =>
    text.replace(/\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g, (_, key: string) => {
      if (!Object.hasOwn(available, key))
        throw new OutpostError("prompt", `Missing prompt variable: ${key}`, {
          key,
        });
      used.add(key);
      return String(available[key as keyof typeof available]);
    });
  const fragments: PromptFragment[] = [];
  let previous = 0;
  for (const match of source.matchAll(/!`([^`]+)`/g)) {
    fragments.push({
      kind: "literal",
      value: substitute(source.slice(previous, match.index)),
    });
    fragments.push({ kind: "command", value: substitute(match[1]!) });
    previous = match.index + match[0].length;
  }
  fragments.push({
    kind: "literal",
    value: substitute(source.slice(previous)),
  });
  return {
    fragments,
    unused: Object.keys(values).filter((key) => !used.has(key)),
  };
}

export function validateBrief(
  brief: Brief | undefined,
  optional = false,
): void {
  if (!brief && optional) return;
  invariant(
    brief &&
      (typeof brief.text === "string") !== (typeof brief.file === "string"),
    "Provide exactly one brief: text or file",
  );
  if (typeof brief.text === "string")
    invariant(
      brief.values === undefined,
      "Literal briefs cannot use template variables",
    );
}

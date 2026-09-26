import type { AgentAuthentication } from "./agent.types.ts";
import {
  VARIABLE_NAME,
  authenticationForms,
} from "./authentication.constants.ts";
import type { AuthenticationSelection } from "./authentication.types.ts";
import { invariant } from "./errors.ts";

const expected =
  'Use "account", "usage", { account: { file | key | variable } } or { usage: { key | variable } }';

function singleEntry(value: unknown, label: string): [string, unknown] {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} must be "account", "usage" or an object. ${expected}`,
  );
  const entries = Object.entries(value);
  invariant(
    entries.length === 1,
    `${label} must have exactly one key. ${expected}`,
  );
  return entries[0]!;
}

export function authenticationForm(
  value: AgentAuthentication,
): AuthenticationSelection {
  if (value === "account" || value === "usage") return { form: value };
  const [kind, credential] = singleEntry(value, "Authentication");
  invariant(
    kind === "account" || kind === "usage",
    `Unknown authentication "${kind}". ${expected}`,
  );
  const [source, text] = singleEntry(credential, `Authentication ${kind}`);
  const form = authenticationForms.find(
    (candidate) => candidate === `${kind}.${source}`,
  );
  invariant(
    form,
    `${kind} authentication does not accept "${source}". ${expected}`,
  );
  invariant(
    typeof text === "string" && text.trim() !== "",
    `${form} must be a nonempty string`,
  );
  invariant(
    source !== "variable" || VARIABLE_NAME.test(text),
    `Invalid authentication environment variable: ${text}`,
  );
  return { form, value: text };
}

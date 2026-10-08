import { resolve } from "node:path";
import type { AgentAuthentication } from "../domain/agent.types.ts";
import type { AgentModel } from "../domain/model.types.ts";
import type { BranchPolicy } from "../domain/workspace.types.ts";
import { MODEL_REASONING } from "../domain/model.constants.ts";
import { SECRET_VARIABLE_NAME } from "../domain/secrets.constants.ts";
import { recipeConfigurationKeys } from "./recipe-configuration.constants.ts";

export function configurationObject(
  value: unknown,
  label: string,
  keys?: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be a mapping`);
  const result = Object.fromEntries(Object.entries(value));
  if (keys)
    for (const key of Object.keys(result))
      if (!keys.includes(key))
        throw new Error(`Unknown configuration field: ${label}.${key}`);
  return result;
}

export function configurationText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be a nonempty string`);
  return value;
}

export function configurationNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw new Error(`${label} must be a positive integer`);
  return value;
}

export function configurationAuthentication(
  value: unknown,
  directory: string,
): AgentAuthentication {
  if (value === "account" || value === "usage") return value;
  const record = configurationObject(value, "authentication", [
    "account",
    "usage",
  ]);
  if (Object.keys(record).length !== 1)
    throw new Error("Select account or usage authentication explicitly");
  if (record.account !== undefined) {
    const account = configurationObject(
      record.account,
      "authentication.account",
      ["file", "variable"],
    );
    if (Object.keys(account).length !== 1)
      throw new Error("Select one account file or variable");
    if (account.file !== undefined)
      return {
        account: {
          file: resolve(
            directory,
            configurationText(account.file, "account.file"),
          ),
        },
      };
    return { account: { variable: configurationVariable(account.variable) } };
  }
  const usage = configurationObject(record.usage, "authentication.usage", [
    "variable",
  ]);
  return { usage: { variable: configurationVariable(usage.variable) } };
}

export function configurationVariable(value: unknown): string {
  const name = configurationText(value, "environment variable");
  if (!SECRET_VARIABLE_NAME.test(name))
    throw new Error("Invalid environment variable name");
  return name;
}

export function configurationModel(value: unknown): AgentModel {
  if (typeof value === "string")
    return { name: configurationText(value, "model") };
  const record = configurationObject(
    value,
    "model",
    recipeConfigurationKeys.model,
  );
  const reasoning = [...MODEL_REASONING].find(
    (candidate) => candidate === record.reasoning,
  );
  if (record.reasoning !== undefined && !reasoning)
    throw new Error("Unknown model reasoning level");
  return {
    name: configurationText(record.name, "model.name"),
    ...(reasoning ? { reasoning } : {}),
    ...(record.maxOutputTokens === undefined
      ? {}
      : {
          maxOutputTokens: configurationNumber(
            record.maxOutputTokens,
            "model.maxOutputTokens",
          ),
        }),
  };
}

export function configurationBranch(value: unknown): BranchPolicy {
  if (value === undefined) return { mode: "integrate" };
  const record = configurationObject(
    value,
    "branch",
    recipeConfigurationKeys.branch,
  );
  if (record.mode === "current") {
    if (record.name !== undefined || record.from !== undefined)
      throw new Error("Current branch does not accept name or from");
    return { mode: "current" };
  }
  const from =
    record.from === undefined
      ? {}
      : { from: configurationText(record.from, "branch.from") };
  if (record.mode === "named")
    return {
      mode: "named",
      name: configurationText(record.name, "branch.name"),
      ...from,
    };
  if (record.mode !== "integrate" || record.name !== undefined)
    throw new Error(
      "Branch mode must be current, named or integrate; only named accepts name",
    );
  return { mode: "integrate", ...from };
}

import { checkpointValue } from "../workflow/checkpoint-value.ts";
import { canonicalJson } from "../workflow/canonical-json.ts";
import { recipeTextReferences } from "./expression-text.ts";
import { recipeTemplatePattern } from "../recipe.constants.ts";
import { recipeValue } from "../recipe-inputs.ts";
import { recipeObject } from "./values.ts";
import type { WorkflowJson } from "../workflow/checkpoint.types.ts";
import type {
  RecipeExpressionContext,
  RecipeExpressionValidation,
} from "./expressions.types.ts";

export function recipeJson(value: unknown): WorkflowJson {
  const result = checkpointValue(value);
  if (result.kind !== "json")
    throw new Error("Recipe values must be lossless JSON");
  return plainJson(result.value);
}

function plainJson(value: WorkflowJson): WorkflowJson {
  if (Array.isArray(value)) return value.map(plainJson);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, plainJson(item)]),
    );
  return value;
}

class MissingRecipeField extends Error {}

function select(value: unknown, path: unknown): WorkflowJson {
  if (
    path !== undefined &&
    (!Array.isArray(path) ||
      !path.every(
        (key) => typeof key === "string" || Number.isSafeInteger(key),
      ))
  )
    throw new Error(
      "Recipe reference path must be an array of property names or indexes",
    );
  for (const key of path ?? []) {
    if (
      value === null ||
      typeof value !== "object" ||
      !Object.hasOwn(value, key)
    )
      throw new MissingRecipeField(`Missing recipe field: ${key}`);
    value = Object.getOwnPropertyDescriptor(value, key)?.value;
  }
  return recipeJson(value);
}

export function recipeExpression(
  value: unknown,
  context: RecipeExpressionContext,
): WorkflowJson {
  if (typeof value === "string") {
    const references = recipeTextReferences(
      value,
      Object.keys(context.inputs),
      context.steps,
    );
    let index = 0;
    return value.replace(recipeTemplatePattern, () => {
      const reference = references[index++]!;
      const result = select(
        reference.kind === "inputs"
          ? context.inputs[reference.key]
          : context.output(reference.key),
        reference.path,
      );
      if (!recipeValue(result))
        throw new Error(
          `Text interpolation requires a scalar: ${reference.source}`,
        );
      return String(result);
    });
  }
  if (Array.isArray(value))
    return value.map((item) => recipeExpression(item, context));
  if (!recipeObject(value)) return recipeJson(value);
  if (Object.hasOwn(value, "$literal")) return recipeJson(value.$literal);
  if (typeof value.$input === "string")
    return select(context.inputs[value.$input], value.path);
  if (typeof value.$step === "string")
    return select(context.output(value.$step), value.path);
  if (recipeObject(value.$select))
    return select(
      recipeExpression(value.$select.from, context),
      value.$select.path,
    );
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      recipeExpression(item, context),
    ]),
  );
}

export function validateRecipeExpression(
  value: unknown,
  context: RecipeExpressionValidation,
): void {
  const { document, step } = context;
  function reference(kind: string, key: unknown): void {
    if (typeof key !== "string")
      throw new Error(`${step.key}: ${kind} requires a name`);
    if (kind === "$input") {
      if (!Object.hasOwn(document.inputs, key))
        throw new Error(`${step.key}: unknown recipe input ${key}`);
      return;
    }
    if (!step.after.includes(key))
      throw new Error(
        `${step.key} must declare ${key} in after before referencing its output`,
      );
  }
  if (typeof value === "string") {
    for (const item of recipeTextReferences(
      value,
      Object.keys(document.inputs),
      document.tasks.map((task) => task.key),
    )) {
      reference(item.kind === "inputs" ? "$input" : "$step", item.key);
      if (
        item.kind === "inputs" &&
        item.path.length === 0 &&
        !["string", "number", "boolean"].includes(
          document.inputs[item.key]!.type,
        )
      )
        throw new Error(
          `${step.key}: text interpolation requires a scalar input ${item.key}`,
        );
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) validateRecipeExpression(item, context);
    return;
  }
  if (!recipeObject(value)) {
    recipeJson(value);
    return;
  }
  if (Object.hasOwn(value, "$literal")) {
    if (Object.keys(value).length !== 1)
      throw new Error(`${step.key}: $literal must be the only field`);
    recipeJson(value.$literal);
    return;
  }
  for (const kind of ["$input", "$step"]) {
    if (!Object.hasOwn(value, kind)) continue;
    reference(kind, value[kind]);
    if (Object.keys(value).some((key) => ![kind, "path"].includes(key)))
      throw new Error(`${step.key}: unknown reference field`);
    if (
      value.path !== undefined &&
      (!Array.isArray(value.path) ||
        !value.path.every(
          (key) =>
            typeof key === "string" ||
            (Number.isSafeInteger(key) && Number(key) >= 0),
        ))
    )
      throw new Error(`${step.key}: invalid reference path`);
    return;
  }
  if (Object.hasOwn(value, "$select")) {
    if (
      Object.keys(value).length !== 1 ||
      !recipeObject(value.$select) ||
      Object.keys(value.$select).some(
        (key) => !["from", "path"].includes(key),
      ) ||
      !Array.isArray(value.$select.path) ||
      !value.$select.path.every(
        (key) =>
          typeof key === "string" ||
          (Number.isSafeInteger(key) && Number(key) >= 0),
      )
    )
      throw new Error(`${step.key}: $select requires from and a property path`);
    validateRecipeExpression(value.$select.from, context);
    return;
  }
  for (const item of Object.values(value))
    validateRecipeExpression(item, context);
}

export function validateRecipeCondition(
  value: unknown,
  context: RecipeExpressionValidation,
): void {
  if (typeof value === "boolean") return;
  if (!recipeObject(value) || Object.keys(value).length !== 1)
    throw new Error(`${context.step.key}: condition requires one operator`);
  const [operator, operands] = Object.entries(value)[0]!;
  if (["all", "any"].includes(operator)) {
    if (!Array.isArray(operands))
      throw new Error(`${operator} requires a list of conditions`);
    for (const item of operands) validateRecipeCondition(item, context);
    return;
  }
  if (operator === "not") {
    validateRecipeCondition(operands, context);
    return;
  }
  if (operator === "exists") {
    validateRecipeExpression(operands, context);
    return;
  }
  if (
    !["eq", "ne", "gt", "gte", "lt", "lte", "in"].includes(operator) ||
    !Array.isArray(operands) ||
    operands.length !== 2
  )
    throw new Error(`${context.step.key}: invalid comparison ${operator}`);
  for (const item of operands) validateRecipeExpression(item, context);
}

export function recipeCondition(
  value: unknown,
  context: RecipeExpressionContext,
): boolean {
  if (typeof value === "boolean") return value;
  if (!recipeObject(value)) throw new Error("Invalid recipe condition");
  const [operator, operands] = Object.entries(value)[0]!;
  if (operator === "all" && Array.isArray(operands))
    return operands.every((item) => recipeCondition(item, context));
  if (operator === "any" && Array.isArray(operands))
    return operands.some((item) => recipeCondition(item, context));
  if (operator === "not") return !recipeCondition(operands, context);
  if (operator === "exists") {
    try {
      recipeExpression(operands, context);
      return true;
    } catch (error) {
      if (error instanceof MissingRecipeField) return false;
      throw error;
    }
  }
  if (!Array.isArray(operands)) throw new Error("Invalid recipe comparison");
  const left = recipeExpression(operands[0], context),
    right = recipeExpression(operands[1], context);
  const equal = (a: WorkflowJson, b: WorkflowJson) =>
    canonicalJson(a) === canonicalJson(b);
  if (operator === "eq") return equal(left, right);
  if (operator === "ne") return !equal(left, right);
  if (operator === "in") {
    if (!Array.isArray(right))
      throw new Error("Recipe membership requires an array");
    return right.some((item) => equal(left, item));
  }
  if (
    (typeof left !== "number" && typeof left !== "string") ||
    typeof right !== typeof left ||
    (typeof right !== "number" && typeof right !== "string")
  )
    throw new Error("Recipe ordering requires two numbers or two strings");
  const order = left < right ? -1 : left > right ? 1 : 0;
  const comparisons: Readonly<Record<string, boolean>> = {
    gt: order > 0,
    gte: order >= 0,
    lt: order < 0,
    lte: order <= 0,
  };
  return comparisons[operator] ?? false;
}

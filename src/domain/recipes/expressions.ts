import {
  ConfigurationError,
  configurationError,
} from "../configuration-diagnostic.ts";
import { losslessJson } from "../lossless-json.ts";
import { canonicalJson } from "../workflow/canonical-json.ts";
import { recipeTextReferences } from "./expression-text.ts";
import { recipeComparisons } from "./expressions.constants.ts";
import { recipeTemplatePattern } from "../recipe.constants.ts";
import { recipeValue } from "../recipe-inputs.ts";
import { recipeObject } from "./values.ts";
import type { WorkflowJson } from "../workflow/checkpoint.types.ts";
import type {
  RecipeComparison,
  RecipeConditionNode,
  RecipeExpressionContext,
  RecipeExpressionNode,
  RecipeExpressionReference,
  RecipeExpressionScope,
  RecipeExpressionValidation,
  RecipeReferencePath,
  RecipeSourcePath,
  RecipeValueReference,
} from "./expressions.types.ts";

export function recipeJson(value: unknown): WorkflowJson {
  return plainJson(losslessJson(value, { label: "Recipe values" }));
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

function expressionError(message: string, sourcePath: RecipeSourcePath): Error {
  return sourcePath.length
    ? configurationError(message, sourcePath)
    : new Error(message);
}

function located<T>(sourcePath: RecipeSourcePath, read: () => T): T {
  try {
    return read();
  } catch (error) {
    if (!sourcePath.length || error instanceof ConfigurationError) throw error;
    throw expressionError(
      error instanceof Error ? error.message : String(error),
      sourcePath,
    );
  }
}

function prefix(scope: RecipeExpressionScope): string {
  return scope.label === undefined ? "" : `${scope.label}: `;
}

function referencePath(
  path: unknown,
  scope: RecipeExpressionScope,
  sourcePath: RecipeSourcePath,
): RecipeReferencePath {
  if (path === undefined) return [];
  if (
    !Array.isArray(path) ||
    !path.every(
      (key) =>
        typeof key === "string" || (Number.isSafeInteger(key) && key >= 0),
    )
  )
    throw expressionError(`${prefix(scope)}invalid reference path`, sourcePath);
  return path;
}

function select(value: unknown, path: RecipeReferencePath): WorkflowJson {
  for (const key of path) {
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

function valueReference(
  kind: "$input" | "$step",
  value: Readonly<Record<string, unknown>>,
  scope: RecipeExpressionScope,
  sourcePath: RecipeSourcePath,
): RecipeValueReference {
  const key = value[kind];
  if (typeof key !== "string")
    throw expressionError(
      `${prefix(scope)}${kind} requires a name`,
      sourcePath,
    );
  if (Object.keys(value).some((field) => ![kind, "path"].includes(field)))
    throw expressionError(
      `${prefix(scope)}unknown reference field`,
      sourcePath,
    );
  const path = referencePath(value.path, scope, sourcePath);
  return kind === "$input"
    ? { kind: "input-value", input: key, path, sourcePath }
    : { kind: "step-value", step: key, path, sourcePath };
}

/** Parses an expression once into located nodes; validation and evaluation share the result. */
export function compileRecipeExpression(
  value: unknown,
  scope: RecipeExpressionScope,
  sourcePath: RecipeSourcePath = [],
): RecipeExpressionNode {
  if (typeof value === "string") {
    const interpolations = located(sourcePath, () =>
      recipeTextReferences(value, scope.inputs, scope.steps),
    ).map((reference) => ({
      source: reference.source,
      reference:
        reference.kind === "inputs"
          ? ({
              kind: "input-value",
              input: reference.key,
              path: reference.path,
              sourcePath,
            } as const)
          : ({
              kind: "step-value",
              step: reference.key,
              path: reference.path,
              sourcePath,
            } as const),
    }));
    return interpolations.length
      ? { kind: "text", text: value, interpolations, sourcePath }
      : { kind: "literal", value };
  }
  if (Array.isArray(value))
    return {
      kind: "array",
      items: value.map((item, index) =>
        compileRecipeExpression(item, scope, [...sourcePath, index]),
      ),
    };
  if (!recipeObject(value))
    return {
      kind: "literal",
      value: located(sourcePath, () => recipeJson(value)),
    };
  if (Object.hasOwn(value, "$literal")) {
    if (Object.keys(value).length !== 1)
      throw expressionError(
        `${prefix(scope)}$literal must be the only field`,
        sourcePath,
      );
    return {
      kind: "literal",
      value: located(sourcePath, () => recipeJson(value.$literal)),
    };
  }
  for (const kind of ["$input", "$step"] as const)
    if (Object.hasOwn(value, kind))
      return valueReference(kind, value, scope, sourcePath);
  if (Object.hasOwn(value, "$select")) {
    const selection = value.$select;
    if (
      Object.keys(value).length !== 1 ||
      !recipeObject(selection) ||
      Object.keys(selection).some((key) => !["from", "path"].includes(key)) ||
      !Array.isArray(selection.path) ||
      !selection.path.every(
        (key) =>
          typeof key === "string" || (Number.isSafeInteger(key) && key >= 0),
      )
    )
      throw expressionError(
        `${prefix(scope)}$select requires from and a property path`,
        sourcePath,
      );
    return {
      kind: "select",
      from: compileRecipeExpression(selection.from, scope, [
        ...sourcePath,
        "$select",
        "from",
      ]),
      path: referencePath(selection.path, scope, sourcePath),
      sourcePath,
    };
  }
  return {
    kind: "object",
    entries: Object.entries(value).map(
      ([key, item]) =>
        [
          key,
          compileRecipeExpression(item, scope, [...sourcePath, key]),
        ] as const,
    ),
  };
}

export function evaluateRecipeExpression(
  node: RecipeExpressionNode,
  context: RecipeExpressionContext,
): WorkflowJson {
  switch (node.kind) {
    case "literal":
      return recipeJson(node.value);
    case "input-value":
      return select(context.inputs[node.input], node.path);
    case "step-value":
      return select(context.output(node.step), node.path);
    case "select":
      return select(evaluateRecipeExpression(node.from, context), node.path);
    case "text": {
      let index = 0;
      return node.text.replace(recipeTemplatePattern, () => {
        const { source, reference } = node.interpolations[index++]!;
        const result = evaluateRecipeExpression(reference, context);
        if (!recipeValue(result))
          throw new Error(`Text interpolation requires a scalar: ${source}`);
        return String(result);
      });
    }
    case "array":
      return node.items.map((item) => evaluateRecipeExpression(item, context));
    case "object":
      return Object.fromEntries(
        node.entries.map(([key, item]) => [
          key,
          evaluateRecipeExpression(item, context),
        ]),
      );
  }
}

function scopeOf(context: RecipeExpressionContext): RecipeExpressionScope {
  return { inputs: Object.keys(context.inputs), steps: context.steps };
}

export function recipeExpression(
  value: unknown,
  context: RecipeExpressionContext,
): WorkflowJson {
  return evaluateRecipeExpression(
    compileRecipeExpression(value, scopeOf(context)),
    context,
  );
}

export function createRecipeExpressionEvaluator(
  inputs: readonly string[],
  steps: readonly string[],
) {
  const compiled = new Map<unknown, RecipeExpressionNode>();
  return (value: unknown, context: RecipeExpressionContext): WorkflowJson => {
    let expression = compiled.get(value);
    if (!expression) {
      expression = compileRecipeExpression(value, { inputs, steps });
      compiled.set(value, expression);
    }
    return evaluateRecipeExpression(expression, context);
  };
}

function* expressionReferences(
  node: RecipeExpressionNode,
): Generator<RecipeExpressionReference> {
  switch (node.kind) {
    case "input-value":
    case "step-value":
      yield { reference: node, interpolated: false };
      return;
    case "text":
      for (const { reference } of node.interpolations)
        yield { reference, interpolated: true };
      return;
    case "select":
      yield* expressionReferences(node.from);
      return;
    case "array":
      for (const item of node.items) yield* expressionReferences(item);
      return;
    case "object":
      for (const [, item] of node.entries) yield* expressionReferences(item);
      return;
    case "literal":
      return;
  }
}

function* conditionExpressions(
  node: RecipeConditionNode,
): Generator<RecipeExpressionNode> {
  switch (node.kind) {
    case "all":
    case "any":
      for (const item of node.items) yield* conditionExpressions(item);
      return;
    case "not":
      yield* conditionExpressions(node.item);
      return;
    case "exists":
      yield node.expression;
      return;
    case "compare":
      yield node.left;
      yield node.right;
      return;
    case "constant":
      return;
  }
}

function documentScope({
  document,
  step,
}: RecipeExpressionValidation): RecipeExpressionScope {
  return {
    inputs: Object.keys(document.inputs),
    steps: document.tasks.map((task) => task.key),
    label: step.key,
  };
}

function validateReferences(
  node: RecipeExpressionNode,
  { document, step }: RecipeExpressionValidation,
): void {
  for (const { reference, interpolated } of expressionReferences(node)) {
    if (reference.kind === "step-value") {
      if (!step.after.includes(reference.step))
        throw expressionError(
          `${step.key} must declare ${reference.step} in after before referencing its output`,
          reference.sourcePath,
        );
      continue;
    }
    if (!Object.hasOwn(document.inputs, reference.input))
      throw expressionError(
        `${step.key}: unknown recipe input ${reference.input}`,
        reference.sourcePath,
      );
    if (
      interpolated &&
      reference.path.length === 0 &&
      !["string", "number", "boolean"].includes(
        document.inputs[reference.input]!.type,
      )
    )
      throw expressionError(
        `${step.key}: text interpolation requires a scalar input ${reference.input}`,
        reference.sourcePath,
      );
  }
}

/** Compiles an expression against its task and rejects references to undeclared inputs or dependencies. */
export function validateRecipeExpression(
  value: unknown,
  context: RecipeExpressionValidation,
): void {
  validateReferences(
    compileRecipeExpression(
      value,
      documentScope(context),
      context.sourcePath ?? [],
    ),
    context,
  );
}

function isComparison(operator: string): operator is RecipeComparison {
  return recipeComparisons.some((comparison) => comparison === operator);
}

export function compileRecipeCondition(
  value: unknown,
  scope: RecipeExpressionScope,
  sourcePath: RecipeSourcePath = [],
): RecipeConditionNode {
  if (typeof value === "boolean") return { kind: "constant", value };
  if (!recipeObject(value) || Object.keys(value).length !== 1)
    throw expressionError(
      `${prefix(scope)}condition requires one operator`,
      sourcePath,
    );
  const [operator, operands] = Object.entries(value)[0]!;
  const at = [...sourcePath, operator];
  if (operator === "all" || operator === "any") {
    if (!Array.isArray(operands))
      throw expressionError(`${operator} requires a list of conditions`, at);
    return {
      kind: operator,
      items: operands.map((item, index) =>
        compileRecipeCondition(item, scope, [...at, index]),
      ),
    };
  }
  if (operator === "not")
    return { kind: "not", item: compileRecipeCondition(operands, scope, at) };
  if (operator === "exists")
    return {
      kind: "exists",
      expression: compileRecipeExpression(operands, scope, at),
    };
  if (
    !isComparison(operator) ||
    !Array.isArray(operands) ||
    operands.length !== 2
  )
    throw expressionError(
      `${prefix(scope)}invalid comparison ${operator}`,
      sourcePath,
    );
  return {
    kind: "compare",
    operator,
    left: compileRecipeExpression(operands[0], scope, [...at, 0]),
    right: compileRecipeExpression(operands[1], scope, [...at, 1]),
  };
}

export function validateRecipeCondition(
  value: unknown,
  context: RecipeExpressionValidation,
): void {
  const condition = compileRecipeCondition(
    value,
    documentScope(context),
    context.sourcePath ?? [],
  );
  for (const expression of conditionExpressions(condition))
    validateReferences(expression, context);
}

function compare(
  operator: RecipeComparison,
  left: WorkflowJson,
  right: WorkflowJson,
): boolean {
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

export function evaluateRecipeCondition(
  node: RecipeConditionNode,
  context: RecipeExpressionContext,
): boolean {
  switch (node.kind) {
    case "constant":
      return node.value;
    case "all":
      return node.items.every((item) => evaluateRecipeCondition(item, context));
    case "any":
      return node.items.some((item) => evaluateRecipeCondition(item, context));
    case "not":
      return !evaluateRecipeCondition(node.item, context);
    case "exists":
      try {
        evaluateRecipeExpression(node.expression, context);
        return true;
      } catch (error) {
        if (error instanceof MissingRecipeField) return false;
        throw error;
      }
    case "compare":
      return compare(
        node.operator,
        evaluateRecipeExpression(node.left, context),
        evaluateRecipeExpression(node.right, context),
      );
  }
}

export function recipeCondition(
  value: unknown,
  context: RecipeExpressionContext,
): boolean {
  return evaluateRecipeCondition(
    compileRecipeCondition(value, scopeOf(context)),
    context,
  );
}

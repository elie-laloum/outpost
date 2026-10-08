import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import prettier from "prettier";
import {
  nativeRecipeTypes,
  nativeRecipeKinds,
  nativeRecipePaths,
  nativeRecipeSecrets,
} from "../src/application/recipes/native-catalog.constants.ts";
const root = fileURLToPath(new URL("../", import.meta.url));
const source = (file) => resolve(root, "src", file);
const program = ts.createProgram(
  nativeRecipeTypes.flatMap(([, , file, , factoryFile]) => [
    source(file),
    ...(factoryFile ? [source(factoryFile)] : []),
  ]),
  {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ESNext,
    skipLibCheck: true,
    strict: true,
  },
);
const checker = program.getTypeChecker();
const reference = (component) => ({
  type: "object",
  properties: { $ref: { type: "string", minLength: 1 } },
  required: ["$ref"],
  additionalProperties: false,
  component,
});
const environment = {
  type: "object",
  properties: { env: { type: "string", pattern: "^[A-Za-z_][A-Za-z0-9_]*$" } },
  required: ["env"],
  additionalProperties: false,
  secret: true,
};
function schema(type, component, path = "", ancestors = new Set()) {
  if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never)) return false;
  if (nativeRecipeSecrets[component]?.includes(path)) {
    const parts = type.isUnion() ? type.types : [type];
    const choices = [environment];
    if (parts.some((part) => part.getCallSignatures().length))
      choices.push({
        ...reference("callback"),
        contract: `${component}.${path}`,
      });
    if (
      parts.some(
        (part) =>
          part.flags & ts.TypeFlags.BooleanLiteral &&
          part.intrinsicName === "false",
      )
    )
      choices.push({ const: false });
    return choices.length === 1 ? environment : { anyOf: choices };
  }
  if (path.endsWith(".client") || path === "client") return reference("object");
  const name = type.aliasSymbol?.name ?? type.symbol?.name;
  if (name === "WorkflowJson") return {};
  if (
    type.symbol?.declarations?.some((declaration) =>
      ts.isClassDeclaration(declaration),
    )
  )
    return reference("object");
  if (
    name === "Variables" ||
    (path.split(".").at(-1) === "variables" &&
      !checker.isArrayType(type) &&
      !(type.isUnion() && type.types.some((t) => checker.isArrayType(t))))
  )
    return {
      anyOf: [
        reference("variables"),
        {
          type: "object",
          additionalProperties: { anyOf: [{ type: "string" }, environment] },
        },
      ],
    };
  if (nativeRecipeKinds[name]) return reference(nativeRecipeKinds[name]);
  if (type.getCallSignatures().length)
    return { ...reference("callback"), contract: `${component}.${path}` };
  if (type.isUnion()) {
    const choices = type.types
      .filter((t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never)))
      .map((t) => schema(t, component, path, ancestors));
    if (choices.length === 1) return choices[0];
    return { anyOf: choices };
  }
  if (type.flags & ts.TypeFlags.StringLiteral) return { const: type.value };
  if (type.flags & ts.TypeFlags.NumberLiteral) return { const: type.value };
  if (type.flags & ts.TypeFlags.BooleanLiteral)
    return { const: type.intrinsicName === "true" };
  if (type.flags & ts.TypeFlags.Null) return { type: "null" };
  if (type.flags & (ts.TypeFlags.String | ts.TypeFlags.TemplateLiteral))
    return {
      type: "string",
      ...(nativeRecipePaths[component]?.includes(path)
        ? { hostPath: true }
        : {}),
    };
  if (type.flags & ts.TypeFlags.Number) return { type: "number" };
  if (type.flags & ts.TypeFlags.Boolean) return { type: "boolean" };
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);
    return constraint ? schema(constraint, component, path, ancestors) : {};
  }
  if (type.flags & (ts.TypeFlags.Unknown | ts.TypeFlags.Any)) return {};
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    const args = checker.getTypeArguments(type);
    if (checker.isTupleType(type)) {
      const rest = type.target.elementFlags.findIndex(
        (flag) => flag & ts.ElementFlags.Rest,
      );
      if (rest >= 0)
        return {
          type: "array",
          prefixItems: args
            .slice(0, rest)
            .map((t) => schema(t, component, `${path}.*`, ancestors)),
          minItems: rest,
          items: schema(args[rest], component, `${path}.*`, ancestors),
        };
      return {
        type: "array",
        prefixItems: args.map((t) =>
          schema(t, component, `${path}.*`, ancestors),
        ),
        minItems: args.length,
        maxItems: args.length,
        items: false,
      };
    }
    return {
      type: "array",
      items: schema(args[0], component, `${path}.*`, ancestors),
    };
  }
  if (name === "RegExp")
    return {
      type: "object",
      properties: { pattern: { type: "string" }, flags: { type: "string" } },
      required: ["pattern"],
      additionalProperties: false,
      regexp: true,
    };
  if (ancestors.has(type))
    throw new Error(
      `Recursive native declaration needs a component contract: ${component}.${path}: ${checker.typeToString(type)}`,
    );
  const next = new Set(ancestors).add(type);
  const properties = {};
  const required = [];
  for (const property of checker.getPropertiesOfType(type)) {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration) continue;
    const key = property.name;
    if (key.startsWith("__@")) continue;
    if (key === "signal") continue;
    properties[key] = schema(
      checker.getTypeOfSymbolAtLocation(property, declaration),
      component,
      path ? `${path}.${key}` : key,
      next,
    );
    if (!(property.flags & ts.SymbolFlags.Optional)) required.push(key);
  }
  const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
  return {
    type: "object",
    properties,
    ...(required.length ? { required } : {}),
    additionalProperties: index
      ? schema(index, component, `${path}.*`, next)
      : false,
  };
}
const contracts = {};
const factoryParameters = {};
function compactSchema(value) {
  const counts = new Map();
  function count(item) {
    if (!item || typeof item !== "object") return;
    const key = JSON.stringify(item);
    if (
      (typeof item.type === "string" || Array.isArray(item.anyOf)) &&
      key.length > 400
    )
      counts.set(key, (counts.get(key) ?? 0) + 1);
    for (const child of Object.values(item)) count(child);
  }
  count(value);
  const names = new Map(
    [...counts]
      .filter(([, count]) => count > 1)
      .map(([key], index) => [key, `option${index}`]),
  );
  function rewrite(item, root = false) {
    if (!item || typeof item !== "object") return item;
    if (Array.isArray(item)) return item.map((value) => rewrite(value));
    const name = names.get(JSON.stringify(item));
    if (name && !root) return { $ref: `#/$defs/${name}` };
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [key, rewrite(value)]),
    );
  }
  const result = rewrite(value, true);
  if (names.size)
    result.$defs = Object.fromEntries(
      [...names].map(([key, name]) => [name, rewrite(JSON.parse(key), true)]),
    );
  return result;
}
for (const [name, typeName, file, factory, factoryFile] of nativeRecipeTypes) {
  const module = checker.getSymbolAtLocation(
    program.getSourceFile(source(file)),
  );
  const symbol = checker
    .getExportsOfModule(module)
    .find((s) => s.name === typeName);
  assert.ok(symbol, `Missing native type ${file}:${typeName}`);
  const shape = schema(checker.getDeclaredTypeOfSymbol(symbol), name);
  if (factory && factoryFile) {
    const module = checker.getSymbolAtLocation(
      program.getSourceFile(source(factoryFile)),
    );
    const value = checker
      .getExportsOfModule(module)
      .find((s) => s.name === factory);
    assert.ok(value, `Missing native factory ${factory}`);
    const declaration = value.valueDeclaration ?? value.declarations[0];
    const parameters = checker
      .getTypeOfSymbolAtLocation(value, declaration)
      .getCallSignatures()[0]
      .parameters.slice(1);
    factoryParameters[name] = parameters.map((parameter) => parameter.name);
    for (const parameter of parameters) {
      const declaration =
        parameter.valueDeclaration ?? parameter.declarations[0];
      assert.ok(
        shape.properties && !Object.hasOwn(shape.properties, parameter.name),
        `Conflicting factory parameter ${name}.${parameter.name}`,
      );
      shape.properties[parameter.name] = schema(
        checker.getTypeOfSymbolAtLocation(parameter, declaration),
        name,
        parameter.name,
      );
    }
  }
  contracts[name] = compactSchema(shape);
}
const factories = nativeRecipeTypes
  .filter(([, , , factory]) => factory)
  .map(
    ([name, , , factory, file]) =>
      `${JSON.stringify(name)}: async () => (await import(${JSON.stringify(`../../${file}`)})).${factory}`,
  )
  .join(",\n");
for (const [file, code] of [
  [
    "src/application/recipes/native-schemas.constants.ts",
    `export const nativeRecipeSchemas: Readonly<Record<string, Readonly<Record<string, unknown>>>> = ${JSON.stringify(contracts, null, 2)};\nexport const nativeRecipeFactoryParameters: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(factoryParameters, null, 2)};\n`,
  ],
  [
    "src/application/recipes/native-factories.ts",
    `export const nativeRecipeFactories: Readonly<Record<string, () => Promise<unknown>>> = {${factories}};\n`,
  ],
]) {
  const path = resolve(root, file);
  const formatted = await prettier.format(code, {
    ...(await prettier.resolveConfig(path)),
    filepath: path,
  });
  if (process.argv.includes("--write")) await writeFile(path, formatted);
  else
    assert.equal(
      await readFile(path, "utf8"),
      formatted,
      `Stale native schema: ${file}`,
    );
}
console.log(
  `${Object.keys(contracts).length} native option contracts checked.`,
);

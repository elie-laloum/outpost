import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const dependencies = {
  domain: ["domain"],
  infrastructure: ["domain", "infrastructure"],
  adapters: ["domain", "infrastructure", "adapters"],
  providers: ["domain", "infrastructure", "providers", "adapters"],
  application: [
    "domain",
    "infrastructure",
    "adapters",
    "providers",
    "application",
  ],
  cli: [
    "domain",
    "infrastructure",
    "adapters",
    "providers",
    "application",
    "cli",
  ],
};
const files = (await readdir(root, { recursive: true })).filter((file) =>
  file.endsWith(".ts"),
);
const failures = [];
const runtimeDependencies = new Map();
for (const file of files) {
  const absolute = resolve(root, file);
  const text = await readFile(absolute, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const imports = new Set();
  runtimeDependencies.set(absolute, imports);
  const layer = file.split(/[\\/]/)[0];
  const types = file.endsWith(".types.ts");
  const fail = (node, message) =>
    failures.push(
      `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${message}`,
    );
  function visit(node) {
    if (
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isTypeLiteralNode(node)) &&
      !types
    )
      fail(node, "Declare contracts in a dedicated .types.ts module");
    if (
      ts.isIfStatement(node) &&
      node.elseStatement &&
      ts.isIfStatement(node.elseStatement)
    )
      fail(node, "Use guard clauses or a strategy for alternative branches");
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const bindings = ts.isImportDeclaration(node)
        ? node.importClause?.namedBindings
        : node.exportClause;
      const typeOnly = ts.isImportDeclaration(node)
        ? node.importClause?.isTypeOnly
        : node.isTypeOnly;
      const namedTypes =
        bindings &&
        (ts.isNamedImports(bindings) || ts.isNamedExports(bindings)) &&
        bindings.elements.length > 0 &&
        bindings.elements.every((item) => item.isTypeOnly) &&
        !(ts.isImportDeclaration(node) && node.importClause?.name);
      if (specifier.startsWith(".") && !typeOnly && !namedTypes)
        imports.add(resolve(dirname(absolute), specifier));
      if (specifier.startsWith(".") && dependencies[layer]) {
        const target = relative(
          root,
          resolve(dirname(absolute), specifier),
        ).split(/[\\/]/)[0];
        if (!dependencies[layer].includes(target))
          fail(node, `${layer} cannot depend on ${target}`);
      }
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text.startsWith(".")
    )
      imports.add(resolve(dirname(absolute), node.arguments[0].text));
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      const specifier = node.argument.literal.text;
      if (specifier.startsWith(".") && dependencies[layer]) {
        const target = relative(
          root,
          resolve(dirname(absolute), specifier),
        ).split(/[\\/]/)[0];
        if (!dependencies[layer].includes(target))
          fail(node, `${layer} cannot depend on ${target}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (types) {
    for (const node of source.statements) {
      const typeImport =
        ts.isImportDeclaration(node) &&
        (node.importClause?.isTypeOnly ||
          (node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings) &&
            node.importClause.namedBindings.elements.every(
              (item) => item.isTypeOnly,
            )));
      const declaration =
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        typeImport ||
        (ts.isExportDeclaration(node) && node.isTypeOnly);
      if (!declaration)
        fail(node, "Type modules must have no runtime initialization");
    }
  }
}
const indexes = new Map(),
  low = new Map(),
  stack = [],
  pending = new Set();
let next = 0;
function checkCycles(file) {
  indexes.set(file, next);
  low.set(file, next++);
  stack.push(file);
  pending.add(file);
  for (const dependency of runtimeDependencies.get(file) ?? []) {
    if (!indexes.has(dependency)) {
      checkCycles(dependency);
      low.set(file, Math.min(low.get(file), low.get(dependency)));
      continue;
    }
    if (pending.has(dependency))
      low.set(file, Math.min(low.get(file), indexes.get(dependency)));
  }
  if (low.get(file) !== indexes.get(file)) return;
  const group = [];
  let member;
  do {
    member = stack.pop();
    pending.delete(member);
    group.push(relative(root, member).replaceAll("\\", "/"));
  } while (member !== file);
  if (
    group.length > 1 &&
    group.some((name) =>
      /^application\/(?:(?:file|git)-)?(?:workspace|sandbox|dispatch|attach)(?:-|\.ts)/.test(
        name,
      ),
    )
  )
    failures.push(
      `Workspace execution modules must not form runtime import cycles: ${group.sort().join(", ")}`,
    );
}
for (const file of runtimeDependencies.keys())
  if (!indexes.has(file)) checkCycles(file);
assert.deepEqual(
  failures,
  [],
  `Architecture violations:\n${failures.join("\n")}`,
);
console.log(`Architecture checked: ${files.length} source modules`);

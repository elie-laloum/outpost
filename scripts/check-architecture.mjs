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
for (const file of files) {
  const absolute = resolve(root, file);
  const text = await readFile(absolute, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
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
assert.deepEqual(
  failures,
  [],
  `Architecture violations:\n${failures.join("\n")}`,
);
console.log(`Architecture checked: ${files.length} source modules`);

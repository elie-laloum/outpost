import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import { isPrivateLocalType } from "./architecture-local-type.mjs";

test("only small function-local type declarations receive the exception", () => {
  for (const [text, expected] of [
    ["type Shared = { value: string };", false],
    ["function parse() { type Entry = { value: string }; }", true],
    ["function parse() { interface Entry { value: string } }", true],
    [
      "function parse() { type Entry = {\na: string;\nb: string;\nc: string;\nd: string;\ne: string;\n}; }",
      false,
    ],
    ["function parse() { enum Entry { A } }", false],
  ]) {
    const source = ts.createSourceFile(
      "test.ts",
      text,
      ts.ScriptTarget.Latest,
      true,
    );
    const declarations = [];
    function visit(node) {
      if (
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isEnumDeclaration(node)
      )
        declarations.push(node);
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.equal(isPrivateLocalType(declarations[0], source), expected);
  }
});

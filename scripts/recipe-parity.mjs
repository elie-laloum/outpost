import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const entries = Object.entries(manifest.exports)
  .filter(([, value]) => typeof value === "object")
  .map(([name, value]) => [
    name,
    resolve(
      root,
      value.types.replace("./dist/", "./src/").replace(/\.d\.ts$/, ".ts"),
    ),
  ]);
const program = ts.createProgram(
  entries.map(([, file]) => file),
  {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ESNext,
    skipLibCheck: true,
    strict: true,
  },
);
const checker = program.getTypeChecker();
const inventory = {};
for (const [entry, file] of entries) {
  const source = program.getSourceFile(file);
  for (const exported of checker.getExportsOfModule(
    checker.getSymbolAtLocation(source),
  )) {
    const symbol =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    if (symbol.getJsDocTags(checker).some((tag) => tag.name === "deprecated"))
      continue;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) continue;
    const type =
      symbol.flags & ts.SymbolFlags.Type
        ? checker.getDeclaredTypeOfSymbol(symbol)
        : checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const signatures = type
      .getCallSignatures()
      .map((signature) =>
        checker.signatureToString(
          signature,
          declaration,
          ts.TypeFormatFlags.NoTruncation,
        ),
      );
    const options = {};
    for (const part of type.isUnion() ? type.types : [type]) {
      for (const property of checker.getPropertiesOfType(part)) {
        const location =
          property.valueDeclaration ?? property.declarations?.[0];
        if (
          !location ||
          !location.getSourceFile().fileName.startsWith(resolve(root, "src"))
        )
          continue;
        options[property.name] = checker.typeToString(
          checker.getTypeOfSymbolAtLocation(property, location),
          location,
          ts.TypeFormatFlags.NoTruncation,
        );
      }
    }
    inventory[`${entry}:${exported.name}`] = { signatures, options };
  }
}
const path = resolve(root, "recipes/parity.json");
let previous = {};
try {
  previous = JSON.parse(await readFile(path, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (process.argv.includes("--write")) {
  const result = {};
  for (const [key, contract] of Object.entries(inventory).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const existing = previous[key];
    const callable = contract.signatures.length > 0;
    const foundational =
      key.startsWith("./recipes:") ||
      /:(defineRecipe|createObservationHub)$/.test(key);
    result[key] = {
      ...contract,
      category: existing?.category ?? (callable ? "native" : "contract"),
      lot: existing?.lot ?? (foundational ? 1 : 7),
      status:
        existing?.status ??
        (foundational || !callable ? "implemented" : "planned"),
      test:
        existing?.test ??
        (foundational ? "test/functional/recipe-runtime.test.ts" : null),
    };
  }
  await writeFile(path, JSON.stringify(result, null, 2) + "\n");
} else {
  assert.deepEqual(
    Object.keys(previous).sort(),
    Object.keys(inventory).sort(),
    "Classify added or removed public exports with recipe-parity.mjs --write",
  );
  for (const [key, contract] of Object.entries(inventory)) {
    assert.deepEqual(
      { signatures: previous[key].signatures, options: previous[key].options },
      contract,
      `Classify changed public options: ${key}`,
    );
    assert.ok(
      ["native", "extension", "contract", "experimental"].includes(
        previous[key].category,
      ),
      `Unclassified export: ${key}`,
    );
    assert.ok(
      Number.isInteger(previous[key].lot) &&
        previous[key].lot >= 1 &&
        previous[key].lot <= 7,
      `Missing delivery lot: ${key}`,
    );
    if (
      previous[key].category !== "contract" &&
      previous[key].status === "implemented"
    )
      assert.ok(previous[key].test, `Missing parity test: ${key}`);
  }
}
console.log(
  `${Object.keys(inventory).length} public recipe parity contracts checked.`,
);

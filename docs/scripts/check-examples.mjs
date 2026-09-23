import ts from "typescript";
import assert from "node:assert/strict";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const docs = resolve(root, "docs/src/content/docs");
const examples = resolve(root, "docs/.examples");
await mkdir(examples, { recursive: true });
const roots = [];
const runnable = new Set([
  "workflows/graph.md",
  "workflows/execution.md",
  "workflows/backlogs.md",
  "extend/agents.md",
]);
let executed = 0;
for (const file of (await readdir(docs, { recursive: true })).filter(
  (file) => file.endsWith(".md") && !file.includes("reference"),
)) {
  const content = await readFile(resolve(docs, file), "utf8");
  let index = 0;
  for (const match of content.matchAll(/^```ts[^\n]*\n([\s\S]*?)^```/gm)) {
    const code = `${match[1]}\nexport {};\n`;
    const target = resolve(
      examples,
      `${file.replaceAll(/[\\/]/g, "-")}-${index++}.mts`,
    );
    await writeFile(target, code);
    roots.push(target);
    if (runnable.has(file.replaceAll("\\", "/"))) {
      const executable = ts.transpile(
        code.replaceAll(
          '"@elie-laloum/outpost"',
          JSON.stringify(pathToFileURL(resolve(root, "dist/index.js")).href),
        ),
        { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
      );
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", executable],
        { timeout: 20_000, stdio: "pipe" },
      );
      executed++;
    }
  }
}
const program = ts.createProgram(roots, {
  target: ts.ScriptTarget.ES2023,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  strict: true,
  exactOptionalPropertyTypes: true,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  types: ["node"],
  typeRoots: [resolve(root, "node_modules/@types")],
  paths: {
    "@elie-laloum/outpost": [resolve(root, "src/index.ts")],
    "@elie-laloum/outpost/providers/*": [resolve(root, "src/providers/*.ts")],
  },
});
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length)
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (file) => file,
      getNewLine: () => "\n",
    }),
  );
assert.ok(
  roots.length >= 30,
  "Expected substantive bilingual TypeScript examples",
);
console.log(
  `${roots.length} TypeScript examples checked; ${executed} credential-free examples executed.`,
);

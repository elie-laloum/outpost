import ts from "typescript";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  symlink,
  rm,
} from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const content = resolve(root, "docs/src/content/docs");
const directory = resolve(root, "docs/.examples");
await mkdir(resolve(directory, "node_modules/@elie-laloum"), {
  recursive: true,
});
await symlink(
  root,
  resolve(directory, "node_modules/@elie-laloum/outpost"),
  "junction",
).catch((error) => {
  if (error.code !== "EEXIST") throw error;
});
const workspace = await mkdtemp(resolve(directory, "snippets-"));
const roots = [];
const runnable = [];
let executed = 0;
try {
  for (const locale of ["", "fr/"]) {
    const setup = await readFile(
      resolve(content, `${locale}guide/setup.md`),
      "utf8",
    );
    const configuration = setup.match(
      /```ts title="outpost\.config\.mts"\n([\s\S]*?)```/,
    )?.[1];
    assert.ok(configuration, `Missing published configuration: ${locale}`);
    const localeDirectory = resolve(workspace, locale || "en");
    await mkdir(localeDirectory, { recursive: true });
    await writeFile(
      resolve(localeDirectory, "outpost.config.mts"),
      configuration,
    );
    roots.push(resolve(localeDirectory, "outpost.config.mts"));
    for (const name of await readdir(resolve(content, locale + "guide"))) {
      if (!name.endsWith(".md")) continue;
      const markdown = await readFile(
        resolve(content, locale + "guide", name),
        "utf8",
      );
      let index = 0;
      for (const match of markdown.matchAll(/^```ts[^\n]*\n([\s\S]*?)^```/gm)) {
        const file = resolve(localeDirectory, `${name}-${index++}.mts`);
        await writeFile(file, `${match[1]}\nexport {};\n`);
        roots.push(file);
        if (
          markdown
            .slice(match.index + match[0].length)
            .trimStart()
            .startsWith("<!-- check:run -->")
        )
          runnable.push({ file, name: locale + name });
      }
    }
  }
  assert.ok(roots.length > 2, "No guide snippets found");
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
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (name) => name,
      getNewLine: () => "\n",
    }),
  );
  assert.ok(runnable.length > 0, "No offline snippets selected");
  for (const { file, name } of runnable) {
    const cwd = await mkdtemp(resolve(workspace, "run-"));
    const output = execFileSync(process.execPath, [file], {
      cwd,
      encoding: "utf8",
      timeout: 30_000,
    });
    assert.ok(output.trim(), `Missing output: ${name}`);
    executed++;
  }
  console.log(
    `${roots.length} published TypeScript snippets checked; ${executed} offline snippets executed in both languages.`,
  );
} finally {
  await rm(workspace, { recursive: true, force: true });
}

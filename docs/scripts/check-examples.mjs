import ts from "typescript";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  copyFile,
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
  await writeFile(
    resolve(workspace, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  for (const locale of ["", "fr/"]) {
    const setup = await readFile(
      resolve(content, `${locale}guide/setup.md`),
      "utf8",
    );
    const configuration = setup.match(
      /```ts title="outpost\.config\.ts"\n([\s\S]*?)```/,
    )?.[1];
    assert.ok(configuration, `Missing published configuration: ${locale}`);
    const localeDirectory = resolve(workspace, locale || "en");
    await mkdir(localeDirectory, { recursive: true });
    await writeFile(
      resolve(localeDirectory, "outpost.config.ts"),
      configuration,
    );
    roots.push(resolve(localeDirectory, "outpost.config.ts"));
    const names = [
      "index.md",
      ...(await readdir(resolve(content, locale + "guide")))
        .filter((name) => name.endsWith(".md"))
        .map((name) => `guide/${name}`),
    ];
    for (const name of names) {
      const markdown = await readFile(resolve(content, locale, name), "utf8");
      let index = 0;
      const project = resolve(
        localeDirectory,
        name.replace(/\.md$/, "").replaceAll("/", "-"),
      );
      const projectFiles = new Set();
      for (const match of markdown.matchAll(
        /^```ts([^\n]*)\n([\s\S]*?)^```/gm,
      )) {
        // Titled TypeScript files form one project per page, so they can import each other.
        const title = match[1].match(/title="([\w.-]+\.ts)"/)?.[1];
        let file = resolve(
          localeDirectory,
          `${name.replaceAll("/", "-")}-${index++}.ts`,
        );
        if (title) {
          assert.ok(!projectFiles.has(title), `Duplicate ${title} in ${name}`);
          if (!projectFiles.size) {
            await mkdir(project);
            await copyFile(
              resolve(localeDirectory, "outpost.config.ts"),
              resolve(project, "outpost.config.ts"),
            );
          }
          projectFiles.add(title);
          file = resolve(project, title);
        }
        await writeFile(file, `${match[2]}\nexport {};\n`);
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
  const checker = program.getTypeChecker();
  const deprecatedImports = [];
  for (const file of roots)
    for (const statement of program.getSourceFile(file).statements) {
      const bindings = statement.importClause?.namedBindings;
      if (
        !ts.isImportDeclaration(statement) ||
        !statement.moduleSpecifier.text.startsWith("@elie-laloum/outpost") ||
        !bindings ||
        !ts.isNamedImports(bindings)
      )
        continue;
      for (const element of bindings.elements) {
        const symbol = checker.getSymbolAtLocation(element.name);
        const target =
          symbol && symbol.flags & ts.SymbolFlags.Alias
            ? checker.getAliasedSymbol(symbol)
            : symbol;
        if (
          target?.getJsDocTags(checker).some((tag) => tag.name === "deprecated")
        )
          deprecatedImports.push(
            `${file}: ${(element.propertyName ?? element.name).text}`,
          );
      }
    }
  assert.deepEqual(
    deprecatedImports,
    [],
    "Guide snippets must use current names, not deprecated aliases",
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

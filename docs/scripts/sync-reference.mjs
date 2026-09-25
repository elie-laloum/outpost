import ts from "typescript";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { groups } from "./api-groups.mjs";
import { explain } from "./reference-explanations.mjs";
import {
  isContract,
  referenceKind,
  referenceRank,
} from "./reference-model.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const manifest = JSON.parse(
  await readFile(resolve(root, "../package.json"), "utf8"),
);
const entries = Object.entries(manifest.exports).map(([entry, value]) => ({
  entry,
  file: resolve(root, "..", value.types),
}));
const program = ts.createProgram(
  entries.map(({ file }) => file),
  {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
  },
);
const checker = program.getTypeChecker();
const symbols = new Map();
const publicNames = new Map();
const unalias = (symbol) =>
  symbol?.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
for (const { entry, file } of entries) {
  const source = program.getSourceFile(file);
  if (!source) throw new Error("Build the package before synchronizing docs");
  for (const exported of checker.getExportsOfModule(
    checker.getSymbolAtLocation(source),
  )) {
    const symbol = unalias(exported);
    const imports = publicNames.get(symbol) ?? [];
    imports.push(
      entry === "." ? manifest.name : `${manifest.name}${entry.slice(1)}`,
    );
    publicNames.set(symbol, imports);
  }
}
const topDeclaration = (symbol) =>
  symbol?.declarations?.find(
    (node) =>
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isVariableDeclaration(node)) &&
      node
        .getSourceFile()
        .fileName.replaceAll("\\", "/")
        .startsWith(resolve(root, "../dist").replaceAll("\\", "/") + "/"),
  );
function collect(symbol) {
  if (symbols.has(symbol)) return;
  const declaration = topDeclaration(symbol);
  if (!declaration) return;
  const related = new Set();
  symbols.set(symbol, { declaration, related });
  const visit = (node) => {
    if (
      ts.isTypeReferenceNode(node) ||
      ts.isExpressionWithTypeArguments(node) ||
      ts.isTypeQueryNode(node)
    ) {
      const dependency = unalias(
        checker.getSymbolAtLocation(
          node.typeName ?? node.expression ?? node.exprName,
        ),
      );
      if (dependency && dependency !== symbol && topDeclaration(dependency)) {
        related.add(dependency);
        collect(dependency);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration);
}
for (const symbol of publicNames.keys()) collect(symbol);
const exportedSymbols = [...publicNames.keys()];
const exportedByName = new Map(
  exportedSymbols.map((symbol) => [symbol.name, symbol]),
);
function slug(symbol) {
  const preserved = {
    artifactStore: "function-artifactstore",
    ArtifactStore: "artifactstore",
    workflowCheckpointStore: "function-workflowcheckpointstore",
    WorkflowCheckpointStore: "workflowcheckpointstore",
  };
  if (Object.hasOwn(preserved, symbol.name)) return preserved[symbol.name];
  const name = symbol.name.toLowerCase();
  const collision = exportedSymbols.some(
    (other) => other !== symbol && other.name.toLowerCase() === name,
  );
  const prefix = publicNames.has(symbol) ? "" : "support-";
  const typePrefix =
    collision && isContract(symbols.get(symbol).declaration) ? "type-" : "";
  return `${prefix}${typePrefix}${name}`;
}
const expected = new Map();
const front = (title, order) =>
  `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`${title} — Outpost API`)}\nsidebar:\n  order: ${order}\n---\n\n`;
const groupFor = (name) =>
  groups.find((group) => group.names.split(" ").includes(name));
for (const symbol of publicNames.keys())
  if (!groupFor(symbol.name))
    throw new Error(`Document and classify new export: ${symbol.name}`);
for (const group of groups)
  for (const name of group.names.split(" "))
    if (![...publicNames.keys()].some((symbol) => symbol.name === name))
      throw new Error(`Stale API entry: ${name}`);

for (const group of groups) {
  for (const locale of ["", "fr/"]) {
    const overview = `${locale}reference/overview/${group.id}.md`;
    const text = await readFile(
      resolve(root, "src/content/docs", overview),
      "utf8",
    );
    if (!text.includes(group.guide))
      throw new Error(`Overview must link its practical guide: ${overview}`);
  }
}

const navigation = groups.map((group) => ({
  title: group.title,
  items: [
    { slug: `reference/overview/${group.id}` },
    ...group.names
      .split(" ")
      .map((name) => exportedByName.get(name))
      .sort(
        (a, b) =>
          referenceRank(symbols.get(a).declaration, checker, a) -
          referenceRank(symbols.get(b).declaration, checker, b),
      )
      .map((symbol) => {
        const kind = referenceKind(
          symbols.get(symbol).declaration,
          checker,
          symbol,
        );
        return {
          slug: `reference/${slug(symbol)}`,
          attrs: {
            "data-api-kind": kind,
            ...(group.experimental?.includes(symbol.name)
              ? {
                  "data-api-status": "experimental",
                  title: "Experimental / Expérimental",
                }
              : {}),
          },
        };
      }),
  ],
}));
const navigationPath = resolve(root, "reference-content/navigation.json");
const { format } = await import("../../node_modules/prettier/index.mjs");
const navigationText = await format(JSON.stringify(navigation), {
  parser: "json",
});
if (check) {
  if ((await readFile(navigationPath, "utf8")) !== navigationText)
    throw new Error("Outdated reference navigation. Run npm run docs:sync.");
} else await writeFile(navigationPath, navigationText);
const slugs = [...symbols.keys()].map(slug);
if (new Set(slugs).size !== slugs.length)
  throw new Error("Reference URL collision");

for (const [symbol, { declaration, related }] of symbols) {
  const exported = publicNames.has(symbol);
  const group = groupFor(symbol.name);
  const kind =
    ts.isInterfaceDeclaration(declaration) ||
    ts.isTypeAliasDeclaration(declaration)
      ? "type "
      : "";
  let code = declaration.getText().replaceAll(/import\("[^"\n]+"\)\./g, "");
  if (ts.isVariableDeclaration(declaration))
    code = `export declare const ${code};`;
  const externalImports = declaration
    .getSourceFile()
    .statements.filter(
      (node) =>
        ts.isImportDeclaration(node) &&
        !node.moduleSpecifier.text.startsWith("."),
    )
    .flatMap((node) => {
      const bindings = node.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) return [];
      const names = bindings.elements.filter((item) =>
        new RegExp(`\\b${item.name.text}\\b`).test(code),
      );
      return names.length
        ? [
            `import type { ${names.map((item) => item.getText()).join(", ")} } from ${node.moduleSpecifier.getText()};`,
          ]
        : [];
    });
  if (externalImports.length) code = `${externalImports.join("\n")}\n\n${code}`;
  for (const [language, locale] of [
    [0, ""],
    [1, "fr/"],
  ]) {
    const lead =
      exported || isContract(declaration)
        ? ""
        : language
          ? "Contrat auxiliaire non exporté directement ; utilisez l’inférence TypeScript ou le type public qui le référence."
          : "Supporting contract not directly exported; use TypeScript inference or the public type that references it.";
    const imports = exported
      ? `\n\n## Import\n\n\`\`\`ts\n${publicNames
          .get(symbol)
          .map((entry) => `import ${kind}{ ${symbol.name} } from "${entry}";`)
          .join("\n")}\n\`\`\``
      : "";
    const links = [...related]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => `- [${item.name}](../${slug(item)}/)`)
      .join("\n");
    const relatedText = links
      ? `\n\n## ${language ? "Contrats associés" : "Related contracts"}\n\n${links}`
      : "";
    expected.set(
      `${locale}reference/${slug(symbol)}.md`,
      front(symbol.name, referenceRank(declaration, checker, symbol) * 10) +
        lead +
        imports +
        explain(symbol, declaration, group, language, checker) +
        `\n\n## ${language ? "Signature" : "Signature"}\n\n\`\`\`ts\n${code}\n\`\`\`` +
        relatedText +
        "\n",
    );
  }
}

for (const [language, locale] of [
  [0, ""],
  [1, "fr/"],
]) {
  const canonicalChangelog = (
    await readFile(resolve(root, "../CHANGELOG.md"), "utf8")
  ).replace(/^# Changelog\s*/, "");
  const changelog = language
    ? (
        await readFile(resolve(root, "translations/changelog.fr.md"), "utf8")
      ).replace(/^# Historique des versions\s*/, "")
    : canonicalChangelog;
  const versions = (text) =>
    [...text.matchAll(/^## (.+)$/gm)].map((match) =>
      match[1] === "Non publié" ? "Unreleased" : match[1],
    );
  if (
    JSON.stringify(versions(changelog)) !==
    JSON.stringify(versions(canonicalChangelog))
  )
    throw new Error(
      "Update the French changelog translation for every release",
    );
  expected.set(
    `${locale}project/changelog.md`,
    front(language ? "Historique des versions" : "Changelog", 2) +
      (language
        ? "Traduction du journal `CHANGELOG.md` conservé à la racine du dépôt. Chaque version publiée possède ses notes dans les deux langues.\n\n"
        : "The release notes below are synchronized from the root `CHANGELOG.md`, the single source of release history.\n\n") +
      changelog.trim() +
      "\n",
  );
}
for (const [name, raw] of expected) {
  const content = await format(raw, { parser: "markdown" });
  const target = resolve(root, "src/content/docs", name);
  if (check) {
    if ((await readFile(target, "utf8").catch(() => "")) !== content)
      throw new Error(
        `Outdated generated page: ${name}. Run npm run docs:sync.`,
      );
  } else {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}
for (const locale of ["", "fr/"]) {
  const directory = resolve(root, "src/content/docs", `${locale}reference`);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    if (!expected.has(`${locale}reference/${name}`))
      throw new Error(
        `Remove stale reference page: ${locale}reference/${name}`,
      );
  }
}
console.log(
  `${publicNames.size} public symbols and ${symbols.size - publicNames.size} supporting contracts synchronized in English and French.`,
);

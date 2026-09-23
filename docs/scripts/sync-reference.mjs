import ts from "typescript";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { groups } from "./api-groups.mjs";

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
const slug = (symbol) =>
  `${publicNames.has(symbol) ? "" : "support-"}${symbol.name.toLowerCase()}`;
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
  for (const [language, locale] of [
    [0, ""],
    [1, "fr/"],
  ]) {
    const lead = exported
      ? language
        ? `Contrat public de **${symbol.name}**. Consultez le [guide ${group.title[1].toLowerCase()}](../../${group.guide}/) pour le comportement, les valeurs par défaut et des exemples.`
        : `Public contract for **${symbol.name}**. See the [${group.title[0].toLowerCase()} guide](../../${group.guide}/) for behavior, defaults and examples.`
      : language
        ? "Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence."
        : "Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.";
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
      front(symbol.name, exported ? 10 : 20) +
        lead +
        imports +
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
  const sections = groups
    .map(
      (group) =>
        `## ${group.title[language]}\n\n${group.names
          .split(" ")
          .map((name) => `- [${name}](./${name.toLowerCase()}/)`)
          .join("\n")}`,
    )
    .join("\n\n");
  const intro = language
    ? "Chaque export public du package et de ses sous-chemins possède une page de référence. Les signatures sont extraites des déclarations TypeScript compilées et vérifiées en CI. Les guides expliquent les usages ; les contrats détaillent les champs exacts. Les contrats auxiliaires restent accessibles depuis les types qui les utilisent."
    : "Every public export from the package and its subpaths has a reference page. Signatures are extracted from compiled TypeScript declarations and checked in CI. Guides explain usage; contracts list exact fields. Supporting contracts are linked from the types that use them.";
  expected.set(
    `${locale}reference/index.md`,
    front(language ? "Index de l’API" : "API index", 0) +
      intro +
      "\n\n" +
      sections +
      "\n",
  );
  const canonicalChangelog = (
    await readFile(resolve(root, "../CHANGELOG.md"), "utf8")
  ).replace(/^# Changelog\s*/, "");
  const changelog = language
    ? (
        await readFile(resolve(root, "translations/changelog.fr.md"), "utf8")
      ).replace(/^# Historique des versions\s*/, "")
    : canonicalChangelog;
  const versions = (text) =>
    [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
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
const { format } = await import("../../node_modules/prettier/index.mjs");
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
  for (const name of await readdir(directory))
    if (!expected.has(`${locale}reference/${name}`))
      throw new Error(
        `Remove stale reference page: ${locale}reference/${name}`,
      );
}
console.log(
  `${publicNames.size} public symbols and ${symbols.size - publicNames.size} supporting contracts synchronized in English and French.`,
);

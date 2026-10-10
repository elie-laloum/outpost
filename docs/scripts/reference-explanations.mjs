import { readFile } from "node:fs/promises";
import ts from "typescript";
import { displayType, referenceModel } from "./reference-model.mjs";
import { symbolGuides } from "./api-groups.mjs";

const readContent = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../reference-content/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const symbols = await readContent("symbols");
const fields = await readContent("fields");
const used = { symbols: new Set(), fields: new Set() };
const escape = (value) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("`", "\\`");
// Descriptions are prose: placeholders such as <name> must not become HTML.
const prose = (value) => value.replaceAll("<", "&lt;");
const bilingual = (values, key) => {
  if (
    !Array.isArray(values) ||
    values.length !== 2 ||
    values.some((value) => typeof value !== "string" || !value.trim())
  )
    throw new Error(`Missing bilingual reference description: ${key}`);
  if (
    values.some((value) =>
      /Consultez le contrat lié|See the linked contract/.test(value),
    )
  )
    throw new Error(`Generic reference description is forbidden: ${key}`);
  return values;
};
const presence = (entry, language) => {
  if (entry.conditional)
    return ["Variant-dependent", "Selon la variante"][language];
  if (entry.optional) return ["Optional", "Optionnel"][language];
  return ["Required", "Requis"][language];
};

export function explain(symbol, declaration, group, language, checker) {
  const { contract, signatures, entries } = referenceModel(
    symbol,
    declaration,
    checker,
  );
  const fr = language === 1;
  let output = "";
  // Interfaces are described by their properties; plain type aliases need a sentence.
  if (
    !contract ||
    (ts.isTypeAliasDeclaration(declaration) && !entries.length)
  ) {
    output += `\n\n## ${fr ? "Rôle et comportement" : "Purpose and behavior"}\n\n`;
    used.symbols.add(symbol.name);
    output += prose(bilingual(symbols[symbol.name], symbol.name)[language]);
    if (group)
      output += `\n\n[${fr ? "Exemple complet et règles détaillées" : "Complete example and detailed rules"}](../../${symbolGuides[symbol.name] ?? group.guide}/).`;
  }
  if (entries.length) {
    output += `\n\n## ${fr ? "Paramètres et propriétés" : "Parameters and properties"}\n\n`;
    const variants =
      signatures.length > 1
        ? signatures.map((signature) =>
            referenceModel(symbol, declaration, checker, signature),
          )
        : [{ entries }];
    for (const [index, variant] of variants.entries()) {
      if (variants.length > 1) {
        const signature = signatures[index];
        const parameter = signature.parameters[0];
        const type = checker.getTypeOfSymbolAtLocation(
          parameter,
          signature.declaration,
        );
        output += `### ${fr ? "Variante" : "Variant"} ${index + 1} — \`${displayType(checker.typeToString(type))}\`\n\n`;
      }
      if (variant.entries.some((entry) => entry.conditional))
        output += fr
          ? "Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.\n\n"
          : "The fields below cover all variants; the signature specifies their allowed combinations.\n\n";
      output += `| ${fr ? "Nom" : "Name"} | Type | ${fr ? "Présence" : "Presence"} | ${fr ? "Rôle" : "Meaning"} |\n| --- | --- | --- | --- |\n`;
      for (const entry of variant.entries) {
        used.fields.add(entry.key in fields ? entry.key : entry.owner);
        const description = bilingual(
          fields[entry.key] ?? fields[entry.owner],
          entry.key,
        )[language];
        output += `| \`${escape(entry.name)}\` | \`${escape(entry.type)}\` | ${presence(entry, language)} | ${prose(escape(description))} |\n`;
      }
      output += "\n";
    }
  }
  if (signatures.length && !ts.isInterfaceDeclaration(declaration)) {
    output += `\n\n## ${fr ? "Retour" : "Returns"}\n\n`;
    output +=
      [
        ...new Set(
          signatures.map(
            (signature) =>
              `\`${displayType(checker.typeToString(signature.getReturnType(), declaration, ts.TypeFormatFlags.NoTruncation))}\``,
          ),
        ),
      ].join(" · ") + "\n";
  }
  return output;
}

// Descriptions no generated page uses belong to removed or renamed declarations.
export function unusedDescriptions() {
  return [
    ...Object.keys(symbols).filter((key) => !used.symbols.has(key)),
    ...Object.keys(fields).filter((key) => !used.fields.has(key)),
  ];
}

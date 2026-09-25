import { readFile } from "node:fs/promises";
import ts from "typescript";
import { referenceModel } from "./reference-model.mjs";

const readContent = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../reference-content/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const symbols = await readContent("symbols");
const fields = await readContent("fields");
const escape = (value) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("`", "\\`");
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
  if (!contract) {
    output += `\n\n## ${fr ? "Rôle et comportement" : "Purpose and behavior"}\n\n`;
    output += bilingual(symbols[symbol.name], symbol.name)[language];
    if (group)
      output += `\n\n[${fr ? "Exemple complet et règles détaillées" : "Complete example and detailed rules"}](../../${group.guide}/).`;
  }
  if (entries.length) {
    output += `\n\n## ${fr ? "Paramètres et propriétés" : "Parameters and properties"}\n\n`;
    if (entries.some((entry) => entry.conditional))
      output += fr
        ? "Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.\n\n"
        : "The fields below cover all variants; the signature specifies their allowed combinations.\n\n";
    output += `| ${fr ? "Nom" : "Name"} | Type | ${fr ? "Présence" : "Presence"} | ${fr ? "Rôle" : "Meaning"} |\n| --- | --- | --- | --- |\n`;
    for (const entry of entries) {
      const description = bilingual(
        fields[entry.key] ?? fields[entry.owner],
        entry.key,
      )[language];
      output += `| \`${escape(entry.name)}\` | \`${escape(entry.type)}\` | ${presence(entry, language)} | ${escape(description)} |\n`;
    }
  }
  if (signatures.length && !ts.isInterfaceDeclaration(declaration)) {
    output += `\n\n## ${fr ? "Retour" : "Returns"}\n\n`;
    output +=
      [
        ...new Set(
          signatures.map(
            (signature) =>
              `\`${checker.typeToString(signature.getReturnType(), declaration, ts.TypeFormatFlags.NoTruncation)}\``,
          ),
        ),
      ].join(" · ") + "\n";
  }
  return output;
}

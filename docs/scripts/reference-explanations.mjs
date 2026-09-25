import ts from "typescript";
import { readFile } from "node:fs/promises";
const families = JSON.parse(
  await readFile(
    new URL("../reference-content/families.json", import.meta.url),
    "utf8",
  ),
);
const fields = JSON.parse(
  await readFile(
    new URL("../reference-content/fields.json", import.meta.url),
    "utf8",
  ),
);
const escape = (value) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ").replaceAll("`", "\\`");

export function explain(symbol, declaration, group, language, checker, owners) {
  const family = group ?? owners.get(symbol);
  const editorial = family && families[family.title[0]];
  if (family && !editorial)
    throw new Error(
      `Missing bilingual reference explanation: ${family.title[0]}`,
    );
  const fr = language === 1;
  let output = `\n\n## ${fr ? "Rôle et comportement" : "Purpose and behavior"}\n\n`;
  output +=
    editorial?.purpose[language] ??
    (fr
      ? "Contrat auxiliaire des interfaces liées ci-dessous. Utilisez le type public parent pour configurer ou lire cette valeur."
      : "Supporting contract for the interfaces linked below. Use the public parent type to configure or read this value.");
  if (editorial) output += `\n\n${editorial.behavior[language]}`;
  if (family)
    output += `\n\n[${fr ? "Exemple complet et règles détaillées" : "Complete example and detailed rules"}](../../${family.guide}/).`;
  const isType =
    ts.isInterfaceDeclaration(declaration) ||
    ts.isTypeAliasDeclaration(declaration) ||
    ts.isClassDeclaration(declaration);
  const type = isType
    ? checker.getDeclaredTypeOfSymbol(symbol)
    : checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  const properties = isType
    ? checker.getPropertiesOfType(type)
    : signatures.flatMap((signature) => signature.parameters);
  const unique = [
    ...new Map(
      properties.map((property) => [property.name, property]),
    ).values(),
  ];
  const entries = unique.map((property) => ({ property, name: property.name }));
  if (!isType) {
    for (const parameter of unique.filter(
      (property) => property.name === "options",
    )) {
      const location = parameter.valueDeclaration ?? declaration;
      const options = checker.getNonNullableType(
        checker.getTypeOfSymbolAtLocation(parameter, location),
      );
      for (const property of checker.getPropertiesOfType(options)) {
        entries.push({ property, name: `options.${property.name}` });
      }
    }
  }
  if (entries.length) {
    output += `\n\n## ${fr ? "Paramètres et propriétés" : "Parameters and properties"}\n\n| ${fr ? "Nom" : "Name"} | Type | ${fr ? "Présence" : "Presence"} | ${fr ? "Rôle" : "Meaning"} |\n| --- | --- | --- | --- |\n`;
    for (const { property, name } of entries) {
      const location =
        property.valueDeclaration ?? property.declarations?.[0] ?? declaration;
      const fieldType = checker.getTypeOfSymbolAtLocation(property, location);
      const signature = checker.typeToString(
        fieldType,
        location,
        ts.TypeFormatFlags.NoTruncation,
      );
      const optional =
        !!(property.flags & ts.SymbolFlags.Optional) ||
        !!location.questionToken ||
        !!location.initializer;
      const comment = ts.displayPartsToString(
        property.getDocumentationComment(checker),
      );
      const description =
        fields[property.name]?.[language] ??
        (comment && !fr
          ? comment
          : fr
            ? "Consultez le contrat lié et les règles de cette famille pour son interprétation."
            : "See the linked contract and this family's rules for its interpretation.");
      output += `| \`${escape(name)}\` | \`${escape(signature)}\` | ${optional ? (fr ? "Optionnel" : "Optional") : fr ? "Requis" : "Required"} | ${escape(description)} |\n`;
    }
  }
  if (signatures.length) {
    output += `\n\n## ${fr ? "Retour" : "Returns"}\n\n`;
    output += [
      ...new Set(
        signatures.map(
          (signature) =>
            `\`${checker.typeToString(signature.getReturnType(), declaration, ts.TypeFormatFlags.NoTruncation)}\``,
        ),
      ),
    ].join(" · ");
    output += "\n";
  }
  return output;
}

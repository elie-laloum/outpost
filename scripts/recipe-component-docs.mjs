import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";
import { nativeRecipeTypes } from "../src/application/recipes/native-catalog.constants.ts";
import {
  nativeRecipeComponents,
  sandboxOptionsComponent,
  dispatchOptionsComponent,
} from "../src/application/recipes/native.ts";
import { observationComponents } from "../src/application/recipes/observation.ts";
import { workflowOptionComponents } from "../src/application/recipes/workflow-components.ts";
import { secretSelectionComponent } from "../src/application/recipes/variables.ts";

const definitions = [
  ...nativeRecipeComponents,
  ...observationComponents,
  ...workflowOptionComponents,
  sandboxOptionsComponent,
  dispatchOptionsComponent,
  secretSelectionComponent,
];
const tests = [
  null,
  "recipe-runtime",
  "recipe-components",
  "recipe-harness",
  "recipe-workflow",
  "recipe-durable",
  "recipe-services",
  "recipe-advanced",
];
const index = {};
function fields(
  schema,
  root = schema,
  path = "",
  result = {},
  seen = new Set(),
) {
  if (!schema || typeof schema !== "object") return result;
  if (schema.$ref?.startsWith("#/$defs/")) {
    if (seen.has(schema.$ref)) return result;
    return fields(
      root.$defs[schema.$ref.slice(8)],
      root,
      path,
      result,
      new Set(seen).add(schema.$ref),
    );
  }
  if (schema.component)
    result[path || "."] = [
      "callback",
      "object",
      "workspace",
      "signal",
    ].includes(schema.component)
      ? "extension"
      : "native";
  if (schema.component) return result;
  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    const field = path ? `${path}.${key}` : key;
    result[field] ??= "native";
    fields(value, root, field, result, seen);
  }
  if (schema.items) fields(schema.items, root, `${path}[]`, result, seen);
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  )
    fields(schema.additionalProperties, root, `${path}.*`, result, seen);
  for (const choice of schema.anyOf ?? schema.oneOf ?? schema.allOf ?? [])
    fields(choice, root, path, result, seen);
  return result;
}
for (const definition of definitions.toSorted((a, b) =>
  a.name.localeCompare(b.name),
)) {
  const native = nativeRecipeTypes.find(
    ([name]) =>
      name === definition.name ||
      name === definition.name.replace("Options.options", ".options"),
  );
  const lot = native?.[5] ?? (definition.name.startsWith("variables.") ? 2 : 1);
  index[definition.name] = {
    kind: definition.kind,
    lot,
    experimental: definition.experimental === true,
    owned: !!definition.dispose,
    options: fields(definition.schema),
    test: `test/functional/${tests[lot]}.test.ts`,
  };
  await readFile(new URL(`../${index[definition.name].test}`, import.meta.url));
}
async function output(path, content, parser) {
  const url = new URL(`../${path}`, import.meta.url);
  const formatted = await prettier.format(content, {
    ...(await prettier.resolveConfig(url.pathname)),
    parser,
  });
  if (process.argv.includes("--write")) await writeFile(url, formatted);
  else if ((await readFile(url, "utf8")) !== formatted)
    throw new Error(`Stale descriptor output: ${path}`);
}
await output("recipes/components.json", JSON.stringify(index), "json");
for (const fr of [false, true]) {
  let content = fr
    ? `---\ntitle: Composants YAML disponibles\ndescription: Correspondance générée entre les composants YAML, leurs contrats TypeScript et leur propriété.\n---\n\nCes déclarations proviennent du registre utilisé pour valider et exécuter les recettes. Déclarez un composant avec \`type\` ou réutilisez-le avec \`$ref\` depuis la configuration locale. Le guide [des recettes YAML](../yaml-recipes/) explique les familles et les extensions ; les [compositions avancées](../recipe-advanced/) présentent la spéculation et les résolveurs.\n\n`
    : `---\ntitle: Available YAML components\ndescription: Generated mapping of YAML components, TypeScript contracts and ownership.\n---\n\nThese declarations come from the registry used to validate and execute recipes. Declare a component with \`type\` or reuse it with \`$ref\` from local configuration. The [YAML recipes guide](../yaml-recipes/) explains families and extensions; [advanced composition](../recipe-advanced/) covers speculation and resolvers.\n\n`;
  content += fr
    ? `Les identifiants se lisent \`catégorie.type\`. Les lignes \`*Options.options\` représentent les sections du document : \`workflow\`, \`workspace\`, \`integration\` ou les options d’une tâche. Les propriétés détaillées restent celles des contrats TypeScript liés depuis les guides. Le schéma de l’éditeur et \`recipes/components.json\` répertorient leurs champs et les références de callbacks.\n\n`
    : `Identifiers read as \`category.type\`. The \`*Options.options\` rows represent document sections: \`workflow\`, \`workspace\`, \`integration\` or task options. Detailed properties retain the TypeScript contracts linked from the guides. The editor schema and \`recipes/components.json\` list their fields and callback references.\n\n`;
  content += fr
    ? `Un composant indiqué « runtime » est fermé par le runtime ; « valeur » désigne une configuration, une factory sans ressource ouverte ou un objet sans fermeture propre. Les dépendances possédées sont fermées en ordre inverse, les observateurs en dernier. Un export emprunté reste toujours à la charge de son propriétaire. L’activation expérimentale exige \`experimental: true\` dans la configuration.\n\n`
    : `A component marked “runtime” is closed by the runtime; “value” denotes configuration, an allocation-free factory or an object without its own cleanup. Owned dependencies close in reverse order, with observers last. Borrowed exports always remain caller-owned. Experimental activation requires \`experimental: true\` in configuration.\n\n`;
  content += fr
    ? `| Identifiant | Catégorie | Fermeture | Lot | Statut |\n| --- | --- | --- | --- | --- |\n`
    : `| Identifier | Category | Cleanup | Lot | Status |\n| --- | --- | --- | --- | --- |\n`;
  for (const [name, entry] of Object.entries(index))
    content += `| \`${name}\` | \`${entry.kind}\` | ${entry.owned ? "runtime" : fr ? "valeur" : "value"} | ${entry.lot} | ${entry.experimental ? (fr ? "expérimental" : "experimental") : fr ? "implémenté" : "implemented"} |\n`;
  content += fr
    ? `\nLa couverture décrit la composition locale, pas une validation de chaque service distant. Les tests utilisent des agents simulés, des modèles HTTP locaux, Git, Docker et Redis réels ; les appels payants, clouds et gestionnaires de secrets distants restent sans validation live.\n`
    : `\nCoverage describes local composition, not validation of every remote service. Tests use simulated agents, local HTTP models, real Git, Docker and Redis; paid calls, clouds and remote secret managers remain without live validation.\n`;
  await output(
    `docs/src/content/docs/${fr ? "fr/" : ""}guide/yaml-components.md`,
    content,
    "markdown",
  );
}
console.log(
  `${definitions.length} component mappings and YAML guides checked.`,
);

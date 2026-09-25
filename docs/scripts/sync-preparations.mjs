import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "../../node_modules/prettier/index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const content = resolve(root, "src/content/docs");
const snippets = Object.fromEntries(
  await Promise.all(
    ["prepare.mjs", "runtime.mts"].map(async (name) => [
      name,
      await readFile(resolve(root, "snippets", name), "utf8"),
    ]),
  ),
);
export function preparation(kind, french, page) {
  const tr = (en, fr) => (french ? fr : en);
  const offline = kind === "offline";
  const agent = kind === "agent";
  const demo = kind !== "offline";
  const remote = /(?:providers\/(?:vercel|daytona)|cookbook\/remote)\.md$/.test(
    page,
  );
  const environment = remote
    ? tr(
        "Generate the workflow files without building a local image. This example allocates its environment in the cloud; Docker is not required. Install the optional provider SDK and declare allocation credentials as described below.",
        "Générez les fichiers du workflow sans construire d’image locale. Cet exemple alloue son environnement dans le cloud ; Docker n’est pas nécessaire. Installez le SDK optionnel et déclarez les identifiants d’allocation indiqués ci-dessous.",
      )
    : tr(
        "Start Docker, then generate a separate workflow directory and build its image. The first download/build can take several minutes; later examples can reuse the image by adding `--no-build`.",
        "Démarrez Docker, puis générez un dossier de workflow séparé et construisez son image. Le premier téléchargement/build peut prendre plusieurs minutes ; les exemples suivants peuvent réutiliser l’image avec `--no-build`.",
      );
  return (
    `<details>\n<summary>${tr("Prepare this example from scratch", "Préparer cet exemple depuis zéro")}</summary>\n\n` +
    tr(
      "Use Node.js **24+** and npm. Start in a new directory for each example.",
      "Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.",
    ) +
    "\n\n```sh\nmkdir outpost-example\ncd outpost-example\n```\n\n" +
    (demo
      ? tr(
          "Git is required. Save this file as **prepare.mjs**, then run it. It creates a disposable repository with a deliberately failing whitespace test. It refuses to overwrite an existing directory.",
          "Git est nécessaire. Enregistrez ce fichier sous **prepare.mjs**, puis lancez-le. Il crée un dépôt de démonstration dont le test des espaces échoue volontairement. Il refuse d’écraser un dossier existant.",
        ) +
        "\n\n```js file=prepare.mjs\n" +
        snippets["prepare.mjs"] +
        "```\n\n```sh\nnode prepare.mjs\n```\n\n"
      : "") +
    (offline
      ? "```sh\nnpm init -y\nnpm install @elie-laloum/outpost\n```\n\n" +
        tr(
          "Save the example as **example.mts** in this directory. No account, API key or container is needed.",
          "Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.",
        )
      : environment +
        `\n\n\`\`\`sh\nnpx @elie-laloum/outpost init --yes --directory workflow --repository ../repository --image outpost:docs-demo --install${remote ? " --no-build" : ""}\ncd workflow\n\`\`\`\n\n` +
        (agent
          ? tr(
              "Choose **one** of these configurations for **workflow/.env**. Empty key declarations inherit the matching environment variable; alternatively set its value in this ignored file. Account access and API billing are separate. The CLI-generated `run.ts` already configures Codex login; do not add a second login hook.",
              "Choisissez **une** des configurations ci-dessous pour **workflow/.env**. Les déclarations de clés vides héritent de la variable d’environnement correspondante ; vous pouvez aussi renseigner sa valeur dans ce fichier ignoré par Git. Accès par compte et facturation API sont distincts. Le `run.ts` généré par la CLI configure déjà la connexion Codex ; n’ajoutez pas un second hook.",
            ) +
            "\n\n" +
            tr("**Codex — API key**", "**Codex — clé API**") +
            "\n\n```dotenv\nOUTPOST_AGENT=codex\nOUTPOST_AUTH=api-key\nOPENAI_API_KEY=\n```\n\n" +
            tr(
              "**Codex — account**: run `codex -c cli_auth_credentials_store='\"file\"' login` on the host first. This explicitly selects a file credential seed instead of exporting a keychain.",
              "**Codex — compte** : lancez d’abord `codex -c cli_auth_credentials_store='\"file\"' login` sur l’hôte. Vous sélectionnez explicitement un fichier de connexion sans exporter un trousseau.",
            ) +
            "\n\n```dotenv\nOUTPOST_AGENT=codex\nOUTPOST_AUTH=login\n```\n\n" +
            tr("**Claude — API key**", "**Claude — clé API**") +
            "\n\n```dotenv\nOUTPOST_AGENT=claude\nOUTPOST_AUTH=api-key\nANTHROPIC_API_KEY=\n```\n\n" +
            tr(
              "**Claude — subscription**: obtain a token with `claude setup-token` on the host and declare it below.",
              "**Claude — abonnement** : obtenez un jeton avec `claude setup-token` sur l’hôte et déclarez-le ci-dessous.",
            ) +
            "\n\n```dotenv\nOUTPOST_AGENT=claude\nOUTPOST_AUTH=oauth-token\nCLAUDE_CODE_OAUTH_TOKEN=\n```\n\n" +
            tr(
              "Save **runtime.mts** next to the example. This complete configuration reads only declared variables, selects the agent and initializes its private sandbox home. The example calls `configuration()` to use your choice. These two `OUTPOST_` settings belong to this teaching script, not the Outpost API.",
              "Enregistrez **runtime.mts** à côté de l’exemple. Cette configuration complète lit uniquement les variables déclarées, sélectionne l’agent et initialise son home privé dans la sandbox. L’exemple appelle `configuration()` pour utiliser votre choix. Les deux réglages `OUTPOST_` appartiennent à ce script pédagogique, pas à l’API Outpost.",
            ) +
            "\n\n```ts file=runtime.mts\n" +
            snippets["runtime.mts"] +
            "```\n\n" +
            tr(
              "Agent runs make real model calls. Account/model access and response time depend on your provider. See the official [Codex authentication](https://developers.openai.com/codex/auth/) and [Claude authentication](https://code.claude.com/docs/en/authentication) documentation.",
              "Les exécutions d’agents appellent réellement les modèles. L’accès au compte/modèle et le temps de réponse dépendent du fournisseur. Consultez les documentations officielles de [connexion Codex](https://developers.openai.com/codex/auth/) et [connexion Claude](https://code.claude.com/docs/en/authentication).",
            )
          : tr(
              "This example uses container commands only; no agent credentials are needed.",
              "Cet exemple exécute uniquement des commandes dans le conteneur ; aucun identifiant d’agent n’est nécessaire.",
            ))) +
    "\n\n</details>"
  );
}
const check = process.argv.includes("--check");
for (const name of await readdir(content, { recursive: true })) {
  if (!name.endsWith(".md")) continue;
  const path = resolve(content, name);
  const previous = await readFile(path, "utf8");
  if (!previous.includes("<!-- preparation:")) continue;
  const next = await format(
    previous.replace(
      /<!-- preparation:(agent|sandbox|offline) -->[\s\S]*?<!-- \/preparation -->/g,
      (_, kind) =>
        `<!-- preparation:${kind} -->\n\n${preparation(kind, name.replaceAll("\\", "/").startsWith("fr/"), name.replaceAll("\\", "/"))}\n\n<!-- /preparation -->`,
    ),
    { parser: "markdown" },
  );
  if (next === previous) continue;
  if (check)
    throw new Error(`Outdated preparation: ${name}. Run npm run docs:sync.`);
  await writeFile(path, next);
}

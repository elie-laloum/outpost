import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const content = new URL("../src/content/docs/", import.meta.url);
export const downloadableExamples = [
  "fix-failing-ci",
  "plan-a-change",
  "prepare-change-tests",
  "development-workflow",
  "review-on-label",
  "nightly-maintenance",
  "multi-repository-change",
  "compete-agents",
  "verification-loops",
];

export async function exampleProject(
  slug,
  locale = "",
  { read: readSource, version } = {},
) {
  if (!downloadableExamples.includes(slug) || !["", "fr/"].includes(locale))
    throw new Error("Unknown guide example");
  const read =
    readSource ??
    ((name) => readFile(new URL(`${locale}guide/${name}.md`, content), "utf8"));
  const files = new Map();
  const snippets = (markdown) =>
    new Map(
      [
        ...markdown.matchAll(/^```ts title="([\w.-]+\.ts)"\n([\s\S]*?)^```/gm),
      ].map((match) => [match[1], match[2]]),
    );
  const markdown = await read(slug);
  for (const match of markdown.matchAll(
    /<!-- example:include ([a-z0-9-]+) ([\w. -]+) -->/g,
  )) {
    const shared = snippets(await read(match[1]));
    for (const name of match[2].split(" ")) {
      if (!shared.has(name))
        throw new Error(`Missing example file: ${match[1]}/${name}`);
      files.set(name, shared.get(name));
    }
  }
  for (const entry of snippets(markdown)) files.set(...entry);
  files.set(
    "outpost.config.ts",
    snippets(await read("setup")).get("outpost.config.ts"),
  );
  const packageVersion =
    version ??
    JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    ).version;
  files.set(
    "package.json",
    JSON.stringify(
      {
        private: true,
        type: "module",
        engines: { node: ">=24" },
        dependencies: { "@elie-laloum/outpost": packageVersion, zod: "^4.6.5" },
      },
      null,
      2,
    ) + "\n",
  );
  files.set(
    "README.md",
    locale
      ? `# ${slug}\n\nFichiers de l’exemple : https://elie-laloum.github.io/outpost/fr/guide/${slug}/\n\nInstallez les dépendances avec npm install. Préparez l’image et l’authentification selon Installation, puis adaptez repository dans outpost.config.ts. Suivez les commandes de la page ; chaque fichier n’est pas un point d’entrée. Ces exemples peuvent appeler un modèle payant et modifier le dépôt choisi. Aucun identifiant n’est inclus.\n`
      : `# ${slug}\n\nExample files: https://elie-laloum.github.io/outpost/guide/${slug}/\n\nInstall dependencies with npm install. Prepare the image and authentication from Installation, then set repository in outpost.config.ts. Follow the page’s commands; not every file is an entry point. These examples can call a paid model and modify the selected repository. No credentials are included.\n`,
  );
  for (const [name, code] of files) {
    if (!name.endsWith(".ts")) continue;
    for (const match of code.matchAll(/from "\.\/([^"/]+)"/g))
      if (!files.has(match[1]))
        throw new Error(`Missing import: ${slug}/${name} -> ${match[1]}`);
  }
  return files;
}

export function projectArchive(files) {
  const blocks = [];
  for (const [name, text] of files) {
    if (!/^[\w.-]+$/.test(name) || name === "..")
      throw new Error("Unsafe archive path");
    const bytes = Buffer.from(text);
    const header = Buffer.alloc(512);
    header.write(name, 0, 100);
    for (const [offset, size, value] of [
      [100, 8, 0o644],
      [108, 8, 0],
      [116, 8, 0],
      [124, 12, bytes.length],
      [136, 12, 0],
    ])
      header.write(
        value.toString(8).padStart(size - 1, "0") + "\0",
        offset,
        size,
      );
    header.fill(32, 148, 156);
    header.write("0", 156);
    header.write("ustar\0", 257);
    header.write("00", 263);
    const sum = header.reduce((total, byte) => total + byte, 0);
    header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
    blocks.push(
      header,
      bytes,
      Buffer.alloc((512 - (bytes.length % 512)) % 512),
    );
  }
  return gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
}

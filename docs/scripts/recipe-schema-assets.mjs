import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { recipeSchemaNames } from "./recipe-schema-assets.constants.mjs";

const execute = promisify(execFile);

export async function recipeSchemaAssets(repository) {
  const root =
    repository ??
    (
      await execute("git", ["rev-parse", "--show-toplevel"], {
        encoding: "utf8",
      })
    ).stdout.trim();
  const git = async (...arguments_) =>
    (
      await execute("git", arguments_, {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      })
    ).stdout;
  if ((await git("rev-parse", "--is-shallow-repository")).trim() === "true")
    throw new Error(
      "Schema archives require full Git history: run git fetch --unshallow --tags",
    );
  const assets = await Promise.all(
    recipeSchemaNames.map(async (name) => ({
      path: name,
      body: await readFile(resolve(root, name), "utf8"),
    })),
  );
  const tags = (await git("tag", "--merged", "HEAD", "--list", "v*"))
    .trim()
    .split("\n")
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
  for (const tag of tags) {
    const names = (
      await git("ls-tree", "--name-only", tag, "--", ...recipeSchemaNames)
    )
      .trim()
      .split("\n");
    if (!recipeSchemaNames.every((name) => names.includes(name))) continue;
    const version = tag.slice(1);
    const manifest = JSON.parse(await git("show", `${tag}:package.json`));
    if (manifest.version !== version)
      throw new Error(`Schema archive ${tag} does not match package.json`);
    for (const name of recipeSchemaNames)
      assets.push({
        path: `${version}/${name}`,
        body: await git("show", `${tag}:${name}`),
      });
  }
  for (const asset of assets) JSON.parse(asset.body);
  return assets;
}

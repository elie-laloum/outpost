import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { recipeCatalogCommand } from "../../src/cli/recipe-catalog.ts";
import { downloadRecipeResource } from "../../src/infrastructure/recipe-download.ts";
import { validateRecipeCatalog } from "../../src/domain/recipe-catalog.ts";

const source =
  "version: 2\nname: review\nrecipeVersion: '1.0.0'\ntasks: [{key: review, agent: reviewer, brief: Review}]\n";
const entry = {
  name: "review",
  version: "1.0.0",
  description: "Review code",
  source: "./review.yaml",
  sha256: createHash("sha256").update(source).digest("hex"),
};

test("catalogue fetch follows HTTPS redirects, verifies identity and never overwrites files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-catalog-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  const urls: string[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    urls.push(url);
    if (url === "https://recipes.example/catalog.json")
      return new Response(null, {
        status: 302,
        headers: { location: "/v1/catalog.json" },
      });
    if (url.endsWith("catalog.json"))
      return Response.json({ version: 1, recipes: [entry] });
    assert.equal(url, "https://recipes.example/v1/review.yaml");
    return new Response(source);
  };
  const reports: string[] = [];
  const invocation = {
    values: {
      catalog: "https://recipes.example/catalog.json",
      recipe: "review",
      file,
      json: true,
    },
    positionals: ["recipe", "fetch"],
  };
  await recipeCatalogCommand(invocation, fetcher, (text) => reports.push(text));
  assert.equal(await readFile(file, "utf8"), source);
  assert.equal(JSON.parse(reports[0]!).sha256, entry.sha256);
  assert.equal(urls.length, 3);
  await assert.rejects(
    recipeCatalogCommand(invocation, fetcher, () => {}),
    /EEXIST/,
  );
  assert.equal(await readFile(file, "utf8"), source);
  const listed: string[] = [];
  await recipeCatalogCommand(
    { values: {}, positionals: ["recipe", "list"] },
    fetcher,
    (text) => listed.push(text),
  );
  assert.match(listed.join(""), /fix-and-check/);
  const bundled = join(directory, "bundled.yaml");
  await recipeCatalogCommand(
    {
      values: { recipe: "review", file: bundled },
      positionals: ["recipe", "fetch"],
    },
    fetcher,
    () => {},
  );
  assert.match(await readFile(bundled, "utf8"), /name: review/);
});

test("catalogue integrity and source restrictions fail before writing a recipe", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-catalog-refused-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, "recipe.yaml");
  for (const modified of [
    { ...entry, sha256: "0".repeat(64) },
    { ...entry, source: "file:///etc/passwd" },
    { ...entry, version: "2.0.0" },
  ]) {
    const fetcher: typeof fetch = async (input) =>
      String(input).endsWith("catalog.json")
        ? Response.json({ version: 1, recipes: [modified] })
        : new Response(source);
    await assert.rejects(
      recipeCatalogCommand(
        {
          values: {
            catalog: "https://recipes.example/catalog.json",
            recipe: "review",
            file,
          },
          positionals: ["recipe", "fetch"],
        },
        fetcher,
        () => {},
      ),
    );
    await assert.rejects(access(file));
  }
  assert.throws(
    () => validateRecipeCatalog({ version: 1, recipes: [entry, entry] }),
    /duplicate/,
  );
  assert.throws(
    () =>
      validateRecipeCatalog({
        version: 1,
        recipes: [{ ...entry, sha256: "bad" }],
      }),
    /digest/,
  );
  await assert.rejects(
    downloadRecipeResource(new URL("http://recipes.example/a")),
    /HTTPS/,
  );
  await assert.rejects(
    downloadRecipeResource(new URL("https://user:secret@recipes.example/a")),
    /credentials/,
  );
  await assert.rejects(
    downloadRecipeResource(
      new URL("https://recipes.example/a"),
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "http://recipes.example/a" },
        }),
    ),
    /HTTPS/,
  );
  await assert.rejects(
    downloadRecipeResource(
      new URL("https://recipes.example/a"),
      async () => new Response("x".repeat(1_048_577)),
    ),
    /exceeds/,
  );
  await assert.rejects(
    downloadRecipeResource(
      new URL("https://recipes.example/a"),
      async () => new Response(null, { status: 404 }),
    ),
    /404/,
  );
});

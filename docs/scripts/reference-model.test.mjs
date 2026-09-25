import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";
import { groups } from "./api-groups.mjs";
import {
  referenceModel,
  referenceRank,
  referenceKind,
} from "./reference-model.mjs";
import { explain } from "./reference-explanations.mjs";

function model(source) {
  const file = ts.createSourceFile(
    "/reference.ts",
    source,
    ts.ScriptTarget.ESNext,
    true,
  );
  const host = ts.createCompilerHost({});
  const program = ts.createProgram(
    [file.fileName],
    {},
    {
      ...host,
      getSourceFile: (name) => (name === file.fileName ? file : undefined),
      fileExists: (name) => name === file.fileName,
    },
  );
  const checker = program.getTypeChecker();
  return (name) => {
    const declarations = file.statements.flatMap((node) =>
      ts.isVariableStatement(node)
        ? [...node.declarationList.declarations]
        : [node],
    );
    const declaration = declarations.find(
      (node) => node.name?.getText() === name,
    );
    const symbol = checker.getSymbolAtLocation(declaration.name);
    return {
      declaration,
      symbol,
      checker,
      ...referenceModel(symbol, declaration, checker),
    };
  };
}

test("union-only and inherited fields keep their declaring context", () => {
  const get = model(`
    interface Base { label: string; }
    interface Child extends Base { enabled?: boolean; }
    type Choice = { mode: "current" } | { mode: "named"; name: string };
    type Status = "done" | "failed";
    declare function configure(options: Child): void;
  `);
  assert.deepEqual(
    get("Child").entries.map(({ name, owner }) => [name, owner]),
    [
      ["enabled", "Child.enabled"],
      ["label", "Base.label"],
    ],
  );
  assert.deepEqual(
    get("Choice").entries.map(({ name }) => name),
    ["mode", "name"],
  );
  assert.equal(get("Status").entries.length, 0);
  assert.equal(
    get("Choice").entries.find(({ name }) => name === "name").conditional,
    true,
  );
  assert.equal(
    get("configure").entries.find(({ name }) => name === "options.label").owner,
    "Base.label",
  );
});

test("a new property cannot borrow a description just because its name matches", () => {
  const { symbol, declaration, checker } = model(
    "interface NewContract { usage: number; }",
  )("NewContract");
  assert.throws(
    () => explain(symbol, declaration, undefined, 0, checker),
    /Missing bilingual reference description: NewContract.usage/,
  );
});

test("functions precede other types and interfaces", () => {
  const get = model(
    'interface Options { name: string; } type Status = "ready"; declare function run(): void;',
  );
  assert.deepEqual(
    ["run", "Status", "Options"].map((name) => {
      const { declaration, checker, symbol } = get(name);
      return referenceRank(declaration, checker, symbol);
    }),
    [0, 1, 2],
  );
});

const content = new URL("../src/content/docs/", import.meta.url);
const page = (name) => readFile(new URL(name, content), "utf8");
const navigation = JSON.parse(
  await readFile(
    new URL("../reference-content/navigation.json", import.meta.url),
    "utf8",
  ),
);

test("every navigable reference is unique, ordered and free of generic boilerplate", async () => {
  const paths = navigation.flatMap((group) =>
    group.items
      .filter((item) => item.attrs?.["data-api-kind"])
      .map((item) => item.slug),
  );
  assert.equal(
    paths.length,
    groups.reduce((count, group) => count + group.names.split(" ").length, 0),
  );
  assert.equal(new Set(paths).size, paths.length);
  for (const locale of ["", "fr/"]) {
    const purposes = new Set();
    for (const group of navigation) {
      let previous = -1;
      for (const { slug: route, attrs } of group.items.slice(1)) {
        const source = await page(`${locale}${route}.md`);
        const rank = Number(source.match(/order: (\d+)/)[1]);
        assert.ok(rank >= previous, `Incorrect order: ${route}`);
        previous = rank;
        const declarationKind = [
          ["interface", /export interface /],
          ["type", /export type /],
          ["class", /export declare class /],
        ].find(([, pattern]) => pattern.test(source))?.[0];
        assert.equal(
          attrs?.["data-api-kind"],
          declarationKind ?? (rank === 0 ? "function" : "constant"),
        );
        assert.doesNotMatch(
          source,
          /Public contract for|Contrat public de|See the linked contract|Consultez le contrat lié/,
        );
        const purpose = source.match(
          /## (?:Purpose and behavior|Rôle et comportement)\n\n([^\n]+)/,
        )?.[1];
        if (rank === 20) {
          assert.equal(purpose, undefined, route);
          assert.deepEqual(
            [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
            locale
              ? [
                  "Import",
                  "Paramètres et propriétés",
                  "Signature",
                  ...(source.includes("## Contrats associés")
                    ? ["Contrats associés"]
                    : []),
                ]
              : [
                  "Import",
                  "Parameters and properties",
                  "Signature",
                  ...(source.includes("## Related contracts")
                    ? ["Related contracts"]
                    : []),
                ],
          );
        }
        if (purpose) {
          assert.ok(!purposes.has(purpose), `Repeated behavior: ${route}`);
          purposes.add(purpose);
        }
      }
    }
  }
});

test("task and workflow functions keep separate pages from their interfaces", async () => {
  for (const name of ["task", "workflow"]) {
    const callable = await page(`reference/${name}.md`);
    const contract = await page(`reference/type-${name}.md`);
    assert.match(callable, new RegExp(`export declare function ${name}`));
    assert.match(contract, /export interface/);
    assert.ok(callable.includes(`../type-${name}/`));
  }
  assert.match(
    await page("fr/reference/isolatedtask.md"),
    /allouer et fermer sa propre sandbox/,
  );
  assert.match(await page("fr/reference/task.md"), /n’alloue aucune sandbox/);
});

test("identical field names describe the actual contract", async () => {
  assert.match(
    await page("fr/reference/containeroptions.md"),
    /Réétiquetage SELinux/,
  );
  assert.match(
    await page("fr/reference/support-storageinventory.md"),
    /Octets de stockage observés/,
  );
  assert.match(
    await page("fr/reference/recoverypruneresult.md"),
    /Nouveau plan de rétention calculé après nettoyage/,
  );
  assert.match(await page("fr/reference/branchpolicy.md"), /\| `name`/);
  assert.match(await page("fr/reference/agentevent.md"), /\| `tokens`/);
});

test("icons distinguish callable values from callable type aliases", () => {
  const get = model(`
    interface Options { enabled: boolean; }
    type Handler = () => void;
    declare class Failure {}
    declare function run(): void;
    declare const factory: () => void;
    declare const versions: { agent: string };
  `);
  for (const [name, kind] of [
    ["Options", "interface"],
    ["Handler", "type"],
    ["Failure", "class"],
    ["run", "function"],
    ["factory", "function"],
    ["versions", "constant"],
  ]) {
    const { declaration, checker, symbol } = get(name);
    assert.equal(referenceKind(declaration, checker, symbol), kind);
  }
});

test("every family starts with its own bilingual conceptual overview", async () => {
  assert.equal(navigation.length, groups.length);
  assert.equal(new Set(groups.map((group) => group.id)).size, groups.length);
  for (const [index, group] of groups.entries()) {
    const route = `reference/overview/${group.id}`;
    assert.equal(navigation[index].items[0].slug, route);
    for (const locale of ["", "fr/"]) {
      const source = await page(`${locale}${route}.md`);
      assert.ok(source.includes(`../../../${group.guide}/`), route);
      assert.ok(
        source.includes(locale ? "label: Vue d’ensemble" : "label: Overview"),
        route,
      );
      assert.equal([...source.matchAll(/^## /gm)].length, 3, route);
    }
  }
});

test("Firecracker is classified only under Providers and marked experimental", () => {
  const providers = navigation.find((group) => group.title[0] === "Providers");
  assert.ok(providers);
  assert.ok(!navigation.some((group) => /Firecracker/.test(group.title[0])));
  const all = navigation.flatMap((group) => group.items);
  for (const name of ["firecracker", "firecrackeroptions"]) {
    const route = `reference/${name}`;
    const entries = all.filter((item) => item.slug === route);
    assert.equal(entries.length, 1);
    assert.ok(providers.items.includes(entries[0]));
    assert.equal(entries[0].attrs["data-api-status"], "experimental");
  }
});

test("experimental references explain their status before the API content in both languages", async () => {
  const experimental = navigation
    .flatMap((group) => group.items)
    .filter((item) => item.attrs?.["data-api-status"] === "experimental");
  assert.ok(experimental.length > 0);
  for (const item of experimental) {
    for (const [locale, label] of [
      ["", "Experimental"],
      ["fr/", "Expérimental"],
    ]) {
      const source = await page(`${locale}${item.slug}.md`);
      const body = source.replace(/^---\n[\s\S]*?\n---\n/, "").trimStart();
      assert.ok(body.startsWith(`:::caution[${label}]`), item.slug);
      const end = body.indexOf("\n:::");
      assert.ok(end > body.indexOf("\n") + 1, item.slug);
      assert.ok(end < body.indexOf("## Import"), item.slug);
    }
  }
  const stable = await page("reference/codex.md");
  assert.ok(!stable.includes(":::caution[Experimental]"));
});

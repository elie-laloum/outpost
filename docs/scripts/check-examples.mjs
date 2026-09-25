import ts from "typescript";
import assert from "node:assert/strict";
import {
  mkdir,
  writeFile,
  readFile,
  mkdtemp,
  rm,
  readdir,
  symlink,
} from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { root, contentRoot, scenarios } from "./example-scenarios.mjs";

const directory = resolve(root, "docs/.examples");
await mkdir(directory, { recursive: true });
await mkdir(resolve(directory, "node_modules/@elie-laloum"), {
  recursive: true,
});
await symlink(
  root,
  resolve(directory, "node_modules/@elie-laloum/outpost"),
  "junction",
).catch((error) => {
  if (error.code !== "EEXIST") throw error;
});
const assembled = [];
const roots = [];
for (const scenario of await scenarios()) {
  const workspace = await mkdtemp(resolve(directory, "scenario-"));
  for (const [name, content] of scenario.files) {
    const path = resolve(workspace, name);
    await writeFile(path, content);
    if (name.endsWith(".mts")) roots.push(path);
  }
  assembled.push({ ...scenario, workspace });
}
// Reference fragments are checked separately from complete, executable scenarios.
for (const name of await readdir(contentRoot, { recursive: true })) {
  if (!name.endsWith(".md")) continue;
  const source = await readFile(resolve(contentRoot, name), "utf8");
  if (
    source.includes("<!-- scenario:") ||
    /^(fr\/)?reference\/(?!behavior\/|manual\/)/.test(
      name.replaceAll("\\", "/"),
    )
  )
    continue;
  let index = 0;
  for (const match of source.matchAll(/^```ts[^\n]*\n([\s\S]*?)^```/gm)) {
    const path = resolve(
      directory,
      `${name.replaceAll(/[\\/]/g, "-")}-${index++}.mts`,
    );
    await writeFile(path, `${match[1]}\nexport {};\n`);
    roots.push(path);
  }
}
const program = ts.createProgram(roots, {
  target: ts.ScriptTarget.ES2023,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  strict: true,
  exactOptionalPropertyTypes: true,
  skipLibCheck: true,
  allowImportingTsExtensions: true,
  types: ["node"],
  typeRoots: [resolve(root, "node_modules/@types")],
  paths: {
    "@elie-laloum/outpost": [resolve(root, "src/index.ts")],
    "@elie-laloum/outpost/providers/*": [resolve(root, "src/providers/*.ts")],
    "@elie-laloum/outpost/opentelemetry": [
      resolve(root, "src/infrastructure/opentelemetry.ts"),
    ],
  },
});
let executed = 0;
try {
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (name) => name,
        getNewLine: () => "\n",
      }),
    );
  for (const scenario of assembled) {
    if (scenario.mode !== "offline") continue;
    const result = execFileSync(process.execPath, ["example.mts"], {
      cwd: scenario.workspace,
      timeout: 30_000,
      encoding: "utf8",
      stdio: "pipe",
    });
    assert.ok(result.trim(), `Expected observable output: ${scenario.name}`);
    if (
      scenario.name.includes("approvals") ||
      scenario.name.includes("human-approval")
    ) {
      const rejected = execFileSync(
        process.execPath,
        ["example.mts", "reject"],
        {
          cwd: scenario.workspace,
          timeout: 30_000,
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      assert.match(rejected, /failed/, scenario.name);
    }
    executed++;
  }
  const authentication = assembled.find((item) =>
    item.files.has("runtime.mts"),
  );
  assert.ok(authentication, "Agent examples must supply their configuration");
  await writeFile(
    resolve(authentication.workspace, "auth-check.mts"),
    `
import assert from "node:assert/strict";
import { configuration, variables } from "./runtime.mts";
const config = await configuration();
assert.equal(config.agent.name, process.argv[2]);
assert.equal(variables.UNDECLARED_SECRET, undefined);
console.log(config.agent.name);
`,
  );
  const seed = resolve(authentication.workspace, "seed");
  await mkdir(seed);
  await writeFile(resolve(seed, "auth.json"), JSON.stringify({ demo: true }));
  const authCases = [
    ["codex", "api-key", "OPENAI_API_KEY=fixture", true],
    ["codex", "login", "", true],
    ["claude", "api-key", "ANTHROPIC_API_KEY=fixture", true],
    ["claude", "oauth-token", "CLAUDE_CODE_OAUTH_TOKEN=fixture", true],
    ["gemini", "api-key", "GEMINI_API_KEY=fixture", true],
    ["codex", "api-key", "", false],
    ["codex", "login", "OPENAI_API_KEY=fixture", false],
    [
      "claude",
      "api-key",
      "ANTHROPIC_API_KEY=fixture\nCLAUDE_CODE_OAUTH_TOKEN=fixture",
      false,
    ],
    ["claude", "login", "ANTHROPIC_API_KEY=fixture", false],
    ["gemini", "login", "GEMINI_API_KEY=fixture", false],
  ];
  for (const [agent, method, declarations, succeeds] of authCases) {
    await writeFile(
      resolve(authentication.workspace, ".env"),
      `OUTPOST_AGENT=${agent}\nOUTPOST_AUTH=${method}\n${declarations}\n`,
    );
    const result = spawnSync(process.execPath, ["auth-check.mts", agent], {
      cwd: authentication.workspace,
      env: {
        PATH: process.env.PATH,
        CODEX_HOME: seed,
        UNDECLARED_SECRET: "not-forwarded",
      },
      encoding: "utf8",
      timeout: 10_000,
    });
    assert.equal(
      result.status === 0,
      succeeds,
      `${agent}/${method}: ${result.stderr}`,
    );
  }
  const preparation = assembled.find((item) => item.files.has("prepare.mjs"));
  assert.ok(preparation, "A complete demonstration preparation is required");
  execFileSync(process.execPath, ["prepare.mjs"], {
    cwd: preparation.workspace,
    stdio: "pipe",
  });
  const test = spawnSync(process.execPath, ["--test", "text.test.ts"], {
    cwd: resolve(preparation.workspace, "repository"),
    encoding: "utf8",
  });
  assert.equal(test.status, 1, "The initial whitespace regression must fail");
  assert.match(test.stdout, /extra whitespace/);
  assert.equal(
    execFileSync("git", ["status", "--porcelain"], {
      cwd: resolve(preparation.workspace, "repository"),
      encoding: "utf8",
    }),
    "",
  );
  const duplicate = spawnSync(process.execPath, ["prepare.mjs"], {
    cwd: preparation.workspace,
    encoding: "utf8",
  });
  assert.notEqual(
    duplicate.status,
    0,
    "Preparation must refuse existing repositories",
  );
} finally {
  for (const scenario of assembled)
    await rm(scenario.workspace, { recursive: true, force: true });
}
console.log(
  `${roots.length} TypeScript files checked; ${executed} complete bilingual scenarios executed; demonstration preparation verified.`,
);

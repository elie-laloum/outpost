import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { test } from "node:test";
import { chromium, type Page } from "playwright-core";
import { parse } from "yaml";

const configuration = `version: 3
workspace: { kind: ephemeral }
sandbox: { provider: local }
transports:
  state: { type: local, directory: ./state }
stores:
  state: { type: transport, transporter: { $ref: transports.state } }
`;

interface Editor {
  readonly page: Page;
  readonly project: string;
  readonly errors: readonly string[];
}

async function openEditor(
  t: { after(run: () => Promise<void>): void },
  recipe: string,
): Promise<Editor> {
  assert.ok(
    existsSync(resolve("dist/editor/index.html")),
    "Build the editor first with bun run build",
  );
  const project = await mkdtemp(join(tmpdir(), "outpost-editor-browser-"));
  await writeFile(join(project, "recipe.yaml"), recipe);
  await writeFile(join(project, "outpost.yaml"), configuration);
  const child = spawn(
    process.execPath,
    [
      resolve("src/cli/main.ts"),
      ...["recipe", "editor", "--directory", project],
      ...["--file", join(project, "recipe.yaml")],
      ...["--config", join(project, "outpost.yaml"), "--no-open", "--json"],
    ],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const exited = once(child, "exit");
  const browser = await chromium.launch();
  // One reversed scope: the browser closes before the editor, which stops before its directory goes.
  t.after(async () => {
    await browser.close();
    child.kill("SIGINT");
    await exited;
    await rm(project, { recursive: true, force: true });
  });
  const [line] = (await once(
    createInterface({ input: child.stdout }),
    "line",
  )) as [string];
  const { url } = JSON.parse(line) as { url: string };
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url);
  await page.locator(".react-flow__node").first().waitFor();
  return { page, project, errors };
}

async function waitForFile(
  path: string,
  ready: (text: string) => boolean,
): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const text = await readFile(path, "utf8").catch(() => "");
    if (ready(text)) return text;
    await new Promise((settle) => setTimeout(settle, 100));
  }
  assert.fail(`${path} was not saved`);
}

test(
  "a task added on the canvas is saved after its dependency with the recipe comments",
  { timeout: 120_000 },
  async (t) => {
    const { page, project, errors } = await openEditor(
      t,
      `version: 3
name: edited
# Build before anything else.
tasks:
  - key: build # compile
    command:
      executable: node
      arguments: [--version]
`,
    );
    const build = page.locator(".react-flow__node", { hasText: "build" });
    const box = await build.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // Inside its sandbox zone, so the move only changes the layout.
    await page.mouse.move(
      box.x + box.width / 2 + 60,
      box.y + box.height / 2 + 40,
      {
        steps: 8,
      },
    );
    await page.mouse.up();
    await build.click();
    await page
      .getByRole("complementary", { name: "Palette" })
      .getByRole("button", { name: "Command", exact: true })
      .click();
    await page.locator(".react-flow__node", { hasText: "command" }).waitFor();
    await page.keyboard.press("Control+s");

    const saved = await waitForFile(join(project, "recipe.yaml"), (text) =>
      text.includes("key: command"),
    );
    const layout = await waitForFile(
      join(project, "recipe.editor.json"),
      (text) => text.includes('"task:build"'),
    );
    assert.match(saved, /^# Build before anything else\.$/m);
    assert.match(saved, /- key: build # compile$/m);
    const document = parse(saved) as {
      tasks: { key: string; after?: string[] }[];
    };
    assert.deepEqual(
      document.tasks.map((task) => [task.key, task.after]),
      [
        ["build", undefined],
        ["command", ["build"]],
      ],
    );
    const { nodes } = JSON.parse(layout) as {
      nodes: Record<string, { x: number; y: number }>;
    };
    assert.ok(
      nodes["task:build"] && nodes["task:build"].x > 0,
      "the moved node keeps its place",
    );
    assert.deepEqual(errors, []);
  },
);

test(
  "a durable run pauses at its gate, resumes on approval and marks every task done",
  { timeout: 120_000 },
  async (t) => {
    const { page, project, errors } = await openEditor(
      t,
      `version: 3
name: gated
workflow:
  checkpoint:
    store: { $ref: stores.state }
    runId: gated
    version: "1"
tasks:
  - key: build
    command:
      executable: node
      arguments: [-e, "console.log('building')"]
  - key: approve
    after: [build]
    gate: { kind: approval, prompt: Ship it?, actors: [owner] }
  - key: ship
    after: [approve]
    value: shipped
`,
    );
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Run" }).click();
    await page
      .getByRole("log", { name: "Run events" })
      .getByText("building")
      .waitFor({ timeout: 30_000 });
    await page.getByText("Waiting for you").waitFor({ timeout: 30_000 });
    await page.getByLabel("Reason").fill("Checked in the editor");
    await page.getByRole("button", { name: "Approve" }).click();

    const statuses = page.getByRole("region", { name: "Task statuses" });
    for (const key of ["build", "approve", "ship"])
      await statuses
        .locator("span", { hasText: key })
        .filter({ hasText: "done" })
        .first()
        .waitFor({ timeout: 30_000 });
    await page.getByRole("tab", { name: "Canvas" }).click();
    const nodes = page.locator('.react-flow__node [data-testid^="task-"]');
    await nodes.first().waitFor();
    assert.deepEqual(
      (await nodes.allInnerTexts()).map((text) => text.includes("done")),
      [true, true, true],
    );
    assert.equal(
      await readFile(join(project, ".outpost/editor/.gitignore"), "utf8"),
      "*\n",
    );
    assert.deepEqual(errors, []);
  },
);

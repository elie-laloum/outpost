import {
  access,
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { OutpostError, invariant } from "../domain/errors.ts";
import { imageName } from "../providers/container.ts";
import { requireSuccess, type Executor } from "../infrastructure/process.ts";

export type Template = "blank" | "iterate" | "review" | "plan" | "plan-review";
export interface InitOptions {
  readonly directory?: string;
  readonly agent?: "claude" | "codex";
  readonly provider?: "docker" | "podman" | "vercel" | "daytona" | "local";
  readonly template?: Template;
  readonly tracker?: "github" | "beads" | "custom";
  readonly manager?: "npm" | "pnpm" | "yarn" | "bun";
  readonly model?: string;
  readonly install?: boolean;
  readonly label?: string;
  readonly build?: boolean;
  readonly image?: string;
}

export const imageRecipe = `FROM node:24-bookworm-slim
ARG AGENT_UID=1000
ARG AGENT_GID=1000
RUN apt-get update && apt-get install -y --no-install-recommends git openssh-client ca-certificates curl procps util-linux python3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g @openai/codex @anthropic-ai/claude-code
RUN groupmod -o -g "$AGENT_GID" node && usermod -o -u "$AGENT_UID" -g "$AGENT_GID" node
ENV HOME=/home/agent
USER $AGENT_UID:$AGENT_GID
WORKDIR /workspace
`;

function starter(options: InitOptions, extension: string): string {
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  const importLine = `import { dispatch, createSandbox, task, workflow, response, ${agent} } from "@elie-laloum/outpost";\nimport { ${provider} } from "@elie-laloum/outpost/providers/${provider}";\n`;
  const config = `const runtime = { agent: ${agent}(${options.model ? `{ model: ${JSON.stringify(options.model)} }` : ""}), provider: ${provider}(${options.image && (provider === "docker" || provider === "podman") ? `{ image: ${JSON.stringify(options.image)} }` : ""}) };\n`;
  const brief = `{ file: ".outpost/brief.md", values: { OBJECTIVE: process.argv.slice(2).join(" ") || "Inspect this repository and implement one useful improvement." } }`;
  if (template === "blank" || template === "iterate")
    return `${importLine}\n${config}\nconst result = await dispatch({ ...runtime, branch: { mode: "integrate" }, brief: ${brief}, passes: ${template === "iterate" ? 10 : 1} });\nconsole.log({ branch: result.branch, commits: result.commits, conversation: result.conversation });\n`;
  if (template === "review")
    return `${importLine}\n${config}\nawait using sandbox = await createSandbox({ ...runtime, branch: { mode: "integrate" } });\nconst implement = task({ key: "implement", perform: ({ signal }) => sandbox.dispatch({ brief: ${brief}, signal }) });\nconst review = task({ key: "review", after: [implement], perform: ({ signal }) => sandbox.dispatch({ brief: { text: "Review the changes, fix concrete defects, run tests and commit the result." }, signal }) });\n(await workflow("implementation-review", [implement, review]).start()).unwrap();\nawait sandbox.workspace.integrate?.();\n`;
  return `${importLine}\n${config}\nconst approaches = ["correctness", "maintainability", "testability"].map((perspective, index) => task({\n  key: perspective,\n  perform: ({ signal }) => dispatch({ ...runtime, branch: { mode: "named", name: \`outpost/plan-\${index}-\${Date.now()}\` }, brief: { text: \`Analyze this repository from the \${perspective} perspective. Do not change files. Return your proposal inside <proposal> tags.\` }, response: response.text({ tag: "proposal" }), signal }),\n}));\nconst implement = task({ key: "implement", after: approaches, perform: context => dispatch({ ...runtime, branch: { mode: "integrate" }, brief: { text: "Implement a coherent improvement from these proposals, test and commit it:\\n" + approaches.map(item => context.value(item).value).join("\\n") }, signal: context.signal }) });\n${template === "plan-review" ? 'const review = task({ key: "review", after: [implement], perform: context => dispatch({ ...runtime, branch: { mode: "integrate" }, brief: { text: "Review the latest changes, fix concrete defects, test and commit." }, signal: context.signal }) });\n' : ""}(await workflow("parallel-planning", [...approaches, implement${template === "plan-review" ? ", review" : ""}]).start({ concurrency: 3 })).unwrap();\n`;
}

function tracker(kind: NonNullable<InitOptions["tracker"]>): string {
  if (kind === "custom")
    return `export interface Ticket { id: string; title: string; body: string }\nexport async function tickets(): Promise<Ticket[]> {\n  const url = process.env.OUTPOST_TRACKER_URL;\n  if (!url) throw new Error("Set OUTPOST_TRACKER_URL");\n  const response = await fetch(url);\n  if (!response.ok) throw new Error(\`Tracker returned \${response.status}\`);\n  return await response.json() as Ticket[];\n}\n`;
  const program = kind === "github" ? "gh" : "bd",
    args =
      kind === "github"
        ? '["issue", "list", "--state", "open", "--json", "number,title,body"]'
        : '["ready", "--json"]';
  return `import { execFile } from "node:child_process";\nimport { promisify } from "node:util";\nexport async function tickets() {\n  const { stdout } = await promisify(execFile)(${JSON.stringify(program)}, ${args});\n  return JSON.parse(stdout) as { ${kind === "github" ? "number: number" : "id: string"}; title: string; body?: string }[];\n}\n`;
}

export async function initialize(
  options: InitOptions = {},
  executor?: Executor,
): Promise<{ files: readonly string[]; run: string }> {
  const root = resolve(options.directory ?? process.cwd()),
    folder = join(root, ".outpost");
  const agent = options.agent ?? "codex",
    provider = options.provider ?? "docker",
    template = options.template ?? "blank";
  invariant(["codex", "claude"].includes(agent), "Choose codex or claude");
  invariant(
    ["docker", "podman", "vercel", "daytona", "local"].includes(provider),
    "Unknown sandbox provider",
  );
  invariant(
    ["blank", "iterate", "review", "plan", "plan-review"].includes(template),
    "Unknown starter template",
  );
  if (options.tracker)
    invariant(
      ["github", "beads", "custom"].includes(options.tracker),
      "Unknown tracker",
    );
  let pkg: { type?: string; packageManager?: string } = {};
  try {
    pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code !== "ENOENT") throw cause;
  }
  const extension = pkg.type === "module" ? "ts" : "mts";
  let detected = pkg.packageManager?.split("@")[0];
  if (!detected)
    for (const [file, manager] of [
      ["pnpm-lock.yaml", "pnpm"],
      ["yarn.lock", "yarn"],
      ["bun.lock", "bun"],
      ["bun.lockb", "bun"],
    ]) {
      if (
        await access(join(root, file!))
          .then(() => true)
          .catch(() => false)
      ) {
        detected = manager;
        break;
      }
    }
  const manager = options.manager ?? detected ?? "npm";
  invariant(
    ["npm", "pnpm", "yarn", "bun"].includes(manager),
    "Unknown package manager",
  );
  const files: Record<string, string> = {
    [`run.${extension}`]: starter(options, extension),
    "brief.md":
      "Objective: {{OBJECTIVE}}\n\nWork on {{WORK_BRANCH}} from {{BASE_BRANCH}}. Inspect the repository, implement the objective, run relevant tests and commit your changes. When finished, write <outpost>done</outpost>.\n",
    ".env.example":
      agent === "codex" ? "OPENAI_API_KEY=\n" : "ANTHROPIC_API_KEY=\n",
    ".gitignore": ".env\nworkspaces/\nlocks/\nrecovery/\nlogs/\n",
  };
  if (provider === "docker" || provider === "podman")
    files[provider === "docker" ? "Dockerfile" : "Containerfile"] = imageRecipe;
  if (options.tracker) files[`tickets.${extension}`] = tracker(options.tracker);
  for (const name of Object.keys(files))
    if (
      await access(join(folder, name))
        .then(() => true)
        .catch(() => false)
    )
      throw new OutpostError(
        "configuration",
        `Initialization would overwrite .outpost/${name}`,
      );
  await mkdir(folder, { recursive: true });
  for (const [name, content] of Object.entries(files))
    await writeFile(join(folder, name), content, { flag: "wx" });
  if (options.install) {
    const packages = [
      "@elie-laloum/outpost",
      ...(provider === "vercel"
        ? ["@vercel/sandbox"]
        : provider === "daytona"
          ? ["@daytona/sdk"]
          : []),
    ];
    const args =
      manager === "npm"
        ? ["install", "--save-dev", ...packages]
        : ["add", "--dev", ...packages];
    await requireSuccess(
      process.platform === "win32"
        ? {
            executable: "cmd.exe",
            arguments: ["/d", "/c", [manager, ...args].join(" ")],
            directory: root,
          }
        : { executable: manager, arguments: args, directory: root },
      executor,
    );
  }
  if (options.label) {
    invariant(
      options.tracker === "github",
      "Labels require the GitHub tracker",
    );
    await requireSuccess(
      {
        executable: "gh",
        arguments: [
          "label",
          "create",
          options.label,
          "--color",
          "4969ED",
          "--description",
          "Ready for Outpost",
          "--force",
        ],
        directory: root,
      },
      executor,
    );
  }
  if (options.build && (provider === "docker" || provider === "podman"))
    await manageImage(
      "build",
      {
        directory: root,
        engine: provider,
        ...(options.image ? { image: options.image } : {}),
      },
      executor,
    );
  return {
    files: Object.keys(files).map((name) => join(folder, name)),
    run: `node .outpost/run.${extension}`,
  };
}

export async function manageImage(
  action: "build" | "remove",
  options: {
    directory?: string;
    engine?: "docker" | "podman";
    image?: string;
    file?: string;
    uid?: number;
    gid?: number;
  } = {},
  executor?: Executor,
): Promise<string> {
  const root = resolve(options.directory ?? process.cwd()),
    engine = options.engine ?? "docker",
    image = options.image ?? imageName(root);
  invariant(
    engine === "docker" || engine === "podman",
    "Image engine must be docker or podman",
  );
  const uid = options.uid ?? process.getuid?.() ?? 1000,
    gid = options.gid ?? process.getgid?.() ?? 1000;
  invariant(
    Number.isSafeInteger(uid) &&
      uid >= 0 &&
      Number.isSafeInteger(gid) &&
      gid >= 0,
    "UID and GID must be nonnegative integers",
  );
  const args =
    action === "remove"
      ? ["image", "rm", image]
      : [
          "build",
          "--tag",
          image,
          "--file",
          resolve(
            root,
            options.file ??
              `.outpost/${engine === "docker" ? "Dockerfile" : "Containerfile"}`,
          ),
          "--build-arg",
          `AGENT_UID=${uid}`,
          "--build-arg",
          `AGENT_GID=${gid}`,
          root,
        ];
  await requireSuccess(
    {
      executable: engine,
      arguments: args,
      directory: root,
      deadlineMs: 1_800_000,
      observe(channel, text) {
        (channel === "stdout" ? process.stdout : process.stderr).write(text);
      },
    },
    executor,
  );
  return image;
}

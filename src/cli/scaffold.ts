import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { OutpostError, invariant } from "../domain/errors.ts";
import { imageName } from "../providers/container.ts";
import { agentVersions } from "../providers/versions.ts";
import { requireSuccess, type Executor } from "../infrastructure/process.ts";

import { starter, tracker } from "./starters.ts";

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
RUN apt-get update && apt-get install -y --no-install-recommends git gh openssh-client ca-certificates curl procps util-linux python3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g --allow-scripts=@anthropic-ai/claude-code @openai/codex@${agentVersions.codex} @anthropic-ai/claude-code@${agentVersions.claude}
RUN groupmod -o -g "$AGENT_GID" node && usermod -o -u "$AGENT_UID" -g "$AGENT_GID" node
ENV HOME=/home/agent
USER $AGENT_UID:$AGENT_GID
WORKDIR /workspace
`;

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
    if (!pkg || typeof pkg !== "object") pkg = {};
  } catch (cause) {
    if (
      !(cause instanceof SyntaxError) &&
      (cause as NodeJS.ErrnoException).code !== "ENOENT"
    )
      throw cause;
  }
  const extension = pkg.type === "module" ? "ts" : "mts";
  let detected =
    typeof pkg.packageManager === "string"
      ? pkg.packageManager.split("@")[0]
      : undefined;
  if (!detected || !["npm", "pnpm", "yarn", "bun"].includes(detected)) {
    detected = undefined;
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
      (agent === "codex" ? "OPENAI_API_KEY=\n" : "ANTHROPIC_API_KEY=\n") +
      (options.tracker === "github" ? "GH_TOKEN=\n" : ""),
    ".gitignore": ".env\nworkspaces/\nlocks/\nrecovery/\nlogs/\n",
  };
  if (provider === "docker" || provider === "podman")
    files[provider === "docker" ? "Dockerfile" : "Containerfile"] =
      options.tracker === "beads"
        ? imageRecipe.replace(
            "RUN groupmod",
            "RUN npm install -g --allow-scripts=@beads/bd @beads/bd@1.2.2\nRUN groupmod",
          )
        : imageRecipe;
  if (template !== "blank")
    files["STANDARDS.md"] =
      "# Engineering standards\n\nKeep domain rules separate from infrastructure. Test observable behavior, handle failure and cancellation, and preserve existing user changes. Run the repository checks before committing. Prefer clear names to comments; keep necessary comments at most two lines. Review the complete diff against the supplied base commit.\n";
  if (options.tracker)
    files[`tickets.${extension}`] = tracker(options.tracker, options.label);
  if (options.tracker === "custom")
    files["TRACKER.md"] =
      `# Custom issue tracker\n\nSet OUTPOST_TRACKER_URL in the host environment before running the starter. Implement GET issues?state=open (Issue[]), GET issues/:id (Issue), and POST issues/:id/close (any successful status). Issue has id, title, optional body and optional blockedBy ids. The generated tickets.${extension} is yours to adapt: add authentication, pagination and filtering for your tracker there. Never commit credentials.\n\nThe campaign reloads the backlog each cycle, reads an issue before implementation, and closes it only after its commits reach the host branch. Configure authentication in tickets.${extension}. A failed close is reported and must be reconciled before rerunning.\n`;
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

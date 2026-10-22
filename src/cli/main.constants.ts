import { builtInAgentList } from "../adapters/agents/catalog.ts";
import { officialImageNames } from "./image-recipes.ts";
export const cliOptions = {
  interactive: {
    type: "boolean",
    description:
      "Answer recipe questions and review unsigned gates in the terminal (automatic on a TTY without --json)",
    negation: "Leave dialogue questions pending without prompting",
  },
  extensions: {
    type: "boolean",
    description:
      "Also import declared extensions and check their exports; this runs their module code",
  },
  open: {
    type: "boolean",
    description: "Open the editor in the default browser (default)",
    negation: "Only print the editor URL",
  },
  port: {
    type: "string",
    description: "Loopback port for the editor (default: a free port)",
  },
  actor: {
    type: "string",
    description:
      "Trusted local actor submitting dialogue answers; defaults to the sole declared actor",
  },
  service: { type: "string", description: "Named service to start explicitly" },
  queue: { type: "string", description: "Named queue receiving a recipe job" },
  handler: {
    type: "string",
    description: "Trusted worker handler registered for the job",
  },
  "job-id": {
    type: "string",
    description:
      "Deterministic queue job ID; defaults to recipe:<handler>:<run-id>",
  },
  "idempotency-key": {
    type: "string",
    description: "Stable effect key retained when publishing a new job ID",
  },
  timeout: {
    type: "string",
    description:
      "Per-check doctor timeout in milliseconds (1–60000; default 5000 on host, 15000 in image)",
  },
  deadline: {
    type: "string",
    description: "Absolute queue deadline as epoch milliseconds",
  },
  "run-id": {
    type: "string",
    description: "Durable recipe execution identifier",
  },
  "retry-incomplete": {
    type: "boolean",
    description: "Explicitly authorize replay of interrupted tasks",
  },
  "workspace-recovery": {
    type: "string",
    description:
      "JSON file mapping shared or task names to inspected workspace recovery revisions and stopped-process authorization",
  },
  "recover-revision": {
    type: "string",
    description:
      "Explicitly recover a stopped checkpoint owner at this revision",
  },
  answer: {
    type: "string",
    description: "JSON file containing a WorkflowAnswer",
  },
  events: {
    type: "string",
    description:
      "Append redacted observation events to this file as JSON lines",
  },
  decision: {
    type: "string",
    description:
      "JSON file containing a WorkflowDecision, including any required proof",
  },
  catalog: {
    type: "string",
    description: "Local catalogue JSON or HTTPS catalogue URL",
  },
  recipe: {
    type: "string",
    description: "Recipe name in the selected catalogue",
  },
  input: {
    type: "strings",
    description: "Recipe input name=value; repeat for each parameter",
  },
  config: {
    type: "string",
    description:
      "Local YAML recipe configuration or TypeScript/JavaScript bindings module",
  },
  json: {
    type: "boolean",
    description: "Write a machine-readable JSON report",
  },
  git: { type: "boolean", description: "Inspect workspace Git state" },
  locks: { type: "boolean", description: "Inspect local lock ownership" },
  resources: {
    type: "boolean",
    description: "Inspect recorded sandbox activity",
  },
  restorability: {
    type: "boolean",
    description: "Check whether the retained transfer can be restored",
  },
  apply: { type: "boolean", description: "Apply changes (default: preview)" },
  policy: { type: "string", description: "Retention policy file" },
  checksums: { type: "boolean", description: "Verify retained file checksums" },
  "max-bytes": { type: "string", description: "Maximum bytes to inspect" },
  "max-entries": { type: "string", description: "Maximum inventory entries" },
  "runtime-directory": {
    type: "string",
    description: "Runtime control directory without repository discovery",
  },
  namespace: { type: "string", description: "Runtime namespace" },
  "workspace-id": { type: "string", description: "File workspace identity" },
  lock: {
    type: "string",
    description: "Inspected lock filename, including .json or .json.reclaim",
  },
  revision: {
    type: "string",
    description: "Inspected resource revision to recover explicitly",
  },
  "processes-stopped": {
    type: "boolean",
    description: "Confirm the workspace processes have been stopped",
  },
  "allocation-released": {
    type: "boolean",
    description:
      "Confirm an unknown sandbox allocation was released externally",
  },
  "adopt-files": {
    type: "boolean",
    description: "Explicitly adopt files from an interrupted attempt",
  },
  "adopt-source": {
    type: "boolean",
    description: "Explicitly adopt a changed mounted source",
  },
  "publication-id": { type: "string", description: "Publication identifier" },
  portable: {
    type: "boolean",
    description:
      "Explicitly restore a verified portable file snapshot into a new owned root",
  },
  "workspace-kind": {
    type: "string",
    description: "Workspace mode: git, directory or ephemeral",
  },
  agent: {
    type: "string",
    description: `Agent CLI to check: ${builtInAgentList()} (default codex)`,
  },
  provider: {
    type: "string",
    description:
      "Sandbox provider: docker, podman, local, vercel or daytona (default docker)",
  },
  directory: {
    type: "string",
    description: "Directory to read or write (default: current directory)",
  },
  path: {
    type: "string",
    description: "Retained transfer directory under .outpost/recovery",
  },
  repository: { type: "string", description: "Target Git repository" },
  destination: { type: "string", description: "New restoration directory" },
  side: { type: "string", description: "Transfer side: previous or incoming" },
  engine: {
    type: "string",
    description: "Container engine: docker or podman (default docker)",
  },
  file: { type: "string", description: "Recipe YAML path" },
  image: {
    type: "string",
    description: `Image: official name (${officialImageNames()}) or a local reference`,
  },
  tag: {
    type: "string",
    description: "Local image name to build, e.g. outpost-codex:dev",
  },
  force: {
    type: "boolean",
    description: "Replace previously ejected files",
  },
  uid: {
    type: "string",
    description: "Agent user ID baked into the image (default: your UID)",
  },
  gid: {
    type: "string",
    description: "Agent group ID baked into the image (default: your GID)",
  },
} as const;

const recipeFile = "--file recipe.yaml --config outpost.yaml";

/** Command groups shown by `outpost --help`, in display order. */
export const commandGroups = {
  doctor: {
    heading: "Get started:",
    description: "Check the host, container engine, image and agent CLI",
  },
  image: {
    heading: "Get started:",
    description:
      "List, pull, verify, eject and build the official agent images",
  },
  recipe: {
    heading: "Run workflows:",
    description: "Create, validate, run and resume YAML recipes",
  },
  recovery: {
    heading: "Repair and clean up:",
    description:
      "Inspect and explicitly recover interrupted state (rarely needed)",
  },
} as const;

export const subcommandGroups = {
  "recovery workspace": "Inspect or recover a file workspace",
  "recovery publication": "Inspect, finish or roll back a file publication",
  "recovery registry": "Inspect or release the host path-lock registry",
  "recovery transfer": "Verify or restore a retained synchronization transfer",
} as const;

const fileRecovery = [
  "runtime-directory",
  "namespace",
  "file",
  "config",
  "json",
] as const;

/** Every command, its options, help examples and hidden legacy aliases. */
export const commandOptions = {
  doctor: {
    description: "Diagnose host and sandbox prerequisites",
    options: [
      "provider",
      "agent",
      "image",
      "workspace-kind",
      "timeout",
      "json",
    ],
    examples: [
      "outpost doctor",
      "outpost doctor --agent claude --image claude",
      "outpost doctor --provider podman --image outpost-codex:dev --json",
    ],
  },
  "image list": {
    description: "List the official images and their published references",
    options: ["json"],
    examples: ["outpost image list"],
  },
  "image pull": {
    description:
      "Pull an official image at the reference pinned by this release",
    options: ["image", "engine", "json"],
    examples: [
      "outpost image pull --image codex",
      "outpost image pull --image harness --engine podman",
    ],
  },
  "image verify": {
    description:
      "Verify the signed build provenance of a published image (requires gh)",
    options: ["image", "json"],
    examples: [
      "outpost image verify --image codex",
      "outpost image verify --image ghcr.io/elie-laloum/outpost/codex@sha256:...",
    ],
  },
  "image eject": {
    description:
      "Write an official image recipe and its lockfiles so you can customize it",
    options: ["image", "directory", "engine", "force", "json"],
    examples: [
      "outpost image eject --image codex",
      "outpost image eject --image harness --directory images/harness --engine podman",
    ],
  },
  "image build": {
    description: "Build an ejected or custom recipe for your user ID",
    options: ["directory", "tag", "engine", "file", "uid", "gid", "json"],
    examples: [
      "outpost image build --tag outpost-codex:dev",
      "outpost image build --directory images/harness --tag outpost-harness:dev --engine podman",
    ],
  },
  "image remove": {
    description: "Remove a local image",
    options: ["image", "engine", "json"],
    examples: ["outpost image remove --image outpost-codex:dev"],
  },
  "recipe init": {
    description:
      "Create a recipe starter with editor schema support; never overwrite an existing file",
    options: ["file", "config", "workspace-kind", "json"],
    examples: [`outpost recipe init ${recipeFile}`],
  },
  "recipe editor": {
    description:
      "Edit recipes, configurations and extensions in a local web editor, and follow their runs",
    options: ["directory", "file", "config", "port", "open", "json"],
    examples: [
      "outpost recipe editor",
      `outpost recipe editor ${recipeFile} --no-open`,
    ],
  },
  "recipe plan": {
    description:
      "Inspect workspace, components and publications without allocation or resolving secrets",
    options: ["file", "config", "json"],
    examples: [`outpost recipe plan ${recipeFile}`],
  },
  "recipe validate": {
    description:
      "Validate a recipe and optional YAML configuration without allocating a sandbox",
    options: ["file", "config", "extensions", "json"],
    examples: [
      `outpost recipe validate ${recipeFile}`,
      `outpost recipe validate ${recipeFile} --extensions`,
    ],
  },
  "recipe run": {
    description:
      "Run a local YAML recipe with explicit sandbox and agent bindings",
    options: [
      "file",
      "config",
      "input",
      "run-id",
      "interactive",
      "actor",
      "events",
      "json",
    ],
    examples: [
      `outpost recipe run ${recipeFile}`,
      `outpost recipe run ${recipeFile} --input target=src --run-id nightly`,
    ],
  },
  "recipe status": {
    description: "Inspect a durable recipe without acquiring its checkpoint",
    options: ["file", "config", "run-id", "json"],
    examples: [`outpost recipe status ${recipeFile} --run-id nightly`],
  },
  "recipe resume": {
    description: "Resume an existing durable recipe",
    options: [
      "file",
      "config",
      "run-id",
      "input",
      "retry-incomplete",
      "recover-revision",
      "workspace-recovery",
      "interactive",
      "actor",
      "events",
      "json",
    ],
    examples: [`outpost recipe resume ${recipeFile} --run-id nightly`],
  },
  "recipe answer": {
    description: "Submit a persisted dialogue answer and resume its recipe",
    options: [
      "file",
      "config",
      "run-id",
      "answer",
      "interactive",
      "actor",
      "events",
      "json",
    ],
    examples: [
      `outpost recipe answer ${recipeFile} --run-id nightly --answer answer.json`,
    ],
  },
  "recipe decide": {
    description: "Submit a gate decision and resume its recipe",
    options: [
      "file",
      "config",
      "run-id",
      "decision",
      "interactive",
      "actor",
      "events",
      "json",
    ],
    examples: [
      `outpost recipe decide ${recipeFile} --run-id nightly --decision decision.json`,
    ],
  },
  "recipe list": {
    description: "List the bundled or selected recipe catalogue",
    options: ["catalog", "json"],
    examples: ["outpost recipe list"],
  },
  "recipe fetch": {
    description:
      "Download and validate a catalogue recipe without executing it",
    options: ["catalog", "recipe", "file", "json"],
    examples: ["outpost recipe fetch --recipe review --file review.yaml"],
  },
  "recipe enqueue": {
    description: "Publish one recipe job without executing its workflow",
    options: [
      "file",
      "config",
      "queue",
      "handler",
      "run-id",
      "job-id",
      "idempotency-key",
      "deadline",
      "input",
      "json",
    ],
    examples: [
      `outpost recipe enqueue ${recipeFile} --queue jobs --handler review`,
    ],
  },
  "recipe serve": {
    description: "Start only the selected local service until interrupted",
    options: ["file", "config", "service"],
    examples: [`outpost recipe serve ${recipeFile} --service worker`],
  },
  "recovery inspect": {
    description: "Inspect recovery inventory",
    options: [
      "repository",
      "runtime-directory",
      "max-entries",
      "git",
      "locks",
      "resources",
      "json",
    ],
    examples: ["outpost recovery inspect --git --locks"],
  },
  "recovery unlock": {
    description: "Inspect or explicitly recover a stopped local lock owner",
    options: [
      "directory",
      "lock",
      "revision",
      "processes-stopped",
      "apply",
      "json",
    ],
    examples: [
      "outpost recovery unlock --directory .outpost/locks --lock NAME.json",
    ],
  },
  "recovery transfer verify": {
    description: "Verify a retained transfer",
    options: [
      "path",
      "checksums",
      "max-bytes",
      "restorability",
      "repository",
      "json",
    ],
    aliases: ["recovery verify"],
    examples: [
      "outpost recovery transfer verify --path .outpost/recovery/ID --checksums",
    ],
  },
  "recovery transfer restore": {
    description: "Restore a retained transfer into a new directory",
    options: [
      "path",
      "repository",
      "destination",
      "side",
      "max-bytes",
      "apply",
      "json",
    ],
    aliases: ["recovery restore"],
    examples: [
      "outpost recovery transfer restore --path .outpost/recovery/ID --destination ../restored --side incoming",
    ],
  },
  "recovery prune": {
    description: "Apply an explicit retention policy (preview unless --apply)",
    options: ["policy", "repository", "apply", "json"],
    examples: ["outpost recovery prune --policy retention.json"],
  },
  "recovery workspace inspect": {
    description: "Inspect a file workspace record and snapshot",
    options: [...fileRecovery, "workspace-id"],
  },
  "recovery workspace recover": {
    description:
      "Recover stopped workspace ownership without replaying its workflow",
    options: [
      ...fileRecovery,
      "workspace-id",
      "revision",
      "processes-stopped",
      "allocation-released",
      "adopt-files",
      "adopt-source",
      "portable",
    ],
  },
  "recovery publication inspect": {
    description: "Inspect a workspace publication",
    options: [...fileRecovery, "publication-id"],
  },
  "recovery publication finish": {
    description: "Finish an interrupted publication without replaying tasks",
    options: [...fileRecovery, "publication-id", "processes-stopped", "run-id"],
  },
  "recovery publication rollback": {
    description: "Conditionally roll back a workspace publication",
    options: [...fileRecovery, "publication-id", "processes-stopped", "run-id"],
  },
  "recovery registry inspect": {
    description: "Inspect local path registry coordination without Git",
    options: ["json"],
  },
  "recovery registry release": {
    description:
      "Release an inspected registry gate after all coordinating processes are stopped",
    options: ["revision", "processes-stopped", "json"],
    aliases: ["recovery registry recover"],
  },
} as const;

/** Legacy option names accepted with a deprecation warning. */
export const optionAliases = {
  "sandbox-provider": "provider",
} as const;

import { randomBytes } from "node:crypto";
import { mkdir, open, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { StringDecoder } from "node:string_decoder";
import { OutpostError } from "../../domain/errors.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import { applyRecipeTaskStatus } from "../../domain/recipes/run-status.ts";
import { replaceFile } from "../../infrastructure/file-replacement.ts";
import { executeProcess } from "../../infrastructure/process.ts";
import { superviseProcess } from "../../infrastructure/supervised-process.ts";
import { recipeEditorRunDefaults } from "./runs.constants.ts";
import type { Observation } from "../../domain/observation.types.ts";
import type { TaskStatus } from "../../domain/workflow.types.ts";
import type { FileHandle } from "node:fs/promises";
import type { RecipeReport } from "../recipe-report.types.ts";
import type { RecipeRunStatus } from "../recipes/durable.types.ts";
import type { SupervisedExit } from "../../infrastructure/supervised-process.types.ts";
import type {
  RecipeEditorActiveRun,
  RecipeEditorDurableRun,
  RecipeEditorRun,
  RecipeEditorRunCommand,
  RecipeEditorRunAction,
  RecipeEditorRunEvent,
  RecipeEditorRunRequest,
  RecipeEditorRuns,
  RecipeEditorRunsOptions,
} from "./runs.types.ts";

const files = {
  record: "run.json",
  report: "report.json",
  events: "events.ndjson",
  stderr: "stderr.log",
} as const;

const identifier = /^[0-9]{8}T[0-9]{6}-[0-9a-f]{6}$/;

function runIdentifier(): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  return `${stamp}-${randomBytes(3).toString("hex")}`;
}

function parseObservation(line: string): Observation[] {
  if (!line) return [];
  try {
    return [JSON.parse(line) as Observation];
  } catch {
    return [];
  }
}

function parseReport(stdout: string): RecipeReport | undefined {
  try {
    const value: unknown = JSON.parse(stdout.trim());
    if (recipeObject(value) && typeof value.status === "string")
      return value as unknown as RecipeReport;
  } catch {
    return undefined;
  }
  return undefined;
}

function lastLine(text: string): string | undefined {
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .at(-1)
    ?.replace(/^Error:\s*/, "");
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

/** Reads the newest complete lines of an NDJSON log, within a byte budget. */
async function tail(path: string): Promise<readonly Observation[]> {
  let handle: FileHandle;
  try {
    handle = await open(path, "r");
  } catch {
    return [];
  }
  try {
    const { size } = await handle.stat();
    const length = Math.min(size, recipeEditorRunDefaults.detailBytes);
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, size - length);
    const lines = buffer.toString("utf8").split("\n");
    if (length < size) lines.shift();
    return lines
      .slice(-recipeEditorRunDefaults.detailEvents)
      .flatMap(parseObservation);
  } finally {
    await handle.close();
  }
}

/** Starts recipe CLI processes for the saved drafts and keeps their history. */
export function createRecipeEditorRuns({
  session,
  cli,
}: RecipeEditorRunsOptions): RecipeEditorRuns {
  const [executable, ...prefix] = cli;
  const listeners = new Set<(event: RecipeEditorRunEvent) => void>();
  let active: RecipeEditorActiveRun | undefined;
  const emit = (event: RecipeEditorRunEvent) => {
    for (const listener of listeners) listener(event);
  };

  async function history(): Promise<string> {
    const base = await session.root.locate(recipeEditorRunDefaults.directory);
    await mkdir(base, { recursive: true });
    await writeFile(join(base, "..", ".gitignore"), "*\n", {
      flag: "wx",
    }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
    });
    return base;
  }

  async function folder(id: string): Promise<string> {
    if (!identifier.test(id))
      throw new OutpostError("configuration", `Unknown editor run ${id}`);
    return join(await history(), id);
  }

  async function save(run: RecipeEditorRun, directory: string) {
    const target = join(directory, files.record);
    const temporary = `${target}.${randomBytes(4).toString("hex")}.tmp`;
    await writeFile(temporary, `${JSON.stringify(run, null, 2)}\n`);
    await replaceFile(temporary, target);
  }

  async function record(id: string): Promise<RecipeEditorRun> {
    if (active?.run.id === id) return active.run;
    const text = await readOptional(join(await folder(id), files.record));
    if (!text)
      throw new OutpostError("configuration", `Unknown editor run ${id}`);
    const run = JSON.parse(text) as RecipeEditorRun;
    return run.state === "running" ? { ...run, state: "interrupted" } : run;
  }

  async function durable(id: string): Promise<RecipeEditorDurableRun> {
    const run = await record(id);
    if (!run.runId)
      throw new OutpostError(
        "configuration",
        "This run has no durable run identifier; configure a workflow checkpoint to resume it",
      );
    return { ...run, runId: run.runId };
  }

  function requireDrafts() {
    const state = session.state();
    const { recipe, config } = session.files();
    if (!executable || !recipe || !config)
      throw new OutpostError(
        "configuration",
        "Open a recipe and a configuration to run them",
      );
    if (!/\.ya?ml$/.test(config))
      throw new OutpostError(
        "configuration",
        "The editor runs recipes with a YAML configuration",
      );
    if (
      !state.recipe?.exists ||
      !state.config?.exists ||
      state.recipe.dirty ||
      state.config.dirty
    )
      throw new OutpostError(
        "configuration",
        "Save the recipe and configuration before running them",
      );
    return { recipe, config };
  }

  async function intervention(directory: string, name: string, value: unknown) {
    const path = join(directory, name);
    await writeFile(path, `${JSON.stringify(value)}\n`, { mode: 0o600 });
    return path;
  }

  const actions: Readonly<
    Record<
      RecipeEditorRunAction,
      (
        request: RecipeEditorRunRequest,
        directory: string,
      ) => Promise<RecipeEditorRunCommand>
    >
  > = {
    run: async (request) => {
      if (request.action !== "run") return { arguments: [] };
      return {
        ...(request.runId ? { runId: request.runId } : {}),
        arguments: Object.entries(request.inputs ?? {}).flatMap(
          ([name, value]) => ["--input", `${name}=${value}`],
        ),
      };
    },
    resume: async (request) => {
      if (request.action !== "resume") return { arguments: [] };
      const source = await durable(request.from);
      return {
        runId: source.runId,
        arguments: request.retryIncomplete ? ["--retry-incomplete"] : [],
      };
    },
    answer: async (request, directory) => {
      if (request.action !== "answer") return { arguments: [] };
      const source = await durable(request.from);
      return {
        runId: source.runId,
        arguments: [
          "--answer",
          await intervention(directory, "answer.json", request.answer),
        ],
      };
    },
    decide: async (request, directory) => {
      if (request.action !== "decide") return { arguments: [] };
      const source = await durable(request.from);
      return {
        runId: source.runId,
        arguments: [
          "--decision",
          await intervention(directory, "decision.json", request.decision),
        ],
      };
    },
  };

  async function supervise(
    run: RecipeEditorRun,
    directory: string,
    command: readonly string[],
  ): Promise<void> {
    const events = join(directory, files.events);
    await writeFile(events, "", { mode: 0o600 });
    const reader = await open(events, "r");
    const decoder = new StringDecoder("utf8");
    const output = { stdout: "", stderr: "" };
    const tasks: Record<string, TaskStatus> = {};
    let offset = 0;
    let partial = "";
    let reading: Promise<void> = Promise.resolve();
    const drain = () =>
      (reading = reading
        .then(async () => {
          const { size } = await reader.stat();
          if (size <= offset) return;
          const buffer = Buffer.alloc(size - offset);
          const { bytesRead } = await reader.read(
            buffer,
            0,
            buffer.length,
            offset,
          );
          offset += bytesRead;
          const lines = (
            partial + decoder.write(buffer.subarray(0, bytesRead))
          ).split("\n");
          partial = lines.pop() ?? "";
          for (const observation of lines.flatMap(parseObservation)) {
            if (applyRecipeTaskStatus(tasks, observation))
              entry.run = { ...entry.run, tasks: { ...tasks } };
            emit({ type: "observation", id: run.id, observation });
          }
        })
        .catch(() => undefined));
    const child = superviseProcess({
      executable: executable!,
      arguments: command,
      directory: session.root.directory,
      output(channel, text) {
        const limit =
          channel === "stdout"
            ? recipeEditorRunDefaults.reportBytes
            : recipeEditorRunDefaults.stderrBytes;
        output[channel] = (output[channel] + text).slice(-limit);
      },
    });
    const poller = setInterval(drain, recipeEditorRunDefaults.pollMs);
    async function settle(): Promise<void> {
      let exit: SupervisedExit = { status: null, signal: null };
      try {
        exit = await child.exited;
      } catch (error) {
        output.stderr += `\n${error instanceof Error ? error.message : String(error)}`;
      }
      clearInterval(poller);
      await drain();
      await reader.close();
      const report = parseReport(output.stdout);
      if (report)
        await writeFile(join(directory, files.report), JSON.stringify(report));
      await writeFile(join(directory, files.stderr), output.stderr);
      const current = entry;
      const message = report ? undefined : lastLine(output.stderr);
      const runId = report?.runId ?? current.run.runId;
      const finishedRun: RecipeEditorRun = {
        ...current.run,
        finishedAt: new Date().toISOString(),
        state: current.cancelled ? "cancelled" : "exited",
        exitCode: exit.status,
        ...(report ? { status: report.status } : {}),
        ...(runId ? { runId } : {}),
        tasks: report
          ? Object.fromEntries(
              report.tasks.map((task) => [task.key, task.status]),
            )
          : { ...tasks },
        ...(message ? { message } : {}),
      };
      try {
        await save(finishedRun, directory);
      } finally {
        active = undefined;
        emit({ type: "run", run: finishedRun });
      }
    }
    const entry: RecipeEditorActiveRun = {
      run,
      process: child,
      finished: settle().catch(() => {
        if (active === entry) active = undefined;
      }),
      cancelled: false,
    };
    active = entry;
  }

  return {
    async list() {
      const base = await history();
      const entries = await readdir(base, { withFileTypes: true });
      const runs = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory() && identifier.test(entry.name))
          .map((entry) => record(entry.name).catch(() => undefined)),
      );
      return runs
        .filter((run): run is RecipeEditorRun => !!run)
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
        .slice(0, recipeEditorRunDefaults.historyLimit);
    },
    async detail(id) {
      const run = await record(id);
      const directory = await folder(id);
      const report = await readOptional(join(directory, files.report));
      return {
        run,
        ...(report ? { report: JSON.parse(report) as RecipeReport } : {}),
        events: await tail(join(directory, files.events)),
        stderr: (await readOptional(join(directory, files.stderr))) ?? "",
      };
    },
    async start(request) {
      if (active)
        throw new OutpostError("conflict", "A recipe run is already active");
      const drafts = requireDrafts();
      const id = runIdentifier();
      const directory = await folder(id);
      await mkdir(directory);
      const settings = await actions[request.action](request, directory);
      const run: RecipeEditorRun = {
        id,
        action: request.action,
        recipe: session.root.relative(drafts.recipe),
        config: session.root.relative(drafts.config),
        ...(settings.runId ? { runId: settings.runId } : {}),
        startedAt: new Date().toISOString(),
        state: "running",
        tasks: {},
      };
      await save(run, directory);
      await supervise(run, directory, [
        ...prefix,
        "recipe",
        request.action,
        "--file",
        drafts.recipe,
        "--config",
        drafts.config,
        ...(settings.runId ? ["--run-id", settings.runId] : []),
        ...settings.arguments,
        "--events",
        join(directory, files.events),
        "--json",
        "--no-interactive",
      ]);
      emit({ type: "run", run });
      return run;
    },
    cancel(id) {
      if (!active || active.run.id !== id)
        throw new OutpostError("configuration", `Run ${id} is not active`);
      active.cancelled = true;
      active.process.stop();
      return active.run;
    },
    async status(id, signal) {
      const run = await durable(id);
      const result = await executeProcess({
        executable: executable!,
        arguments: [
          ...prefix,
          "recipe",
          "status",
          "--file",
          await session.root.locate(run.recipe),
          "--config",
          await session.root.locate(run.config),
          "--run-id",
          run.runId,
          "--json",
        ],
        directory: session.root.directory,
        deadlineMs: recipeEditorRunDefaults.statusDeadlineMs,
        signal,
      });
      if (result.status !== 0 && !result.stdout.trim())
        throw new OutpostError(
          "configuration",
          lastLine(result.stderr) ?? "Recipe status failed",
        );
      return JSON.parse(result.stdout) as RecipeRunStatus | null;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async close() {
      const current = active;
      if (!current) return;
      current.cancelled = true;
      current.process.stop();
      let timer: NodeJS.Timeout | undefined;
      const expired = new Promise<boolean>((done) => {
        timer = setTimeout(
          () => done(true),
          recipeEditorRunDefaults.closeGraceMs,
        );
      });
      if (await Promise.race([current.finished.then(() => false), expired]))
        current.process.stop();
      clearTimeout(timer);
      await current.finished;
    },
  };
}

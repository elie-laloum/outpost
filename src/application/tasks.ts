import { observationDefaults } from "../domain/observation.constants.ts";
import { taskObservation } from "./task-observation.ts";
import { taskUsage } from "./task-usage.ts";
import { OutpostError } from "../domain/errors.ts";
import type { CommandResult } from "../domain/ports.ts";
import { defineTask, type Task, type TaskOptions } from "../domain/workflow.ts";
import type { DispatchResult } from "./outpost.ts";
import { quotaContinuation, quotaWorkspace } from "./quota-resume.ts";
import { dispatch } from "./outpost.ts";
import type {
  AgentTaskOptions,
  CommandTaskOptions,
  IsolatedTaskOptions,
  FileAgentTaskOptions,
  IsolatedCommandTaskOptions,
  MixedAgentTaskOptions,
  FileIsolatedTaskOptions,
  MixedIsolatedTaskOptions,
} from "./tasks.types.ts";
import type { FileDispatchResult } from "./file-sandbox.types.ts";
import {
  createFileSandbox,
  dispatchFiles,
  isFileSandboxOptions,
  validateFileSandbox,
} from "./file-sandbox.ts";
import { openTaskFileWorkspace } from "./task-file-workspace.ts";
import { prepareWorkspaceOutputs } from "./workspace-output-baseline.ts";
import { publishWorkspaceOutputs } from "./workspace-publication.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";

function uncached(options: object): void {
  if ("cache" in options && options.cache !== undefined)
    throw new Error(
      "Dispatch results are not JSON; cache a task that returns a JSON projection",
    );
}

export function defineAgentTask<T>(
  options: Omit<TaskOptions<FileDispatchResult<T>>, "perform" | "cache"> &
    FileAgentTaskOptions<T>,
): Task<FileDispatchResult<T>>;
export function defineAgentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
export function defineAgentTask<T>(
  options: Omit<
    TaskOptions<DispatchResult<T> | FileDispatchResult<T>>,
    "perform" | "cache"
  > &
    MixedAgentTaskOptions<T>,
): Task<DispatchResult<T> | FileDispatchResult<T>>;
export function defineAgentTask<T>(
  options: Omit<
    TaskOptions<DispatchResult<T> | FileDispatchResult<T>>,
    "perform" | "cache"
  > &
    MixedAgentTaskOptions<T>,
): Task<DispatchResult<T> | FileDispatchResult<T>> {
  uncached(options);
  const { sandbox, request, ...definition } = options;
  const quotaResume =
    "quotaResume" in options ? options.quotaResume : undefined;
  return defineTask({
    ...definition,
    async perform(context) {
      const options = quotaContinuation(context, request(context), quotaResume);
      const usage = taskUsage(context, undefined);
      const observation = taskObservation(
        context.observation ?? options.observation,
        options.observe,
      );
      try {
        const result = await sandbox.dispatch({
          ...options,
          ...(context.prices ? { prices: context.prices } : {}),
          observation,
          signal: context.signal,
          observe: usage.observe,
        });
        usage.reconcile(result.usage);
        return result;
      } finally {
        await observation.close();
      }
    },
  });
}

export function defineIsolatedCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> &
    IsolatedCommandTaskOptions,
): Task<CommandResult> {
  const { request, ...definition } = options;
  return defineTask({
    ...definition,
    async perform(context) {
      const { command, outputs, ...settings } = await request(context);
      await validateFileSandbox(settings);
      const resource = !settings.workspace
        ? await openTaskFileWorkspace(
            context,
            `isolated:${options.key}`,
            {
              ...settings,
              source: settings.workspaceSource,
              signal: context.signal,
            },
            settings.sandboxProvider,
          )
        : undefined;
      const { workspaceSource: _source, ...borrowed } = settings;
      let sandbox: import("./file-sandbox.types.ts").FileSandbox | undefined;
      let complete = false;
      try {
        const workspace = resource?.workspace ?? settings.workspace!;
        if (outputs) await prepareWorkspaceOutputs(workspace, outputs);
        sandbox = await createFileSandbox(
          { ...borrowed, workspace, signal: context.signal },
          resource?.settled,
        );
        const result = await sandbox.command({
          ...command,
          signal: context.signal,
        });
        if (result.status !== 0)
          throw new OutpostError(
            "process",
            "Isolated workflow command failed",
            { ...result },
          );
        await sandbox.close({ preserve: true });
        const fileOutputs = [];
        for (const output of outputs ?? [])
          fileOutputs.push(await publishWorkspaceOutputs(workspace, output));
        const workspaceInfo = await workspace.checkpoint();
        await resource?.settled(workspaceInfo);
        complete = true;
        return { ...result, workspaceInfo, fileOutputs };
      } finally {
        await sandbox?.close({ preserve: !complete });
        if (resource && !fileWorkspaces.get(resource.workspace)?.active)
          await resource.workspace.close({ preserve: !complete });
      }
    },
  });
}

export function defineIsolatedTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform" | "cache"> &
    IsolatedTaskOptions<T>,
): Task<DispatchResult<T>>;
export function defineIsolatedTask<T>(
  options: Omit<TaskOptions<FileDispatchResult<T>>, "perform" | "cache"> &
    FileIsolatedTaskOptions<T>,
): Task<FileDispatchResult<T>>;
export function defineIsolatedTask<T>(
  options: Omit<
    TaskOptions<DispatchResult<T> | FileDispatchResult<T>>,
    "perform" | "cache"
  > &
    MixedIsolatedTaskOptions<T>,
): Task<DispatchResult<T> | FileDispatchResult<T>>;
export function defineIsolatedTask<T>(
  options: Omit<
    TaskOptions<DispatchResult<T> | FileDispatchResult<T>>,
    "perform" | "cache"
  > &
    MixedIsolatedTaskOptions<T>,
): Task<DispatchResult<T> | FileDispatchResult<T>> {
  uncached(options);
  const { request, quotaResume, ...definition } = options;
  return defineTask({
    ...definition,
    async perform(context) {
      const requested = await request(context);
      if (isFileSandboxOptions(requested)) {
        await validateFileSandbox(requested);
        const settings = quotaContinuation(context, requested, quotaResume);
        const resource = !requested.workspace
          ? await openTaskFileWorkspace(
              context,
              `isolated:${options.key}`,
              {
                ...requested,
                source: requested.workspaceSource,
                signal: context.signal,
              },
              requested.sandboxProvider,
            )
          : undefined;
        const usage = taskUsage(context, undefined);
        let complete = false;
        try {
          const { workspaceSource: _source, ...borrowed } = settings;
          const result = await dispatchFiles(
            {
              ...borrowed,
              workspace: resource?.workspace ?? requested.workspace!,
              signal: context.signal,
              observe: usage.observe,
              ...(context.prices ? { prices: context.prices } : {}),
              ...(context.observation
                ? { observation: context.observation }
                : {}),
            },
            resource?.settled,
          );
          usage.reconcile(result.usage);
          complete = true;
          return result;
        } finally {
          if (resource && !fileWorkspaces.get(resource.workspace)?.active)
            await resource.workspace.close({ preserve: !complete });
        }
      }
      const settings = quotaWorkspace(
        context,
        quotaContinuation(context, requested, quotaResume),
        quotaResume,
      );
      const usage = taskUsage(context, undefined);
      const observation = taskObservation(
        context.observation ?? settings.observation,
        settings.observe,
      );
      try {
        const result = await dispatch({
          ...settings,
          ...(context.prices ? { prices: context.prices } : {}),
          observation,
          signal: context.signal,
          observe: usage.observe,
        });
        usage.reconcile(result.usage);
        return result;
      } finally {
        await observation.close();
      }
    },
  });
}

export function defineCommandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult> {
  const { sandbox, command, ...definition } = options;
  return defineTask({
    ...definition,
    async perform(context) {
      const invocation =
        typeof command === "function" ? command(context) : command;
      const result = await sandbox.command({
        ...invocation,
        observe(channel, text) {
          for (
            let offset = 0;
            offset < text.length;
            offset += observationDefaults.outputCharacters
          )
            context.observation?.emit("sandbox", {
              kind: "command-output",
              channel,
              text: text.slice(
                offset,
                offset + observationDefaults.outputCharacters,
              ),
            });
          invocation.observe?.(
            channel,
            context.observation?.redact(text) ?? text,
          );
        },
        signal: context.signal,
      });
      if (result.status !== 0)
        throw new OutpostError("process", "Workflow command failed", {
          ...result,
        });
      return result;
    },
  });
}

import { resolve } from "node:path";
import { invariant, OutpostError, positive } from "../domain/errors.ts";
import type { Command, CommandResult } from "../domain/command.types.ts";
import type { SandboxProvider } from "../domain/sandbox.types.ts";
import { processDefaults } from "../infrastructure/process.constants.ts";
import { applyScriptedCommit } from "../infrastructure/scripted-commit.ts";
import { scriptedExecutable } from "../infrastructure/scripted-turn.constants.ts";
import { readScriptedRecipe } from "../infrastructure/scripted-turn.ts";
import type { MemorySandboxOptions } from "./memory.types.ts";

export function createMemorySandboxProvider(
  options: MemorySandboxOptions = {},
): SandboxProvider {
  const commands = structuredClone(options.commands ?? []);
  for (const command of commands) {
    invariant(
      command.executable.length > 0 &&
        command.executable !== scriptedExecutable,
      "Invalid memory command executable",
    );
    invariant(
      command.status === undefined ||
        (Number.isInteger(command.status) &&
          command.status >= 0 &&
          command.status <= 255),
      "Invalid memory command status",
    );
  }
  let next = 0;
  const provider: SandboxProvider = {
    name: "memory",
    placement: "mounted",
    async acquire(context) {
      context.signal?.throwIfAborted();
      let closed = false;
      const active = new Set<Promise<CommandResult>>();
      const stop = new AbortController();
      const invoke = async (command: Command): Promise<CommandResult> => {
        if (closed)
          throw new OutpostError("provider", "Memory sandbox is closed");
        command.signal?.throwIfAborted();
        invariant(
          !command.interactive &&
            !command.input &&
            !command.terminal &&
            !command.elevated,
          "Memory sandboxes do not support terminals, live input or elevation",
        );
        const retain = positive(
          command.retain ?? processDefaults.retainBytes,
          "retain",
        );
        if (command.executable === scriptedExecutable) {
          invariant(
            command.arguments?.length === 1,
            "Invalid scripted command",
          );
          invariant(
            !command.directory ||
              resolve(command.directory) === resolve(context.directory),
            "Scripted commits must use the sandbox workspace",
          );
          const recipe = readScriptedRecipe(command.arguments[0]!);
          if (recipe.commit)
            await applyScriptedCommit(
              context.directory,
              recipe.commit,
              command,
            );
          for (const line of recipe.events) {
            command.signal?.throwIfAborted();
            command.observe?.("stdout", line + "\n");
          }
          if (recipe.stderr) command.observe?.("stderr", recipe.stderr);
          command.signal?.throwIfAborted();
          return {
            status: recipe.status,
            stdout: (recipe.events.join("\n") + "\n").slice(-retain),
            stderr: recipe.stderr.slice(-retain),
          };
        }
        const expected = commands[next];
        if (
          !expected ||
          expected.executable !== command.executable ||
          JSON.stringify(expected.arguments ?? []) !==
            JSON.stringify(command.arguments ?? [])
        )
          throw new OutpostError(
            "provider",
            `Unexpected memory sandbox command: ${command.executable}`,
            { index: next },
          );
        next++;
        const result = {
          status: expected.status ?? 0,
          stdout: expected.stdout ?? "",
          stderr: expected.stderr ?? "",
        };
        if (result.stdout) command.observe?.("stdout", result.stdout);
        if (result.stderr) command.observe?.("stderr", result.stderr);
        command.signal?.throwIfAborted();
        return {
          ...result,
          stdout: result.stdout.slice(-retain),
          stderr: result.stderr.slice(-retain),
        };
      };
      const transfer = async () => {
        throw new OutpostError(
          "provider",
          "Memory sandboxes do not support file transfers",
        );
      };
      return {
        root: context.directory,
        home: context.directory,
        invoke(command) {
          const pending = (async () => {
            const deadline = positive(
              command.deadlineMs ?? processDefaults.deadlineMs,
              "Memory command deadline",
            );
            const timeout = new AbortController();
            const timer = setTimeout(
              () =>
                timeout.abort(
                  new OutpostError(
                    "timeout",
                    `Memory command exceeded ${deadline} ms`,
                    { deadlineMs: deadline },
                  ),
                ),
              deadline,
            );
            const signals = [stop.signal, timeout.signal];
            if (command.signal) signals.push(command.signal);
            try {
              return await invoke({
                ...command,
                signal: AbortSignal.any(signals),
              });
            } finally {
              clearTimeout(timer);
            }
          })();
          active.add(pending);
          void pending.then(
            () => active.delete(pending),
            () => active.delete(pending),
          );
          return pending;
        },
        upload: transfer,
        download: transfer,
        async release() {
          if (closed) return;
          closed = true;
          stop.abort(new OutpostError("aborted", "Memory sandbox disposed"));
          await Promise.allSettled(active);
        },
      };
    },
  };
  return {
    ...provider,
    workspaces: {
      bindings: ["copy", "ephemeral"],
      acquire(context) {
        return provider.acquire({
          directory: context.workspace.directory,
          repository: context.runtime.directory,
          gitDirectories: [],
          variables: context.variables,
          ...(context.signal ? { signal: context.signal } : {}),
        });
      },
    },
  };
}

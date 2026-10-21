import { installHookConfiguration } from "../infrastructure/hook-configuration.ts";
import { randomBytes } from "node:crypto";
import { PassThrough } from "node:stream";
import type {
  AgentHookInstallation,
  AgentHookPlan,
} from "../domain/agent-hook.types.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import { runCleanup, withCleanup } from "../domain/cleanup.ts";
import { invariant, OutpostError } from "../domain/errors.ts";
import { hookSnapshot, hookSandbox, invokeHook } from "./hook-invocation.ts";
import { hookBridgeScript, hookClientScript } from "./cli-hooks.constants.ts";

export async function openCliHooks(
  plan: AgentHookPlan,
  sandbox: SandboxLease,
  signal: AbortSignal,
  fail: (error: unknown) => void,
): Promise<AgentHookInstallation> {
  const callbacks = plan.handlers.some((hook) => !hook.command);
  invariant(
    !callbacks || sandbox.liveInput,
    "CLI hook callbacks require a sandbox with live process input",
  );
  signal.throwIfAborted();
  const token = randomBytes(24).toString("hex");
  const variable = `OUTPOST_HOOK_${token.toUpperCase()}`;
  const stop = new AbortController();
  const combined = AbortSignal.any([signal, stop.signal]);
  const input = new PassThrough();
  let closing = false;
  let pending = "";
  const active = new Set<Promise<void>>();
  let ready!: (port: number) => void;
  let rejectReady!: (error: unknown) => void;
  const readiness = new Promise<number>((resolve, reject) => {
    ready = resolve;
    rejectReady = reject;
  });
  const failed = (error: unknown) => {
    rejectReady(error);
    if (!closing) fail(error);
  };
  const respond = async (value: Record<string, unknown>) => {
    const id = value.id;
    try {
      invariant(
        Number.isSafeInteger(id) && typeof value.hook === "number",
        "Invalid hook bridge request",
      );
      const hook = plan.handlers[value.hook];
      invariant(hook && !hook.command, "Unknown hook callback");
      const output = await invokeHook(
        hook.name,
        hook.timeoutMs,
        combined,
        (signal) =>
          hook.run(hookSnapshot(value.event), {
            sandbox: hookSandbox(sandbox, signal),
            signal,
          }),
      );
      if (!closing) input.write(`${JSON.stringify({ id, output })}\n`);
    } catch (error) {
      if (!closing)
        input.write(
          `${JSON.stringify({ id, error: "Outpost hook failed" })}\n`,
        );
      failed(error);
    }
  };
  const receive = (chunk: string) => {
    pending += chunk;
    if (pending.length > 2_097_152) {
      failed(
        new OutpostError(
          "response",
          "Hook bridge output exceeds its size limit",
        ),
      );
      return;
    }
    let end: number;
    while ((end = pending.indexOf("\n")) >= 0) {
      const line = pending.slice(0, end);
      pending = pending.slice(end + 1);
      try {
        const value: unknown = JSON.parse(line);
        invariant(
          value !== null && typeof value === "object" && !Array.isArray(value),
          "Invalid hook bridge message",
        );
        if ("port" in value && typeof value.port === "number") {
          ready(value.port);
          continue;
        }
        invariant(active.size < 32, "Too many concurrent hook callbacks");
        const operation = respond(value as Record<string, unknown>);
        active.add(operation);
        void operation.finally(() => active.delete(operation));
      } catch (error) {
        failed(error);
      }
    }
  };
  const running = callbacks
    ? sandbox.invoke({
        executable: "node",
        arguments: ["-e", hookBridgeScript],
        variables: { OUTPOST_HOOK_BRIDGE_TOKEN: token },
        input,
        signal: combined,
        deadlineMs: 86_400_000,
        retain: 1,
        observe: (channel, chunk) => {
          if (channel === "stdout") receive(chunk);
        },
      })
    : Promise.resolve({ status: 0, stdout: "", stderr: "" });
  if (callbacks)
    void running.then((result) => {
      if (!closing)
        failed(
          new OutpostError(
            "process",
            `Hook bridge exited with status ${result.status}`,
          ),
        );
    }, failed);
  const closeBridge = async () => {
    closing = true;
    stop.abort(new OutpostError("aborted", "Hook bridge closed"));
    input.end();
    await Promise.allSettled([running, ...active]);
  };
  let closeClient: (() => Promise<void>) | undefined;
  try {
    const port = callbacks
      ? await invokeHook("bridge startup", 30_000, combined, () => readiness)
      : 0;
    const clientPath = `.outpost-hooks/${token}.cjs`;
    closeClient = await installHookConfiguration(
      sandbox,
      { kind: "exclusive", path: clientPath, content: hookClientScript },
      combined,
    );
    const encodedPath = Buffer.from(`${sandbox.home}/${clientPath}`).toString(
      "base64",
    );
    const commands = plan.handlers.map((hook, index) => {
      const configuration = Buffer.from(
        JSON.stringify({
          index,
          variable,
          timeoutMs: hook.timeoutMs,
          ...(hook.command ? { command: hook.command } : {}),
        }),
      ).toString("base64");
      return `node -e "if(process.env.${variable})require(Buffer.from('${encodedPath}','base64').toString())" ${configuration}`;
    });
    const installation = await plan.prepare(sandbox, commands, combined);
    let closed: Promise<void> | undefined;
    return {
      command(command) {
        const configured = installation.command(command);
        return {
          ...configured,
          variables: {
            ...configured.variables,
            [variable]: JSON.stringify({ port, token }),
          },
        };
      },
      close() {
        return (closed ??= (async () => {
          await closeBridge();
          await withCleanup(
            () => installation.close(),
            [() => closeClient?.()],
            { recovery: "hookClientCleanupError" },
          );
        })());
      },
    };
  } catch (error) {
    await closeBridge();
    await runCleanup([() => closeClient?.()], [error], {
      recovery: "hookClientCleanupError",
    });
    throw error;
  }
}

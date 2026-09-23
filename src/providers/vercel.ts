import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import type { Sandbox } from "@vercel/sandbox";
import type { SandboxProvider, Variables } from "../domain/ports.ts";
import { OutpostError } from "../domain/errors.ts";
import { quote } from "../infrastructure/process.ts";
import { registerCleanup } from "../infrastructure/shutdown.ts";
import { downloadTree, manifestScript, uploadTree } from "./cloud-files.ts";
import { transfer } from "../infrastructure/transfer.ts";

export interface VercelOptions {
  readonly create?: NonNullable<Parameters<typeof Sandbox.create>[0]>;
  readonly variables?: Variables;
  readonly root?: string;
  readonly retain?: number;
}

export function vercel(
  options: VercelOptions = {},
  connect: (config: VercelOptions["create"]) => Promise<Sandbox> = async (
    config,
  ) => (await import("@vercel/sandbox")).Sandbox.create(config),
): SandboxProvider {
  return {
    name: "vercel",
    placement: "remote",
    variables: { ...options.variables },
    async acquire(context) {
      context.signal?.throwIfAborted();
      const sandbox = await connect({
        ...options.create,
        env: { ...options.create?.env, ...context.variables },
      });
      const root = options.root ?? "/vercel/sandbox/outpost";
      let closed = false;
      let releasing: Promise<void> | undefined;
      let unregister = () => {};
      const release = () =>
        (releasing ??= sandbox
          .stop()
          .then(() => {
            closed = true;
            unregister();
          })
          .catch((error) => {
            releasing = undefined;
            throw error;
          }));
      unregister = registerCleanup(release);
      let home: string;
      try {
        await sandbox.mkDir(root);
        home = (
          await (await sandbox.runCommand("printenv", ["HOME"])).stdout()
        ).trim();
        if (!home.startsWith("/"))
          throw new OutpostError(
            "provider",
            "Cloud sandbox returned an invalid home directory",
          );
      } catch (cause) {
        await release();
        throw cause;
      }
      return {
        root,
        home,
        async invoke(command) {
          if (closed)
            throw new OutpostError("provider", "Cloud sandbox is closed");
          if (command.interactive)
            throw new OutpostError(
              "provider",
              "Interactive terminals require a mounted or local provider",
            );
          const signal = command.signal
            ? AbortSignal.any([
                command.signal,
                AbortSignal.timeout(command.deadlineMs ?? 600_000),
              ])
            : AbortSignal.timeout(command.deadlineMs ?? 600_000);
          signal.throwIfAborted();
          const inputPath = `/tmp/outpost-${randomUUID()}.stdin`;
          if (command.stdin !== undefined)
            await sandbox.writeFiles([
              { path: inputPath, content: Buffer.from(command.stdin) },
            ]);
          const output = { stdout: "", stderr: "" };
          const cmd = command.stdin === undefined ? command.executable : "sh";
          const args =
            command.stdin === undefined
              ? [...(command.arguments ?? [])]
              : [
                  "-c",
                  `exec ${[command.executable, ...(command.arguments ?? [])].map(quote).join(" ")} < ${quote(inputPath)}`,
                ];
          try {
            const running = await sandbox.runCommand({
              cmd,
              args,
              cwd: command.directory ?? root,
              env: { ...command.variables },
              sudo: command.elevated ?? false,
              detached: true,
              signal,
              timeoutMs: command.deadlineMs ?? 600_000,
            });
            try {
              for await (const log of running.logs({ signal })) {
                const channel = log.stream;
                if (channel !== "stdout" && channel !== "stderr") continue;
                output[channel] = (output[channel] + log.data).slice(
                  -(command.retain ?? options.retain ?? 65_536),
                );
                command.observe?.(channel, log.data);
              }
              const result = await running.wait({ signal });
              return { status: result.exitCode, ...output };
            } catch (cause) {
              await running.kill("SIGKILL", {
                abortSignal: AbortSignal.timeout(15_000),
              });
              throw cause;
            }
          } finally {
            if (command.stdin !== undefined)
              await sandbox
                .runCommand("rm", ["-f", inputPath])
                .catch(() => undefined);
          }
        },
        async upload(source, destination, options = {}) {
          return transfer(options, async (signal) => {
            await uploadTree(
              source,
              destination,
              (path, content) => sandbox.writeFiles([{ path, content }]),
              async (target, path) => {
                await sandbox.mkDir(posix.dirname(path));
                const result = await sandbox.runCommand("ln", [
                  "-s",
                  "--",
                  target,
                  path,
                ]);
                if (result.exitCode !== 0)
                  throw new OutpostError("provider", "Symlink upload failed");
              },
              async (path, directory, mode) => {
                if (directory) await sandbox.mkDir(path);
                const result = await sandbox.runCommand("chmod", [
                  mode.toString(8),
                  path,
                ]);
                if (result.exitCode !== 0)
                  throw new OutpostError(
                    "provider",
                    "Transfer permissions could not be set",
                  );
              },
              signal,
            );
          });
        },
        async download(source, destination, options = {}) {
          return transfer(options, async (signal) => {
            const listing = await sandbox.runCommand("node", [
              "-e",
              manifestScript,
              source,
            ]);
            if (listing.exitCode !== 0)
              throw new OutpostError(
                "provider",
                "Remote transfer source is unavailable",
              );
            await downloadTree(
              source,
              destination,
              await listing.stdout(),
              async (path) => {
                const stream = await sandbox.readFile({ path });
                if (!stream)
                  throw new OutpostError(
                    "provider",
                    `Remote file is missing: ${path}`,
                  );
                const chunks: Buffer[] = [];
                for await (const chunk of stream)
                  chunks.push(
                    Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
                  );
                return Buffer.concat(chunks);
              },
              signal,
            );
          });
        },
        release,
      };
    },
  };
}

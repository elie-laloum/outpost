import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, posix, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { OutpostError, invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/ports.ts";

export type ConversationFormat = "claude" | "codex";
export interface ConversationLocation {
  readonly id: string;
  readonly file: string;
  readonly format: ConversationFormat;
}

export function projectKey(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, "-");
}
function validId(id: string): void {
  invariant(/^[A-Za-z0-9_-]+$/.test(id), "Invalid conversation identifier");
}

async function files(root: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await readdir(root, { withFileTypes: true }).catch(
    (error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    },
  );
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await files(path)));
    else if (entry.isFile() && entry.name.endsWith(".jsonl")) result.push(path);
  }
  return result;
}

export async function locateConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  home = homedir(),
): Promise<ConversationLocation> {
  validId(id);
  if (format === "claude") {
    const expected = join(
      home,
      ".claude",
      "projects",
      projectKey(resolve(repository)),
      `${id}.jsonl`,
    );
    if (await stat(expected).catch(() => undefined))
      return { id, file: expected, format };
    const found = (await files(join(home, ".claude", "projects"))).find(
      (path) => path.endsWith(`${id}.jsonl`),
    );
    if (found) return { id, file: found, format };
  } else {
    const found = (await files(join(home, ".codex", "sessions"))).find((path) =>
      path.endsWith(`-${id}.jsonl`),
    );
    if (found) return { id, file: found, format };
  }
  throw new OutpostError(
    "session",
    `Conversation ${id} was not found in native ${format} storage`,
    { id, repository },
  );
}

export function relocateTranscript(text: string, destination: string): string {
  function visit(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(visit);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          key === "cwd" && typeof item === "string" ? destination : visit(item),
        ]),
      );
    return value;
  }
  return text
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      try {
        return JSON.stringify(visit(JSON.parse(line)));
      } catch {
        return line;
      }
    })
    .join("\n");
}

function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string {
  validId(id);
  return format === "claude"
    ? posix.join(
        lease.home,
        ".claude",
        "projects",
        projectKey(lease.root),
        `${id}.jsonl`,
      )
    : posix.join(
        lease.home,
        ".codex",
        "sessions",
        ...new Date().toISOString().slice(0, 10).split("-"),
        basename(original),
      );
}

export async function restoreConversation(
  location: ConversationLocation,
  lease: SandboxLease,
  staging: string,
): Promise<void> {
  const target = remotePath(location.format, location.id, lease, location.file);
  const contents = relocateTranscript(
    await readFile(location.file, "utf8"),
    lease.root,
  );
  const temporary = join(staging, `${randomUUID()}.jsonl`);
  await mkdir(staging, { recursive: true });
  await writeFile(temporary, contents, { mode: 0o600 });
  try {
    await lease.upload(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  if (location.format === "claude") {
    const sidecars = join(dirname(location.file), location.id, "subagents");
    for (const file of await files(sidecars)) {
      const name = file.slice(sidecars.length).replaceAll("\\", "/");
      const local = join(staging, `${randomUUID()}.jsonl`);
      await writeFile(
        local,
        relocateTranscript(await readFile(file, "utf8"), lease.root),
        { mode: 0o600 },
      );
      try {
        await lease.upload(
          local,
          posix.join(posix.dirname(target), location.id, "subagents", name),
        );
      } finally {
        await rm(local, { force: true });
      }
    }
  }
}

export async function captureConversation(
  format: ConversationFormat,
  id: string,
  repository: string,
  lease: SandboxLease,
  staging: string,
  options: {
    home?: string;
    warn?: (message: string) => void;
    local?: boolean;
  } = {},
): Promise<ConversationLocation> {
  validId(id);
  const home = options.home ?? homedir();
  const search =
    format === "claude"
      ? posix.join(lease.home, ".claude", "projects")
      : posix.join(lease.home, ".codex", "sessions");
  const pattern = format === "claude" ? `${id}.jsonl` : `*-${id}.jsonl`;
  const result = options.local
    ? {
        status: 0,
        stdout: (await locateConversation(format, id, lease.root, lease.home))
          .file,
      }
    : await lease.invoke({
        executable: "find",
        arguments: [search, "-type", "f", "-name", pattern],
        retain: 1_048_576,
      });
  const remote = result.stdout.trim().split("\n").filter(Boolean)[0];
  if (result.status !== 0 || !remote)
    throw new OutpostError(
      "session",
      `Agent emitted conversation ${id} but its transcript is unavailable`,
      { id, search },
    );
  const file =
    format === "claude"
      ? join(
          home,
          ".claude",
          "projects",
          projectKey(resolve(repository)),
          `${id}.jsonl`,
        )
      : join(
          home,
          ".codex",
          "sessions",
          ...new Date().toISOString().slice(0, 10).split("-"),
          posix.basename(remote.replaceAll("\\", "/")),
        );
  await mkdir(staging, { recursive: true });
  const temporary = join(staging, `${randomUUID()}.jsonl`);
  await lease.download(remote, temporary);
  await mkdir(dirname(file), { recursive: true });
  try {
    await writeFile(
      file,
      relocateTranscript(
        await readFile(temporary, "utf8"),
        resolve(repository),
      ),
      { mode: 0o600 },
    );
  } finally {
    await rm(temporary, { force: true });
  }
  if (format === "claude") {
    const remoteSidecars = posix.join(posix.dirname(remote), id, "subagents");
    const listed = options.local
      ? {
          status: 0,
          stdout: (await files(join(dirname(remote), id, "subagents"))).join(
            "\n",
          ),
        }
      : await lease.invoke({
          executable: "find",
          arguments: [remoteSidecars, "-type", "f", "-name", "*.jsonl"],
          retain: 1_048_576,
        });
    if (listed.status === 0)
      for (const child of listed.stdout.split("\n").filter(Boolean)) {
        try {
          const scratch = join(staging, `${randomUUID()}.jsonl`);
          await lease.download(child, scratch);
          const destination = join(
            dirname(file),
            id,
            "subagents",
            posix.basename(child.replaceAll("\\", "/")),
          );
          await mkdir(dirname(destination), { recursive: true });
          try {
            await writeFile(
              destination,
              relocateTranscript(
                await readFile(scratch, "utf8"),
                resolve(repository),
              ),
              { mode: 0o600 },
            );
          } finally {
            await rm(scratch, { force: true });
          }
        } catch (cause) {
          options.warn?.(
            `Could not capture child transcript: ${String(cause)}`,
          );
        }
      }
  }
  return { id, file, format };
}

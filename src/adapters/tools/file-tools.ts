import { join } from "node:path";
import { glob } from "../../domain/glob.ts";
import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type { HarnessToolset } from "../../domain/tool.types.ts";
import {
  anywhere,
  downloadFile,
  repositoryPath,
  withStaging,
} from "./sandbox-files.ts";
import { TOOL_LIMITS } from "./tools.constants.ts";
import type {
  FileSelectionOptions,
  ListFilesInput,
  ReadFileInput,
} from "./tools.types.ts";
import { filesystemSelectionScript } from "./filesystem-selection.constants.ts";
import { invariant } from "../../domain/errors.ts";

export function createHarnessFileTools(
  options: FileSelectionOptions = {},
): HarnessToolset {
  invariant(
    options.selection === undefined ||
      options.selection === "git" ||
      options.selection === "filesystem",
    "File selection must be git or filesystem",
  );
  return defineHarnessToolset({
    name: "files",
    tools: [readFileTool(), listFilesTool(options.selection ?? "git")],
  });
}

function readFileTool() {
  return defineHarnessTool({
    name: "read_file",
    description:
      "Read a UTF-8 text file relative to the repository root. Lines are numbered; use offset and limit for long files.",
    readOnly: true,
    input: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1 },
        offset: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: TOOL_LIMITS.readLines },
      },
      required: ["path"],
      additionalProperties: false,
    },
    resources: (input: ReadFileInput) => ({ paths: [input.path] }),
    execute: (input: ReadFileInput, context) =>
      withStaging(async (directory) => {
        const file = await downloadFile(
          context,
          input.path,
          join(directory, "file"),
        );
        const lines = file.bytes.toString("utf8").split(/\r?\n/);
        if (lines.at(-1) === "") lines.pop();
        const start = (input.offset ?? 1) - 1;
        const selected = lines.slice(
          start,
          start + (input.limit ?? TOOL_LIMITS.readLines),
        );
        const width = String(start + selected.length).length;
        const body = selected
          .map(
            (line, index) =>
              `${String(start + index + 1).padStart(width)}\t${line}`,
          )
          .join("\n");
        const end = start + selected.length;
        const note =
          end < lines.length || start > 0
            ? `\n[lines ${start + 1}-${end} of ${lines.length}]`
            : "";
        return lines.length ? `${body}${note}` : "(empty file)";
      }),
  });
}

function listFilesTool(selection: "git" | "filesystem") {
  return defineHarnessTool({
    ...(selection === "git" ? { workspace: "git" as const } : {}),
    name: "list_files",
    description:
      selection === "git"
        ? "List files tracked or not ignored by Git, optionally under a directory and filtered by a glob."
        : "List ordinary workspace files without following links or applying Git ignore rules, optionally under a directory and filtered by a glob.",
    readOnly: true,
    input: {
      type: "object",
      properties: {
        path: { type: "string" },
        pattern: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
    },
    resources: (input: ListFilesInput) => ({ paths: [input.path ?? "."] }),
    async execute(input: ListFilesInput, context) {
      const scope = repositoryPath(input.path ?? ".") || ".";
      const invocation =
        selection === "filesystem"
          ? {
              executable: "node",
              arguments: [
                "-e",
                `(function(){${filesystemSelectionScript}})()`,
                "list",
                scope,
                "{}",
              ],
            }
          : {
              executable: "git",
              arguments: [
                "ls-files",
                "-z",
                "--cached",
                "--others",
                "--exclude-standard",
                "--",
                scope,
              ],
            };
      const result = await context.sandbox.invoke({
        ...invocation,
        retain: TOOL_LIMITS.commandCharacters * 10,
        signal: context.signal,
      });
      if (result.status !== 0)
        return {
          content: result.stderr || "File listing failed",
          isError: true,
        };
      const matcher = input.pattern
        ? glob(anywhere(input.pattern), "path")
        : undefined;
      const files = [...new Set(result.stdout.split("\0").filter(Boolean))]
        .filter((file) => !matcher || matcher.test(file))
        .sort();
      const shown = files.slice(0, TOOL_LIMITS.listEntries);
      if (!shown.length) return "No files found.";
      return shown.length < files.length
        ? `${shown.join("\n")}\n[${files.length - shown.length} more files; narrow the path or pattern]`
        : shown.join("\n");
    },
  });
}

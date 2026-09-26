import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineHarnessTool, defineHarnessToolset } from "../../domain/tool.ts";
import type {
  HarnessToolContext,
  HarnessToolset,
} from "../../domain/tool.types.ts";
import {
  digest,
  downloadFile,
  repositoryPath,
  sandboxPath,
  withStaging,
} from "./sandbox-files.ts";
import type { EditFileInput, WriteFileInput } from "./tools.types.ts";

export function harnessEditTools(): HarnessToolset {
  return defineHarnessToolset({
    name: "edit",
    tools: [writeFileTool(), editFileTool()],
  });
}

function writeFileTool() {
  return defineHarnessTool({
    name: "write_file",
    description:
      "Create or replace a UTF-8 file relative to the repository root with the given content. Prefer edit_file to change part of an existing file.",
    input: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1 },
        content: { type: "string" },
      },
      required: ["path", "content"],
      additionalProperties: false,
    },
    resources: (input: WriteFileInput) => ({ paths: [input.path] }),
    execute: (input: WriteFileInput, context) =>
      withStaging(async (directory) => {
        repositoryPath(input.path);
        const staged = join(directory, "file");
        await writeFile(staged, input.content);
        await upload(context, staged, input.path);
        return `Wrote ${Buffer.byteLength(input.content)} bytes to ${input.path}`;
      }),
  });
}

function editFileTool() {
  return defineHarnessTool({
    name: "edit_file",
    description:
      "Replace an exact text in a UTF-8 file. old_text must appear exactly once unless replace_all is true; include surrounding lines to make it unique.",
    input: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1 },
        old_text: { type: "string", minLength: 1 },
        new_text: { type: "string" },
        replace_all: { type: "boolean" },
      },
      required: ["path", "old_text", "new_text"],
      additionalProperties: false,
    },
    resources: (input: EditFileInput) => ({ paths: [input.path] }),
    execute: (input: EditFileInput, context) =>
      withStaging(async (directory) => {
        const original = await downloadFile(
          context,
          input.path,
          join(directory, "file"),
        );
        const text = original.bytes.toString("utf8");
        const occurrences = text.split(input.old_text).length - 1;
        if (occurrences === 0)
          return {
            content: `old_text was not found in ${input.path}`,
            isError: true,
          };
        if (occurrences > 1 && !input.replace_all)
          return {
            content: `old_text appears ${occurrences} times in ${input.path}; add surrounding lines or set replace_all`,
            isError: true,
          };
        const updated = input.replace_all
          ? text.split(input.old_text).join(input.new_text)
          : text.replace(input.old_text, () => input.new_text);
        const current = await downloadFile(
          context,
          input.path,
          join(directory, "current"),
        );
        if (digest(current.bytes) !== digest(original.bytes))
          return {
            content: `${input.path} changed during the edit; read it again and retry`,
            isError: true,
          };
        await writeFile(original.staged, updated);
        await upload(context, original.staged, input.path);
        return `Replaced ${input.replace_all ? occurrences : 1} occurrence(s) in ${input.path}`;
      }),
  });
}

function upload(context: HarnessToolContext, staged: string, path: string) {
  return context.sandbox.upload(staged, sandboxPath(context, path), {
    signal: context.signal,
  });
}

import { invariant } from "../domain/errors.ts";
import type { ScriptedRecipe } from "./scripted-turn.types.ts";

export function validateScriptedPath(path: string): void {
  invariant(
    path.length > 0 &&
      !path.includes("\\") &&
      !path.includes(":") &&
      !path.includes("\0") &&
      !path.startsWith("/") &&
      path
        .split("/")
        .every(
          (part) =>
            part !== "" &&
            part !== "." &&
            part !== ".." &&
            part.toLowerCase() !== ".git" &&
            part.toLowerCase() !== ".outpost",
        ),
    `Invalid scripted commit path: ${path}`,
  );
}

export function readScriptedRecipe(text: string): ScriptedRecipe {
  const value: unknown = JSON.parse(text);
  invariant(
    value !== null && typeof value === "object",
    "Invalid scripted turn",
  );
  invariant(
    "events" in value && Array.isArray(value.events),
    "Invalid scripted events",
  );
  const events: string[] = [];
  for (const event of value.events) {
    invariant(typeof event === "string", "Invalid scripted event");
    events.push(event);
  }
  invariant(
    "status" in value &&
      typeof value.status === "number" &&
      Number.isInteger(value.status) &&
      value.status >= 0 &&
      value.status <= 255,
    "Invalid scripted status",
  );
  invariant(
    "stderr" in value && typeof value.stderr === "string",
    "Invalid scripted stderr",
  );
  const recipe = { events, status: value.status, stderr: value.stderr };
  if (!("commit" in value)) return recipe;
  const commit = value.commit;
  invariant(
    commit !== null &&
      typeof commit === "object" &&
      "message" in commit &&
      typeof commit.message === "string" &&
      commit.message.trim().length > 0,
    "Invalid scripted commit message",
  );
  invariant(
    "files" in commit &&
      commit.files !== null &&
      typeof commit.files === "object" &&
      !Array.isArray(commit.files),
    "Invalid scripted commit files",
  );
  const files: Record<string, string | null> = Object.create(null);
  for (const [path, content] of Object.entries(commit.files)) {
    validateScriptedPath(path);
    invariant(
      content === null || typeof content === "string",
      "Invalid scripted file content",
    );
    files[path] = content;
  }
  invariant(Object.keys(files).length > 0, "Scripted commits require files");
  return { ...recipe, commit: { message: commit.message, files } };
}

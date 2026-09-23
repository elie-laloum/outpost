import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OutpostError } from "../domain/errors.ts";
import type { Variables } from "../domain/ports.ts";

export function parseEnvironment(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(
      /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/,
    );
    if (!match) continue;
    let value = match[2]!;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const double = value.startsWith('"');
      value = value.slice(1, -1);
      if (double)
        value = value
          .replaceAll("\\n", "\n")
          .replaceAll("\\r", "\r")
          .replaceAll('\\"', '"');
    } else value = value.replace(/\s+#.*$/, "").trim();
    result[match[1]!] = value;
  }
  return result;
}

export async function resolveVariables(
  repository: string,
  agent: Variables = {},
  provider: Variables = {},
  environment: NodeJS.ProcessEnv = process.env,
): Promise<Variables> {
  const overlap = Object.keys(agent).filter((key) =>
    Object.hasOwn(provider, key),
  );
  if (overlap.length)
    throw new OutpostError(
      "configuration",
      `Agent and sandbox variables overlap: ${overlap.join(", ")}`,
      { overlap },
    );
  const optional = async (path: string) =>
    readFile(path, "utf8").catch((error) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
      throw error;
    });
  const variables = {
    ...parseEnvironment(await optional(join(repository, ".env"))),
    ...parseEnvironment(await optional(join(repository, ".outpost", ".env"))),
  };
  const known = [
    "CODEX_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "GH_TOKEN",
    "GITHUB_TOKEN",
  ];
  for (const key of new Set([...Object.keys(variables), ...known]))
    if (environment[key] !== undefined) variables[key] = environment[key]!;
  return Object.freeze({ ...variables, ...provider, ...agent });
}

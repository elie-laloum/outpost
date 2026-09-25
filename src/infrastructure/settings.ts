import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Variables } from "../domain/command.types.ts";
import { OutpostError } from "../domain/errors.ts";

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
        value = value.replace(
          /\\([nrt"\\])/g,
          (_, character: string) =>
            ({ n: "\n", r: "\r", t: "\t", '"': '"', "\\": "\\" })[character]!,
        );
    } else value = value.replace(/\s+#.*$/, "").trim();
    result[match[1]!] = value;
  }
  return result;
}

export async function resolveVariables(
  repository: string,
  agent: Variables = {},
  sandboxProvider: Variables = {},
  environment: NodeJS.ProcessEnv = process.env,
): Promise<Variables> {
  const overlap = Object.keys(agent).filter((key) =>
    Object.hasOwn(sandboxProvider, key),
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
    ...parseEnvironment(await optional(join(repository, ".outpost", ".env"))),
  };
  for (const key of Object.keys(variables))
    if (!variables[key] && environment[key] !== undefined)
      variables[key] = environment[key]!;
  return Object.freeze({ ...variables, ...sandboxProvider, ...agent });
}

import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { join } from "node:path";
import type {
  HostCredential,
  HostCredentialPath,
} from "../domain/agent.types.ts";
import { OutpostError } from "../domain/errors.ts";
import { expandPath } from "./files.ts";
import { HOST_CREDENTIAL_LIMIT } from "./host-credentials.constants.ts";

export function resolveHostPath(
  source: HostCredentialPath,
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const home = source.home && environment[source.home.variable];
  return home && source.home
    ? join(expandPath(home), source.home.path)
    : expandPath(source.path);
}

function missing(path: string, credential: HostCredential): OutpostError {
  const alternative = credential.alternative
    ? `, or pass ${credential.alternative}`
    : "";
  return new OutpostError(
    "configuration",
    `Account credentials were not found at ${path}. Run ${credential.login} on the host${alternative}. Outpost reads only this file and never reads the system keychain.`,
    { path },
  );
}

export async function readHostCredential(
  credential: HostCredential,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  const path = resolveHostPath(credential.source, environment);
  const link = await lstat(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT" || error.code === "ENOTDIR")
      throw missing(path, credential);
    throw error;
  });
  if (!link.isFile())
    throw new OutpostError(
      "configuration",
      `Account credentials must be a regular file, not a link or directory: ${path}`,
      { path },
    );
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = await handle.stat();
    if (!info.isFile() || info.size > HOST_CREDENTIAL_LIMIT)
      throw new OutpostError(
        "configuration",
        `Account credentials must be a regular file of at most ${HOST_CREDENTIAL_LIMIT} bytes: ${path}`,
        { path },
      );
    const content = await handle.readFile("utf8");
    return credential.select ? credential.select(content) : content;
  } finally {
    await handle.close();
  }
}

function stringEnd(text: string, start: number): number {
  for (let index = start + 1; index < text.length; index += 1) {
    if (text[index] === '"') return index + 1;
    if (text[index] === "\\") index += 1;
  }
  return text.length;
}

function withoutComments(text: string): string {
  let output = "";
  for (let index = 0; index < text.length; index += 1) {
    const pair = text.slice(index, index + 2);
    if (text[index] === '"') {
      const end = stringEnd(text, index);
      output += text.slice(index, end);
      index = end - 1;
      continue;
    }
    if (pair === "//" || pair === "/*") {
      const end = text.indexOf(pair === "//" ? "\n" : "*/", index + 2);
      index = end === -1 ? text.length : end + (pair === "//" ? -1 : 1);
      output += " ";
      continue;
    }
    output += text[index];
  }
  return output;
}

function withoutTrailingCommas(text: string): string {
  const closing = /\s*[}\]]/y;
  let output = "";
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '"') {
      const end = stringEnd(text, index);
      output += text.slice(index, end);
      index = end - 1;
      continue;
    }
    closing.lastIndex = index + 1;
    if (text[index] === "," && closing.test(text)) continue;
    output += text[index];
  }
  return output;
}

export function parseJsonc(text: string): unknown {
  return JSON.parse(withoutTrailingCommas(withoutComments(text)));
}

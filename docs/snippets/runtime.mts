import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { codex, claude, gemini } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";
import type { LifecycleHooks } from "@elie-laloum/outpost";

const settings = parseEnv(
  await readFile(new URL(".env", import.meta.url), "utf8"),
);
export const repository = resolve(import.meta.dirname, "../repository");
export const variables = Object.fromEntries(
  Object.entries(settings)
    .filter(([name]) => !name.startsWith("OUTPOST_"))
    .map(([name, value]) => [name, value || process.env[name] || ""]),
);

export async function configuration(
  name = settings.OUTPOST_AGENT ?? "codex",
  authentication = settings.OUTPOST_AUTH ?? "api-key",
) {
  const factories = { codex, claude, gemini };
  if (!(name === "codex" || name === "claude" || name === "gemini"))
    throw new Error("Choose codex, claude or gemini");
  const supported = {
    codex: ["api-key", "login"],
    claude: ["api-key", "oauth-token"],
    gemini: ["api-key"],
  };
  if (!supported[name].includes(authentication))
    throw new Error(
      `Unsupported authentication for ${name}: ${authentication}`,
    );
  if (
    name === "codex" &&
    authentication === "login" &&
    variables.OPENAI_API_KEY
  )
    throw new Error(
      "Remove OPENAI_API_KEY when using Codex account authentication",
    );
  let hooks: LifecycleHooks = {};
  if (name === "codex" && authentication === "login") {
    const seed = await readFile(
      resolve(
        process.env.CODEX_HOME || resolve(homedir(), ".codex"),
        "auth.json",
      ),
      "utf8",
    );
    JSON.parse(seed);
    hooks = {
      sandboxReady: [
        {
          executable: "node",
          arguments: [
            "-e",
            'const fs=require("node:fs"),p=require("node:path"),h=require("node:os").homedir();const d=p.join(h,".codex");fs.mkdirSync(d,{recursive:true,mode:0o700});fs.writeFileSync(p.join(d,"auth.json"),fs.readFileSync(0),{mode:0o600});',
          ],
          stdin: seed,
        },
      ],
    };
  } else {
    const keys = {
      codex: "OPENAI_API_KEY",
      claude: "ANTHROPIC_API_KEY",
      gemini: "GEMINI_API_KEY",
    };
    const key =
      name === "claude" && authentication === "oauth-token"
        ? "CLAUDE_CODE_OAUTH_TOKEN"
        : keys[name];
    if (!variables[key]) throw new Error(`Declare ${key} in workflow/.env`);
    if (
      name === "claude" &&
      variables.ANTHROPIC_API_KEY &&
      variables.CLAUDE_CODE_OAUTH_TOKEN
    )
      throw new Error("Choose one Claude authentication method");
    if (name === "codex")
      hooks = {
        sandboxReady: [
          {
            executable: "sh",
            arguments: ["-c", "codex login --with-api-key"],
            stdin: variables.OPENAI_API_KEY,
          },
        ],
      };
  }
  return {
    repository,
    agent: factories[name](),
    provider: docker({ image: "outpost:docs-demo", variables }),
    hooks,
  };
}

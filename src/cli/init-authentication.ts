import type { InitOptions } from "./scaffold.types.ts";
import { authenticationRecipes } from "./init-authentication.constants.ts";

export function authenticationEnvironment(options: InitOptions): string {
  if (options.baseUrl)
    return `${options.apiKeyEnvironment ?? "OPENAI_API_KEY"}=\n`;
  if (options.authentication === "login") return "";
  if (options.authentication === "oauth-token")
    return "CLAUDE_CODE_OAUTH_TOKEN=\n";
  return authenticationRecipes[options.agent ?? "codex"].environment;
}

export function authenticationInstructions(options: InitOptions): string {
  if (options.authentication === "login")
    return "Run codex login on the host. For isolated providers, use file credential storage; the generated script copies auth.json into the private sandbox home.";
  if (options.authentication === "oauth-token")
    return "Run claude setup-token on the host, then set CLAUDE_CODE_OAUTH_TOKEN in the workflow .env or parent environment. This uses your Claude subscription.";
  return (
    "Set " +
    authenticationEnvironment(options).trim().replace("=", "") +
    " in the workflow .env or parent environment. API usage is billed separately from subscriptions."
  );
}

export function authenticationSource(options: InitOptions): string {
  const agent = options.agent ?? "codex";
  if (options.authentication === "login") {
    if (options.provider === "local") return "const authentication = {};";
    return `const seed = await readFile(resolve(process.env.CODEX_HOME || resolve(homedir(), ".codex"), "auth.json"), "utf8");
try { JSON.parse(seed); } catch { throw new Error("Invalid Codex authentication file. Run codex login again with file credential storage."); }
const authentication = { sandboxReady: [{ executable: "node", arguments: ["-e", ${JSON.stringify(authenticationRecipes.codex.seed)}], stdin: seed }] };`;
  }
  const key = authenticationEnvironment(options).trim().replace("=", "");
  const conflict =
    agent === "claude"
      ? key === "ANTHROPIC_API_KEY"
        ? "CLAUDE_CODE_OAUTH_TOKEN"
        : "ANTHROPIC_API_KEY"
      : undefined;
  const check = `if (!variables[${JSON.stringify(key)}]) throw new Error(${JSON.stringify(`Missing ${key}. Configure the workflow .env or parent environment before starting a sandbox.`)});`;
  const guard = conflict
    ? `\nif (variables[${JSON.stringify(conflict)}]) throw new Error("Conflicting Claude authentication methods. Keep only the selected credential in the workflow environment.");`
    : "";
  if (agent !== "codex" || options.baseUrl)
    return `${check}${guard}\nconst authentication = {};`;
  return `${check}\nconst authentication = { sandboxReady: [{ executable: "node", arguments: ["-e", ${JSON.stringify(authenticationRecipes.codex.login)}], stdin: variables.OPENAI_API_KEY }] };`;
}

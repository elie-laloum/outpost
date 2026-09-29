import { codexCredentialVariables, codexLabel } from "./codex.constants.ts";
import {
  hostFile,
  toolCommand,
  variableCredential,
} from "../authentication.ts";
import type { CredentialStrategy } from "../authentication.types.ts";
import { parseCredential } from "../protocol.ts";
import type { CodexModelProvider } from "../settings.types.ts";

const file = hostFile({
  source: {
    path: "~/.codex/auth.json",
    home: { variable: "CODEX_HOME", path: "auth.json" },
  },
  destination: { file: ".codex/auth.json" },
  login: 'codex login with cli_auth_credentials_store = "file"',
  alternative: `"usage" with ${codexCredentialVariables.usage}`,
  select: (content) => {
    parseCredential(content, codexLabel);
    return content;
  },
});

const key = variableCredential({
  variable: codexCredentialVariables.usage,
  expose: (secret) => ({
    commands: [
      toolCommand("codex", ["login", "--with-api-key"], { stdin: secret }),
    ],
  }),
});

function providerCredentials(provider: CodexModelProvider): CredentialStrategy {
  const variable = provider.apiKeyEnvironment ?? codexCredentialVariables.usage;
  if (variable === false) return {};
  const external = variableCredential({ variable });
  return Object.freeze({
    usage: external.preset,
    "usage.key": external.key,
    "usage.variable": external.variable,
  });
}

export function codexCredentials(
  provider: CodexModelProvider | undefined,
): CredentialStrategy {
  if (provider) return providerCredentials(provider);
  return Object.freeze({
    account: file.preset,
    "account.file": file.file,
    usage: key.preset,
    "usage.key": key.key,
    "usage.variable": key.variable,
  });
}

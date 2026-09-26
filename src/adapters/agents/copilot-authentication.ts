import { invariant, OutpostError } from "../../domain/errors.ts";
import { parseJsonc } from "../../infrastructure/host-credentials.ts";
import { credentialVariables } from "./authentication.constants.ts";
import { hostFile, variableCredential } from "./authentication.ts";
import type { CredentialStrategy } from "./authentication.types.ts";
import { asRecord } from "./protocol.ts";

const variable = credentialVariables.copilot.account;

function acceptToken(token: string): void {
  invariant(
    !token.startsWith("ghp_"),
    "GitHub Copilot CLI rejects classic personal access tokens (ghp_). Use copilot login or a fine-grained token with the Copilot Requests permission.",
  );
}

function parseConfiguration(content: string): Record<string, unknown> {
  try {
    return asRecord(parseJsonc(content));
  } catch {
    throw new OutpostError(
      "configuration",
      "The Copilot config.json file is not valid JSON",
    );
  }
}

function storedToken(content: string): string {
  const configuration = parseConfiguration(content);
  const user = asRecord(configuration.lastLoggedInUser);
  const token =
    typeof user.host === "string" && typeof user.login === "string"
      ? asRecord(configuration.authTokens)[`${user.host}:${user.login}`]
      : undefined;
  invariant(
    typeof token === "string" && token !== "",
    `Copilot config.json stores no token for the last logged-in user. Copilot keeps tokens in the system keychain by default, which Outpost never reads: pass { account: { variable: "${variable}" } } instead.`,
  );
  acceptToken(token);
  return token;
}

const file = hostFile({
  source: {
    path: "~/.copilot/config.json",
    home: { variable: "COPILOT_HOME", path: "config.json" },
  },
  destination: { variable },
  login: "copilot login",
  alternative: `{ account: { variable: "${variable}" } }`,
  select: storedToken,
});

const token = variableCredential({ variable, accept: acceptToken });

export const copilotCredentials: CredentialStrategy = Object.freeze({
  account: file.preset,
  "account.file": file.file,
  "account.key": token.key,
  "account.variable": token.variable,
});

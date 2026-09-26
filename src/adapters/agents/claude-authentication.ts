import { invariant } from "../../domain/errors.ts";
import { credentialVariables } from "./authentication.constants.ts";
import { excluding, hostFile, variableCredential } from "./authentication.ts";
import type {
  CredentialRecipe,
  CredentialStrategy,
} from "./authentication.types.ts";
import { asRecord, parseCredential } from "./protocol.ts";

const { account: tokenVariable, usage: keyVariable } =
  credentialVariables.claude;
const token = variableCredential({ variable: tokenVariable });
const key = variableCredential({ variable: keyVariable });

function subscription(content: string): string {
  const login = asRecord(parseCredential(content, "Claude")).claudeAiOauth;
  invariant(
    login && typeof login === "object",
    "The Claude credential file has no claudeAiOauth subscription login",
  );
  return JSON.stringify({ claudeAiOauth: login });
}

const file = hostFile({
  source: {
    path: "~/.claude/.credentials.json",
    home: { variable: "CLAUDE_CONFIG_DIR", path: ".credentials.json" },
  },
  destination: { file: ".claude/.credentials.json" },
  login: "claude and /login",
  alternative: `{ account: { variable: "${tokenVariable}" } } with a token from claude setup-token`,
  select: subscription,
});

const account = (recipe: CredentialRecipe) =>
  excluding(
    recipe,
    keyVariable,
    `Conflicting Claude authentication: ${keyVariable} takes precedence over account credentials. Remove it or select usage authentication.`,
  );
const usage = (recipe: CredentialRecipe) =>
  excluding(
    recipe,
    tokenVariable,
    `Conflicting Claude authentication: remove ${tokenVariable} or select account authentication.`,
  );

export const claudeCredentials: CredentialStrategy = Object.freeze({
  account: account(file.preset),
  "account.file": account(file.file),
  "account.key": account(token.key),
  "account.variable": account(token.variable),
  usage: usage(key.preset),
  "usage.key": usage(key.key),
  "usage.variable": usage(key.variable),
});

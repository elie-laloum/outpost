import {
  credentialRecipes,
  credentialVariables,
} from "./authentication.constants.ts";
import { hostFile, variableCredential } from "./authentication.ts";
import type { CredentialStrategy } from "./authentication.types.ts";

const file = hostFile({
  source: { path: "~/.gemini/antigravity-cli/antigravity-oauth-token" },
  destination: { file: ".gemini/antigravity-cli/antigravity-oauth-token" },
  login: "agy and sign in with your Google account",
  alternative: `"usage" with ${credentialVariables.antigravity.usage}`,
});

const key = variableCredential({
  variable: credentialVariables.antigravity.usage,
  expose: () => ({
    files: [
      {
        path: ".gemini/antigravity-cli/settings.json",
        content: credentialRecipes.antigravitySettings,
      },
    ],
  }),
});

export const antigravityCredentials: CredentialStrategy = Object.freeze({
  account: file.preset,
  "account.file": file.file,
  usage: key.preset,
  "usage.key": key.key,
  "usage.variable": key.variable,
});

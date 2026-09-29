import {
  antigravityCredentialVariables,
  antigravitySettingsFile,
} from "./antigravity.constants.ts";
import { hostFile, variableCredential } from "../authentication.ts";
import type { CredentialStrategy } from "../authentication.types.ts";

const file = hostFile({
  source: { path: "~/.gemini/antigravity-cli/antigravity-oauth-token" },
  destination: { file: ".gemini/antigravity-cli/antigravity-oauth-token" },
  login: "agy and sign in with your Google account",
  alternative: `"usage" with ${antigravityCredentialVariables.usage}`,
});

const key = variableCredential({
  variable: antigravityCredentialVariables.usage,
  expose: () => ({
    files: [
      {
        path: ".gemini/antigravity-cli/settings.json",
        content: antigravitySettingsFile,
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

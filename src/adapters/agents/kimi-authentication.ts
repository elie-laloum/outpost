import { join, posix } from "node:path";
import type { HostCredentialPath } from "../../domain/agent.types.ts";
import { invariant } from "../../domain/errors.ts";
import {
  KIMI_LOGIN_DEADLINE_MS,
  credentialVariables,
} from "./authentication.constants.ts";
import {
  credentialPlan,
  toolCommand,
  variableCredential,
} from "./authentication.ts";
import type {
  CredentialInput,
  CredentialPlanner,
  CredentialStrategy,
} from "./authentication.types.ts";

const profileFiles = [
  ["credentials", "kimi-code.json"],
  ["device_id"],
] as const;

function profile(
  root: (path: string) => HostCredentialPath,
): CredentialPlanner {
  return () =>
    credentialPlan({
      host: profileFiles.map((parts) => ({
        source: root(join(...parts)),
        destination: { file: posix.join(".kimi-code", ...parts) },
        login: "kimi login",
        alternative: `"usage" with ${credentialVariables.kimi.usage} and a model`,
      })),
      commands: [
        toolCommand("kimi", ["login"], { deadlineMs: KIMI_LOGIN_DEADLINE_MS }),
      ],
    });
}

function modelName(input: CredentialInput): string {
  const name = input.model?.name;
  invariant(
    name,
    "Kimi Code usage authentication requires a model name on agent()",
  );
  return name;
}

const key = variableCredential({
  variable: credentialVariables.kimi.usage,
  bind: modelName,
  expose: (secret, input) => ({
    variables: {
      KIMI_MODEL_API_KEY: secret,
      KIMI_MODEL_PROVIDER_TYPE: "kimi",
      KIMI_MODEL_NAME: modelName(input),
    },
  }),
});

export const kimiCredentials: CredentialStrategy = Object.freeze({
  account: () =>
    profile((path) => ({
      path: join("~/.kimi-code", path),
      home: { variable: "KIMI_CODE_HOME", path },
    })),
  "account.file": (input) =>
    profile((path) => ({ path: join(input.value, path) })),
  usage: key.preset,
  "usage.key": key.key,
  "usage.variable": key.variable,
});

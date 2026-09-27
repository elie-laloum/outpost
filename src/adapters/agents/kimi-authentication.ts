import { join, posix } from "node:path";
import { DEFAULT_KIMI_REGION, kimiRegions } from "./kimi.constants.ts";
import type { KimiSettings } from "./kimi.types.ts";
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

function profile(
  root: (path: string) => HostCredentialPath,
  region: NonNullable<KimiSettings["region"]>,
): CredentialPlanner {
  const selected = kimiRegions[region];
  const profileFiles = [["credentials", selected.credential], ["device_id"]];
  return (variables) => {
    for (const [name, expected] of [
      ["KIMI_CODE_OAUTH_HOST", selected.oauthHost],
      ["KIMI_OAUTH_HOST", selected.oauthHost],
      ["KIMI_CODE_BASE_URL", selected.baseUrl],
    ] as const)
      invariant(
        !variables[name] || variables[name]?.replace(/\/+$/, "") === expected,
        `Kimi ${name} conflicts with account region "${region}"`,
      );
    return credentialPlan({
      variables: {
        KIMI_CODE_OAUTH_HOST: selected.oauthHost,
        KIMI_CODE_BASE_URL: selected.baseUrl,
      },
      host: profileFiles.map((parts) => ({
        source: root(join(...parts)),
        destination: { file: posix.join(".kimi-code", ...parts) },
        login: `kimi login --region ${region}`,
        alternative: `"usage" with ${credentialVariables.kimi.usage} and a model`,
      })),
      commands: [
        toolCommand("kimi", ["login", "--region", region], {
          deadlineMs: KIMI_LOGIN_DEADLINE_MS,
        }),
      ],
    });
  };
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

export function kimiCredentials(
  region: NonNullable<KimiSettings["region"]> = DEFAULT_KIMI_REGION,
): CredentialStrategy {
  return Object.freeze({
    account: () =>
      profile(
        (path) => ({
          path: join("~/.kimi-code", path),
          home: { variable: "KIMI_CODE_HOME", path },
        }),
        region,
      ),
    "account.file": (input) =>
      profile((path) => ({ path: join(input.value, path) }), region),
    usage: key.preset,
    "usage.key": key.key,
    "usage.variable": key.variable,
  });
}

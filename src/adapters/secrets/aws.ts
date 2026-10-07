import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { invariant, OutpostError } from "../../domain/errors.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { mappedSecretSource, secretText } from "./secret-source.ts";
import type { AwsSecretSourceOptions } from "./aws.types.ts";

export type {
  AwsSecretSourceOptions,
  AwsSecretReference,
} from "./aws.types.ts";

export function createAwsSecretSource(
  options: AwsSecretSourceOptions,
): SecretSource {
  invariant(
    typeof options.client?.send === "function",
    "AWS secret client must provide send",
  );
  const secrets = Object.fromEntries(
    Object.entries(options.secrets).map(([key, ref]) => {
      secretText(ref.id, "AWS secret id");
      for (const value of [ref.field, ref.versionId, ref.versionStage])
        if (value !== undefined) secretText(value, "AWS secret selector");
      return [key, Object.freeze({ ...ref })];
    }),
  );
  const client = options.client;
  return mappedSecretSource(
    "aws-secrets-manager",
    secrets,
    async (reference, settings) => {
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: reference.id,
          ...(reference.versionId === undefined
            ? {}
            : { VersionId: reference.versionId }),
          ...(reference.versionStage === undefined
            ? {}
            : { VersionStage: reference.versionStage }),
        }),
        settings.signal ? { abortSignal: settings.signal } : {},
      );
      if (typeof response.SecretString !== "string")
        throw new OutpostError(
          "provider",
          "AWS secret must contain SecretString",
        );
      if (reference.field === undefined) return response.SecretString;
      let document: unknown;
      try {
        document = JSON.parse(response.SecretString);
      } catch {
        throw new OutpostError(
          "provider",
          "AWS secret field requires a JSON object",
        );
      }
      if (
        !document ||
        typeof document !== "object" ||
        Array.isArray(document) ||
        !Object.hasOwn(document, reference.field)
      )
        throw new OutpostError("provider", "AWS secret JSON field is missing");
      return Reflect.get(document, reference.field);
    },
  );
}

import { invariant, OutpostError } from "../../domain/errors.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { mappedSecretSource, secretText } from "./secret-source.ts";
import type { GcpSecretSourceOptions } from "./gcp.types.ts";

export type { GcpSecretSourceOptions } from "./gcp.types.ts";

export function createGcpSecretSource(
  options: GcpSecretSourceOptions,
): SecretSource {
  invariant(
    typeof options.client?.accessSecretVersion === "function",
    "GCP secret client must provide accessSecretVersion",
  );
  for (const ref of Object.values(options.secrets)) {
    secretText(ref, "GCP secret version");
    invariant(
      /^projects\/[^/]+\/(?:locations\/[^/]+\/)?secrets\/[^/]+\/versions\/(?:latest|[1-9][0-9]*)$/.test(
        ref,
      ),
      "GCP secret reference must name a full version resource",
    );
  }
  const client = options.client;
  return mappedSecretSource(
    "gcp-secret-manager",
    options.secrets,
    async (reference) => {
      const [response] = await client.accessSecretVersion({ name: reference });
      const data = response.payload?.data;
      if (!(data instanceof Uint8Array) && typeof data !== "string")
        throw new OutpostError("provider", "GCP secret payload is missing");
      try {
        const bytes =
          typeof data === "string"
            ? Buffer.from(data, "base64")
            : Buffer.from(data);
        if (typeof data === "string" && bytes.toString("base64") !== data)
          throw new OutpostError(
            "provider",
            "GCP secret payload must be valid base64",
          );
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        throw new OutpostError(
          "provider",
          "GCP secret payload must be UTF-8 text",
        );
      }
    },
  );
}

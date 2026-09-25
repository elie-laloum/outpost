import { invariant } from "../../domain/errors.ts";
import type { Bound, CodexSettings } from "./settings.types.ts";

export function codexProvider(
  settings: Bound<CodexSettings>,
): readonly string[] {
  const provider = settings.modelProvider;
  if (!provider) return [];
  invariant(
    settings.model?.name.trim(),
    "A custom model provider requires a model name",
  );
  let url: URL;
  try {
    url = new URL(provider.baseUrl);
  } catch {
    throw new Error("Model provider baseUrl must be an absolute HTTP(S) URL");
  }
  invariant(
    ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
    "Model provider baseUrl must use HTTP(S) without embedded credentials, query or fragment",
  );
  const environment = provider.apiKeyEnvironment ?? "OPENAI_API_KEY";
  invariant(
    environment === false || /^[A-Za-z_][A-Za-z0-9_]*$/.test(environment),
    "Invalid model provider API-key environment variable",
  );
  const configuration = [
    'model_provider="outpost_compatible"',
    'model_providers.outpost_compatible.name="OpenAI compatible"',
    `model_providers.outpost_compatible.base_url=${JSON.stringify(provider.baseUrl)}`,
    'model_providers.outpost_compatible.wire_api="responses"',
    "model_providers.outpost_compatible.requires_openai_auth=false",
  ];
  if (environment !== false)
    configuration.push(
      `model_providers.outpost_compatible.env_key=${JSON.stringify(environment)}`,
    );
  return configuration.flatMap((value) => ["-c", value]);
}

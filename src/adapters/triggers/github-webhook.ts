import { payloadString, triggerEvent } from "../../domain/trigger.ts";
import type {
  TriggerHttpRequest,
  TriggerSource,
} from "../../domain/trigger.types.ts";
import {
  header,
  signatureMatches,
  webhookSecret,
} from "../../infrastructure/webhook-signature.ts";
import { formBody, jsonBody, textBody } from "./trigger-body.ts";
import type { GithubWebhookOptions } from "./triggers.types.ts";

function githubPayload(request: TriggerHttpRequest) {
  const form = request.headers["content-type"]?.startsWith(
    "application/x-www-form-urlencoded",
  );
  if (!form) return jsonBody(textBody(request.body));
  const payload = formBody(request.body).get("payload");
  if (payload === null) throw new Error("Missing GitHub form payload");
  return jsonBody(payload);
}

/** Receive GitHub webhooks signed with `X-Hub-Signature-256`. */
export function githubWebhook(options: GithubWebhookOptions): TriggerSource {
  const secrets = webhookSecret(options.secret, "GitHub webhook");
  return Object.freeze({
    name: "github",
    async verify(request: TriggerHttpRequest, now: number) {
      const signature = header(request.headers, "x-hub-signature-256");
      const digest = /^sha256=[0-9a-f]{64}$/i.test(signature)
        ? Buffer.from(signature.slice(7), "hex")
        : undefined;
      if (
        !digest ||
        !signatureMatches(await secrets(), [request.body], [digest])
      )
        throw new Error("GitHub signature mismatch");
      const payload = githubPayload(request);
      const action = payloadString(payload, "action");
      const login = payloadString(payload, "sender", "login");
      return triggerEvent({
        source: "github",
        delivery: header(request.headers, "x-github-delivery"),
        kind: header(request.headers, "x-github-event"),
        ...(action ? { action } : {}),
        ...(login ? { actor: `github:${login}` } : {}),
        payload,
        receivedAt: new Date(now).toISOString(),
      });
    },
  });
}

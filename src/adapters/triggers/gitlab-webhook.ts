import { triggerDefaultToleranceMs } from "../../domain/trigger.constants.ts";
import { payloadString, triggerEvent } from "../../domain/trigger.ts";
import type {
  TriggerHttpRequest,
  TriggerSource,
} from "../../domain/trigger.types.ts";
import {
  header,
  sameBytes,
  webhookSecret,
} from "../../infrastructure/webhook-signature.ts";
import { standardVerifier } from "./standard-webhook.ts";
import { jsonBody, textBody, toleranceMs } from "./trigger-body.ts";
import type {
  DeliveryVerifier,
  GitlabSigningOptions,
  GitlabTokenOptions,
  GitlabWebhookOptions,
} from "./triggers.types.ts";

function signedDelivery(options: GitlabSigningOptions): DeliveryVerifier {
  return standardVerifier(
    options.signingToken,
    toleranceMs(options.toleranceMs, triggerDefaultToleranceMs),
  );
}

function tokenDelivery(options: GitlabTokenOptions): DeliveryVerifier {
  const secrets = webhookSecret(options.token, "GitLab webhook");
  return async (request) => {
    const supplied = Buffer.from(header(request.headers, "x-gitlab-token"));
    let matched = false;
    for (const token of await secrets())
      matched = sameBytes(supplied, Buffer.from(token)) || matched;
    if (!matched) throw new Error("GitLab token mismatch");
    return (
      request.headers["idempotency-key"] ??
      header(request.headers, "x-gitlab-event-uuid")
    );
  };
}

/** Receive GitLab webhooks, preferably verified with a signing token. */
export function createGitlabWebhook(
  options: GitlabWebhookOptions,
): TriggerSource {
  const delivery =
    "signingToken" in options
      ? signedDelivery(options)
      : tokenDelivery(options);
  return Object.freeze({
    name: "gitlab",
    async verify(request: TriggerHttpRequest, now: number) {
      const id = await delivery(request, now);
      const payload = jsonBody(textBody(request.body));
      const action = payloadString(payload, "object_attributes", "action");
      const username =
        payloadString(payload, "user", "username") ??
        payloadString(payload, "user_username");
      return triggerEvent({
        source: "gitlab",
        delivery: id,
        kind:
          payloadString(payload, "object_kind") ??
          header(request.headers, "x-gitlab-event"),
        ...(action ? { action } : {}),
        ...(username ? { actor: `gitlab:${username}` } : {}),
        payload,
        receivedAt: new Date(now).toISOString(),
      });
    },
  });
}

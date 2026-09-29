import { triggerDefaultToleranceMs } from "../../domain/trigger.constants.ts";
import {
  payloadString,
  triggerDelivery,
  triggerEvent,
} from "../../domain/trigger.ts";
import type {
  TriggerHttpRequest,
  TriggerSecret,
  TriggerSource,
} from "../../domain/trigger.types.ts";
import {
  header,
  signatureMatches,
  timestampWithin,
  webhookSecret,
} from "../../infrastructure/webhook-signature.ts";
import { jsonBody, textBody, toleranceMs } from "./trigger-body.ts";
import type { StandardWebhookOptions } from "./triggers.types.ts";

function signingKey(secret: string): Buffer {
  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.alloc(0);
  if (!key.length)
    throw new Error("Signing secrets must use the whsec_ format");
  return key;
}

/** Verifies a Standard Webhooks signature and returns the message identifier. */
export function standardVerifier(secret: TriggerSecret, tolerance: number) {
  const secrets = webhookSecret(secret, "Standard webhook");
  return async (request: TriggerHttpRequest, now: number): Promise<string> => {
    const delivery = triggerDelivery(header(request.headers, "webhook-id"));
    const timestamp = header(request.headers, "webhook-timestamp");
    timestampWithin(timestamp, now, tolerance);
    const signatures = header(request.headers, "webhook-signature")
      .split(" ")
      .filter((value) => value.startsWith("v1,"))
      .map((value) => Buffer.from(value.slice(3), "base64"));
    const keys = (await secrets()).map(signingKey);
    if (
      !signatures.length ||
      !signatureMatches(
        keys,
        [`${delivery}.${timestamp}.`, request.body],
        signatures,
      )
    )
      throw new Error("Webhook signature mismatch");
    return delivery;
  };
}

/** Receive webhooks signed with the Standard Webhooks scheme. */
export function standardWebhook(
  options: StandardWebhookOptions,
): TriggerSource {
  const source = options.source ?? "standard";
  const verify = standardVerifier(
    options.secret,
    toleranceMs(options.toleranceMs, triggerDefaultToleranceMs),
  );
  return Object.freeze({
    name: source,
    async verify(request: TriggerHttpRequest, now: number) {
      const delivery = await verify(request, now);
      const payload = jsonBody(textBody(request.body));
      return triggerEvent({
        source,
        delivery,
        kind: payloadString(payload, "type") ?? "webhook",
        payload,
        receivedAt: new Date(now).toISOString(),
      });
    },
  });
}

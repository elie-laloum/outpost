import { triggerDefaultToleranceMs } from "../../domain/trigger.constants.ts";
import { payloadString, triggerEvent } from "../../domain/trigger.ts";
import type {
  TriggerHttpRequest,
  TriggerSource,
} from "../../domain/trigger.types.ts";
import {
  header,
  signatureMatches,
  timestampWithin,
  webhookSecret,
} from "../../infrastructure/webhook-signature.ts";
import { formBody, jsonBody, toleranceMs } from "./trigger-body.ts";
import type { SlackRequestOptions } from "./triggers.types.ts";

function slackPayload(request: TriggerHttpRequest) {
  const form = formBody(request.body);
  const interaction = form.get("payload");
  if (interaction !== null) {
    const payload = jsonBody(interaction);
    return {
      payload,
      kind: payloadString(payload, "type") ?? "interaction",
      user: payloadString(payload, "user", "id"),
      delivery: payloadString(payload, "trigger_id"),
    };
  }
  const command = form.get("command") ?? undefined;
  return {
    payload: Object.fromEntries(form),
    kind: "command",
    ...(command ? { action: command } : {}),
    user: form.get("user_id") ?? undefined,
    delivery: form.get("trigger_id") ?? undefined,
  };
}

/** Receive Slack slash commands and interactions signed with `X-Slack-Signature`. */
export function createSlackSource(options: SlackRequestOptions): TriggerSource {
  const secrets = webhookSecret(options.signingSecret, "Slack");
  const tolerance = toleranceMs(options.toleranceMs, triggerDefaultToleranceMs);
  return Object.freeze({
    name: "slack",
    async verify(request: TriggerHttpRequest, now: number) {
      const timestamp = header(request.headers, "x-slack-request-timestamp");
      timestampWithin(timestamp, now, tolerance);
      const signature = header(request.headers, "x-slack-signature");
      const digest = /^v0=[0-9a-f]{64}$/i.test(signature)
        ? Buffer.from(signature.slice(3), "hex")
        : undefined;
      if (
        !digest ||
        !signatureMatches(
          await secrets(),
          [`v0:${timestamp}:`, request.body],
          [digest],
        )
      )
        throw new Error("Slack signature mismatch");
      const { user, delivery, ...event } = slackPayload(request);
      return triggerEvent({
        source: "slack",
        ...event,
        delivery: delivery ?? "",
        ...(user ? { actor: `slack:${user}` } : {}),
        receivedAt: new Date(now).toISOString(),
      });
    },
    /** Slack expects HTTP 200 within three seconds; an empty body sends no message. */
    reply: () => ({ status: 200 }),
  });
}

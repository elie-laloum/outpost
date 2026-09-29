import type { SteeringInbox } from "../domain/steering.types.ts";
import type { HarnessSteering } from "./harness.types.ts";

/** Routes steering to built-in loops: untargeted to any, null to the main loop, ids to subagents. */
export function harnessSteering(inbox: SteeringInbox): HarnessSteering {
  return {
    take(subagent) {
      const messages = inbox.take(
        (message) =>
          message.subagent === undefined ||
          message.subagent === (subagent ?? null),
      );
      for (const message of messages) message.deliver({ mode: "injected" });
      return messages.map((message) => message.text);
    },
    finish(subagent) {
      inbox.reject(
        (message) => message.subagent === subagent,
        "The subagent finished before the message was delivered",
      );
    },
  };
}

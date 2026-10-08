import { jsonBytes, jsonObject } from "../../infrastructure/transport-json.ts";
import { recipeObject } from "../../domain/recipes/values.ts";
import {
  addUsage,
  usageDifference,
  validateUsage,
} from "../../domain/usage.ts";
import type { Usage } from "../../domain/agent.types.ts";
import type { TaskContext } from "../../domain/workflow.types.ts";
import type { Transport } from "../../domain/transport.types.ts";

export function recipeSpeculationTransport(
  transporter: Transport,
  context: TaskContext,
): Transport {
  let entries: Usage[] = [];
  let total: Usage = { input: 0, cached: 0, output: 0 };
  const delivered = new Set<string>();
  return {
    name: transporter.name,
    list: (...arguments_) => transporter.list(...arguments_),
    remove: (...arguments_) => transporter.remove(...arguments_),
    async read(key, options) {
      const object = await transporter.read(key, options);
      const envelope = jsonObject(object);
      if (recipeObject(envelope) && recipeObject(envelope.state)) {
        const saved = envelope.state.recipeUsage;
        if (!Array.isArray(saved))
          throw new Error(
            "Durable recipe speculation is missing its usage ledger",
          );
        entries = saved.map((value) => {
          validateUsage(value);
          return value;
        });
        total = entries.reduce(addUsage, { input: 0, cached: 0, output: 0 });
        if (
          !recipeObject(envelope.state.usage) ||
          JSON.stringify(total) !== JSON.stringify(envelope.state.usage.tokens)
        )
          throw new Error("Invalid recipe speculation usage ledger");
      }
      return object;
    },
    async write(key, bytes, options) {
      const envelope: unknown = JSON.parse(Buffer.from(bytes).toString("utf8"));
      if (!recipeObject(envelope) || !recipeObject(envelope.state))
        return transporter.write(key, bytes, options);
      const state = envelope.state;
      if (!recipeObject(state.usage) || typeof state.id !== "string")
        throw new Error("Invalid speculation usage checkpoint");
      const next = state.usage.tokens;
      validateUsage(next);
      if (JSON.stringify(total) !== JSON.stringify(next)) {
        const delta = usageDifference(next, total);
        const combined = addUsage(total, delta);
        if (JSON.stringify(combined) !== JSON.stringify(next))
          throw new Error("Recipe speculation usage must be cumulative");
        entries = [...entries, delta];
        total = combined;
      }
      const encoded = jsonBytes({
        ...envelope,
        state: { ...state, recipeUsage: entries },
      });
      if (encoded.byteLength > 16 * 1024 * 1024)
        throw new Error("Recipe speculation checkpoint exceeds 16 MiB");
      const result = await transporter.write(key, encoded, options);
      for (const [index, usage] of entries.entries()) {
        const receipt = `speculation:${state.id}:${index}`;
        if (delivered.has(receipt)) continue;
        if (context.reportUsageOnce) context.reportUsageOnce(receipt, usage);
        else context.reportUsage(usage);
        delivered.add(receipt);
      }
      await context.checkpoint?.();
      return result;
    },
  };
}

import { stripVTControlCharacters } from "node:util";
import type { ObservationSink } from "@elie-laloum/outpost";

export function createProgressObserver(): ObservationSink {
  const answers = new Map<string, string>();
  const streaming = new Set<string>();
  const write = (text: string) =>
    process.stderr.write(`${stripVTControlCharacters(text)}\n`);
  return {
    observe({ event, scope }) {
      const key = scope.taskKey ?? "run";
      if (event.kind === "workflow") {
        const entry = event.event;
        if (entry.type === "task" && entry.status)
          write(
            `[${entry.key}] ${entry.status}${entry.durationMs === undefined ? "" : ` · ${(entry.durationMs / 1000).toFixed(1)}s`}`,
          );
        if (entry.type === "finish") {
          const usage = entry.accounting;
          write(
            `[run] ${entry.status} · ${usage?.attempts ?? 0} attempts · tokens: ${usage?.tokens.input ?? 0} input / ${usage?.tokens.output ?? 0} output`,
          );
        }
        return;
      }
      if (event.kind === "operation" && event.status === "failed")
        write(`[${key}] Operation failed: ${event.name}`);
      if (event.kind === "tool") write(`[${key}] Tool: ${event.name}`);
      if (event.kind === "dispatch-start") {
        answers.delete(key);
        streaming.delete(key);
      }
      if (key === "summary") {
        if (event.kind === "text-delta") {
          answers.set(key, (answers.get(key) ?? "") + event.text);
          streaming.add(key);
        }
        if (event.kind === "text" && !streaming.has(key))
          answers.set(key, event.text);
        if (event.kind === "result" && !answers.has(key))
          answers.set(key, event.text);
        if (event.kind === "dispatch-finished" && answers.has(key))
          write(`\n--- Summary ---\n${answers.get(key)}\n`);
      }
      if (event.kind === "dispatch-finished")
        write(
          `[${key}] ${event.status} · ${event.commits?.length ?? 0} commits · tokens ${event.usage.input}/${event.usage.output}`,
        );
    },
  };
}

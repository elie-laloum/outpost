import type { TaskContext } from "../../dist/index.js";

export function identity(_input: unknown, context: TaskContext) {
  const dialogue = context.interaction;
  if (!dialogue) throw new Error("This task requires a durable interaction");
  if (!dialogue.answer)
    dialogue.suspend({ question: "What is your name?" }, null);
  return { name: dialogue.answer.value };
}

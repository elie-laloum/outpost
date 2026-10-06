// System One decisions — typed choices, scores and yes/no probabilities through Laya or Jev.
// This demo needs only the decision server: no sandbox or conversational model.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createSystemOneDecisionProvider,
  decide,
  defineDecision,
  defineDecisionTask,
  defineTask,
  defineWorkflow,
} from "@elie-laloum/outpost";

const provider = createSystemOneDecisionProvider({
  baseUrl: process.env.LAYA_BASE_URL ?? "http://127.0.0.1:8000/v1",
  apiKey: process.env.LAYA_API_KEY ?? false,
});
const model = process.env.LAYA_MODEL ?? "english";
const ticket =
  process.argv.slice(2).join(" ") ||
  (await readFile(join(import.meta.dirname, "ticket.md"), "utf8"));

// 1. One declaration answers three questions, preserving literal choice types.
const triage = defineDecision({
  questions: {
    route: {
      type: "choice",
      instructions:
        "Choose the model depth needed to handle this coding ticket.",
      criteria: {
        fast: "A simple documentation edit or a straightforward small fix.",
        deep: "Complex debugging, architectural changes or multi-step reasoning.",
      },
    },
    difficulty: {
      type: "score",
      instructions: "Assess the difficulty of the requested change.",
      criteria: ["Routine", "Moderate", "Complex"],
    },
    readOnly: {
      type: "noul",
      instructions: "Can the request be completed without modifying any files?",
      criteria: {
        true: "Only inspect or explain the existing code.",
        false: "Edit files to implement or fix something.",
      },
    },
  },
});

console.log("1. décision directe");
console.log("  ticket :", ticket.trim());
const result = await decide({
  provider,
  model,
  decision: triage,
  state: ticket,
});
const route: "fast" | "deep" = result.answers.route.choice;
console.log("  route :", route);
console.log("  confiance native :", result.answers.route.confidence);
console.log("  distribution :", result.answers.route.probabilities);
console.log("  difficulté (0–2) :", result.answers.difficulty.score);
console.log("  probabilité de lecture seule :", result.answers.readOnly.noul);
console.log("  modèle utilisé :", result.model);
console.log("  usage :", result.usage);
console.log("  troncature signalée :", result.truncated ?? "non renseignée");
console.log("  métadonnées natives :", result.metadata);

// 2. A dependency supplies JSON state; the decision task allocates no sandbox.
const input = defineTask({
  key: "input",
  perform: () => ({ ticket }),
});
const classify = defineDecisionTask({
  key: "triage",
  after: [input],
  provider,
  model,
  decision: triage,
  state: (context) => context.value(input),
  timeoutMs: 120_000,
});
const report = defineTask({
  key: "report",
  after: [classify],
  perform: (context) => {
    const answers = context.value(classify).answers;
    return {
      route: answers.route.choice,
      difficulty: answers.difficulty.score,
      readOnlyProbability: answers.readOnly.noul,
    };
  },
});

console.log("\n2. décision dans un workflow");
const workflow = defineWorkflow("system-one-triage", [input, classify, report]);
console.log(workflow.diagram());
const run = await workflow.start();
run.unwrap();
console.log("  rapport :", run.value(report));
console.log("  usage du workflow :", run.usage);

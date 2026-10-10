---
title: "Clarifier et approuver une modification"
description: "Préciser le besoin, examiner le plan et enregistrer une décision humaine."
---

Cet exemple transforme un ticket en plan à relire avant d’autoriser la réalisation. L’agent pose les questions nécessaires ; une étape d’approbation distincte décide si le travail peut continuer. Ce workflow ne comporte aucune étape de réalisation.

Utilisez la [configuration de l’agent](../setup/) et installez le validateur avec `npm install zod`. Enregistrez tous les fichiers ci-dessous dans un même dossier de scripts. Remplacez le ticket par une tâche de votre projet et changez sa clé pour chaque nouvelle exécution.

[Télécharger tous les fichiers](../../../guide-examples/fr/plan-a-change.tar.gz). Extrayez l’archive dans un dossier dédié, lancez `npm install`, puis adaptez `outpost.config.ts` selon [Installation](../setup/). Les commandes ci-dessous indiquent les scripts à exécuter.

## Clarifier le ticket et approuver le plan

Commencez par le ticket, le format du plan attendu et l’étape d’approbation.

<!-- tabs -->

```ts title="ticket.ts"
import { z } from "zod";

export const ticket = {
  key: "SHOP-142",
  text: "Add a CSV export to the orders list.",
};
export const planSchema = z.object({
  summary: z.string().min(1),
  tests: z.array(z.string()).min(1),
  code: z.array(z.string()).min(1),
});
```

```ts title="frame.ts"
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
import { repository, coder, sandboxProvider } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const frame = defineInteractiveAgentTask({
  key: "frame",
  repository,
  agent: coder,
  sandboxProvider,
  brief: [
    `Ticket ${ticket.key}: ${ticket.text}`,
    "Read the code without editing or committing. Then ask the owner about what the ticket leaves open, one point at a time.",
    'When nothing is ambiguous, complete with {"summary": string, "tests": string[], "code": string[]}:',
    "the behaviors to test, then the changes to make.",
  ].join("\n"),
  actors: ["owner"],
  maxTurns: 10,
});
```

```ts title="plan.ts"
import { defineTask } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { planSchema } from "./ticket.ts";

export const plan = defineTask({
  key: "plan",
  after: [frame],
  perform: (context) => planSchema.parse(context.value(frame).output),
});
```

```ts title="approval.ts"
import { defineApprovalTask } from "@elie-laloum/outpost";
import { plan } from "./plan.ts";
import { ticket } from "./ticket.ts";

export const review = defineApprovalTask({
  key: "review",
  after: [plan],
  prompt: `Deliver this plan for ${ticket.key}?`,
  actors: ["owner"],
});
```

## Enregistrer la progression et démarrer

Le checkpoint conserve les questions, réponses et le plan entre les processus. Enregistrez ces fichiers à côté des tâches. Lancez `node plan-run.ts` pour afficher la question ou l’approbation en attente ; relancez-le pour consulter le même état enregistré.

<!-- tabs -->

```ts title="checkpoint.ts"
import {
  createWorkflowCheckpointStore,
  createLocalTransport,
} from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { ticket } from "./ticket.ts";

export const checkpoint = {
  store: createWorkflowCheckpointStore({
    transporter: createLocalTransport({
      directory: `${repository}/.outpost/storage`,
    }),
  }),
  runId: ticket.key,
  version: "1",
};
```

```ts title="plan-workflow.ts"
import { defineWorkflow } from "@elie-laloum/outpost";
import { frame } from "./frame.ts";
import { plan } from "./plan.ts";
import { review } from "./approval.ts";

export const planning = defineWorkflow("plan-change", [frame, plan, review]);
```

```ts title="plan-run.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { plan } from "./plan.ts";

const result = await planning.start({ checkpoint });
console.log(result.status, result.inputRequests);
if (result.status === "paused") console.log(result.value(plan));
console.log(result.tasks.find((task) => task.key === "review")?.pause);
// Example output: waiting-input [ { id: '...', ... } ]
```

## Répondre à une question

Copiez le `id` affiché dans `inputRequests` et passez votre réponse en second argument : `node plan-answer.ts REQUEST_ID "Include dates in UTC"`. Chaque appel reprend la conversation enregistrée et peut produire une nouvelle question.

```ts title="plan-answer.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";

const [requestId, value] = process.argv.slice(2);
if (!requestId || !value) throw new Error("Pass the request ID and answer");
const current = await planning.start({ checkpoint });
const request = current.inputRequests.find((item) => item.id === requestId);
if (!request) throw new Error("Question is not pending");
const { executionId, key } = request;
const result = await planning.start({
  checkpoint,
  answers: [{ executionId, key, requestId, actor: "owner", value }],
});
console.log(result.status, result.inputRequests);
```

## Relire puis décider

Lorsque `node plan-run.ts` affiche `paused`, relisez le plan enregistré. Lancez ensuite `node plan-decide.ts approve "Scope and tests reviewed"`, ou utilisez `reject` avec votre motif. Cet exemple local vous considère comme l’acteur de confiance `owner` ; une application web doit authentifier la personne avant d’accepter cet acteur.

<!-- tabs -->

```ts title="pending-plan.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { plan } from "./plan.ts";

const [choice, explanation] = process.argv.slice(2);
if ((choice !== "approve" && choice !== "reject") || !explanation)
  throw new Error("Pass approve or reject, followed by a reason");
export const action = choice;
export const reason = explanation;
export const current = await planning.start({ checkpoint });
const pause = current.tasks.find((task) => task.key === "review")?.pause;
if (!pause) throw new Error("No approval pending");
export const pending = pause;
console.log(current.value(plan));
```

```ts title="plan-decide.ts"
import { planning } from "./plan-workflow.ts";
import { checkpoint } from "./checkpoint.ts";
import { current, pending, action, reason } from "./pending-plan.ts";

const result = await planning.start({
  checkpoint,
  decisions: [
    {
      executionId: current.executionId,
      key: "review",
      requestId: pending.id,
      actor: "owner",
      action,
      reason,
    },
  ],
});
console.log(result.status);
```

L’approbation termine ce workflow de planification avec `done`, le refus avec `rejected`. Aucune décision ne fusionne une branche. Demander une inspection sans modification n’impose pas de permissions sur les fichiers. Le dialogue conserve son workspace et ouvre une nouvelle sandbox par échange ; [les tâches interactives](../interactive-tasks/) détaillent les échecs et le rejeu après interruption.

Pour réaliser le plan, passez à [Construire un workflow de développement](../development-workflow/). Il réutilise les déclarations de cette page avec sa propre identité de checkpoint. Démarrez ce workflow combiné avec un nouvel ID d’exécution ; ne réutilisez pas un checkpoint de planification déjà démarré pour un autre graphe.

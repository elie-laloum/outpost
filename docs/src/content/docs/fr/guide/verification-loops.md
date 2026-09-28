---
title: "Boucles de vérification"
description: "Répéter le travail avec un feedback jusqu’à validation ou atteinte d’une limite."
---

`loopTask()` alterne `attempt` et `check` dans un seul nœud de workflow. Cette fonctionnalité est implémentée mais pas encore publiée. Une vérification refusée fournit un feedback textuel au tour suivant ; une vérification réussie expose le résultat accepté aux tâches dépendantes.

```ts
import { loopTask, workflow } from "@elie-laloum/outpost";

const fix = loopTask({
  key: "fix",
  maxRounds: 3,
  attempt: (ctx, feedback) => ({ round: ctx.round, feedback: feedback ?? "" }),
  check: (_, candidate) =>
    candidate.round === 2
      ? { done: true }
      : { done: false, feedback: "Cover the missing edge case." },
});
const result = await workflow("verified", [fix]).start({
  budget: { attempts: 3 },
});
result.unwrap();
console.log(result.value(fix).round); // 2
```

<!-- check:run -->

## Coder, puis lancer une commande

Réutilisez une sandbox appartenant à l’appelant, préparée comme dans les [sessions de sandbox](../sandbox-sessions/). Appeler `perform(ctx)` sur un `agentTask` relie l’usage en streaming, l’annulation et l’observation au contexte de boucle. Avec les checkpoints, renvoyez une projection JSON du résultat : le résultat complet possède des méthodes de continuation non sérialisables en JSON.

```ts
import { agentTask, loopTask } from "@elie-laloum/outpost";
import type { Sandbox } from "@elie-laloum/outpost";

declare const session: Sandbox;
const fix = loopTask({
  key: "fix-tests",
  maxRounds: 4,
  timeoutMs: 300_000,
  async attempt(ctx, feedback) {
    const run = agentTask({
      key: "coder",
      sandbox: session,
      request: () => ({
        brief: { text: `Fix the failing tests.\n${feedback ?? ""}` },
      }),
    });
    const result = await run.perform(ctx);
    return { text: result.text, conversation: result.conversation ?? null };
  },
  async check(ctx) {
    const run = await session.command({
      executable: "npm",
      arguments: ["test"],
      signal: ctx.signal,
    });
    return run.status === 0
      ? { done: true }
      : { done: false, feedback: `${run.stdout}\n${run.stderr}` };
  },
});
```

Seul `fix` appartient au graphe ; `coder` sert à exécuter l’appel. L’appelant gère la fermeture de la sandbox et l’intégration Git. Des nœuds concurrents ne doivent pas lancer de dispatch dans une même session à usage exclusif.

## Utiliser un second agent pour relire

`check` peut appeler un autre `agentTask.perform(ctx)` dans une sandbox de relecture et transformer sa réponse structurée en `{ done: true }` ou `{ done: false, feedback }`. L’usage déclaré des deux agents compte dans le même budget de workflow. Utilisez les [réponses structurées](../output-validation/) pour valider la décision.

Un `session.dispatch()` direct dans un callback ne relie pas automatiquement son usage ni son signal au workflow. Préférez le helper ci-dessus ; une intégration personnalisée doit transmettre `ctx.signal`, propager l’observation et déclarer l’usage synchroniquement via `ctx.reportUsage`, y compris les requêtes échouées. Ne déclarez pas en plus les totaux finaux du helper : il réconcilie déjà les compteurs en streaming.

Le feedback est transmis tel quel à `attempt` ; le callback choisit son prompt. Pour poursuivre une conversation existante, renseignez explicitement `continuation` dans la requête avec un identifiant pris en charge et utilisez le feedback dans le brief suivant. Consultez [l’historique des conversations](../chat-history/) pour capture et restauration. La boucle ne choisit pas implicitement de stratégie de continuation et ne restaure pas de sandbox.

## Limites et échecs

`maxRounds` est un entier sûr strictement positif qui borne les tours logiques. `ctx.round` commence à un. Chaque nouveau tour consomme une tentative du workflow ; rejouer une phase interrompue en consomme une autre, même si seule la vérification s’exécute. Les tokens sont comptés à leur déclaration par les callbacks. Configurez les [budgets de workflow](../token-budgets/) et transmettez l’annulation à chaque opération.

`timeoutMs` couvre les deux callbacks d’une exécution de tour et se renouvelle au rejeu d’une phase. Annulation et délais sont coopératifs : les callbacks doivent respecter `ctx.signal`. Une exception de l’un des callbacks fait échouer la tâche sans consommer automatiquement les tours restants. Un refus de vérification n’est pas un retry technique. Il n’existe pas d’option `retry` au niveau de la boucle.

Lorsque la dernière vérification refuse, `WorkflowResult.errors` contient `LoopTaskExhausted`, avec `key`, `maxRounds` et le dernier `feedback`. Les tâches dépendantes ne peuvent pas s’exécuter. `result.unwrap()` conserve le contrat habituel d’échec de workflow.

## Checkpoint et reprise

Utilisez la [configuration des exécutions durables](../durable-runs/). Chaque tour enregistre les transitions `attempt`, `check` et `complete` dans `TaskRecord.rounds`, et émet un `WorkflowEvent` avec `type: "loop"`, `round` et `phase`. Les traitements exhaustifs d’événements doivent prendre en charge ce nouveau type. L’observation reste distincte du stockage durable.

Le candidat est sauvegardé avant `check`. À la reprise, un candidat sauvegardé passe directement à la vérification ; les tours refusés terminés fournissent leur feedback sans rejouer leurs callbacks. Un tour accepté sauvegardé peut terminer la tâche sans nouvel appel. Reprendre un workflow incomplet exige toujours `resume: "retry-incomplete"`, car un callback interrompu peut déjà avoir effectué des effets. Une limite de tours épuisée reste épuisée. Modifier `maxRounds` invalide l’identité du checkpoint ; changez la version du checkpoint lorsque les callbacks ou leurs entrées changent.

Tous les candidats persistés doivent être du JSON sans perte ou `undefined` au premier niveau, même ceux refusés ensuite. Sans checkpoint, les valeurs en mémoire sont libres et les enregistrements de tours omettent les résultats candidats. Les checkpoints conservent la progression du workflow, pas les fichiers de sandbox ni les callbacks exécutables : recréez des définitions compatibles et restaurez le workspace ou la session voulus avant reprise.

`ctx.idempotencyKey` est stable pour une exécution, une tâche, un tour logique et une phase ; essai et vérification ont des clés distinctes. Les services effectuant les effets doivent persister leurs propres reçus de déduplication. Un appel modèle payant rejoué reste une nouvelle consommation ; ne réutilisez pas un ancien reçu d’usage pour masquer son coût.

API : [loopTask](../../reference/looptask/) · [LoopTaskOptions](../../reference/looptaskoptions/) · [LoopTaskContext](../../reference/looptaskcontext/) · [LoopTaskExhausted](../../reference/looptaskexhausted/).

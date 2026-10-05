---
title: "Ajouter un agent en ligne de commande"
description: "Créez un adaptateur qui lance votre agent et traduit sa sortie en événements Outpost."
---

## Écrire un adaptateur minimal

Implémentez un `AgentAdapter` pour décrire le lancement de votre outil et traduire sa sortie en événements : `request()` construit la commande et `events()` lit les lignes produites. Un `CliHarness` associe l’adaptateur au modèle choisi, puis `createAgent()` rend l’agent utilisable dans une tâche.

<!-- tabs -->

```ts title="protocol-values.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export const parse = (line: string) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};
export function usage(input: number, output: number): AgentEvent {
  return { kind: "usage", tokens: { input, cached: 0, output } };
}
```

```ts title="events.ts"
import type { AgentEvent } from "@elie-laloum/outpost";
import { parse, usage } from "./protocol-values.ts";

export function events(line: string): AgentEvent[] {
  const event = parse(line);
  switch (event?.type) {
    case "session":
      return [{ kind: "conversation", id: event.id }];
    case "message":
      return [{ kind: "text", text: event.text }];
    case "tool":
      return [{ kind: "tool", name: event.name, input: event.input }];
    case "usage":
      return [usage(event.input, event.output)];
    case "error":
      return [{ kind: "failure", message: event.message }];
    default:
      return [];
  }
}
```

```ts title="model-request.ts"
import type { AgentModel, AgentAdapter } from "@elie-laloum/outpost";

export function requestForModel(model?: AgentModel): AgentAdapter["request"] {
  return ({ text }) => ({
    executable: "mycli",
    arguments: ["--json", ...(model ? ["--model", model.name] : [])],
    stdin: text ?? "",
  });
}
```

```ts title="mycli-agent.ts"
import type { CliHarness } from "@elie-laloum/outpost";
import { requestForModel } from "./model-request.ts";
import { events } from "./events.ts";
import { createAgent } from "@elie-laloum/outpost";

export const myCliHarness: CliHarness = {
  kind: "cli",
  bind(model) {
    if (model?.reasoning || model?.maxOutputTokens)
      throw new Error("mycli accepts only a model name");
    return {
      name: "mycli",
      request: requestForModel(model),
      events,
    };
  },
};
export const myCli = createAgent({ harness: myCliHarness, model: "mycli-pro" });
```

```ts title="mycli.ts"
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { myCli } from "./mycli-agent.ts";

export const result = await dispatch({
  repository,
  sandboxProvider,
  agent: myCli,
  branch: { mode: "named", name: "outpost/mycli-review" },
  brief: { text: "Review the README for incorrect setup instructions." },
});
reportValue(result.text);
// Example output: The README setup command uses an outdated flag.
```

Outpost exécute `mycli --json --model mycli-pro` dans la sandbox avec le brief sur stdin, transmet chaque ligne de stdout à `events()` et renvoie le texte collecté dans `result.text`. Installez d’abord la CLI dans votre [image d’agent](../agent-images/).

## Construire la commande

`request()` reçoit un `AgentInput` et renvoie une `Command` : `executable`, `arguments`, `stdin`, `variables`. Outpost ajoute l’échéance et le signal d’annulation.

Référence API : [AgentInput](../../reference/agentinput/).

## Décoder la sortie

`events()` reçoit chaque ligne de stdout et renvoie zéro, un ou plusieurs événements. Stderr ne lui parvient jamais : Outpost signale ses lignes par des événements `stderr`.

Référence API : [AgentEvent](../../reference/agentevent/).

Les autres types, comme `tool`, `tool-result`, `reasoning`, `file-change` et `warning`, ne parviennent qu’aux [observateurs](../progress/). Un code de sortie non nul fait échouer le tour. Sans événement `text` ni `result`, `result.text` contient la fin de stdout.

:::caution
Une exception levée par `events()` fait échouer le tour. Renvoyez `[]` pour les lignes que vous ne reconnaissez pas.
:::

## Déclarer les capacités optionnelles

Chaque membre optionnel active une fonctionnalité. Ne déclarez que ce que la CLI fait réellement.

Référence API : [AgentAdapter](../../reference/agentadapter/).

## Mesurer la consommation de tokens

`usage` indique à Outpost d’où viennent les compteurs. Une consommation incomplète est une borne inférieure que les [budgets](../budgets/) traitent à part.

Référence API : [Usage](../../reference/usage/).

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";

export const sessionUsage: Pick<
  AgentAdapter,
  "usage" | "usageCommand" | "usageResult"
> = {
  usage: "session",
  usageCommand: (conversation) => ({
    executable: "mycli",
    arguments: ["usage", "--json", conversation],
  }),
  usageResult: (text) => {
    const totals = JSON.parse(text);
    return {
      input: totals.input,
      cached: totals.cached,
      output: totals.output,
    };
  },
};
```

Ajoutez `...sessionUsage` à l’adaptateur. La commande dispose de cinq secondes et n’est pas lancée si un événement `usage` cumulatif a déjà fourni les totaux. Sur une conversation poursuivie, Outpost mesure d’abord une référence et garde la différence ; un fork n’a pas de référence, sa consommation est donc incomplète.

Avec `storage`, `transcriptUsage(text)` peut plutôt lire les totaux dans la transcription capturée.

## Réorienter un tour en cours

Un dispatch [réorienté](../steering/) atteint votre CLI de l’une de deux façons.

| Adapter                             | Livraison  | Ce qui se passe                                                                                |
| ----------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Avec `liveInput`                    | `injected` | Outpost écrit chaque instruction sur le stdin du processus en cours.                           |
| `resumable: true`, sans `liveInput` | `resumed`  | Outpost arrête le processus dès que sa conversation est connue, puis la reprend avec le texte. |
| Aucun des deux                      | ―          | Le dispatch est refusé avant de démarrer.                                                      |

```ts
import type { AgentLiveInput } from "@elie-laloum/outpost";

export const liveInput: AgentLiveInput = {
  open: () => ({
    encode: (text) => `${JSON.stringify({ type: "user", text })}\n`,
    read: (line) => ({
      consumed: line.includes('"type":"user-ack"') ? 1 : 0,
      replies: [],
    }),
  }),
};
```

`encode()` transforme une instruction en texte pour stdin. `read()` voit chaque ligne de stdout et renvoie le nombre de messages confirmés par la CLI, ainsi que les réponses de protocole à écrire, comme les réponses aux demandes de permission.

Le prompt compte comme premier message à confirmer. Outpost garde stdin ouvert et le ferme après un événement `finished`, une fois tous les messages consommés.

L’injection exige aussi un `SandboxLease` avec `liveInput: true`, ce que renvoient tous les fournisseurs intégrés. Sur un [fournisseur personnalisé](../custom-sandbox-providers/) qui n’en a pas, un adaptateur reprenable se replie sur `resumed`.

## Ce qu’Outpost gère pour vous

<!-- features -->

- **Processus** : Les échéances, les délais d’inactivité et l’annulation arrêtent tout le groupe de processus.
- **Sandbox et workspace** : L’allocation, le worktree, les commits et le nettoyage fonctionnent comme pour les agents intégrés.
- **Répertoire personnel de l’agent** : Les plans de `credentials()` et `configuration()` sont installés dans le répertoire personnel privé de la sandbox.
- **Réponses** : Les réponses typées, les réparations et les marqueurs de fin s’appliquent à votre texte décodé.
- **Consommation** : Les compteurs s’additionnent entre tours, nouvelles tentatives et workflows, et alimentent les budgets.
- **Observation** : Les événements décodés, les lignes brutes et stderr parviennent à `observe`, aux reporters et aux journaux.

## Tester l’adaptateur

Enregistrez une fois de vraies lignes de sortie de la CLI, puis rejouez-les dans `events()`. [`diagnoseAgentProtocol()`](../diagnostics/) vérifie les agents intégrés de la même façon.

<!-- tabs -->

```ts title="protocol.types.ts"
import type { AgentEvent } from "@elie-laloum/outpost";

export interface ProtocolFixture {
  readonly name: string;
  readonly lines: readonly string[];
  readonly expected: readonly AgentEvent[];
}
```

```ts title="check-protocol.ts"
import type { CliHarness } from "@elie-laloum/outpost";
import type { ProtocolFixture } from "./protocol.types.ts";
import assert from "node:assert/strict";

export function checkProtocol(
  harness: CliHarness,
  fixtures: readonly ProtocolFixture[],
): void {
  const adapter = harness.bind();
  for (const fixture of fixtures)
    assert.deepEqual(
      fixture.lines.flatMap((line) => adapter.events(line)),
      fixture.expected,
      fixture.name,
    );
}
```

Ajoutez des fixtures pour les échecs, et vérifiez que `quota()` ne reconnaît que les messages de limite définitifs, pas les avis de nouvelle tentative. Lancez ensuite un vrai dispatch dans un conteneur : les fixtures ne testent ni l’installation, ni la connexion, ni le code de sortie, ni la capture.

## Limites

- Le bootstrap distant n’installe que les CLI intégrées. Installez la vôtre dans l’image de chaque fournisseur utilisé.
- `outpost init`, `outpost doctor` et `diagnoseAgentProtocol()` ne connaissent que les agents intégrés.
- Une ligne de stdout contient au plus 16 Mio ; une ligne plus longue fait échouer le tour.

API : [createAgent](../../reference/createagent/) · [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [AgentInput](../../reference/agentinput/) · [AgentEvent](../../reference/agentevent/) · [AgentLiveInput](../../reference/agentliveinput/) · [Usage](../../reference/usage/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/).

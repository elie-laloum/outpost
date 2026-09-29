---
title: "Ajouter un agent CLI"
description: "Exécuter une CLI d’agent de code qu’Outpost ne prend pas encore en charge : construire sa commande, décoder sa sortie, puis déclarer ce qu’elle sait faire d’autre."
---

## Écrire un adapter minimal

Un `AgentAdapter` fait le lien entre Outpost et une CLI : `request()` construit la commande, `events()` décode chaque ligne de sortie. Un `CliHarness` crée l’adapter pour un modèle, et `createAgent()` en fait un agent comme les agents intégrés.

```ts title="mycli.mts"
import {
  createAgent,
  dispatch,
  type AgentEvent,
  type CliHarness,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const parse = (line: string) => {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
};

function events(line: string): AgentEvent[] {
  const event = parse(line);
  switch (event?.type) {
    case "session":
      return [{ kind: "conversation", id: event.id }];
    case "message":
      return [{ kind: "text", text: event.text }];
    case "tool":
      return [{ kind: "tool", name: event.name, input: event.input }];
    case "usage":
      return [
        {
          kind: "usage",
          tokens: { input: event.input, cached: 0, output: event.output },
        },
      ];
    case "error":
      return [{ kind: "failure", message: event.message }];
    default:
      return [];
  }
}

const myCliHarness: CliHarness = {
  kind: "cli",
  bind(model) {
    if (model?.reasoning || model?.maxOutputTokens)
      throw new Error("mycli accepts only a model name");
    return {
      name: "mycli",
      request: ({ text }) => ({
        executable: "mycli",
        arguments: ["--json", ...(model ? ["--model", model.name] : [])],
        stdin: text ?? "",
      }),
      events,
    };
  },
};

export const myCli = createAgent({ harness: myCliHarness, model: "mycli-pro" });

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: myCli,
  branch: { mode: "named", name: "outpost/mycli-review" },
  brief: { text: "Review the README for incorrect setup instructions." },
});
console.log(result.text);
```

Outpost exécute `mycli --json --model mycli-pro` dans la sandbox avec le brief sur stdin, transmet chaque ligne de stdout à `events()` et renvoie le texte collecté dans `result.text`. Installez d’abord la CLI dans votre [image d’agent](../agent-images/).

## Construire la commande

`request()` reçoit un `AgentInput` et renvoie une `Command` : `executable`, `arguments`, `stdin`, `variables`. Outpost ajoute l’échéance et le signal d’annulation.

| Champ d’entrée      | Présent quand                                                   | Votre commande doit                                        |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| `text`              | À chaque tour                                                   | Transmettre le prompt, sur stdin ou en argument.           |
| `continuation.id`   | Le dispatch poursuit une conversation                           | Reprendre cette conversation native.                       |
| `continuation.fork` | Le dispatch dérive une conversation et vous n’avez pas `fork()` | Démarrer une nouvelle conversation à partir d’elle.        |
| `liveInput`         | La réorientation passe par votre protocole `liveInput`          | Écrire le prompt sur stdin au format du protocole.         |
| `interactive`       | [`attach()`](../sandbox-sessions/) ouvre un terminal            | Renvoyer `interactive: true` et passer `text` en argument. |

## Décoder la sortie

`events()` reçoit chaque ligne de stdout et renvoie zéro, un ou plusieurs événements. Stderr ne lui parvient jamais : Outpost signale ses lignes par des événements `stderr`.

| Événement                        | Effet sur le tour                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `conversation` (`id`)            | Enregistre l’ID de conversation native pour la capture, la reprise et la réorientation. |
| `text` (`text`)                  | S’ajoute à la réponse.                                                                  |
| `result` (`text`)                | La réponse finale ; remplace les `text` accumulés.                                      |
| `usage` (`tokens`, `cumulative`) | Ajoute les tokens à `result.usage`. `cumulative: true` pour des totaux courants.        |
| `failure` (`message`)            | Fait échouer le tour avec ce message.                                                   |
| `quota` (`message`, `resetAt`)   | Classe le tour échoué comme erreur de [quota](../quota-pauses/).                        |
| `finished`                       | Termine le tour. Avec `requiresFinishedEvent: true`, un tour sans lui échoue.           |

Les autres types, comme `tool`, `tool-result`, `reasoning`, `file-change` et `warning`, ne parviennent qu’aux [observateurs](../progress/). Un code de sortie non nul fait échouer le tour. Sans événement `text` ni `result`, `result.text` contient la fin de stdout.

:::caution
Une exception levée par `events()` fait échouer le tour. Renvoyez `[]` pour les lignes que vous ne reconnaissez pas.
:::

## Déclarer les capacités optionnelles

Chaque membre optionnel active une fonctionnalité. Ne déclarez que ce que la CLI fait réellement.

| Membre                                 | Active                                                                                                          | Page                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Contrôle du modèle dans `bind()`       | Levez une erreur pour refuser les réglages de modèle que la CLI ne sait pas appliquer, dès `createAgent()`.     | [AgentModel](../../reference/agentmodel/)                                      |
| `resumable: true`                      | Reprise, réparations des réponses typées et réorientation par reprise. `false` refuse reprise et fork d’emblée. | [Conversations](../conversations/)                                             |
| `forkable`, `fork(id, invoke)`         | Forks. `fork()` crée l’enfant par des commandes dans la sandbox et renvoie son ID. `false` refuse les forks.    | [Conversations](../conversations/)                                             |
| `storage`, `capture`                   | Capture après chaque tour et reprise dans une nouvelle sandbox. `capture: false` désactive la capture.          | [Formats de conversation natifs](../conversation-formats/)                     |
| `credentials(variables)`               | Variables, fichiers de l’hôte, fichiers générés et commandes de connexion pour le home privé de l’agent.        | [Authentification](../authentication/)                                         |
| `configuration(variables)`             | Fichiers de réglages de la CLI fusionnés dans le home de l’agent, comme les serveurs MCP.                       | [Serveurs MCP](../mcp-servers/)                                                |
| `quota(text)`, `unavailable(text)`     | Classent un tour échoué comme erreur de quota ou panne, d’après son texte d’échec ou stderr.                    | [Pauses sur quota](../quota-pauses/), [Agents de secours](../fallback-agents/) |
| `usage`, `usageCommand`, `usageResult` | Décompte des tokens.                                                                                            | [Mesurer la consommation de tokens](#mesurer-la-consommation-de-tokens)        |
| `liveInput`                            | Instructions injectées dans le tour en cours.                                                                   | [Réorienter un tour en cours](#réorienter-un-tour-en-cours)                    |
| `variables`                            | Variables d’environnement pour chaque commande de l’agent.                                                      | [Variables d’environnement](../environment-variables/)                         |

## Mesurer la consommation de tokens

`usage` indique à Outpost d’où viennent les compteurs. Une consommation incomplète est une borne inférieure que les [budgets](../budgets/) traitent à part.

| `usage`         | Ce que fait Outpost                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `"events"`      | Additionne les événements `usage`. Marque la consommation incomplète si aucun n’arrive ou si la commande n’aboutit pas.            |
| `"session"`     | Après la sortie de la CLI, exécute `usageCommand(conversation)` dans la sandbox et lit les totaux de session avec `usageResult()`. |
| `"unavailable"` | Marque la consommation incomplète avant le lancement de la commande.                                                               |
| absent          | Additionne les événements `usage` sans juger de leur complétude.                                                                   |

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

Ajoutez `...sessionUsage` à l’adapter. La commande dispose de cinq secondes et n’est pas lancée si un événement `usage` cumulatif a déjà fourni les totaux. Sur une conversation poursuivie, Outpost mesure d’abord une référence et garde la différence ; un fork n’a pas de référence, sa consommation est donc incomplète.

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

L’injection exige aussi un `SandboxLease` avec `liveInput: true`, ce que renvoient tous les providers intégrés. Sur un [provider personnalisé](../custom-sandbox-providers/) qui n’en a pas, un adapter reprenable se replie sur `resumed`.

## Ce qu’Outpost gère pour vous

<!-- features -->

- **Processus** : Les échéances, les délais d’inactivité et l’annulation arrêtent tout le groupe de processus.
- **Sandbox et workspace** : L’allocation, le worktree, les commits et le nettoyage fonctionnent comme pour les agents intégrés.
- **Home de l’agent** : Les plans de `credentials()` et `configuration()` sont installés dans le home privé de la sandbox.
- **Réponses** : Les réponses typées, les réparations et les marqueurs de fin s’appliquent à votre texte décodé.
- **Consommation** : Les compteurs s’additionnent entre tours, nouvelles tentatives et workflows, et alimentent les budgets.
- **Observation** : Les événements décodés, les lignes brutes et stderr parviennent à `observe`, aux reporters et aux journaux.

## Tester l’adapter

Enregistrez une fois de vraies lignes de sortie de la CLI, puis rejouez-les dans `events()`. [`diagnoseAgentProtocol()`](../diagnostics/) vérifie les agents intégrés de la même façon.

```ts
import assert from "node:assert/strict";
import type { AgentEvent, CliHarness } from "@elie-laloum/outpost";

export interface ProtocolFixture {
  readonly name: string;
  readonly lines: readonly string[];
  readonly expected: readonly AgentEvent[];
}

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

- Le bootstrap distant n’installe que les CLI intégrées. Installez la vôtre dans l’image de chaque provider utilisé.
- `outpost init`, `outpost doctor` et `diagnoseAgentProtocol()` ne connaissent que les agents intégrés.
- Une ligne de stdout contient au plus 16 Mio ; une ligne plus longue fait échouer le tour.

API : [createAgent](../../reference/createagent/) · [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [AgentInput](../../reference/agentinput/) · [AgentEvent](../../reference/agentevent/) · [AgentLiveInput](../../reference/agentliveinput/) · [Usage](../../reference/usage/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/).

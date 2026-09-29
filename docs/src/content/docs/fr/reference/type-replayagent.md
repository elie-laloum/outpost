---
title: "ReplayAgent"
description: "ReplayAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayAgent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"replay"`                                            | Requis    | Toujours replay. Distingue un agent de rejeu, qui n’a ni harness ni modèle, des agents cli et custom dans l’union Agent.                                                                                                                                                                                  |
| `source`                | `"harness" \| "agent"`                                | Requis    | Source d’observation des événements rejoués : harness si le journal provient du harness Outpost, sinon agent.                                                                                                                                                                                             |
| `divergence`            | `ReplayDivergencePolicy`                              | Requis    | Politique de divergence : fail lève ReplayDivergence ; warn signale les divergences prompt, baseline, tree et unrecorded par des avertissements et continue.                                                                                                                                              |
| `turns`                 | `readonly ReplayTurn[]`                               | Requis    | Tours enregistrés extraits du journal, dans l’ordre d’exécution.                                                                                                                                                                                                                                          |
| `remainingTurns`        | `number`                                              | Requis    | Nombre de tours enregistrés pas encore consommés par un dispatch ; 0 après un rejeu complet.                                                                                                                                                                                                              |
| `nextTurn`              | `() => ReplayTurn \| undefined`                       | Requis    | Consomme et renvoie le tour enregistré suivant, ou undefined quand le journal est épuisé. Le dispatch l’appelle une fois par tour ; un agent de rejeu ne sert qu’une fois.                                                                                                                                |
| `pendingSteering`       | `() => readonly string[] \| undefined`                | Requis    | Consignes enregistrées qui ont repris le tour suivant, sans le consommer ; le dispatch s’en sert pour poursuivre une passe pilotée comme enregistrée. Undefined lorsque le tour suivant n’était pas une reprise de pilotage.                                                                              |
| `name`                  | `string`                                              | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                     |
| `bootstrap`             | `string \| undefined`                                 | Optionnel | Agent intégré dont Outpost installe la CLI épinglée sur une sandbox distante quand l’exécutable manque : un paquet npm, ou une archive vérifiée par SHA-512 pour antigravity. Un nom inconnu échoue.                                                                                                      |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optionnel | Exige l’événement final natif : sans lui, les marqueurs de fin ne correspondent pas et le tour échoue avec le code process, même si le processus se termine avec 0.                                                                                                                                       |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined` | Optionnel | Mode de mesure de l’usage de jetons : events le lit dans le flux de sortie, session lit la session après la sortie du processus, unavailable n’enregistre rien. Des compteurs manquants marquent alors l’usage incomplet ; en son absence, les événements rapportés sont comptés sans cette vérification. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Variables d’environnement ajoutées à chaque commande de cet agent, par-dessus les valeurs de .outpost/.env. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                                                         |
| `storage`               | `ConversationStore \| undefined`                      | Optionnel | Store de conversations qui capture, localise et restaure les sessions de cet agent ; absent quand ses conversations ne sont pas portables.                                                                                                                                                                |
| `capture`               | `boolean \| undefined`                                | Optionnel | Enregistre la conversation dans storage après chaque tour ; false l’évite. En son absence, un tour est enregistré dès que storage existe.                                                                                                                                                                 |
| `resumable`             | `boolean \| undefined`                                | Optionnel | Indique si l’agent peut poursuivre une conversation, ce qu’exigent continuation, les réparations de réponse et le pilotage par reprise ; false refuse continuation avant l’allocation. La reprise à froid exige aussi storage.                                                                            |
| `forkable`              | `boolean \| undefined`                                | Optionnel | Indique si l’agent peut forker une conversation ; false refuse le fork avant l’allocation. En son absence, le fork est tenté via request() ou le hook fork.                                                                                                                                               |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optionnel | Lit l’usage de jetons dans la transcription capturée après le tour ; un résultat remplace l’usage rapporté par les événements, undefined le conserve.                                                                                                                                                     |

## Signature

```ts
export interface ReplayAgent extends AgentFeatures {
  readonly kind: "replay";
  readonly source: "agent" | "harness";
  readonly divergence: ReplayDivergencePolicy;
  readonly turns: readonly ReplayTurn[];
  readonly remainingTurns: number;
  nextTurn(): ReplayTurn | undefined;
  /** Instructions that resumed the next recorded turn, without consuming it. */
  pendingSteering(): readonly string[] | undefined;
}
```

## Contrats associés

- [AgentFeatures](../support-agentfeatures/)
- [ReplayDivergencePolicy](../replaydivergencepolicy/)
- [ReplayTurn](../replayturn/)

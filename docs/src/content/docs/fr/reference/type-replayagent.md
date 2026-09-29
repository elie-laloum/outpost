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

| Nom                     | Type                                                      | Présence  | Rôle                                                                                                                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                  | `"replay"`                                                | Requis    | Discriminant d’exécution des agents de rejeu.                                                                                                                                                                                                                              |
| `source`                | `"agent" \| "harness"`                                    | Requis    | Source d’observation des événements rejoués : harness si le journal provient du harness Outpost, sinon agent.                                                                                                                                                              |
| `divergence`            | `ReplayDivergencePolicy`                                  | Requis    | Politique de divergence : fail lève ReplayDivergence ; warn signale les écarts de prompt, de baseline et d’arbre en avertissement puis continue.                                                                                                                           |
| `turns`                 | `readonly ReplayTurn[]`                                   | Requis    | Tours enregistrés extraits du journal, dans l’ordre d’exécution.                                                                                                                                                                                                           |
| `remainingTurns`        | `number`                                                  | Requis    | Nombre de tours enregistrés pas encore consommés par un dispatch ; 0 après un rejeu complet.                                                                                                                                                                               |
| `nextTurn`              | `() => ReplayTurn \| undefined`                           | Requis    | Consomme et renvoie le tour enregistré suivant, ou undefined quand le journal est épuisé. Le dispatch l’appelle une fois par tour ; un agent de rejeu ne sert qu’une fois.                                                                                                 |
| `pendingSteering`       | `() => readonly string[] \| undefined`                    | Requis    | Consignes enregistrées qui ont repris le tour suivant, sans le consommer ; le dispatch s’en sert pour poursuivre une passe pilotée comme enregistrée. Undefined lorsque le tour suivant n’était pas une reprise de pilotage.                                               |
| `name`                  | `string`                                                  | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                      |
| `bootstrap`             | `string \| undefined`                                     | Optionnel | Nom de l’installeur intégré utilisé pour installer une CLI absente sur les providers distants lorsque le bootstrap est activé : un paquet npm épinglé pour claude, codex, copilot et kimi, ou une archive versionnée avec une empreinte SHA-512 épinglée pour antigravity. |
| `requiresFinishedEvent` | `boolean \| undefined`                                    | Optionnel | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                                                                                                                                                              |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`     | Optionnel | Capacité de comptabilité CLI : events attend l’usage dans le flux décodé, session collecte les compteurs après la sortie et unavailable déclare les tokens non mesurables. L’absence conserve le comportement des adaptateurs existants.                                   |
| `variables`             | `Readonly<Record<string, string>> \| undefined`           | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                    |
| `conversations`         | `"codex" \| "claude" \| "copilot" \| "kimi" \| undefined` | Optionnel | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                                                                                                                                                                  |
| `storage`               | `ConversationStore \| undefined`                          | Optionnel | Implémentation personnalisée de persistance des conversations de cet adapter.                                                                                                                                                                                              |
| `capture`               | `boolean \| undefined`                                    | Optionnel | Indique si l’adapter active la capture des transcripts natifs.                                                                                                                                                                                                             |
| `resumable`             | `boolean \| undefined`                                    | Optionnel | Indique si l’agent peut continuer une conversation, y compris pour réparer une réponse. La reprise à froid exige aussi un store ; le fork est déclaré séparément.                                                                                                          |
| `forkable`              | `boolean \| undefined`                                    | Optionnel | Indique si la bifurcation est prise en charge ; false refuse le fork avant allocation. L’absence conserve le comportement existant de l’adapter. La reprise est déclarée séparément.                                                                                       |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`     | Optionnel | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                                                                                                                                                                   |

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

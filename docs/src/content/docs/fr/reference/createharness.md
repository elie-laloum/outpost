---
title: "createHarness"
description: "createHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Compose le moteur intégré d’Outpost à partir d’un fournisseur de modèles, d’outils, d’instructions, de limites et de réglages d’exécution des outils. La validation est immédiate ; rien ne s’exécute avant le dispatch de l’agent. Le moteur appelle le modèle, valide et exécute les outils dans le sandbox emprunté et échoue avec le code limit quand une borne est atteinte. Les callbacks run sont refusés.

[Exemple complet et règles détaillées](../../guide/harness/).

## Paramètres et propriétés

| Nom                     | Type                                                               | Présence  | Rôle                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `HarnessOptions`                                                   | Requis    | Fournisseur de modèles, instructions, outils, limites de boucle, exécution des outils et cache d’historique du moteur intégré d’Outpost.                                                                                                          |
| `options.modelProvider` | `ModelProvider`                                                    | Requis    | Transport de requêtes que le moteur appelle à chaque étape ; il valide le modèle de l’agent à la composition.                                                                                                                                     |
| `options.instructions`  | `HarnessInstructionsOption \| undefined`                           | Optionnel | Instructions système en texte, résultat de defineHarnessInstructions() ou liste des deux. Résolues à chaque passe et jointes par des lignes vides ; les résultats vides sont ignorés.                                                             |
| `options.tools`         | `readonly (HarnessTool<unknown> \| HarnessToolset)[] \| undefined` | Optionnel | Outils et jeux d’outils que le modèle peut appeler. Les jeux imbriqués sont aplatis ; les noms doivent être uniques dans tout le harness.                                                                                                         |
| `options.limits`        | `HarnessLimits \| undefined`                                       | Optionnel | Bornes sur les étapes, les appels d’outils et l’usage de tokens. En atteindre une fait échouer la passe avec le code limit.                                                                                                                       |
| `options.toolExecution` | `HarnessToolExecution \| undefined`                                | Optionnel | Concurrence des outils, délai par appel et politique d’erreur.                                                                                                                                                                                    |
| `options.hooks`         | `readonly HarnessHook<HarnessHookPhase>[] \| undefined`            | Optionnel | Hooks issus de defineHarnessHook, exécutés dans l’ordre de déclaration au sein de chaque phase.                                                                                                                                                   |
| `options.permissions`   | `HarnessPermissions \| undefined`                                  | Optionnel | Règles issues de defineHarnessPermissions, évaluées avant les hooks before-tool.                                                                                                                                                                  |
| `options.context`       | `HarnessContextStrategy \| undefined`                              | Optionnel | Stratégie qui peut réécrire l’historique avant chaque requête au modèle, comme truncateToolResults() ou summarizeHistory().                                                                                                                       |
| `options.conversations` | `false \| ConversationStore \| undefined`                          | Optionnel | Store des transcriptions de passes ; createHarnessConversations() par défaut. Utilisez createTransportConversations(createHarnessConversations(), …) pour un stockage distant, ou false pour désactiver continuation et réparations.              |
| `options.skills`        | `readonly HarnessSkill[] \| undefined`                             | Optionnel | Skills listées dans les instructions système et chargées à la demande via l’outil load_skill.                                                                                                                                                     |
| `options.cache`         | `boolean \| undefined`                                             | Optionnel | Demande au fournisseur de mettre en cache le préfixe de la conversation ; true par défaut. OpenAI met en cache les préfixes stables automatiquement.                                                                                              |
| `options.mcpServers`    | `McpServers \| undefined`                                          | Optionnel | Serveurs MCP dont le modèle peut appeler les outils, indexés par nom de serveur. Chaque tour les démarre dans la sandbox empruntée et expose leurs outils sous la forme mcp__&lt;serveur>__&lt;outil> ; le bail doit prendre en charge liveInput. |

## Retour

`Harness`

## Signature

```ts
export declare function createHarness(options: HarnessOptions): Harness;
```

## Contrats associés

- [Harness](../type-customharness/)
- [HarnessOptions](../customharnessoptions/)

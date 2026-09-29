---
title: "CustomAgent"
description: "CustomAgent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomAgent } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resumable`             | `boolean`                                             | Requis    | Vrai sauf si le harness définit conversations: false, ce qui désactive la reprise, le fork et la réparation de réponse.                                                                                                                                                                                   |
| `capture`               | `boolean`                                             | Requis    | Vrai sauf si le harness définit conversations: false. Les transcripts vont dans le store de conversations du harness, par défaut .outpost/conversations/harness dans le dépôt.                                                                                                                            |
| `kind`                  | `"custom"`                                            | Requis    | Discriminant d’exécution : custom.                                                                                                                                                                                                                                                                        |
| `harness`               | `Harness`                                             | Requis    | Harness intégré issu de createHarness(), avec son fournisseur de modèles, ses outils et ses limites.                                                                                                                                                                                                      |
| `model`                 | `AgentModel`                                          | Requis    | AgentModel normalisé et figé dont le nom, le raisonnement et la limite de sortie s’appliquent par défaut aux requêtes du modèle.                                                                                                                                                                          |
| `name`                  | `string`                                              | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                     |
| `bootstrap`             | `string \| undefined`                                 | Optionnel | Agent intégré dont Outpost installe la CLI épinglée sur une sandbox distante quand l’exécutable manque : un paquet npm, ou une archive vérifiée par SHA-512 pour antigravity. Un nom inconnu échoue.                                                                                                      |
| `requiresFinishedEvent` | `boolean \| undefined`                                | Optionnel | Exige l’événement final natif : sans lui, les marqueurs de fin ne correspondent pas et le tour échoue avec le code process, même si le processus se termine avec 0.                                                                                                                                       |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined` | Optionnel | Mode de mesure de l’usage de jetons : events le lit dans le flux de sortie, session lit la session après la sortie du processus, unavailable n’enregistre rien. Des compteurs manquants marquent alors l’usage incomplet ; en son absence, les événements rapportés sont comptés sans cette vérification. |
| `variables`             | `Readonly<Record<string, string>> \| undefined`       | Optionnel | Variables d’environnement ajoutées à chaque commande de cet agent, par-dessus les valeurs de .outpost/.env. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                                                         |
| `storage`               | `ConversationStore \| undefined`                      | Optionnel | Store de conversations qui capture, localise et restaure les sessions de cet agent ; absent quand ses conversations ne sont pas portables.                                                                                                                                                                |
| `forkable`              | `boolean \| undefined`                                | Optionnel | Laissé vide par createAgent() : le harness intégré forke en copiant la conversation sous un nouvel identifiant. false refuse le fork avant allocation.                                                                                                                                                    |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined` | Optionnel | Lit l’usage de jetons dans la transcription capturée après le tour ; un résultat remplace l’usage rapporté par les événements, undefined le conserve.                                                                                                                                                     |

## Signature

```ts
export interface CustomAgent extends AgentFeatures {
  readonly resumable: boolean;
  readonly capture: boolean;
  readonly kind: "custom";
  readonly harness: Harness;
  readonly model: AgentModel;
}
```

## Contrats associés

- [AgentFeatures](../support-agentfeatures/)
- [AgentModel](../agentmodel/)
- [Harness](../type-customharness/)

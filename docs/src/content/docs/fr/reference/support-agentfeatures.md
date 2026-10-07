---
title: "AgentFeatures"
description: "AgentFeatures — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                     | Type                                                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usageInput`            | `"inclusive" \| "uncached" \| undefined`              | Optionnel | Convention des tokens d’entrée pour tarifer l’usage CLI : inclusive par défaut, uncached lorsque les lectures et écritures du cache sont supplémentaires. Ne modifie pas les compteurs agrégés rapportés.                                                                                                 |
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
export interface AgentFeatures {
  readonly usageInput?: "inclusive" | "uncached";
  readonly name: string;
  readonly bootstrap?: string;
  readonly requiresFinishedEvent?: boolean;
  readonly usage?: "events" | "session" | "unavailable";
  readonly variables?: Variables;
  readonly storage?: ConversationStore;
  readonly capture?: boolean;
  readonly resumable?: boolean;
  readonly forkable?: boolean;
  transcriptUsage?(text: string): Usage | undefined;
}
```

## Contrats associés

- [ConversationStore](../conversationstore/)
- [Usage](../usage/)
- [Variables](../variables/)

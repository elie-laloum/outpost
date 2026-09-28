---
title: "AgentEventDetails"
description: "AgentEventDetails — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom            | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Présence          | Rôle                                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`         | `"subagent" \| "message-usage" \| "stderr" \| "stopped" \| "reasoning" \| "file-change" \| "model-request" \| "model-response" \| "model-retry" \| "model-error" \| "hook" \| "instructions-loaded" \| "skills-loaded" \| "tool-output" \| "phase" \| "summary" \| "warning" \| "text" \| "text-delta" \| "result" \| "prompt" \| "tool" \| "tool-result" \| "step" \| "tool-denied" \| "stop-prevented" \| "compaction" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Requis            | Discriminant sélectionnant les données de l’événement : phase, summary, warning, text, text-delta, result, prompt, tool, tool-result, tool-denied, step, stop-prevented, compaction, conversation, usage, failure, finished ou raw. |
| `id`           | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Identifiant de conversation pour les événements conversation, ou identifiant unique d’exécution enfant pour les événements de cycle de vie subagent.                                                                                |
| `callId`       | `string \| string \| undefined \| string \| string \| undefined \| string \| string`                                                                                                                                                                                                                                                                                                                                                                                                       | Selon la variante | Identifiant qui relie un événement tool à son événement tool-result ; fourni par les harness personnalisés.                                                                                                                         |
| `name`         | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Nom de la phase pour les événements phase, ou nom de l’outil pour les événements tool et tool-result.                                                                                                                               |
| `status`       | `"started" \| "finished" \| "failed" \| number`                                                                                                                                                                                                                                                                                                                                                                                                                                            | Selon la variante | Statut de sortie du processus pour les résumés, ou started, finished ou failed pour le cycle de vie d’un enfant.                                                                                                                    |
| `conversation` | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Identifiant de conversation enfant persistée lorsque l’enfant active le stockage des transcripts.                                                                                                                                   |
| `tokens`       | `Usage`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Selon la variante | Compteurs d’usage de tokens portés par un événement usage ou summary.                                                                                                                                                               |
| `messageId`    | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Identifiant CLI du message dont l’usage est rapporté.                                                                                                                                                                               |
| `parentCallId` | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Appel d’outil parent fourni par la CLI pour un message de sous-agent ou un événement d’outil.                                                                                                                                       |
| `text`         | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Texte porté par l’événement : fragment diffusé, texte diffusé, réponse finale ou prompt soumis selon la variante.                                                                                                                   |
| `truncated`    | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Selon la variante | Indique si le fragment stderr ou l’aperçu brut trop volumineux a été borné avant livraison.                                                                                                                                         |
| `reason`       | `"completion" \| "idle-timeout" \| "deadline" \| "aborted" \| "oversized-event" \| string`                                                                                                                                                                                                                                                                                                                                                                                                 | Selon la variante | Motif de refus d’outil ou d’arrêt forcé ; stopped distingue complétion, inactivité, deadline, annulation et sortie de protocole trop volumineuse.                                                                                   |
| `changes`      | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Modifications de fichiers structurées exposées par la CLI ; l’adapter conserve les données fournies.                                                                                                                                |
| `request`      | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Requête modèle observée uniquement si le hub active explicitement les contenus détaillés ; peut contenir des instructions et messages privés.                                                                                       |
| `response`     | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Réponse modèle observée uniquement lorsque les contenus détaillés sont activés, avec appels d’outils et contenu rejouable.                                                                                                          |
| `attempt`      | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Tentative de reprise explicitement signalée par un fournisseur modèle ; Outpost ne déduit pas les reprises cachées.                                                                                                                 |
| `message`      | `string \| undefined \| string \| string \| string \| string`                                                                                                                                                                                                                                                                                                                                                                                                                              | Selon la variante | Message d’avertissement ou d’échec, ou message qu’un hook stop a renvoyé au modèle.                                                                                                                                                 |
| `phase`        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Phase du hook de harness qui vient de se terminer.                                                                                                                                                                                  |
| `changed`      | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Indique si le hook a renvoyé une décision ou modifié son entrée observable.                                                                                                                                                         |
| `count`        | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Nombre de sources d’instructions non vides résolues pour ce tour de harness.                                                                                                                                                        |
| `names`        | `readonly string[]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Selon la variante | Skills nouvellement chargés dans la conversation et disponibles aux étapes modèle suivantes.                                                                                                                                        |
| `channel`      | `"stdout" \| "stderr"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Selon la variante | Flux de sortie de la commande pour l’événement tool-output : stdout ou stderr.                                                                                                                                                      |
| `agent`        | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Identifiant du CLI d’agent à rapporter ou diagnostiquer : claude, codex, antigravity (exécutable agy), copilot ou kimi.                                                                                                             |
| `branch`       | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Nom de la branche de travail utilisée ou observée pendant l’exécution.                                                                                                                                                              |
| `directory`    | `string \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Dossier hôte du workspace utilisé pour cette exécution.                                                                                                                                                                             |
| `durationMs`   | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Durée d’exécution écoulée en millisecondes.                                                                                                                                                                                         |
| `input`        | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Arguments bruts fournis à l’outil nommé par cet événement tool.                                                                                                                                                                     |
| `isError`      | `boolean`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Indique si l’appel d’outil a échoué ou signalé une erreur.                                                                                                                                                                          |
| `preview`      | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Début du résultat de l’outil, borné pour les journaux et les rapporteurs.                                                                                                                                                           |
| `characters`   | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Longueur complète du résultat de l’outil avant toute troncature.                                                                                                                                                                    |
| `index`        | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Numéro d’étape, à partir de 1, d’une passe de harness personnalisé.                                                                                                                                                                 |
| `strategy`     | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Nom de la stratégie de contexte qui a réécrit l’historique.                                                                                                                                                                         |
| `messages`     | `number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Selon la variante | Nombre de messages de l’historique après compaction.                                                                                                                                                                                |
| `cumulative`   | `boolean \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Selon la variante | Sur les événements d’usage CLI, true indique un total pour la commande courante. Le runtime le convertit en deltas positifs ou nuls avant de notifier les observateurs ; l’absence indique un événement incrémental.                |
| `value`        | `unknown`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Selon la variante | Valeur brute de protocole non reconnue conservée pour observation.                                                                                                                                                                  |
| `bytes`        | `number \| undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Selon la variante | Taille UTF-8 constatée d’une ligne de protocole trop volumineuse ou du préfixe reçu avant l’arrêt.                                                                                                                                  |

## Signature

```ts
export type AgentEventDetails =
  | {
      readonly kind: "subagent";
      readonly id: string;
      readonly callId: string;
      readonly name: string;
      readonly status: "started" | "finished" | "failed";
      readonly conversation?: string;
    }
  | {
      readonly kind: "message-usage";
      readonly tokens: Usage;
      readonly messageId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "stderr";
      readonly text: string;
      readonly truncated?: boolean;
    }
  | {
      readonly kind: "stopped";
      readonly reason:
        | "completion"
        | "idle-timeout"
        | "deadline"
        | "aborted"
        | "oversized-event";
    }
  | {
      readonly kind: "reasoning";
      readonly text: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "file-change";
      readonly changes: unknown;
      readonly callId?: string;
    }
  | {
      readonly kind: "model-request";
      readonly request: unknown;
    }
  | {
      readonly kind: "model-response";
      readonly response: unknown;
    }
  | {
      readonly kind: "model-retry";
      readonly attempt: number;
      readonly message?: string;
    }
  | {
      readonly kind: "model-error";
      readonly message: string;
    }
  | {
      readonly kind: "hook";
      readonly phase: string;
      readonly changed: boolean;
    }
  | {
      readonly kind: "instructions-loaded";
      readonly count: number;
    }
  | {
      readonly kind: "skills-loaded";
      readonly names: readonly string[];
    }
  | {
      readonly kind: "tool-output";
      readonly callId: string;
      readonly channel: "stdout" | "stderr";
      readonly text: string;
    }
  | {
      readonly kind: "phase";
      readonly name: string;
      readonly agent?: string;
      readonly branch?: string;
      readonly directory?: string;
    }
  | {
      readonly kind: "summary";
      readonly durationMs: number;
      readonly status: number;
      readonly tokens: Usage;
    }
  | {
      readonly kind: "warning";
      readonly message: string;
    }
  | {
      readonly kind: "text";
      readonly text: string;
    }
  | {
      readonly kind: "text-delta";
      readonly text: string;
    }
  | {
      readonly kind: "result";
      readonly text: string;
    }
  | {
      readonly kind: "prompt";
      readonly text: string;
    }
  | {
      readonly kind: "tool";
      readonly name: string;
      readonly input: unknown;
      readonly callId?: string;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "tool-result";
      readonly callId: string;
      readonly name: string;
      readonly isError: boolean;
      readonly preview: string;
      readonly characters: number;
      readonly parentCallId?: string;
    }
  | {
      readonly kind: "step";
      readonly index: number;
    }
  | {
      readonly kind: "tool-denied";
      readonly callId: string;
      readonly name: string;
      readonly reason: string;
    }
  | {
      readonly kind: "stop-prevented";
      readonly message: string;
    }
  | {
      readonly kind: "compaction";
      readonly strategy: string;
      readonly messages: number;
    }
  | {
      readonly kind: "conversation";
      readonly id: string;
    }
  | {
      readonly kind: "usage";
      readonly tokens: Usage;
      readonly cumulative?: boolean;
    }
  | {
      readonly kind: "failure";
      readonly message: string;
    }
  | {
      readonly kind: "finished";
    }
  | {
      readonly kind: "raw";
      readonly value: unknown;
      readonly bytes?: number;
      readonly truncated?: boolean;
    };
```

## Contrats associés

- [Usage](../usage/)

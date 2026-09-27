---
title: "AgentAdapter"
description: "AgentAdapter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                     | Type                                                                                                   | Présence  | Rôle                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fork`                  | `((id: string, invoke: (command: Command) => Promise<CommandResult>) => Promise<string>) \| undefined` | Optionnel | Préparation native optionnelle du fork : reçoit l’identifiant parent et un exécuteur de commandes dans la sandbox empruntée, puis renvoie un identifiant enfant distinct. Outpost continue cet enfant ; les adapters dotés d’un flag de fork peuvent omettre ce hook.                                                            |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined`                                              | Optionnel | Planifie les credentials de cette CLI à partir des variables résolues du workflow, sans accès disque : variables à transmettre, fichiers hôte à copier dans le home privé de la sandbox, fichiers générés et commandes de connexion. Appelé une fois par adapter et par sandbox ; le provider local ne reçoit que les variables. |
| `request`               | `(input: AgentInput) => Command`                                                                       | Requis    | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie.                                                                                                                                                                                                                                      |
| `events`                | `(line: string) => readonly AgentEvent[]`                                                              | Requis    | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                                                                                                                                                                                                                                                        |
| `name`                  | `string`                                                                                               | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                                                                  | Optionnel | Nom de l’installeur intégré utilisé pour installer une CLI absente sur les providers distants lorsque le bootstrap est activé : un paquet npm épinglé pour claude, codex, copilot et kimi, ou une archive versionnée avec une empreinte SHA-512 épinglée pour antigravity.                                                       |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                                 | Optionnel | Exige l’événement natif finished avant de considérer le tour d’agent terminé.                                                                                                                                                                                                                                                    |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                                        | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                          |
| `conversations`         | `"codex" \| "claude" \| "copilot" \| "kimi" \| undefined`                                              | Optionnel | Format natif de transcript utilisé en l’absence de stockage personnalisé.                                                                                                                                                                                                                                                        |
| `storage`               | `ConversationStore \| undefined`                                                                       | Optionnel | Implémentation personnalisée de persistance des conversations de cet adapter.                                                                                                                                                                                                                                                    |
| `capture`               | `boolean \| undefined`                                                                                 | Optionnel | Indique si l’adapter active la capture des transcripts natifs.                                                                                                                                                                                                                                                                   |
| `resumable`             | `boolean \| undefined`                                                                                 | Optionnel | Indique si l’agent peut continuer une conversation, y compris pour réparer une réponse. La reprise à froid exige aussi un store ; le fork est déclaré séparément.                                                                                                                                                                |
| `forkable`              | `boolean \| undefined`                                                                                 | Optionnel | Indique si la bifurcation est prise en charge ; false refuse le fork avant allocation. L’absence conserve le comportement existant de l’adapter. La reprise est déclarée séparément.                                                                                                                                             |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optionnel | Analyse un transcript natif pour récupérer l’usage de tokens disponible.                                                                                                                                                                                                                                                         |

## Signature

```ts
export interface AgentAdapter extends AgentFeatures {
  fork?(
    id: string,
    invoke: (command: Command) => Promise<CommandResult>,
  ): Promise<string>;
  credentials?(variables: Variables): CredentialPlan;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
}
```

## Contrats associés

- [AgentEvent](../agentevent/)
- [AgentFeatures](../support-agentfeatures/)
- [AgentInput](../agentinput/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [CredentialPlan](../support-credentialplan/)
- [Variables](../variables/)

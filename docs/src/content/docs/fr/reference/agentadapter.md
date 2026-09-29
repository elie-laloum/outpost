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
| `fork`                  | `((id: string, invoke: (command: Command) => Promise<CommandResult>) => Promise<string>) \| undefined` | Optionnel | Préparation native du fork : reçoit l’identifiant parent et un exécuteur de commandes dans la sandbox empruntée, et renvoie un identifiant enfant distinct qu’Outpost continue ensuite. Les adapters dotés d’un flag de fork peuvent l’omettre.                                                                                  |
| `credentials`           | `((variables: Variables) => CredentialPlan) \| undefined`                                              | Optionnel | Planifie les credentials de cette CLI à partir des variables résolues du workflow, sans accès disque : variables à transmettre, fichiers hôte à copier dans le home privé de la sandbox, fichiers générés et commandes de connexion. Appelé une fois par adapter et par sandbox ; le provider local ne reçoit que les variables. |
| `configuration`         | `((variables: Variables) => AgentConfiguration) \| undefined`                                          | Optionnel | Planifie la configuration de la CLI à partir des variables résolues, sans accès disque : fichiers à fusionner et fichiers de l’hôte à copier dans le home de l’agent, une fois par sandbox, après l’authentification. Lève une erreur si une variable référencée manque.                                                         |
| `request`               | `(input: AgentInput) => Command`                                                                       | Requis    | Construit le programme, ses arguments et son environnement depuis l’entrée d’agent fournie.                                                                                                                                                                                                                                      |
| `events`                | `(line: string) => readonly AgentEvent[]`                                                              | Requis    | Décode une ligne de sortie du CLI natif en événements d’agent normalisés.                                                                                                                                                                                                                                                        |
| `quota`                 | `((text: string) => boolean) \| undefined`                                                             | Optionnel | Reconnaît un message terminal de limite d’usage ou de débit dans un événement failure ou une ligne stderr. Si le processus échoue ensuite, le tour est rejeté avec le code OutpostError quota au lieu de process ; les avis de reprise transitoires ne doivent pas correspondre.                                                 |
| `unavailable`           | `((text: string) => boolean) \| undefined`                                                             | Optionnel | Reconnaît une panne terminale du service ou un échec de connexion dans un événement failure ou une ligne stderr. Si le processus échoue ensuite sans signal de quota, le tour garde le code process et enregistre details.unavailable, lu par unavailableFault() ; les avis de nouvelle tentative ne doivent pas correspondre.   |
| `usageCommand`          | `((conversation: string) => Command \| undefined) \| undefined`                                        | Optionnel | Construit une commande de lecture bornée pour collecter les compteurs de cette conversation dans la sandbox empruntée ; renvoie undefined pour un identifiant non pris en charge.                                                                                                                                                |
| `usageResult`           | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optionnel | Décode stdout de la commande d’usage réussie en totaux de session. Renvoie undefined si illisible, ou complete: false pour des totaux partiels ; ne renvoie pas le contenu du transcript.                                                                                                                                        |
| `liveInput`             | `AgentLiveInput \| undefined`                                                                          | Optionnel | Protocole d’ajout de messages utilisateur à un tour en cours via stdin, utilisé quand le lease accepte l’entrée en direct : stream-json de Claude Code et app-server de Codex. Sinon, le pilotage arrête le tour puis reprend sa conversation.                                                                                   |
| `name`                  | `string`                                                                                               | Requis    | Identifiant d’agent natif utilisé dans les événements et diagnostics.                                                                                                                                                                                                                                                            |
| `bootstrap`             | `string \| undefined`                                                                                  | Optionnel | Agent intégré dont Outpost installe la CLI épinglée sur une sandbox distante quand l’exécutable manque : un paquet npm, ou une archive vérifiée par SHA-512 pour antigravity. Un nom inconnu échoue.                                                                                                                             |
| `requiresFinishedEvent` | `boolean \| undefined`                                                                                 | Optionnel | Exige l’événement final natif : sans lui, les marqueurs de fin ne correspondent pas et le tour échoue avec le code process, même si le processus se termine avec 0.                                                                                                                                                              |
| `usage`                 | `"events" \| "session" \| "unavailable" \| undefined`                                                  | Optionnel | Mode de mesure de l’usage de jetons : events le lit dans le flux de sortie, session lit la session après la sortie du processus, unavailable n’enregistre rien. Des compteurs manquants marquent alors l’usage incomplet ; en son absence, les événements rapportés sont comptés sans cette vérification.                        |
| `variables`             | `Readonly<Record<string, string>> \| undefined`                                                        | Optionnel | Variables d’environnement ajoutées à chaque commande de cet agent, par-dessus les valeurs de .outpost/.env. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                                                                                |
| `storage`               | `ConversationStore \| undefined`                                                                       | Optionnel | Store de conversations qui capture, localise et restaure les sessions de cet adapter. Les presets intégrés utilisent par défaut leur store natif ; absent quand la CLI n’a pas de conversations portables.                                                                                                                       |
| `capture`               | `boolean \| undefined`                                                                                 | Optionnel | Enregistre la conversation dans storage après chaque tour ; false l’évite. En son absence, un tour est enregistré dès que storage existe.                                                                                                                                                                                        |
| `resumable`             | `boolean \| undefined`                                                                                 | Optionnel | Indique si l’agent peut poursuivre une conversation, ce qu’exigent continuation, les réparations de réponse et le pilotage par reprise ; false refuse continuation avant l’allocation. La reprise à froid exige aussi storage.                                                                                                   |
| `forkable`              | `boolean \| undefined`                                                                                 | Optionnel | Indique si l’agent peut forker une conversation ; false refuse le fork avant l’allocation. En son absence, le fork est tenté via request() ou le hook fork.                                                                                                                                                                      |
| `transcriptUsage`       | `((text: string) => Usage \| undefined) \| undefined`                                                  | Optionnel | Lit l’usage de jetons dans la transcription capturée après le tour ; un résultat remplace l’usage rapporté par les événements, undefined le conserve.                                                                                                                                                                            |

## Signature

```ts
export interface AgentAdapter extends AgentFeatures {
  fork?(
    id: string,
    invoke: (command: Command) => Promise<CommandResult>,
  ): Promise<string>;
  credentials?(variables: Variables): CredentialPlan;
  /** Plans CLI configuration merged into the agent home; throws when a referenced variable is missing. */
  configuration?(variables: Variables): AgentConfiguration;
  request(input: AgentInput): Command;
  events(line: string): readonly AgentEvent[];
  /** Recognizes a usage-limit or rate-limit message in failure or stderr text. */
  quota?(text: string): boolean;
  /** Recognizes a terminal service outage or connection failure in failure or stderr text. */
  unavailable?(text: string): boolean;
  usageCommand?(conversation: string): Command | undefined;
  usageResult?(text: string): Usage | undefined;
  /** Protocol for adding user messages to a running turn through live stdin. */
  readonly liveInput?: AgentLiveInput;
}
```

## Contrats associés

- [AgentConfiguration](../agentconfiguration/)
- [AgentEvent](../agentevent/)
- [AgentFeatures](../support-agentfeatures/)
- [AgentInput](../agentinput/)
- [AgentLiveInput](../agentliveinput/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [CredentialPlan](../support-credentialplan/)
- [Usage](../usage/)
- [Variables](../variables/)

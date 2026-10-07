---
title: "LifecycleCommand"
description: "LifecycleCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { LifecycleCommand } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type                                                                                                 | Présence  | Rôle                                                                                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `when`        | `ChangedCondition \| undefined`                                                                      | Optionnel | Condition facultative issue de changed() ; sans elle la commande ne s’exécute qu’à la préparation initiale. Enregistre l’empreinte calculée avant la commande après sa réussite, puis la vérifie avant chaque commande, dispatch ou attachement suivant. workspaceReady reste une phase unique à l’ouverture. |
| `executable`  | `string`                                                                                             | Requis    | Programme exécuté pour ce hook de préparation, sans analyse shell implicite.                                                                                                                                                                                                                                  |
| `arguments`   | `readonly string[] \| undefined`                                                                     | Optionnel | Arguments littéraux de la préparation ; utilisez un shell explicite pour les pipes ou les étapes dépendantes.                                                                                                                                                                                                 |
| `stdin`       | `string \| undefined`                                                                                | Optionnel | Texte initial envoyé à l’entrée du hook avant un éventuel flux input.                                                                                                                                                                                                                                         |
| `input`       | `Readable \| undefined`                                                                              | Optionnel | Flux d’entrée du hook après stdin ; non utilisé par la sonde d’empreinte des fichiers.                                                                                                                                                                                                                        |
| `directory`   | `string \| undefined`                                                                                | Optionnel | Répertoire de travail et base des chemins surveillés : worktree hôte par défaut pour workspaceReady/hostReady et sandbox.root pour sandboxReady.                                                                                                                                                              |
| `variables`   | `Readonly<Record<string, string>> \| undefined`                                                      | Optionnel | Variables propres au hook, appliquées à la sonde d’empreinte et à la commande en plus des variables de l’environnement d’exécution.                                                                                                                                                                           |
| `signal`      | `AbortSignal \| undefined`                                                                           | Optionnel | Signal facultatif du hook combiné au signal de l’opération de cycle de vie. Un hook annulé sur une sandbox réutilisée n’enregistre pas son empreinte et laisse la sandbox ouverte.                                                                                                                            |
| `deadlineMs`  | `number \| undefined`                                                                                | Optionnel | Délai de la sonde d’empreinte et, séparément, de la commande du hook, 600000 ms chacun par défaut. Une expiration bloque l’opération et laisse une sandbox réutilisée disponible pour réessayer.                                                                                                              |
| `interactive` | `boolean \| undefined`                                                                               | Optionnel | Exécute le hook avec le support terminal de l’environnement ; la sonde d’empreinte s’exécute toujours sans terminal.                                                                                                                                                                                          |
| `terminal`    | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Flux de terminal connectés à la commande de préparation ; la sonde d’empreinte ne les utilise pas.                                                                                                                                                                                                            |
| `elevated`    | `boolean \| undefined`                                                                               | Optionnel | Demande une exécution élevée pour la sonde d’empreinte et la commande selon les capacités du provider ; l’exécution hôte ignore cette option.                                                                                                                                                                 |
| `retain`      | `number \| undefined`                                                                                | Optionnel | Sortie finale conservée pour la commande du hook ; la sonde d’empreinte utilise sa propre sortie bornée.                                                                                                                                                                                                      |
| `observe`     | `((channel: Channel, text: string) => void) \| undefined`                                            | Optionnel | Reçoit les fragments de sortie de la commande de préparation, hors sortie de la sonde d’empreinte. Une exception fait échouer la préparation et empêche l’enregistrement de l’empreinte.                                                                                                                      |

## Signature

```ts
export interface LifecycleCommand extends Command {
  readonly when?: ChangedCondition;
}
```

## Contrats associés

- [ChangedCondition](../changedcondition/)
- [Command](../command/)

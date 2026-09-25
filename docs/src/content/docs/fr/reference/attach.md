---
title: "attach"
description: "attach — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { attach } from "@elie-laloum/outpost";
```

## Rôle et comportement

Ouvre le terminal interactif réel d’un agent dans une nouvelle sandbox, puis collecte son statut de sortie et ses commits et ferme les ressources possédées. ask permet de fournir les réponses aux variables du brief ; le terminal ne produit pas de réponse typée.

[Exemple complet et règles détaillées](../../guide/environment/commands/).

## Paramètres et propriétés

| Nom                          | Type                                                                                                 | Présence  | Rôle                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & AttachOptions & RequiredAgent`                                                     | Requis    | Configuration du workspace, du provider, de l’agent natif et du terminal interactif.                           |
| `options.includeUncommitted` | `boolean \| undefined`                                                                               | Optionnel | Inclut les modifications hôtes non commitées dans le snapshot du dépôt distant.                                |
| `options.agent`              | `AgentAdapter`                                                                                       | Optionnel | Adapter natif de l’agent de code.                                                                              |
| `options.provider`           | `SandboxProvider \| undefined`                                                                       | Optionnel | Backend de l’environnement d’exécution.                                                                        |
| `options.workspace`          | `Workspace \| undefined`                                                                             | Optionnel | Workspace Git appartenant à l’appelant ; exclut un nouveau choix de dépôt/branche.                             |
| `options.hooks`              | `LifecycleHooks \| undefined`                                                                        | Optionnel | Commandes de cycle de vie dans l’ordre déclaré.                                                                |
| `options.signal`             | `AbortSignal \| undefined`                                                                           | Optionnel | Annulation coopérative de cette opération.                                                                     |
| `options.logging`            | `Logging \| undefined`                                                                               | Optionnel | Configure le fichier journal du dispatch et la conservation des événements détaillés.                          |
| `options.bootstrap`          | `boolean \| undefined`                                                                               | Optionnel | Indique si un agent sélectionné absent peut être installé automatiquement.                                     |
| `options.conversationHome`   | `string \| undefined`                                                                                | Optionnel | Home hôte utilisé pour le stockage des transcripts natifs.                                                     |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`                                             | Optionnel | Limites d’admission et réservation demandée pour le stockage dans .outpost du dépôt.                           |
| `options.repository`         | `string \| undefined`                                                                                | Optionnel | Checkout Git hôte ciblé.                                                                                       |
| `options.branch`             | `BranchPolicy \| undefined`                                                                          | Optionnel | Choisit le checkout courant, une branche de travail nommée conservée ou une branche préparée pour intégration. |
| `options.copies`             | `readonly string[] \| undefined`                                                                     | Optionnel | Entrées relatives au dépôt copiées dans le workspace.                                                          |
| `options.limits`             | `StageLimits \| undefined`                                                                           | Optionnel | Délais de copie, préparation Git, collecte des commits et intégration, en millisecondes.                       |
| `options.label`              | `string \| undefined`                                                                                | Optionnel | Libellé lisible utilisé dans les rapports d’exécution.                                                         |
| `options.ask`                | `VariableQuestion \| undefined`                                                                      | Optionnel | Callback fournissant les variables manquantes du brief lors de l’attachement interactif.                       |
| `options.brief`              | `Brief \| undefined`                                                                                 | Optionnel | Entrée de tâche textuelle littérale ou provenant d’un fichier.                                                 |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined`                                     | Optionnel | Identifiant de conversation native à poursuivre ; fork demande une conversation distincte dérivée de celle-ci. |
| `options.terminal`           | `{ readonly input?: Readable; readonly output?: Writable; readonly error?: Writable; } \| undefined` | Optionnel | Flux d’entrée, de sortie et d’erreur pour l’attachement à un terminal interactif réel.                         |

## Retour

`Promise<AttachResult>`

## Signature

```ts
export declare function attach(
  options: SandboxOptions & AttachOptions & RequiredAgent,
): Promise<AttachResult>;
```

## Contrats associés

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)

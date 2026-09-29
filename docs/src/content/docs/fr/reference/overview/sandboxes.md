---
title: "Sandboxes — Vue d’ensemble"
description: "Gardez un environnement ouvert pour des tours d’agent, des commandes et des sessions de terminal, puis fermez-le avec le workspace qu’il a ouvert."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Opérations sur une sandbox ouverte

Chaque appel s’exécute sur le même bail de provider : fichiers et dépendances installées persistent d’un appel à l’autre. Un `agent` passé à un appel remplace l’agent par défaut de la sandbox.

| Appel                                                       | Exécute                                                  | Se résout avec                                                |
| ----------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| `sandbox.dispatch(options)`                                 | Un brief dans une nouvelle conversation                  | `WarmDispatchResult` ; ses `resume()` et `fork()` restent ici |
| `sandbox.resume(id, options)` / `sandbox.fork(id, options)` | Une conversation capturée, ou une copie                  | `WarmDispatchResult`                                          |
| `sandbox.attach(options)`                                   | Le CLI de l’agent dans votre terminal, jusqu’à 24 heures | `AttachResult` avec statut et commits                         |
| `sandbox.command(command)`                                  | Un programme, sans shell                                 | `CommandResult`, même pour un statut non nul                  |
| `sandbox.diagnose(options)`                                 | Sondes node, git, commandes, CLI d’agent, transferts     | `SandboxDiagnosticReport`                                     |

Aucun appel n’intègre la branche : appelez `sandbox.workspace.integrate()` avant `close()`. Sur un provider distant, `dispatch`, `attach` et `command` se terminent en rapatriant les modifications de la sandbox dans le worktree de l’hôte.

:::caution
Une sandbox exécute une opération à la fois : un appel lancé pendant qu’une autre s’exécute est rejeté avec le code `configuration`. Ouvrez une sandbox par tâche parallèle.
:::

## Fermer une sandbox

`await using` appelle `close()` ; les appels suivants renvoient la promesse du premier. `close()` interrompt l’opération en cours, l’attend, puis libère l’environnement.

| Événement                                      | Workspace ouvert par `createSandbox()`                                               | `workspace` fourni |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| `close()`                                      | Fermé ; worktree supprimé s’il est propre et attaché, sinon dans `retainedDirectory` | Laissé ouvert      |
| `close({ preserve: true })`                    | Fermé ; worktree conservé                                                            | Laissé ouvert      |
| Échec de la libération pendant `close()`       | Fermé ; worktree conservé ; `close()` rejette                                        | Laissé ouvert      |
| Échec de la préparation dans `createSandbox()` | Fermé après la libération de l’environnement ; l’erreur est relancée                 | Laissé ouvert      |
| SIGINT ou SIGTERM                              | Fermé par `close({ preserve: true })`                                                | Laissé ouvert      |

## Points d’entrée

Guide : [Sessions de sandbox](../../../guide/sandbox-sessions/) · [Préparer l’environnement](../../../guide/environment-setup/) · [Sandboxes cloud](../../../guide/cloud-sandboxes/)

- [createSandbox](../../createsandbox/)
- [Sandbox](../../sandbox/)
- [SandboxOptions](../../sandboxoptions/)
- [WarmDispatchResult](../../warmdispatchresult/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [LifecycleHooks](../../lifecyclehooks/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)

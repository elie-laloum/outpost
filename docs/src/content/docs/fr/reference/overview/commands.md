---
title: "Commandes et terminal — Vue d’ensemble"
description: "Exécutez un programme dans une sandbox et lisez son statut de sortie, ou ouvrez-y le terminal interactif d’un agent."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un appel

| Appel                      | Sandbox                                | Renvoie                                            | À utiliser pour                                              |
| -------------------------- | -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `sandbox.command(command)` | Votre sandbox ouverte, laissée ouverte | `status`, `stdout`, `stderr`                       | Tests, builds et vérifications entre deux exécutions d’agent |
| `sandbox.attach(options)`  | Votre sandbox ouverte, laissée ouverte | `status`, `commits`, `branch`                      | Travailler à la main dans la CLI de l’agent                  |
| `attach(options)`          | Allouée pour l’appel, fermée ensuite   | `status`, `commits`, `branch`, `retainedDirectory` | Une session interactive dans une sandbox neuve               |

Aucun shell n’analyse `arguments` : lancez vous-même `sh -c` pour les tubes ou les motifs. Une sandbox exécute une opération à la fois ; un second appel lancé entre-temps est rejeté avec le code `configuration`.

:::note
`attach` et `interactive: true` exigent un terminal : Docker, Podman, l’hôte et Daytona les prennent en charge, Vercel et Firecracker les refusent.
:::

## Fin d’une commande

| Événement                                         | Défaut                                                   | Résultat                                                                                              |
| ------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Le processus se termine, quel que soit son statut | —                                                        | Se résout à la fin du processus ; vérifiez `status`                                                   |
| Les flux de sortie se ferment avant la fin        | —                                                        | Continue d’attendre le processus                                                                      |
| `deadlineMs` écoulé                               | 600000 (10 minutes) ; 86400000 (24 heures) pour `attach` | Arrête le groupe de processus ; rejette avec le code `timeout` (`TimeoutError` sur Vercel et Daytona) |
| `signal` annulé                                   | —                                                        | Arrête le groupe de processus ; rejette avec la raison du signal                                      |
| `observe` lève une exception                      | —                                                        | Arrête le groupe de processus ; rejette avec cette exception                                          |
| Sortie plus longue que `retain`                   | 65536 caractères par flux                                | Le résultat garde la fin ; `observe` reçoit chaque fragment                                           |

La sandbox reste ouverte après un dépassement de délai ou une annulation. `attach()` applique la politique de branche quand la session se termine avec le statut 0 et conserve le worktree sinon.

## Points d’entrée

Guide : [Sessions de sandbox](../../../guide/sandbox-sessions/) · [Limites et annulation](../../../guide/limits-and-cancellation/) · [Rédiger le brief](../../../guide/briefs/)

- [attach](../../attach/)
- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [Channel](../../channel/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [VariableQuestion](../../variablequestion/)
- [RequiredAgent](../../support-requiredagent/)

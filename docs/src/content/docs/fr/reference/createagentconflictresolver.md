---
title: "createAgentConflictResolver"
description: "createAgentConflictResolver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgentConflictResolver } from "@elie-laloum/outpost/workspaces";
```

## Rôle et comportement

Crée une stratégie explicite qui prépare une fusion dans le workspace de résolution fourni, lance un seul dispatch d’agent puis exécute la vérification obligatoire dans la même sandbox. Exige un sandboxProvider et une commande de vérification non interactive, renvoie le commit vérifié, l’usage et la sortie du contrôle, et ferme sa sandbox quel que soit le résultat. Refuse les entrées non fusionnées, l’ascendance manquante, les changements non ignorés non commités et les commits modifiés par la vérification. Aucun modèle ni sandbox ne s’exécute à la construction.

[Exemple complet et règles détaillées](../../guide/integrating-changes/).

## Paramètres et propriétés

| Nom                       | Type                                               | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------- | -------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`                   | `DispatchAgent`                                    | Requis    | Agent utilisé pour un dispatch de résolution de la fusion en cours ; CLI, harness intégré et agents de repli explicites utilisent leurs protocoles et authentification habituels.                                                                                                                                                                             |
| `options`                 | `AgentConflictResolverOptions`                     | Requis    | Provider d’exécution explicite, commande de vérification obligatoire et consignes, callback d’observation et journal optionnels du dispatch de résolution.                                                                                                                                                                                                    |
| `options.sandboxProvider` | `SandboxProvider`                                  | Requis    | Provider explicite allouant la sandbox de résolution. Indépendant de l’agent et du provider de la tâche initiale ; aucun repli implicite vers l’hôte.                                                                                                                                                                                                         |
| `options.verify`          | `Command`                                          | Requis    | Commande obligatoire non interactive exécutée après le commit de résolution combinée par l’agent, à la racine de la sandbox de résolution. Refuse les réglages directory, terminal et entrée en direct. Un statut non nul échoue avec le code process ; deadlineMs vaut 300000 par défaut et l’annulation de l’appelant est combinée au signal d’intégration. |
| `options.instructions`    | `string \| undefined`                              | Optionnel | Consignes littérales supplémentaires ajoutées au brief de résolution intégré. Elles guident l’agent ; vérification, ascendance et garde-fous de diff sont imposés indépendamment. [Texte exact injecté et limites de personnalisation](../createagentconflictresolver/#outpost-instructions).                                                                 |
| `options.observe`         | `((event: AgentObservation) => void) \| undefined` | Optionnel | Callback historique d’observation de l’agent pour le dispatch de résolution. Ses échecs sont isolés par le mécanisme normal d’observation du dispatch.                                                                                                                                                                                                        |
| `options.logging`         | `Logging \| undefined`                             | Optionnel | Configuration du journal du dispatch dans la sandbox de résolution ; son omission utilise le journal local habituel, false le désactive.                                                                                                                                                                                                                      |

## Retour

`ConflictResolver`

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

Après avoir préparé la fusion conflictuelle dans le workspace de résolution séparé, le résolveur transmet ce brief littéral à son agent :

```text
Resolve the pending Git merge in this workspace. Candidate commit: ${candidateCommit}. Host commit: ${hostCommit}.
Conflicting paths: ${conflictsJSON}. Preserve the intent of both branches.
Resolve every unmerged entry, stage the resolution and commit the merge. Do not abort the merge, rewrite history, change other branches or weaken tests to make them pass.
${instructions}
```

`candidateCommit` et `hostCommit` sont les commits source et hôte figés dans `ConflictContext`. `conflictsJSON` correspond à `JSON.stringify(context.conflicts)`. `instructions` vaut `options.instructions`, ou une chaîne vide ; son contenu est ajouté sans expansion de variables ou de commandes.

`instructions` complète les consignes sans remplacer le texte intégré. Un [ConflictResolver](../conflictresolver/) personnalisé peut remplacer la stratégie entière. La vérification, les contrôles d’ascendance et les garde-fous du workspace sont imposés séparément du prompt. Une fusion sans conflit n’appelle pas cet agent.

Implémentation : [agent-conflict-resolver.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/agent-conflict-resolver.ts).

## Signature

```ts
export declare function createAgentConflictResolver(
  agent: DispatchAgent,
  options: AgentConflictResolverOptions,
): ConflictResolver;
```

## Contrats associés

- [AgentConflictResolverOptions](../agentconflictresolveroptions/)
- [ConflictResolver](../conflictresolver/)
- [DispatchAgent](../dispatchagent/)

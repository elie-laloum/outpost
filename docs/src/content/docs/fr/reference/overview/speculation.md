---
title: "Exécution spéculative — Vue d’ensemble"
description: "Mettez plusieurs candidats en concurrence sur des branches distinctes, validez chacun dans sa sandbox et sélectionnez une branche sans la fusionner."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Déroulement d’une course

:::caution[Expérimental]
La spéculation est expérimentale : ses options et ses résultats peuvent encore changer.
:::

`speculate()` démarre chaque candidat depuis le `HEAD` du checkout et garde le premier que `validate` accepte. Il sélectionne une branche ; il ne la fusionne jamais.

| Étape      | Ce qui se passe                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Démarrage  | Chaque candidat reçoit la branche `outpost/speculation/<id>/<key>`, son worktree et sa sandbox ; `concurrency` s’exécutent à la fois |
| Admission  | Chaque démarrage consomme une unité de `budget.attempts` ; à la limite, aucun candidat ne démarre et ceux en cours terminent         |
| Validation | `validate` s’exécute dans la sandbox active du candidat ; le `HEAD` lu à son retour devient le `commit` du candidat                  |
| Sélection  | Le premier candidat accepté dont la sandbox se ferme gagne ; les candidats en cours sont annulés, ceux en attente ignorés            |
| Arrêt      | Atteindre une limite de `budget.usage` annule les candidats en cours ; annuler `signal` termine la course avec le statut `aborted`   |
| Nettoyage  | Une sandbox qui ne se ferme pas en `cleanupMs` (30000 par défaut) laisse le candidat avec `cleanup: "pending"`                       |
| Résultat   | `integration` contient une vérification `git merge-tree` du gagnant contre le `HEAD` courant, sans toucher aux fichiers ni à l’index |

:::note
Une vérification `clean` est une observation, pas une autorisation. Relancez `checkSpeculationIntegration()` avec `winner.branch` et `winner.commit` juste avant de fusionner.
:::

## Courses durables et récupération

`durability` enregistre la propriété, les tentatives, l’usage et les sorties via un Transport, et chaque écriture est conditionnée à la dernière révision. Il exige un provider doté de `recover` : Docker et Podman en mode monté ; les conteneurs isolés et les autres providers le refusent avec le code `configuration`.

| Situation                                                 | Résultat                                            | Que faire                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Le `runId` est déjà terminé                               | Le résultat enregistré est renvoyé ; rien ne rejoue | Utilisez un nouveau `runId` pour une nouvelle course                                                             |
| Un autre coordinateur possède le `runId`, actif ou planté | `speculate()` rejette : déjà possédé                | Arrêtez ce coordinateur, lisez la révision de l’objet et passez-la à `recoverSpeculation()`                      |
| Des candidats s’exécutaient ou se validaient à l’arrêt    | `speculate()` rejette sans autorisation             | Passez `resume: "retry-incomplete"` : les candidats interrompus repartent sur `…/<key>/<n+1>` depuis la baseline |
| Une sandbox a dépassé `cleanupMs`                         | `cleanup: "pending"` ; la course reste possédée     | Récupérez la propriété ; le `speculate()` suivant arrête d’abord la ressource enregistrée                        |
| La course s’est terminée avec le statut `quota`           | Pas définitif                                       | Rappelez `speculate()` : seuls les candidats arrêtés par un quota rejouent, en nouvelles tentatives              |
| Version, briefs, budget, provider ou dépôt modifiés       | `speculate()` rejette : checkpoint incompatible     | Démarrez sous un nouveau `runId`                                                                                 |

Les courses durables conservent tous les worktrees, et tentatives et tokens se cumulent entre appels : un rejeu consomme du budget. Les candidats déjà validés gardent leur résultat ; les tentatives antérieures figurent dans `previousAttempts`.

:::caution
`recoverSpeculation()` libère seulement la propriété : il n’arrête et ne supprime rien. Arrêtez d’abord l’ancien coordinateur ; le contrôle de révision rejette ses écritures ultérieures, pas ses effets de bord.
:::

## Points d’entrée

Guide : [Candidats concurrents](../../../guide/speculation/) · [Mettre des agents en concurrence](../../../guide/compete-agents/) · [Ajouter un provider de sandbox](../../../guide/custom-sandbox-providers/)

- [speculate](../../speculate/)
- [recoverSpeculation](../../recoverspeculation/)
- [checkSpeculationIntegration](../../checkspeculationintegration/)
- [SpeculationOptions](../../speculationoptions/)
- [SpeculativeCandidate](../../speculativecandidate/)
- [SpeculativeValidation](../../speculativevalidation/)
- [SpeculationResult](../../speculationresult/)
- [SpeculativeCandidateResult](../../speculativecandidateresult/)
- [SpeculationDurability](../../speculationdurability/)
- [SpeculationIntegration](../../speculationintegration/)

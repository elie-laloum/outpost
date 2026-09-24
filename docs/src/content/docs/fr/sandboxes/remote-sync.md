---
title: "Synchronisation distante"
description: "Synchronisation distante — Outpost"
sidebar:
  order: 6
---

Les providers distants travaillent sur un autre système de fichiers. Outpost transfère l’historique Git et les entrées sélectionnées, puis rapatrie les changements après les opérations.

## État initial

Les workspaces distants exigent `named` ou `integrate` ; le défaut est `integrate`. Seul l’historique commité est envoyé par défaut. Passez `includeUncommitted: true` à la création ou au dispatch pour inclure les patches locaux et les fichiers non suivis. Les `copies` explicites sont également transférées.

L’environnement distant doit disposer de Git et des prérequis du provider. Outpost peut installer l’agent sélectionné s’il manque (`bootstrap: true` par défaut). Utilisez `bootstrap: false` avec une image déjà préparée.

Une destination neuve reçoit un bundle Git complet. Si une destination préinitialisée possède un ancêtre vérifié du commit demandé et tous ses objets accessibles, Outpost envoie seulement l’historique manquant ; un HEAD identique et vérifié ne nécessite aucun envoi d’historique. Une base absente ou sans lien entraîne l’envoi d’un bundle complet.

## Retour des changements

Les dispatches et commandes synchronisent le workspace distant vers l’hôte. Les nouveaux commits conservent leurs identifiants, auteurs, dates et relations de parenté. Les synchronisations successives gèrent les modifications devenant ensuite des commits, sans les dupliquer.

Les rapatriements suivants utilisent un bundle différentiel lorsque les deux côtés possèdent le dernier commit synchronisé et que l’historique distant en descend. Outpost importe ce bundle dans un dépôt local indépendant, le vérifie, puis reconstruit un `commits.bundle` complet pour la récupération. Le trafic réseau diminue ; la validation locale exige toujours de l’espace disque et du traitement pour tout l’historique accessible. Un téléchargement interrompu peut laisser des artefacts incomplets.

Outpost compare l’état de l’hôte au dernier état synchronisé avant d’appliquer les changements. Les modifications qui se chevauchent, les changements locaux concurrents et l’historique distant réécrit provoquent une erreur plutôt qu’un remplacement silencieux. Évitez de modifier localement un workspace pendant l’activité de sa sandbox distante.

La validation Git et des patches s’effectue dans un dépôt indépendant sans modifier l’index, `FETCH_HEAD` ni les enregistrements des worktrees de l’hôte. L’import sur l’hôte commence uniquement après validation et sauvegardes réussies.

L’historique entrant, les patches et les fichiers non suivis sont sauvegardés dans `.outpost/recovery` avant application. Un transfert échoué conserve les éléments disponibles ; une interruption peut laisser une récupération incomplète. Consultez [les procédures de récupération](../../operations/recovery/) avant d’appliquer manuellement un bundle ou un patch.

## Limites de transfert

`limits.copyMs` surcharge le délai des transferts pilotés par l’orchestration ; le défaut est de 120 secondes. Les leases personnalisés reçoivent `{ signal, deadlineMs }` en troisième argument de `upload` et `download`. Les providers intégrés gèrent fichiers et répertoires.

Les providers cloud n’exposent pas de session interactive native dans cette version. Utilisez les dispatches et commandes non interactifs.

---
title: "Écrire un provider de sandbox"
description: "Écrire un provider de sandbox — Outpost"
sidebar:
  order: 2
---

Implémentez `SandboxProvider` et retournez un `SandboxLease` depuis `acquire(context)`. Le provider possède l’allocation ; le lease possède les commandes, transferts et fermeture.

`SandboxContext` fournit `repository` sur l’hôte, `directory` du worktree, `gitDirectories` nécessaires, `variables` déclarées et un `signal` facultatif. N’exposez pas silencieusement d’autres répertoires de l’hôte.

| Membre du lease                           | Comportement attendu                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `root`, `home`                            | Chemins réels du workspace et du home côté exécution.                                    |
| `invoke(command)`                         | Respecter répertoire, environnement, stdin, observation, rétention, délai et annulation. |
| `upload(source, destination, options?)`   | Transférer fichiers/répertoires de l’hôte vers l’environnement.                          |
| `download(source, destination, options?)` | Transférer fichiers/répertoires de l’environnement vers l’hôte.                          |
| `release()`                               | Nettoyage idempotent, y compris des processus et sessions en cours.                      |

Choisissez le placement : `mounted` partage le worktree, `remote` active la synchronisation Git, `host` exécute directement. `mountedSandboxProvider({ name, variables?, acquire })` et `remoteSandboxProvider(...)` ajoutent le placement et figent la définition ; ils n’implémentent pas le transport.

Les transferts acceptent `signal` et `deadlineMs`. Gérez données binaires et répertoires imbriqués. L’annulation doit arrêter les commandes sans détruire l’environnement réutilisable. Refusez explicitement l’interactivité ou l’élévation non prises en charge.

Écrivez des tests de contrat pour échec d’allocation, appel après fermeture, fermeture répétée, statut non nul, flux, limites de sortie, transferts binaires et nettoyage après annulation. Les types SDK restent dans l’adapter du provider ; les contrats du domaine ne doivent pas en dépendre.

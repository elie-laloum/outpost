---
title: "Ligne de commande"
description: "Générer les projets, gérer les images et inspecter la récupération."
---

La CLI prépare les projets de workflow et gère leur environnement. Les requêtes d’agent s’exécutent depuis le script généré ou votre application TypeScript.

## Créer un projet

```sh
npx @elie-laloum/outpost init --yes --directory ./automation --repository ../application --agent codex --sandbox-provider docker --install
```

`--directory` choisit le dossier du workflow. `--repository` sélectionne indépendamment le checkout Git cible ; un chemin relatif est résolu par le workflow généré depuis son dossier. `--yes` rend la préparation non interactive. `--install` installe les dépendances du projet.

| Option                        | Rôle                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `--agent`                     | `codex`, `claude`, `antigravity`, `copilot` ou `kimi`.                          |
| `--sandbox-provider`          | `docker`, `podman`, `local`, `vercel` ou `daytona`.                             |
| `--authentication`            | `account`, `account-token` si pris en charge, ou `usage`.                       |
| `--model`                     | Modèle explicite ; requis pour l’API Kimi et les endpoints Codex personnalisés. |
| `--base-url`, `--api-key-env` | Endpoint Responses Codex personnalisé et variable de clé.                       |
| `--manager`                   | npm, pnpm, yarn ou bun pour le projet généré.                                   |
| `--image`                     | Nom d’image du conteneur.                                                       |
| `--no-build`                  | Sauter le build Docker/Podman activé par défaut.                                |

## Fichiers générés

Le projet contient script d’exécution, brief, déclarations d’environnement, règles d’exclusion et recette du fournisseur. Les manifestes et règles d’exclusion existants sont préservés. Les manifestes explicitement CommonJS utilisent `run.mts` ; les autres projets utilisent `run.ts`.

## Opérations

Utilisez `doctor` pour les [contrôles préalables](../preflight-checks/), `image build/remove` pour les [images](../image-recipes/) et `recovery inspect/verify/restore/prune` pour la [récupération](../failure-recovery/). `--json` sélectionne les rapports lisibles par machine sur les commandes de diagnostic et récupération concernées. Chaque commande possède son propre `--help`.

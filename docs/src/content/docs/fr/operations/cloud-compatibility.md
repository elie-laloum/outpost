---
title: Vérifications de compatibilité hébergée
description: Vérifier Vercel et Daytona sur activation explicite, sans appel de modèle.
sidebar:
  order: 8
---

La fixture contributrice `test/cloud-live.ts` crée des sandboxes Vercel ou Daytona jetables. Elle vérifie la fin du processus après fermeture des sorties, les codes non nuls, les délais, l'annulation, la réutilisation, les transferts binaires, les permissions exécutables, les liens symboliques, les chemins avec apostrophes et les téléchargements incrémentaux par lots. Elle ne téléverse ni votre dépôt ni des identifiants de modèle. L'allocation et l'exécution cloud peuvent être facturées.

## Exécution manuelle

Dans une copie d'Outpost, installez les dépendances verrouillées avec `npm ci` et utilisez Node.js 24+. Exportez les identifiants via votre gestionnaire de secrets ou l'environnement du shell ; ne placez pas leurs valeurs dans des fichiers suivis.

| Fournisseur | Variables d'environnement requises                    |
| ----------- | ----------------------------------------------------- |
| Vercel      | `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID` |
| Daytona     | `DAYTONA_API_KEY`                                     |

Cette fixture utilise explicitement un jeton d'accès Vercel, avec les identifiants d'équipe et de projet, plutôt que la découverte OIDC ambiante. Consultez l'[authentification Vercel](https://vercel.com/docs/sandbox/concepts/authentication) et la [configuration Daytona](https://www.daytona.io/docs/en/typescript-sdk/daytona/). L'accès et la facturation des modèles sont distincts de l'allocation du fournisseur ; aucun accès à un modèle n'est nécessaire ici.

```sh
OUTPOST_CLOUD_LIVE=1 OUTPOST_CLOUD_PROVIDERS=vercel,daytona node test/cloud-live.ts > cloud-compatibility.json
```

Ajoutez `OUTPOST_CLOUD_AGENTS=1` pour installer les versions npm courantes de `@openai/codex` et `@anthropic-ai/claude-code` dans chaque sandbox jetable. Le rapport ne conserve que les versions numériques des CLI. Leurs commandes réelles de version et d'aide vérifient les options de démarrage, reprise et fork des adaptateurs. Cela nécessite un accès réseau à npm et davantage de temps d'exécution. Ces vérifications portent sur la syntaxe CLI ; elles ne prouvent ni une exécution authentifiée de modèle, ni la capture de conversations, ni le comportement complet de l'agent. Le rapport indique toujours que les tours de modèle authentifiés sont ignorés.

Le programme écrit du JSON de schéma version 1 avec des états `pass`, `fail` ou `skipped` par fournisseur et vérification. Il omet les erreurs SDK brutes, les sorties de commandes, les chemins, les jetons et les contenus de fichiers. Le code de sortie 0 signifie que les vérifications exécutées ont réussi ; 1 indique un échec de contrat ou de nettoyage ; 2 signifie que tous les fournisseurs ont été ignorés. Consultez les états individuels : la réussite d'un fournisseur ne transforme pas les identifiants absents d'un autre en réussite réelle.

## Vérifications planifiées

Le workflow distinct `.github/workflows/cloud-compatibility.yml` s'exécute chaque lundi et accepte un lancement manuel. La CI ordinaire reste sans identifiants. Les jobs planifiés et manuels exigent la branche `main`. Pour l'activer dans le miroir GitHub :

1. Créez l'environnement GitHub `cloud-compatibility` ; configurez ses protections et les secrets du tableau.
2. Définissez la variable Actions du **dépôt** `OUTPOST_CLOUD_LIVE` à `1`. Sans elle, les jobs sont ignorés avant allocation. Une variable limitée à l'environnement ne peut pas activer cette condition au niveau du job.
3. Vérifiez les règles d'approbation des tâches planifiées, les quotas et le budget. Chaque fournisseur s'exécute séparément ; un identifiant absent produit un rapport JSON ignoré et un code de job non nul, jamais une réussite réelle.

Le workflow conserve le JSON nettoyé même après un échec. Les exécutions planifiées incluent les CLI courantes ; le lancement manuel permet de les désactiver. Les versions SDK suivent le fichier de verrouillage du dépôt. Ce workflow ne déploie et ne publie rien.

## Nettoyage et dépannage

Chaque fournisseur dispose d'un délai global de quatre minutes, de commandes bornées et de trente secondes supplémentaires pour le nettoyage. Une libération réussie du bail est répétée pour vérifier son idempotence ; les échecs déclenchent le nettoyage dans `finally`. Un bail reçu après le délai d'allocation est libéré à son arrivée. Un échec avant réception d'un bail est signalé séparément sans prétendre que le nettoyage est confirmé, même si la libération d'un bail tardif est tentée en arrière-plan. Les délais bornent l'attente de la fixture ; ils ne garantissent pas l'annulation de chaque requête SDK ou opération de nettoyage du fournisseur.

Vercel reçoit une durée de vie de cinq minutes. Daytona reçoit un arrêt automatique après cinq minutes d'inactivité et une suppression à l'arrêt ; un délai d'inactivité n'est pas une durée de vie absolue. Ces protections complètent le nettoyage, qui ne peut être garanti après l'arrêt forcé du processus, une API indisponible ou une réponse d'allocation incomplète. Après `cleanup-unconfirmed`, un échec d'allocation, une annulation du workflow ou un dépassement du délai du job, inspectez le tableau de bord du fournisseur et supprimez les ressources restantes. Le test ne réessaie pas automatiquement l'allocation.

Pour `contract-failed`, relancez d'abord la suite déterministe (`node --test test/functional/cloud-*.test.ts`), puis vérifiez les versions SDK/CLI et la disponibilité du fournisseur. Les rapports masquent volontairement les erreurs distantes ; examinez les détails en privé dans le tableau de bord du fournisseur. Un échec de l'aide CLI peut révéler une modification des options en amont malgré des vérifications d'infrastructure réussies. La suite déterministe utilise des doubles SDK et des processus locaux isolés ; elle ne prouve pas le fonctionnement des ressources d'un compte réel ou des appels de modèles payants.

Pour sonder une sandbox que vous possédez déjà, consultez les [diagnostics](../doctor/).

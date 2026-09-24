---
title: Restaurer un transfert conservé
description: Planifier et reconstruire l’état précédent ou entrant du dépôt dans un checkout séparé.
sidebar:
  order: 3
---

Après [l’inventaire des données de récupération](../recovery/) et [la vérification du transfert conservé](../recovery-verification/), choisissez l’état à reconstruire. La restauration crée un checkout Git indépendant dans un nouveau dossier extérieur au dépôt source, aux métadonnées Git et au transfert. Son dossier parent doit déjà exister. Toute destination existante, même vide ou symbolique, est refusée.

```sh
outpost recovery restore --directory /recovery/session/transfer --repository /projects/repository --destination /projects/restored --side previous --json
outpost recovery restore --directory /recovery/session/transfer --repository /projects/repository --destination /projects/restored --side previous --apply
```

Sans `--apply`, la commande prépare un plan et laisse la destination absente. Chaque invocation vérifie une copie privée du transfert contre son manifeste SHA-256 enregistré, puis contrôle les objets Git et l’applicabilité des patches en isolation. `--apply` répète ces contrôles avant de créer exclusivement la destination. Si un autre processus crée ce chemin, la restauration est refusée. Le checkout original, son index, les enregistrements de branches et les artefacts de récupération restent inchangés.

| Sélection         | État restauré                                                                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--side previous` | Le commit précédent enregistré, le patch du répertoire de travail, celui de l’index et les fichiers non suivis précédents. Les modifications indexées et non indexées restent distinctes, y compris sur un même fichier.                                       |
| `--side incoming` | Le commit entrant enregistré, le patch distant du répertoire de travail et les fichiers entrants. L’indexation distante n’était pas capturée par le format de transfert : les changements restent non indexés et le résultat indique `staging: "unavailable"`. |

Les fichiers binaires, permissions prises en charge et liens symboliques finaux sont conservés. Un fichier supplémentaire ne peut remplacer un chemin restauré existant ni traverser un parent symbolique. La restauration s’arrête en cas de conflit ; elle n’écrase jamais le checkout source. Le checkout obtenu possède un HEAD détaché et aucun remote `origin`. Examinez ses différences et créez une branche avant d’intégrer explicitement ses modifications au dépôt original.

Si une restauration échoue après création de la destination, l’erreur indique ce checkout partiel. Il est conservé avec le transfert original pour inspection. Seule la copie temporaire privée de vérification est supprimée. Choisissez une autre destination pour réessayer, ou examinez et supprimez explicitement le checkout partiel.

## Planifier et appliquer via l’API

```ts
import {
  planRecoveryRestore,
  restoreRecoveryTransfer,
} from "@elie-laloum/outpost";

const plan = await planRecoveryRestore({
  directory: "/recovery/session/transfer",
  repository: "/projects/repository",
  destination: "/projects/restored",
  side: "previous",
});
console.log(plan.commit, plan.payloads, plan.staging);
// Appliquer explicitement le plan examiné.
const restored = await restoreRecoveryTransfer(plan);
console.log(restored.directory, restored.sourceRetained);
```

Le plan lie les chemins canoniques, l’état choisi, le commit, la liste des fichiers, la limite d’octets et l’empreinte du manifeste. L’application refuse les plans modifiés et les transferts dont le manifeste ou les octets couverts ont changé. Un aller-retour JSON préserve le plan ; il ne contient aucun contenu brut de fichier. La CLI crée un nouveau plan à chaque invocation ; l’API permet de conserver puis d’appliquer le même plan examiné.

## Périmètre et limites

Un transfert complet avec `checksums.json` est requis. Manifeste absent, métadonnées invalides, fichiers corrompus, commits indisponibles ou patches invalides provoquent un échec avant la création de la destination. Le dépôt source doit fournir les objets absents du bundle. Les dépôts superficiels, partiels/promisor ou utilisant des objets alternatifs ne sont pas pris en charge. Les opérations Git désactivent les variables Git héritées, la configuration globale/système, les hooks, fsmonitor et la maintenance automatique ; le clone possède ses propres objets et ne télécharge rien sur le réseau.

Le budget par défaut pour les empreintes et fichiers de la copie est de 1 Gio ; `maxBytes` ou `--max-bytes` le modifie. Les lectures de métadonnées sont bornées séparément. L’espace disque du clone et du checkout Git est hors de ce budget. Le manifeste non signé vérifie les octets, types d’entrées et textes des liens ; il n’authentifie pas la source et ne certifie ni les permissions ni la cohérence de capture. Utilisez des données de confiance et arrêtez le producteur en échec avant la récupération.

Cette opération reconstruit l’état du dépôt capturé par un transfert. Les fichiers ignorés non capturés, artefacts de session parents, conversations natives des agents, dépôts de sous-modules, dépendances externes, sessions des providers et identifiants ne sont pas reconstruits. Elle n’effectue aucune fusion hôte, aucun push automatique ni aucun redémarrage de provider.

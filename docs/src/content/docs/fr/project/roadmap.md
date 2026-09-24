---
title: "Roadmap"
description: "Roadmap — Outpost"
sidebar:
  order: 3
---

La roadmap décrit des ajouts prévus, pas des prérequis à l’utilisation de la version actuelle. Elle ne constitue pas un engagement de date.

## Disponible en 2.0.0

Sandboxes réutilisables et workspaces Git indépendants ; adapters Claude Code et Codex ; capture, reprise et fork natifs ; providers Docker, Podman, local, Vercel et Daytona ; prompts, itération, réponses structurées et hooks ; workflows typés ; CLI, documentation bilingue et publication automatisée.

La version 2.0.0 ajoute des projets de workflow autonomes avec `init --repository`, des chemins de dépôt, de brief et d’environnement relatifs au script, la progression de l’agent et les détails de récupération après annulation. Les workflows typés peuvent coordonner des dépôts indépendants via des tâches isolées. Les campagnes d’issues et les connecteurs de backlog ont été supprimés ; l’initialisation génère un script de dispatch.

## Implémenté sur main — non publié

Diagnostic hôte avec `outpost doctor` : Node.js, Git, accès Docker/Podman, versions des agents hôtes, résumé des contrats providers et rapports JSON. L’option `--image` démarre et nettoie une sandbox Docker/Podman temporaire et vérifie la version de son agent sans réseau ni appel modèle. Elle contrôle aussi l’aide des commandes de lancement/reprise/fork et les noms d’options utilisés par les adapters non interactifs par défaut. Voir [le diagnostic hôte](../../operations/doctor/) pour les vérifications et limites.

L’[inspection en lecture seule du stockage de récupération](../../operations/recovery/#inspecter-le-stockage-conservé) décrit les fichiers conservés et leurs tailles logiques, avec limites de parcours et résultats partiels explicites. L’option `--git` indique branches, HEAD détachées, état clean/dirty et problèmes d’enregistrement des workspaces. L’option `--locks` lit les métadonnées bornées des verrous et indique la présence locale des PID sans prouver leur propriété. `recovery verify --directory` vérifie la structure d’un transfert distant conservé et la présence des fichiers de sauvegarde référencés. Les nouvelles sauvegardes de transfert enregistrent des manifestes SHA-256 non signés ; `recovery verify --checksums` compare les contenus couverts à ces empreintes avec un budget d’octets. L’authenticité, l’activité des ressources et la possibilité de restauration restent non vérifiées.

## Prochaines étapes — efficacité et diagnostic

- Manifestes de fichiers incrémentaux et transferts compressés avec garanties de récupération.
- Caches de dépendances et images d’agents préconstruites avec provenance signée.
- Vérification de l’intégrité et de l’activité des ressources de récupération, nettoyage explicite, rétention et quotas de stockage.
- Métriques structurées, OpenTelemetry et budgets par workflow.
- Diagnostic des sandboxes de workflow existantes, vérification des capacités cloud et rapports de compatibilité des protocoles agents.
- Davantage de fixtures cloud et de vérifications réelles planifiées.

## À plus long terme — orchestration durable

- Checkpoints persistants et reprise après redémarrage.
- Files distribuées et leases de workers avec fencing tokens.
- Nœuds d’approbation et de pause/reprise.
- Contrats d’artefacts typés entre tâches isolées avec traçabilité.
- Terminaux cloud natifs lorsque des API PTY fiables existent.
- Nouveaux agents via les ports d’adapters existants.

## Recherche

Isolation renforcée des métadonnées Git contre les agents hostiles, backends microVM, réseau sortant finement contrôlé et exécution spéculative avec maîtrise des conflits et coûts.

Consultez [le changelog](../changelog/) pour les fonctions livrées et [l’architecture](../architecture/) pour les frontières d’extension.

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

## Prochaines étapes — efficacité et diagnostic

- Manifestes de fichiers incrémentaux et transferts compressés avec garanties de récupération.
- Caches de dépendances et images d’agents préconstruites avec provenance signée.
- Inspection/nettoyage de récupération, rétention et quotas de stockage.
- Métriques structurées, OpenTelemetry et budgets par workflow.
- Diagnostic des capacités providers et rapports de compatibilité des CLI.
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

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

L’[inspection de récupération](../../operations/recovery/) couvre l’inventaire, l’état Git des workspaces et les observations locales des verrous. Les nouveaux verrous Linux incluent les identités de l’hôte, du démarrage, du namespace et du processus ; une propriété incertaine empêche la reprise automatique. La [vérification](../../operations/recovery-verification/) contrôle les structures conservées, les manifestes SHA-256 non signés et, sur demande, les objets Git et l’applicabilité indépendante des patches dans une copie isolée. Les [politiques de rétention](../../operations/storage-retention/) proposent simulation, nettoyage explicite avec revalidation des workspaces et journaux éligibles, et observations d’admission des quotas. Les artefacts de récupération et ressources incertaines restent protégés.

Les [transferts distants](../../operations/remote-transfers/) utilisent des manifestes SHA-256 incrémentaux et des lots compressés bornés pour télécharger les fichiers non suivis de Vercel/Daytona. Les fichiers hôtes inchangés vérifiés sont réutilisés et chaque tentative conserve ses propres données entrantes complètes pour la récupération. Les uploads initiaux, patches suivis et bundles Git autonomes gardent leur fonctionnement actuel.

Les [caches de dépendances](../../providers/dependency-caches/) sont des volumes Docker/Podman optionnels avec clés d’invalidation explicites. L’[outillage des images d’agents](../../providers/agent-images/) construit des entrées épinglées et fournit un workflow de publication contrôlé avec vérification de provenance signée. La publication et la vérification des signatures doivent encore être exécutées dans l’environnement de publication configuré ; ajouter ce workflow ne publie pas d’image.

Les [événements et métriques de workflow](../../operations/telemetry/) alimentent une intégration OpenTelemetry optionnelle avec tracer et meter injectés. Les [budgets](../../workflows/budgets/) limitent les admissions de tentatives et la consommation observée, y compris retries et tâches concurrentes ; ils ne garantissent pas un plafond de facturation.

Les [diagnostics avancés](../../operations/doctor/) inspectent une sandbox existante sous propriété exclusive, avec probe binaire optionnelle et nettoyage. Les contrôles des protocoles embarqués sont des fixtures structurelles hors ligne ; ils ne certifient pas le fonctionnement authentifié d’un modèle.

Les [tests cloud](../../operations/cloud-compatibility/) ajoutent des fixtures déterministes et une campagne Vercel/Daytona planifiée ou manuelle, activée explicitement avec identifiants et rapports filtrés. Les contrôles réels restent à exécuter dans les comptes configurés ; les appels modèles sont explicitement exclus.

## Suites possibles — efficacité et diagnostic

- Uploads initiaux et transferts d’historique Git incrémentaux au-delà de l’optimisation actuelle des fichiers non suivis.
- Orchestration d’une restauration complète, suivi d’activité de ressources supplémentaires et réservations de stockage au-delà des observations d’admission des quotas.

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

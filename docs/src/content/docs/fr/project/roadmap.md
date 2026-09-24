---
title: "Roadmap"
description: "Roadmap — Outpost"
sidebar:
  order: 3
---

La roadmap décrit des ajouts prévus, pas des prérequis à l’utilisation de la version actuelle. Elle ne constitue pas un engagement de date.

## Socle disponible jusqu’à la version 3.0.0

Sandboxes réutilisables et workspaces Git indépendants ; adapters Claude Code et Codex ; capture, reprise et fork natifs ; providers Docker, Podman, local, Vercel et Daytona ; prompts, itération, réponses structurées et hooks ; workflows typés ; CLI, documentation bilingue et publication automatisée.

La version 2.0.0 a introduit des projets de workflow autonomes avec `init --repository`, des chemins de dépôt, de brief et d’environnement relatifs au script, la progression de l’agent et les détails de récupération après annulation. Les workflows typés peuvent coordonner des dépôts indépendants via des tâches isolées. Les campagnes d’issues et les connecteurs de backlog ont été supprimés ; l’initialisation génère un script de dispatch.

## Ajouts de la version 3.0.0

Cette version majeure étend les contrats TypeScript publics : les implémentations personnalisées de `Sandbox`, `TaskContext` et `WorkflowResult` doivent fournir les nouveaux membres de diagnostic et de consommation. Les observateurs exhaustifs doivent accepter `attempt` et `usage`. Voir le [changelog](../changelog/) pour les adaptations et changements de comportement.

Diagnostic hôte avec `outpost doctor` : Node.js, Git, accès Docker/Podman, versions des agents hôtes, résumé des contrats providers et rapports JSON. L’option `--image` démarre et nettoie une sandbox Docker/Podman temporaire et vérifie la version de son agent sans réseau ni appel modèle. Elle contrôle aussi l’aide des commandes de lancement/reprise/fork et les noms d’options utilisés par les adapters non interactifs par défaut. Voir [le diagnostic hôte](../../operations/doctor/) pour les vérifications et limites.

L’[inspection de récupération](../../operations/recovery/) couvre l’inventaire, l’état Git des workspaces et les observations locales des verrous. Les nouveaux verrous Linux incluent les identités de l’hôte, du démarrage, du namespace et du processus ; une propriété incertaine empêche la reprise automatique. La [vérification](../../operations/recovery-verification/) contrôle les structures conservées, les manifestes SHA-256 non signés et, sur demande, les objets Git et l’applicabilité indépendante des patches dans une copie isolée. Les [politiques de rétention](../../operations/storage-retention/) proposent simulation, nettoyage explicite avec revalidation des workspaces et journaux éligibles, et observations d’admission des quotas. Les artefacts de récupération et ressources incertaines restent protégés.

Les [transferts distants](../../operations/remote-transfers/) utilisent des manifestes SHA-256 incrémentaux et des lots compressés bornés pour télécharger les fichiers non suivis de Vercel/Daytona. Les fichiers hôtes inchangés vérifiés sont réutilisés et chaque tentative conserve ses propres données entrantes complètes pour la récupération. Les uploads initiaux, patches suivis et bundles Git autonomes gardent leur fonctionnement actuel.

Les [caches de dépendances](../../providers/dependency-caches/) sont des volumes Docker/Podman optionnels avec clés d’invalidation explicites. L’[outillage des images d’agents](../../providers/agent-images/) construit des entrées épinglées et fournit un workflow de publication contrôlé avec vérification de provenance signée. La publication et la vérification des signatures doivent encore être exécutées dans l’environnement de publication configuré ; ajouter ce workflow ne publie pas d’image.

Les [événements et métriques de workflow](../../operations/telemetry/) alimentent une intégration OpenTelemetry optionnelle avec tracer et meter injectés. Les [budgets](../../workflows/budgets/) limitent les admissions de tentatives et la consommation observée, y compris retries et tâches concurrentes ; ils ne garantissent pas un plafond de facturation.

Les [diagnostics avancés](../../operations/doctor/) inspectent une sandbox existante sous propriété exclusive, avec probe binaire optionnelle et nettoyage. Les contrôles des protocoles embarqués sont des fixtures structurelles hors ligne ; ils ne certifient pas le fonctionnement authentifié d’un modèle.

Les [tests cloud](../../operations/cloud-compatibility/) ajoutent des fixtures déterministes et une campagne Vercel/Daytona planifiée ou manuelle, activée explicitement avec identifiants et rapports filtrés. Les contrôles réels restent à exécuter dans les comptes configurés ; les appels modèles sont explicitement exclus.

## Disponible en 4.0.0

La version 4.0.0 ajoute les capacités ci-dessous. Les nouvelles unions publiques de statuts des workflows demandent aux consommateurs exhaustifs de traiter les statuts de tâche `paused` et `rejected`, ainsi que le statut de résultat de workflow `paused`. Les prototypes de recherche de la section suivante sont livrés sur activation explicite, avec leurs limites documentées ; la publication ne prouve pas une validation cloud réelle, microVM ou d’image signée.

- Les [réservations de stockage](../../operations/storage-retention/) coordonnent les rédacteurs locaux coopérants et peuvent suivre la propriété du workspace. L’[activité des ressources](../../operations/recovery/) enregistre les sandboxes, opérations et nettoyages observés localement ; elle n’énumère pas les comptes distants.
- La [restauration de récupération](../../operations/recovery-restoration/) reconstruit l’état précédent ou entrant conservé dans un nouveau dossier isolé après contrôles d’intégrité et Git. Elle ne restaure ni fichiers ignorés, ni dépôts de sous-modules, ni état du provider, ni conversations.
- Les [uploads](../../operations/remote-transfers/) regroupent et vérifient les fichiers/liens ; les copies de dossiers conservent leur fonctionnement existant. Les [transferts Git](../../sandboxes/remote-sync/) utilisent un historique différentiel vérifié lorsque possible ; la récupération conserve des bundles complets et la validation locale traite encore l’historique complet.
- Les [checkpoints](../../workflows/checkpoints/) conservent les résultats JSON et la consommation, avec répétition explicite des tâches inachevées. Les [approbations et pauses](../../workflows/approvals/) conservent demandes et décisions ; les acteurs déclarés sont des métadonnées de confiance, pas une authentification.
- Les [artefacts typés](../../workflows/artifacts/) fournissent valeurs validées, stockage immuable et filiation non signée. Les [files persistantes](../../workflows/distributed/) utilisent SQLite et des workers HTTP optionnels avec fencing, jeton partagé et TLS externe. Les répétitions peuvent reproduire des effets ; la consommation terminale est différée et les reçus empêchent son double comptage.
- Les [terminaux Daytona](../../providers/daytona/) utilisent son API PTY native. Les tests déterministes couvrent l’adapter ; une validation réelle avec compte reste nécessaire. Vercel refuse toujours l’attachement interactif.
- [Gemini CLI](../../agents/gemini/) ajoute adapter, bootstrap, installation dans les images générées et diagnostics épinglés à 0.61.0. Seules les nouvelles sessions sont prises en charge : aucune capture native, reprise, fork ou réparation automatique de réponse.
- Les [rapports cloud](../../operations/cloud-compatibility/) identifient commit source, runtime et date d’exécution. La [publication d’images](../../providers/agent-images/) conserve les preuves de vérification de signature réussie. Ces workflows ne prouvent pas qu’une campagne réelle ou une publication signée a eu lieu.

## Prototypes de recherche de la version 4.0.0, sur activation explicite

- Les [dépôts Docker/Podman isolés](../../providers/repository-isolation/) évitent le montage du checkout et des métadonnées Git hôtes. Ils conservent les limites des conteneurs concernant montages, caches et confiance envers l’hôte.
- [Firecracker](../../providers/firecracker/) nécessite Linux KVM, TAP, image invitée et SSH préparés. Il possède des tests simulés et une fixture réelle optionnelle ; aucun démarrage réel n’est établi ici. Jailer, cgroups, snapshots, performances et tests adversariaux restent à terminer.
- Les [politiques sortantes](../../sandboxes/egress/) proposent le blocage total des conteneurs et les règles domaines/CIDR de Vercel. Les autres providers refusent les politiques non prises en charge. Allowlists de conteneurs, mises à jour dynamiques, audit du trafic et filtrage plus fin restent à étudier.
- Les [candidats spéculatifs](../../workflows/speculation/) comparent des branches bornées depuis une base épinglée, choisissent un gagnant validé et nettoyé et appliquent des budgets de consommation observée. Aucune intégration n’est automatique ; la comparaison hôte reste indicative. La reprise persistante et des garanties renforcées sur les conflits/coûts restent à terminer.

## Validation et production restantes

Les campagnes cloud réelles de commandes, transferts, pare-feu et PTY Daytona nécessitent des comptes configurés et une exécution explicite ; les fixtures déterministes ne les remplacent pas. La publication d’images signées et la vérification de provenance nécessitent une publication configurée réussie. Le démarrage Firecracker réel et son durcissement restent distincts. Les contrôles Docker/Podman réels et PTY font partie de la CI de release. Le fonctionnement authentifié des modèles nécessite une validation séparée ; l’aide CLI sans identifiants ne le prouve pas.

Consultez le [changelog](../changelog/) pour les limites de version et l’[architecture](../architecture/) pour les contrats d’extension. Aucun élément ne constitue un engagement de date.

---
title: Architecture
description: Ports, adapters and domain boundaries in Outpost.
sidebar:
  order: 1
---

Outpost utilise des ports et des adapters. Le domaine décrit les capacités ; les services applicatifs coordonnent leur utilisation. Les agents et les providers de sandbox implémentent des contrats indépendants.

| Couche            | Responsabilité                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `domain`          | Contrats, règles, prompts, réponses, graphes et exécution des workflows                                  |
| `adapters/agents` | Commandes, plans d’identifiants et protocoles propres à Claude Code, Codex, Antigravity, Copilot et Kimi |
| `providers`       | Allocation, commandes, transferts et libération des sandboxes                                            |
| `infrastructure`  | Git, processus, fichiers, identifiants de l’hôte, conversations et journaux                              |
| `application`     | Cycle de vie, dispatch et synchronisation distante                                                       |
| `cli`             | Commandes, initialisation et images                                                                      |

Les contrats nommés et les types objets sont placés dans des fichiers `*.types.ts`, sans initialisation à l’exécution. Les paramètres par défaut, options reconnues, recettes et limites partagées sont placés dans des fichiers `*.constants.ts`. Les variables locales et valeurs calculées restent dans leur opération.

Les points d’entrée publics comprennent `src/index.ts`, les sous-chemins `providers/*` et l’entrée optionnelle `opentelemetry`. Seule cette dernière importe l’API optionnelle de télémétrie. Les façades `providers/agents.ts`, `application/outpost.ts` et `domain/ports.ts` réexportent les implémentations et contrats ; les services internes importent directement leurs dépendances.

## Responsabilités

- Chaque agent possède un adapter, un constructeur de commande, une stratégie d’authentification et un décodeur d’événements. Des registres de handlers, indexés par un discriminant de protocole, remplacent le dispatch conditionnel : `decodeLine` lit `type` par défaut, `event` pour Antigravity et `role` pour Kimi. Un événement inconnu reste une observation brute.
- Les conversations constituent un port distinct. Les stratégies Claude et Codex portent leurs conventions de stockage ; capture, restauration, recherche et réécriture sont séparées. Les adapters Antigravity, Copilot et Kimi ne permettent pas la reprise et n’ont pas de store natif.
- Le workspace possède son état Git. La préparation du sandbox, les opérations exclusives, le dispatch, le terminal et la fermeture ont chacun un service dédié. Sur un placement distant, `agent-bootstrap.ts` installe un CLI d’agent manquant avec l’installateur désigné par `AgentAdapter.bootstrap`, selon une stratégie par type d’installateur : paquet npm épinglé, ou script d’installation officiel pour Antigravity.
- L’exécution d’un tour, l’accumulation des événements et la surveillance des délais sont séparées. L’agrégation de consommation est une règle commune du domaine.
- Les providers composent leurs services de préparation, commandes et transferts. Docker et Podman partagent la mécanique du moteur de conteneurs.
- La synchronisation distante suit quatre étapes : téléchargement, validation, sauvegarde puis application. Le coordinateur conserve la révision et le manifeste de fichiers appliqués avec succès. Le contrat optionnel `FileTransfers` permet la réutilisation incrémentale vérifiée et les lots compressés bornés, sans branchement sur les noms de providers.
- Inventaire, intégrité, vérification Git isolée et rétention sont des opérations distinctes. Le nettoyage explicite acquiert les verrous et revalide les candidats ; `assertRecoveryQuota` observe le stockage, tandis que les réservations explicites sérialisent l’admission coopérative et peuvent appartenir au workspace. Les enregistrements d’activité décrivent les leases et opérations observées localement, sans énumérer les comptes distants. Les volumes de cache des conteneurs ont une durée de vie distincte, gérée par le moteur.
- La propriété locale des verrous est vérifiée lorsque la plateforme le permet ; les propriétaires incertains bloquent la reprise automatique. Les workspaces modifiés, détachés ou contenant des fichiers ignorés restent récupérables.
- Les workflows séparent validation du graphe, état d’exécution, tentatives, budgets et ordonnancement. Les wrappers applicatifs transmettent la consommation normalisée des agents au comptage partagé. L’adapter OpenTelemetry d’infrastructure consomme les événements avec tracer et meter injectés, noms fixes et attributs bornés. Les erreurs d’observateurs ne changent pas l’issue de l’exécution.
- Les diagnostics d’une sandbox détenue utilisent la même exclusion d’opération que commandes et dispatch. Le nettoyage des probes temporaires est indépendant ; le diagnostic ne devient jamais propriétaire de la libération de la lease. Le registre `doctorAgents` associe chaque agent de doctor à son exécutable (`agy` pour Antigravity), sa version épinglée éventuelle, ses diagnostics d’aide et son harness.

## Authentification

`AgentAuthentication` choisit `account` ou `usage`, éventuellement avec `file`, `key` ou `variable` ; le domaine valide sa forme. Un adapter qui prend en charge l’authentification implémente `AgentAdapter.credentials(variables)`, qui renvoie un `CredentialPlan` : variables d’identifiants, fichiers d’identifiants de l’hôte à lire, fichiers générés et commandes de connexion. Les stratégies propres à chaque agent vivent dans `adapters/agents/<agent>-authentication.ts` ; le harness refuse une forme non prise en charge dès la composition de l’agent.

`infrastructure/host-credentials.ts` lit les fichiers d’identifiants de l’hôte : fichiers réguliers uniquement, de taille bornée, et jamais un trousseau système. `application/agent-authentication.ts` installe un plan une fois par adapter et par sandbox, depuis `sandbox-agents.ts`. Pour un placement isolé, il écrit les fichiers dans le home privé de la sandbox par un unique installateur qui reçoit du JSON sur l’entrée standard, puis exécute les commandes de connexion du plan. Pour le placement hôte, il transmet uniquement les variables d’identifiants. Ces variables sont fusionnées dans chaque commande de cet agent.

## Extension et vérification

Un nouvel agent implémente `AgentAdapter` dans son propre module, avec des contrats de requête, de plan d’identifiants et d’événements testés séparément. Il ajoute un format de conversation ou un store personnalisé lorsque la continuation native est prise en charge, et se déclare sinon non reprenable. Enregistrez son exécutable, ses diagnostics et son harness dans `doctorAgents` pour que `outpost doctor --agent` puisse le vérifier. Un nouveau backend implémente `SandboxProvider` et `SandboxLease`, avec annulation, délais de transfert et libération idempotente. Les contrats existants restent compatibles.

`npm run check` vérifie l’architecture, les types, les tests unitaires et fonctionnels et la compilation. `npm run coverage` impose 80 % sur les lignes, branches et fonctions. Les modules de types, effacés à l’exécution, sont contrôlés par TypeScript et le test consommateur du package. Les handlers CLI entrent dans la couverture ; seul le point d’entrée du processus est exclu.

La CI refuse les dépendances entre couches dans le mauvais sens, les contrats déclarés hors des fichiers de types, l’initialisation à l’exécution dans ces fichiers, les chaînes de branches alternatives et les déclarations inutilisées. Elle vérifie aussi les trois systèmes, Docker, Podman et le package installé. Le respect du SRP reste également un travail de revue.

## Orchestration durable et limites de recherche

Les contrats de checkpoints et de portes appartiennent au domaine ; le store de checkpoints possède la persistance conditionnelle et la propriété explicite via Transport. Les contrats d’artefacts valident les valeurs et la filiation ; leur store possède la publication immuable via Transport. La file SQLite et son transport HTTP fournissent les claims persistants ; les workers applicatifs exécutent les handlers enregistrés sous leases protégées par fencing. La répétition reste explicite et les effets peuvent être exécutés plusieurs fois. Les noms d’acteurs et la filiation sont des métadonnées de confiance, pas une authentification.

Le checkout isolé des conteneurs, le provider Firecracker, les politiques réseau et l’exécution spéculative ont leurs propres [limites de recherche](../../../project/roadmap/). Daytona utilise son API PTY native ; Vercel refuse l’attachement interactif.

## Transports de stockage

`Transport` est un port du domaine pour les lectures binaires bornées, le listing de métadonnées et les mutations conditionnelles atomiques. Les implémentations locale et S3 optionnelle appartiennent à l’infrastructure ; les stores séparent intégrité des artefacts, propriété des checkpoints, ordre des journaux et formats de conversation du transport. Copies natives et vérification de récupération utilisent toujours une préparation locale. Le SDK S3 se charge uniquement via `transports/s3`.

La propriété des checkpoints et les registres de réservations coopératives n’expirent pas automatiquement. Une récupération explicite exige une confirmation indépendante de l’arrêt de l’ancien propriétaire. Les activités distantes sont des observations dont la propriété n’est pas vérifiée ; elles n’autorisent jamais la récupération de workspaces Git locaux. La rétention revalide les groupes de journaux fermés et chaque révision supprimée. Voir les [transports de stockage](../../operations/storage-transports/).

## File BullMQ optionnelle

L’entrée `queues/bullmq` charge seule le SDK BullMQ optionnel. L’infrastructure sépare la propriété des connexions, la distribution BullMQ et les transitions atomiques Redis de l’état Outpost. Les workers applicatifs continuent de dépendre de `TaskQueue` ; les résultats conservés restent la référence pendant la récupération d’une finalisation native interrompue.

## Harness composition

Depuis la version 5.0.0, l’API compose `agent({ harness, model })`. Un harness CLI associe un adaptateur de commandes/protocole ; un harness personnalisé déclare un fournisseur de modèles, des outils, des instructions et des limites pour la boucle intégrée de `application/harness-loop.ts`. Les définitions d’outils et la validation JSON Schema relèvent du domaine ; l’exécution, l’ordre et les délais des outils relèvent de `application/tool-execution.ts`. La supervision applicative porte délais, requêtes, opérations sandbox et usage. Les modèles sont des noms ou des objets `{ name, reasoning, maxOutputTokens }` ; le harness CLI ou le fournisseur de modèles refuse les réglages non pris en charge à la composition de l’agent, et le service valide la disponibilité. `sandboxProvider` sélectionne indépendamment l’allocation ; un fournisseur de modèles ne possède jamais le sandbox. Le code des outils tourne dans le processus Outpost et doit respecter l’annulation.

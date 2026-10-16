# Audit Outpost · 2026-10-08 · commit e52198b8

Audit en lecture seule, démarré sur `9a35f33e` (10.0.1). Le dépôt a avancé de six commits pendant l'audit (`af403b92`…`e52198b8`, version 11.0.1 : kit de test hors ligne, sources de secrets, moteur de recettes YAML). Tous les constats et numéros de ligne ont été revérifiés sur `e52198b8`.

## Synthèse

L'architecture, les contrats et la couverture de tests sont solides : `bun run check`, `bun run coverage` (97,6 % lignes), Docker, Redis et PTY passent sur le HEAD audité. Les défauts se concentrent sur les chemins de reprise et de panne partielle : checkpoints rendus illisibles par un cache hit, workers de file qui meurent sur une erreur transitoire, verrous non réclamables hors Linux, synchronisation distante qui écrase ou importe des fichiers hôte. Trois constats sont critiques : un plantage du serveur de triggers par requête non authentifiée, un checkpoint durable corrompu après cache hit, et l'écrasement sans sauvegarde d'un fichier ignoré de l'hôte. Les isolations documentées tiennent, à l'exception des liens symboliques de répertoire dans les outils du harness.

| 🔴 Critique | 🟠 Haute | 🟡 Moyenne | 🔵 Basse | ⚪ Limites |
| ----------- | -------- | ---------- | -------- | ---------- |
| 3           | 16       | 39         | 50       | 49         |

**À traiter en premier :** C-01 (cache hit → checkpoint irrécupérable) ; C-03 (crash du serveur de triggers) ; C-02 (fichier ignoré hôte écrasé sans sauvegarde) ; H-04 et H-15 (workers de file et BullMQ qui meurent) ; H-01 (verrous jamais réclamables hors Linux).

## Vue d'ensemble

| ID   | Sév. | Brique               | Titre                                                                                    | Fichier                                                            |
| ---- | ---- | -------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| C-01 | 🔴   | Workflows durables   | Cache hit après tentatives → checkpoint refusé, run irrécupérable                        | `src/domain/workflow/task-runner.ts:49`                            |
| C-02 | 🔴   | Recovery/Sync        | Commit distant sur chemin ignoré hôte écrase le fichier sans sauvegarde                  | `src/application/remote-validation.ts:33`                          |
| C-03 | 🔴   | Triggers/Cron        | Requête non authentifiée plante le processus du serveur de triggers                      | `src/infrastructure/trigger-server.ts:147`                         |
| H-01 | 🟠   | Dispatch/Workspaces  | Verrous jamais réclamables hors Linux, garde `.reclaim` et verrou vide bloquants à vie   | `src/infrastructure/git/lock.ts:95`                                |
| H-02 | 🟠   | Dispatch/Workspaces  | `integrate()` fusionne dans le checkout hôte occupé par un workspace `current`           | `src/infrastructure/git/workspace-lease.ts:79`                     |
| H-03 | 🟠   | Harness              | Outils fichiers suivent les liens symboliques de répertoire hors dépôt                   | `src/adapters/tools/sandbox-files.ts:19`                           |
| H-04 | 🟠   | Workflows durables   | `runQueueWorker()` meurt sur annulation d'un job actif ou erreur transitoire             | `src/application/queue-worker.ts:83`                               |
| H-05 | 🟠   | Recovery/Sync        | Dépôt Git imbriqué non suivi casse `seedRemote()` et tout `pull()`                       | `src/application/workspace-fingerprint.ts:30`                      |
| H-06 | 🟠   | Recovery/Sync        | Chemins `.outpost/<non listé>` du sandbox importés dans l'hôte                           | `src/application/remote-download.ts:35`                            |
| H-07 | 🟠   | Adaptateurs CLI      | Codex : rollouts dupliqués par date, reprise d'une copie périmée                         | `src/adapters/agents/codex/codex-conversations.ts:3`               |
| H-08 | 🟠   | Adaptateurs CLI      | Provider local + `redact` : transcription native vivante réécrite sur place              | `src/infrastructure/conversations/transcript-store.ts:107`         |
| H-09 | 🟠   | Adaptateurs CLI      | Codex `usage` sur l'hôte : login non exécuté, clé API ignorée                            | `src/application/agent-authentication.ts:20`                       |
| H-10 | 🟠   | Providers modèles    | Erreurs en flux Chat Completions jamais classées `quota`/`unavailable`                   | `src/adapters/models/openai-chat-stream.ts:17`                     |
| H-11 | 🟠   | Providers modèles    | Replay du raisonnement Responses avec `store: false` sans `include`                      | `src/adapters/models/openai-responses.ts:42`                       |
| H-12 | 🟠   | Sandboxes cloud      | Échec d'ajout d'instruction live tue le tour (E2BIG dès ~96 KiB)                         | `src/providers/vercel-command.ts:77`                               |
| H-13 | 🟠   | Sandboxes cloud      | Annulation d'une commande `elevated` ne tue pas le processus root                        | `src/providers/daytona-command.ts:66`                              |
| H-14 | 🟠   | Sandboxes conteneurs | Délai des transferts conteneur plafonné silencieusement à 120 s                          | `src/providers/container-archive.ts:22`                            |
| H-15 | 🟠   | Stockage/Files       | BullMQ : coupure Redis > 600 ms rend la file morte et tue le processus                   | `src/infrastructure/task-queue-bullmq-resources.ts:32`             |
| H-16 | 🟠   | Observabilité        | `hub.flush()` pendant un dispatch ferme son journal et perd la suite                     | `src/application/dispatch-observation.ts:72`                       |
| M-01 | 🟡   | Domaine              | Masquage : passe JSON court-circuitée dès qu'un motif brut a matché                      | `src/domain/redaction.ts:16`                                       |
| M-02 | 🟡   | Dispatch/Workspaces  | `integrate()` sur HEAD hôte détaché : code `process` sans recovery                       | `src/infrastructure/git/workspace-lease.ts:66`                     |
| M-03 | 🟡   | Dispatch/Workspaces  | `passes > 1` en dispatch froid : sandbox, branche et hooks par passe                     | `src/application/dispatch.ts:54`                                   |
| M-04 | 🟡   | Harness              | Outil `git` read-only lit tout fichier via `diff --no-index`                             | `src/adapters/tools/git-tools.ts:34`                               |
| M-05 | 🟡   | Harness              | Découverte OAuth du bridge MCP sans validation du token endpoint                         | `src/adapters/tools/mcp-launcher.constants.ts:162`                 |
| M-06 | 🟡   | Harness              | `truncateToolResults` recompacte à chaque pas                                            | `src/domain/context.ts:64`                                         |
| M-07 | 🟡   | Harness              | Consigne du watchdog pour la boucle principale livrée au sous-agent                      | `src/application/repetition-watchdog.ts:107`                       |
| M-08 | 🟡   | Harness              | `allowedTools` interdit `load_skill` et les outils MCP ressources/prompts                | `src/domain/agent-profile-permissions.ts:12`                       |
| M-09 | 🟡   | Harness              | Steering pris au démarrage placé après les instructions de réponse finale                | `src/application/steering-turns.ts:28`                             |
| M-10 | 🟡   | Harness              | Identifiants d'appel d'outil dupliqués : résultat perdu, effets exécutés                 | `src/application/tool-execution.ts:50`                             |
| M-11 | 🟡   | Workflows durables   | Sortie non-JSON rejouée à chaque `retry`                                                 | `src/domain/workflow/task-runner.ts:148`                           |
| M-12 | 🟡   | Workflows durables   | Échec transitoire de libération du bail masque un résultat réussi                        | `src/domain/workflow/workflow-scheduler.ts:78`                     |
| M-13 | 🟡   | Workflows durables   | Sorties persistées mutables par un consommateur                                          | `src/domain/workflow/workflow-state.ts:109`                        |
| M-14 | 🟡   | Recovery/Sync        | Seed échoué laisse `initial.bundle` orphelin, protégé à vie                              | `src/application/remote-workspace.ts:40`                           |
| M-15 | 🟡   | Recovery/Sync        | Élagage : index du journal supprimé avant ses segments                                   | `src/application/transport-retention.ts:204`                       |
| M-16 | 🟡   | Adaptateurs CLI      | Claude : `transcriptUsage` remplace l'usage cumulé par le dernier message                | `src/application/sandbox-dispatch.ts:150`                          |
| M-17 | 🟡   | Adaptateurs CLI      | Kimi : brief en argument de ligne de commande (128 KiB, visible dans `ps`)               | `src/adapters/agents/kimi/kimi-request.ts:42`                      |
| M-18 | 🟡   | Adaptateurs CLI      | Steering `resumed` Copilot/Kimi : identifiant connu seulement en fin de tour             | `src/application/cli-steering.ts:103`                              |
| M-19 | 🟡   | Providers modèles    | Corps des réponses HTTP en erreur jeté : crédit épuisé non classé                        | `src/adapters/models/http-provider.ts:79`                          |
| M-20 | 🟡   | Providers modèles    | `Retry-After` serveur non borné dans les retries de tâche                                | `src/domain/workflow/retry.ts:52`                                  |
| M-21 | 🟡   | Providers modèles    | `reasoning: "none"` Anthropic validé mais refusé par les modèles actuels                 | `src/adapters/models/anthropic-model-provider.constants.ts:7`      |
| M-22 | 🟡   | Sandboxes cloud      | Cache contenant un composant `.git` impossible à sauvegarder                             | `src/infrastructure/transport-archive.ts:42`                       |
| M-23 | 🟡   | Sandboxes cloud      | Délai fixe de 60 s pour les caches, un appel API par fichier                             | `src/providers/cloud-cache.constants.ts:5`                         |
| M-24 | 🟡   | Sandboxes cloud      | Daytona : secrets inscrits dans le texte de la commande de session                       | `src/providers/daytona-command.ts:54`                              |
| M-25 | 🟡   | Sandboxes conteneurs | Provider local : commande terminée à la fermeture des flux, pas du processus             | `src/infrastructure/process.ts:111`                                |
| M-26 | 🟡   | Sandboxes conteneurs | `upload`/`download` : sémantique différente local vs conteneur                           | `src/providers/local.ts:29`                                        |
| M-27 | 🟡   | Sandboxes conteneurs | `download` rejette toute destination sous un ancêtre symlink                             | `src/infrastructure/transfer-copy.ts:17`                           |
| M-28 | 🟡   | Sandboxes conteneurs | SIGINT libère les conteneurs sans aborter la commande ; statut 137 résolu                | `src/infrastructure/shutdown.ts:14`                                |
| M-29 | 🟡   | Sandboxes conteneurs | Podman : home tmpfs monté `mode=1777`                                                    | `src/providers/container-plan.ts:44`                               |
| M-30 | 🟡   | Stockage/Files       | S3 : repasser de `tombstone` à `conditional` laisse des clés irrécréables                | `src/infrastructure/s3-transport.ts:119`                           |
| M-31 | 🟡   | Stockage/Files       | S3 `tombstone` : marqueurs d'activité accumulés, un HEAD chacun par allocation           | `src/infrastructure/resource-activity.ts:44`                       |
| M-32 | 🟡   | Stockage/Files       | Transport local : `list()` lit le corps complet de chaque objet                          | `src/infrastructure/local-transport.ts:199`                        |
| M-33 | 🟡   | Stockage/Files       | Registre de réservations sans propriétaire : récupération documentée impossible          | `src/infrastructure/transport-reservations.ts:33`                  |
| M-34 | 🟡   | Triggers/Cron        | Expressions à joker perdent une heure réelle au passage à l'heure d'hiver                | `src/domain/cron.ts:126`                                           |
| M-35 | 🟡   | Triggers/Cron        | Créneaux sautés silencieusement si la publication dure plus que l'intervalle             | `src/application/schedules.ts:79`                                  |
| M-36 | 🟡   | CLI/Images           | UID 0 accepté par l'image et le provider sans refus                                      | `src/cli/image.ts:25`                                              |
| M-37 | 🟡   | CLI/Images           | `test/session-bundles-container.test.ts` exécuté nulle part                              | `.github/workflows/ci.yml:92`                                      |
| M-38 | 🟡   | Transverse           | Notes de release = CHANGELOG entier, dont `Unreleased` ; aucune porte changelog          | `.github/workflows/release.yml:36`                                 |
| M-39 | 🟡   | Secrets              | `fromSecrets()` efface aussi les diagnostics sûrs (statut HTTP, mapping manquant)        | `src/application/secrets.ts:53`                                    |
| B-01 | 🔵   | Domaine              | `?` en mode `text` refuse `/`                                                            | `src/domain/glob.ts:10`                                            |
| B-02 | 🔵   | Domaine              | `shell:<cmd>` validé après `trim()` mais comparé sans                                    | `src/domain/agent-profile-permissions.ts:20`                       |
| B-03 | 🔵   | Domaine              | Écriture de checkpoint échouée empoisonne la chaîne `writes`                             | `src/domain/workflow/checkpoint.ts:93`                             |
| B-04 | 🔵   | Domaine              | Doc de reprise muette sur un checkpoint sans tâche démarrée                              | `src/domain/workflow/checkpoint.ts:51`                             |
| B-05 | 🔵   | Domaine              | `prices` + convention de cache invalide → `Error` brute depuis `reportUsage`             | `src/domain/workflow/budget.ts:156`                                |
| B-06 | 🔵   | Domaine              | Doublons de domaines egress sensibles à la casse                                         | `src/domain/egress.ts:18`                                          |
| B-07 | 🔵   | Dispatch/Workspaces  | Réouverture d'un workspace `named` : `fetch origin` + fast-forward silencieux            | `src/infrastructure/git/refresh-worktree.ts:19`                    |
| B-08 | 🔵   | Dispatch/Workspaces  | Vérification de la branche hôte hors du verrou d'intégration                             | `src/infrastructure/git/workspace-lease.ts:66`                     |
| B-09 | 🔵   | Dispatch/Workspaces  | Empreinte du dépôt : lecture intégrale en mémoire des fichiers non suivis                | `src/application/workspace-fingerprint.ts:30`                      |
| B-10 | 🔵   | Dispatch/Workspaces  | `show-ref` hors du contrat Git commun ; `execFile` sans kill de groupe                   | `src/infrastructure/git/managed-worktree.ts:83`                    |
| B-11 | 🔵   | Harness              | Sous-agent borné par le `deadlineMs` d'outil du parent ; `failed` après `finished`       | `src/application/tool-execution.ts:219`                            |
| B-12 | 🔵   | Harness              | `stopReason` inconnu → `TypeError` au lieu d'`OutpostError`                              | `src/application/harness-loop.ts:155`                              |
| B-13 | 🔵   | Harness              | Serveur MCP stdio hérite de tout l'environnement sandbox                                 | `src/adapters/tools/mcp-launcher.constants.ts:13`                  |
| B-14 | 🔵   | Workflows durables   | Ordre des clés d'`interaction` change l'identité du checkpoint                           | `src/domain/workflow/task.ts:27`                                   |
| B-15 | 🔵   | Workflows durables   | `recoverWorkflowCheckpoint()` sans confirmation d'arrêt du runner                        | `src/infrastructure/transport-checkpoint.ts:119`                   |
| B-16 | 🔵   | Recovery/Sync        | `archiveRecovery()` interrompu laisse des chunks sans manifeste, protégés                | `src/infrastructure/transport-archive.ts:55`                       |
| B-17 | 🔵   | Recovery/Sync        | Transfert batch : suppression hôte d'un fichier transféré → `ENOENT`                     | `src/application/remote-download.ts:63`                            |
| B-18 | 🔵   | Adaptateurs CLI      | Antigravity `usage` sur l'hôte : `settings.json` annoncé non écrit                       | `src/adapters/agents/antigravity/antigravity-authentication.ts:18` |
| B-19 | 🔵   | Adaptateurs CLI      | `codexProvider` lance une `Error` nue                                                    | `src/adapters/agents/codex/codex-provider.ts:16`                   |
| B-20 | 🔵   | Providers modèles    | Pas de `validate()` OpenAI : `reasoning: "max"` accepté                                  | `src/adapters/models/openai-protocols.ts:8`                        |
| B-21 | 🔵   | Providers modèles    | Commentaires SSE keep-alive relancent indéfiniment le timeout                            | `src/infrastructure/sse.ts:27`                                     |
| B-22 | 🔵   | Providers modèles    | Pannes de transport sans `cause` ; clé non-ByteString classée `unavailable`              | `src/adapters/models/http-provider.ts:115`                         |
| B-23 | 🔵   | Providers modèles    | Décision : signal déjà annulé → `DOMException`                                           | `src/adapters/decisions/system-one-provider.ts:82`                 |
| B-24 | 🔵   | Sandboxes cloud      | Décodeur Daytona : chunk mêlant texte brut et trames émis en base64                      | `src/providers/daytona-output.ts:12`                               |
| B-25 | 🔵   | Sandboxes cloud      | Firecracker : statut 255 de `ssh` retourné comme statut de commande                      | `src/providers/firecracker-command.ts:137`                         |
| B-26 | 🔵   | Sandboxes cloud      | Fichiers `.cancel` résiduels ; `release()` non idempotente après échec de cache          | `src/providers/daytona.ts:58`                                      |
| B-27 | 🔵   | Sandboxes cloud      | Guide Daytona muet sur `autoStopInterval` ; import dynamique superflu                    | `src/providers/cloud-files.ts:27`                                  |
| B-28 | 🔵   | Sandboxes conteneurs | Escalade SIGTERM→SIGKILL de 100 ms en conteneur, 500 ms sur l'hôte                       | `src/providers/container-command.ts:78`                            |
| B-29 | 🔵   | Sandboxes conteneurs | Chemin de dépôt contenant `:` → `--volume` invalide sous Linux                           | `src/providers/container-mounts.ts:79`                             |
| B-30 | 🔵   | Sandboxes conteneurs | `closed = true` avant le succès de `rm` : nettoyage de sortie sauté                      | `src/providers/container.ts:140`                                   |
| B-31 | 🔵   | Stockage/Files       | Identité d'`enqueue` sensible à l'ordre des clés JSON                                    | `src/infrastructure/task-queue.ts:91`                              |
| B-32 | 🔵   | Stockage/Files       | Queue SQLite : `get()` en `BEGIN IMMEDIATE`, pas de WAL                                  | `src/infrastructure/task-queue.ts:48`                              |
| B-33 | 🔵   | Stockage/Files       | Clés : noms réservés Windows acceptés, collisions de casse                               | `src/domain/transport.constants.ts:2`                              |
| B-34 | 🔵   | Triggers/Cron        | `maxLateMs: 0` accepté et rend le scheduler muet                                         | `src/application/schedules.ts:50`                                  |
| B-35 | 🔵   | Triggers/Cron        | Fuseaux abrégés acceptés et canonisés silencieusement                                    | `src/domain/cron.ts:77`                                            |
| B-36 | 🔵   | Triggers/Cron        | Corps illisible après signature valide classé 401 au lieu de 400                         | `src/adapters/triggers/slack-request.ts:60`                        |
| B-37 | 🔵   | CLI/Images           | Sonde d'image à 5 s fixes : Copilot `--version` échoue sous charge                       | `src/application/doctor.constants.ts:5`                            |
| B-38 | 🔵   | CLI/Images           | Validation du nom d'image incohérente entre `doctor` et `init`/`image`                   | `src/cli/image.ts:16`                                              |
| B-39 | 🔵   | CLI/Images           | Erreurs système brutes sur entrées invalides courantes                                   | `src/cli/project-settings.ts:20`                                   |
| B-40 | 🔵   | CLI/Images           | `init` ne génère pas de `.dockerignore` ; CI scaffolde dans la racine                    | `src/cli/scaffold-files.ts:15`                                     |
| B-41 | 🔵   | Transverse           | Actions épinglées par tag majeur ; tag `v*` publie sans vérifier `main`                  | `.github/workflows/release.yml:4`                                  |
| B-42 | 🔵   | Transverse           | `check-architecture.mjs` ignore ternaires imbriqués, commentaires longs, `as unknown as` | `scripts/check-architecture.mjs:43`                                |
| B-43 | 🔵   | Transverse           | AGENTS.md décalé : `examples/` existe, suites live non documentées                       | `AGENTS.md:158`                                                    |
| B-44 | 🔵   | Transverse           | `scriptedAgent()` échappe à la convention `create*`                                      | `src/testing.ts:1`                                                 |
| B-45 | 🔵   | Transverse           | Chemins critiques sans test de régression                                                | `test/unit/`                                                       |
| B-46 | 🔵   | Secrets              | Message « payload must be valid base64 » inatteignable dans l'adapter GCP                | `src/adapters/secrets/gcp.ts:38`                                   |
| B-47 | 🔵   | Recettes YAML        | Liste des kinds d'agents et regex dupliquées hors `*.constants.ts`                       | `src/cli/recipe-command.ts:40`                                     |
| B-48 | 🔵   | Recettes YAML        | Texte d'aide `--file` de `recipe run` fuit dans `image build --help`                     | `src/cli/main.constants.ts:68`                                     |
| B-49 | 🔵   | Recettes YAML        | Un signal reçu pendant le nettoyage force 130/143 malgré un rapport `done`               | `src/cli/recipe-command.ts:118`                                    |
| B-50 | 🔵   | Transverse           | README sans ligne vers le guide des sources de secrets                                   | `README.md:97`                                                     |

## Findings

### 🔴 Critique

#### C-01 · Cache hit après tentatives antérieures écrit un checkpoint que `start()` refuse ensuite

- **Brique :** Workflows durables (trouvé indépendamment par les audits Domaine et Workflows)
- **Où :** `src/domain/workflow/task-runner.ts:49-57` ; `src/domain/workflow/checkpoint-validation.ts:78-85`
- **Problème :** Un hit de cache est servi quel que soit `state.attempts` et enregistre `cacheHit: true`. Le validateur de checkpoint exige `attempts === 0` et `rounds` absent pour un hit ; le record persisté viole donc sa propre règle.
- **Scénario :** run A échoue (`attempts 1`) → une autre exécution alimente le cache → `start({ resume: "retry-incomplete" })` renvoie `done` → tout `start()` ultérieur sur ce `runId` lève « Invalid or incompatible workflow checkpoint ». Idem après une pause quota durable ou pour une tâche boucle (`rounds`).
- **Correctif :** Refuser le lookup cache quand `attempts > 0` ou `rounds` existe, ou assouplir le validateur ; ajouter la régression.
- **Confiance :** haute (repros `domain/cache-hit.mjs`, `workflows/r1`, `r5b`, `r6`, rejoués par l'orchestrateur)

#### C-02 · Un commit distant sur un chemin ignoré côté hôte écrase le fichier ignoré sans sauvegarde

- **Brique :** Recovery/Sync
- **Où :** `src/application/remote-validation.ts:33-61` ; `src/application/remote-apply.ts:75` ; `src/application/remote-backup.ts:35`
- **Problème :** Le contrôle `ls-files --others --ignored` ne couvre que les fichiers non suivis du sandbox. Un fichier ajouté par commit (`git add -f`) sur un chemin ignoré de l'hôte est écrasé par `merge --ff-only`, et `extras()` exclut les ignorés de la sauvegarde.
- **Scénario :** hôte avec `secret.env` ignoré → l'agent fait `git add -f secret.env && git commit` → `pull()` réussit, `secret.env` hôte contient le contenu de l'agent, aucun fichier de recovery ne garde l'ancien. Contredit `cloud-sandboxes.md` (« never overwrites work it cannot back up ») et SECURITY.md.
- **Correctif :** Étendre le contrôle d'overlap ignoré aux chemins de `diff --name-only originalHead` et du bundle, ou sauvegarder les ignorés touchés avant `merge`.
- **Confiance :** haute (repro `recovery/repro-ignored-overwrite.mjs`, rejoué)

#### C-03 · Une requête non authentifiée fait planter le processus du serveur de triggers

- **Brique :** Triggers/Cron
- **Où :** `src/infrastructure/trigger-server.ts:147`
- **Problème :** `new URL(request.url ?? "/", "http://trigger")` est appelé hors de tout `try` dans un handler async. Une cible acceptée par le parseur HTTP de Node mais invalide pour WHATWG URL lève `TypeError: Invalid URL` → rejet non géré → arrêt du processus, avant toute vérification de signature.
- **Scénario :** `POST //[ HTTP/1.1` envoyé par n'importe qui → `ERR_INVALID_URL`, exit 1, scheduler et workers co-hébergés arrêtés.
- **Correctif :** Envelopper le parsing dans `try` et répondre 400.
- **Confiance :** haute (repro `triggers/crash.mjs`, rejoué)

### 🟠 Haute

#### H-01 · Verrous jamais réclamables hors Linux ; garde `.reclaim` orphelin et verrou vide bloquent la clé à vie

- **Brique :** Dispatch/Workspaces (même mécanisme pour le transport local, trouvé par l'audit Stockage)
- **Où :** `src/infrastructure/git/lock.ts:95-125` ; `src/infrastructure/git/process-identity.ts:11,56-59` ; `src/infrastructure/local-transport.ts:110-117`
- **Problème :** La réclamation d'un verrou périmé exige une identité Linux (`/proc`, `machine-id`) ; ailleurs `localProcessIdentity()` renvoie `undefined` et tout verrou laissé par un processus tué donne `conflict` pour toujours. Même sur Linux, un garde `<lock>.reclaim` ou un fichier de verrou vide (crash entre `open("wx")` et `writeFile`) n'est jamais réclamé.
- **Scénario :** crash sur `branch: { mode: "named" }` → tout `dispatch` suivant échoue « Workspace is already in use or ownership is unknown » ; sur le transport local, l'écriture d'un checkpoint attend 30 s puis lève un `AbortError` nu, verrou conservé. `recovery.md` interdit la suppression manuelle et `retention` ne touche pas aux verrous.
- **Correctif :** Réclamer aussi le garde `.reclaim` et les fichiers vides, fournir une stratégie de propriété hors Linux (pid vivant + boot) et une commande `recovery unlock` explicite.
- **Confiance :** haute (repros `dispatch/repro-lock.mjs`, `storage/lock-reclaim.mjs`, rejoués ; tests de réclamation `skip` hors Linux)

#### H-02 · `integrate()` fusionne dans le checkout hôte pendant qu'un workspace `current` l'occupe

- **Brique :** Dispatch/Workspaces
- **Où :** `src/infrastructure/git/workspace.ts:63` ; `src/infrastructure/git/workspace-lease.ts:79`
- **Problème :** Le workspace `current` verrouille la clé `<repository>` ; l'intégration verrouille `merge:<baseBranch>`. Les deux clés ne s'excluent pas.
- **Scénario :** sandbox A en `current` (agent actif sur le checkout) + workspace B en `integrate` → `B.integrate()` réussit et modifie les fichiers et HEAD de l'hôte sous les pieds de A. `repository-and-branch.md` promet un `conflict`.
- **Correctif :** Faire acquérir au workspace `current` le verrou `merge:<baseBranch>` (ou vérifier le verrou du dépôt dans `integrate()`).
- **Confiance :** haute (repro `dispatch/repro-integrate.mjs`, rejoué)

#### H-03 · Les outils fichiers du harness suivent les liens symboliques de répertoire et sortent du dépôt

- **Brique :** Harness
- **Où :** `src/adapters/tools/sandbox-files.ts:11-23` (contrôle lexical seul), `:44-47` (lstat sur la copie seulement) ; `src/adapters/tools/edit-tools.ts:106-110`
- **Problème :** `sandboxPath()` ne fait que normaliser `..` ; un lien de répertoire est résolu par le transfert. Seuls les liens de fichier sont détectés.
- **Scénario :** dépôt contenant `link -> /outside` (ou créé via `shell`) → `read_file link/secret.txt` lit le fichier, `write_file link/escaped.txt` écrit hors dépôt (sur l'hôte avec `createLocalSandboxProvider()`) ; une règle `deny paths: ["secrets/**"]` est contournée. Contredit `harness-tools.md` et `harness-permissions.md`.
- **Correctif :** Résoudre le chemin dans la sandbox (`realpath` via `lease.invoke`) et refuser hors de `root/`, ou refuser tout composant intermédiaire qui est un lien.
- **Confiance :** haute sur le provider local (repro `harness/repro.mjs` D, rejoué) ; moyenne en conteneur (même logique, non exécutée)

#### H-04 · `runQueueWorker()` meurt sur l'annulation d'un job actif ou sur une erreur transitoire de `claim()`/`complete()`

- **Brique :** Workflows durables (trouvé par les audits Workflows et Stockage)
- **Où :** `src/application/queue-worker.ts:83,91,103` ; `src/infrastructure/task-queue.ts:72-83`
- **Problème :** La boucle ne gère aucune erreur : `complete()` sur un bail annulé lance « Stale queue lease » (l'annulation n'est vue qu'au prochain `renew`, toutes les `leaseMs/3`), et toute exception de `claim()`/`complete()` (backend indisponible, `SQLITE_BUSY`, HTTP 5xx) sort de la boucle.
- **Scénario :** `cancel(id)` sur un job dont le handler finit sous 10 s → la promesse du worker rejette, plus aucun job n'est réclamé. `job-queues.md` promet « runs one job at a time until its signal aborts ».
- **Correctif :** Attraper les erreurs de `claim`/`complete` dans la boucle (bail périmé = continuer ; backend = backoff borné + `onError`).
- **Confiance :** haute (repros `workflows/r3-worker-cancel.mjs`, `storage/worker-loop.mjs`, rejoués ; le test existant utilise `leaseMs 90`, ce qui masque le cas)

#### H-05 · Un dépôt Git imbriqué non suivi casse `seedRemote()` et tous les `pull()`

- **Brique :** Recovery/Sync
- **Où :** `src/application/workspace-fingerprint.ts:9-12,30` ; `src/application/remote-download.ts:29-45` ; `src/infrastructure/inspection-hash.ts:43`
- **Problème :** `git ls-files --others` émet `dir/` pour un dépôt imbriqué ; le code traite chaque entrée comme un fichier (`readFile`, `cp`, hash) et échoue.
- **Scénario :** l'agent fait `git clone` d'une dépendance dans le sandbox → chaque `pull()` échoue « Hash source is not a regular file », le travail reste dans le sandbox. Hôte avec `vendor-clone/.git` → `seedRemote` échoue `EISDIR`. Limite absente des guides.
- **Correctif :** Refuser explicitement les entrées terminées par `/` avec un `conflict` nommant le chemin, et documenter.
- **Confiance :** haute (repros `recovery/repro-nested-repo.mjs`, `repro-nested-remote-and-enoent.mjs`, rejoués)

#### H-06 · Les chemins `.outpost/<non listé>` venant du sandbox sont importés dans l'hôte et cassent le `pull()` suivant

- **Brique :** Recovery/Sync
- **Où :** `src/application/remote-download.ts:35` ; `src/infrastructure/git/git.constants.ts:7-14` ; `src/application/remote-apply.ts:92-97`
- **Problème :** La liste de refus (`locks|recovery|workspaces|logs|conversations`) omet `storage` et tout autre sous-dossier, alors que `runtimeExclusions` connaît `.outpost/storage/`. En mode `current`, un fichier sandbox `.outpost/storage/objects/<clé>.object` atterrit dans la racine du transport local (checkpoints, cache, ledger).
- **Scénario :** `.outpost/cache/f` créé par l'agent → 1er pull OK ; 2e pull : `ERR_FS_CP_EEXIST` après `merge`/`apply`, HEAD hôte avancé et état partiel.
- **Correctif :** Refuser tout `incoming` sous `.outpost/` (aligné sur `extras()`), ou dériver la regex de `runtimeExclusions`.
- **Confiance :** haute (repros `recovery/repro-outpost-storage.mjs`, `repro-outpost-second-pull.mjs`, rejoués)

#### H-07 · Codex : rollouts dupliqués par date, la reprise peut repartir d'une copie périmée

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/codex/codex-conversations.ts:3-16` ; `src/infrastructure/conversations/transcript-store.ts:31` ; `src/infrastructure/conversations/files.ts:12-19`
- **Problème :** Chaque capture écrit `sessions/<aujourd'hui>/rollout-…-<id>.jsonl` sans supprimer la copie des jours précédents ; `locate()` prend le premier fichier rencontré (ordre `readdir`, non trié).
- **Scénario :** capture J1 → reprise J2 → reprise J3 : `locate` renvoie la copie J1 et le tour J2 est perdu silencieusement.
- **Correctif :** Capturer vers le chemin d'origine (date de création du rollout) ou choisir le candidat le plus récent et nettoyer les doublons.
- **Confiance :** haute (repro `agents/codex-locate-dup.mjs`)

#### H-08 · Provider local + `redact` : la transcription native vivante de l'utilisateur est réécrite sur place

- **Brique :** Adaptateurs CLI
- **Où :** `src/infrastructure/conversations/transcript-store.ts:107-146` ; `src/providers/local.ts:50`
- **Problème :** Avec `createLocalSandboxProvider()`, `home = context.home ?? homedir()` et la cible de capture est le fichier source ; `writeFile(file, relocate(redact(...)))` remplace le transcript réel de `~/.claude/projects/...` par sa version masquée.
- **Scénario :** dispatch local avec `observation.redact` → le fichier de session de l'utilisateur contient `[REDACTED]` ; `claude --resume` et les reprises repartent d'un historique altéré. SECURITY.md affirme que la redaction ne réécrit pas les fichiers natifs.
- **Correctif :** Ne jamais réécrire quand `file === remote` ; appliquer la redaction uniquement sur l'archive transport.
- **Confiance :** haute (repro `agents/local-capture-rewrite.mjs` sur un home temporaire)

#### H-09 · Codex `usage` sur le provider local : login non exécuté, Codex ignore `OPENAI_API_KEY`

- **Brique :** Adaptateurs CLI
- **Où :** `src/application/agent-authentication.ts:20` ; `src/adapters/agents/codex/codex-authentication.ts:25-32` ; `docs/src/content/docs/guide/authentication.md:68-69`
- **Problème :** En placement `host`, seules les variables sont transmises et la commande `codex login --with-api-key` n'est pas exécutée ; Codex 0.155 n'utilise pas la variable comme bearer.
- **Scénario :** `createLocalSandboxProvider()` + `createCodexHarness({ authentication: "usage" })` → `401 Missing bearer` sans login hôte, ou facturation du plan ChatGPT avec login hôte, contrairement à la doc.
- **Correctif :** Refuser `usage` pour Codex en placement `host` ou documenter que la clé n'est pas appliquée.
- **Confiance :** moyenne (CLI installé 0.155.0 vs 0.156.1 épinglé ; conséquence Outpost par trace)

#### H-10 · Erreurs en flux Chat Completions jamais classées `quota`/`unavailable`

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/openai-chat-stream.ts:17-22` ; `src/adapters/models/openai-chat.ts:57`
- **Problème :** OpenAI envoie les erreurs mi-flux comme `data: {"error":{...}}` ; `chatStream.push` ignore `data.error`, contrairement aux flux Responses et Anthropic qui appellent `streamFailure`. Le lecteur final échoue en `response`.
- **Scénario :** chunk `{"error":{"type":"insufficient_quota"}}` → `OutpostError("response")` sans `retryAfterMs` ni `unavailable` : ni `onQuota`, ni fallback. `quota-pauses.md` promet la classification `quota`.
- **Correctif :** Dans `chatStream.push` et `readChatCompletion`, appeler `streamFailure(data)` si `data.error` est un objet.
- **Confiance :** haute (repro `models/a-chat-stream-error.mjs` ; code relu par l'orchestrateur)

#### H-11 · Replay du raisonnement Responses impossible avec `store: false` sans `include`

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/openai-responses.ts:42,63-66,161`
- **Problème :** Le corps envoie `store: false` mais jamais `include: ["reasoning.encrypted_content"]` ; les items `reasoning` reçus sans contenu chiffré sont rejoués par `id`, ce que l'API refuse quand rien n'est persisté.
- **Scénario :** modèle raisonnant + outils via `api: "responses"` → pas 2 renvoie `{type:"reasoning", id:"rs_…"}` → HTTP 400 → `provider`. Le test `model-tools.test.ts:206` suppose un `encrypted_content` fourni par le faux serveur.
- **Correctif :** Ajouter `include: ["reasoning.encrypted_content"]` et ne rejouer que les items qui en ont.
- **Confiance :** moyenne (contrat OpenAI non vérifié en direct)

#### H-12 · Une défaillance d'ajout d'instruction live tue le tour en cours (E2BIG dès ~96 KiB)

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/vercel-command.ts:77-87` ; `src/providers/daytona-command.ts:92-101` ; `src/providers/cloud-input.ts:28-35`
- **Problème :** Chaque message devient un seul argument `sh -c "printf '%s' '<base64>' >> file"` ; toute erreur d'ajout appelle `failure.abort(cause)` → signal `stopped` → `running.kill("SIGKILL")`. L'invariant « Steering never cancels a dispatch » n'est pas tenu.
- **Scénario :** `send()` d'une instruction de 100 KiB → `E2BIG` (MAX_ARG_STRLEN 128 KiB) → le tour est tué et le dispatch échoue au lieu d'un rejet code `steering`.
- **Correctif :** Transférer la trame via l'API fichiers ou en lignes bornées ; sur échec, rejeter le `send()` sans aborter la commande.
- **Confiance :** haute (repro `cloud/repro-live-input-size.mjs`, rejoué)

#### H-13 · L'annulation d'une commande `elevated` ne tue pas le processus root (Daytona, Vercel live)

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/daytona-command.ts:45,66` ; `src/providers/vercel-command.ts:68,109` ; contre-exemple correct `src/providers/daytona-terminal.ts:135`
- **Problème :** Daytona place `sudo -n --` dans le programme enfant mais exécute `kill -KILL -$(cat pid)` sans sudo. Vercel lance le wrapper en root (`sudo: true`) et le kill de groupe sans.
- **Scénario :** `sandbox.command({ executable: "apt-get", elevated: true, deadlineMs })` dépasse le délai → le wrapper meurt, le processus root continue. `sandbox-sessions.md` promet la terminaison du groupe.
- **Correctif :** Exécuter le kill avec `sudo -n` quand `command.elevated` (comme le terminal Daytona) et `sudo: true` sur le kill Vercel.
- **Confiance :** haute (Daytona, trace) ; moyenne (Vercel, `Command.kill` non vérifiable hors live)

#### H-14 · Le délai `copyMs`/`deadlineMs` des transferts conteneur est plafonné silencieusement à 120 s

- **Brique :** Sandboxes conteneurs
- **Où :** `src/providers/container-archive.ts:18-25` ; `src/infrastructure/binary-process.ts:14` ; `src/infrastructure/transfer.ts:15`
- **Problème :** `containerArchive` ne transmet que `signal` aux deux commandes `tar` ; `binaryExecutor` applique alors `transferDefaults.deadlineMs` (120 000) à chacune, quel que soit le délai externe.
- **Scénario :** `limits.copyMs: 600_000` ou `download(src, dst, { deadlineMs: 600_000 })` sur un gros arbre → « File transfer timed out » à 120 s. `fields.json` affirme que `copyMs` borne chaque transfert.
- **Correctif :** Propager `deadlineMs` (ou le délai restant) de `transfer()` vers les commandes `tar`.
- **Confiance :** haute (trace, relue par l'orchestrateur ; aucun transfert > 120 s exécuté)

#### H-15 · BullMQ : une coupure Redis > ~600 ms rend la file inutilisable et un rejet non géré tue le processus

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/task-queue-bullmq-resources.ts:32-35` ; `src/infrastructure/task-queue-bullmq.ts:124`
- **Problème :** `retryStrategy` renvoie `null` après 3 tentatives (100+200+300 ms) : ioredis abandonne la connexion pour toujours. BullMQ (`Worker.getNextJob`) laisse échapper « Connection is closed. » hors de `onError`.
- **Scénario :** Redis redémarre (2 s) → `UNHANDLED REJECTION`, worker rejeté, `enqueue`/`get` sur le même handle échouent indéfiniment après le retour de Redis. `redis-workers.md` ne mentionne ni la perte du handle ni le crash.
- **Correctif :** Backoff borné sans abandon, état « fermé/erreur » explicite, capture du rejet BullMQ, test de redémarrage Redis.
- **Confiance :** haute (repro `storage/bullmq-outage2.mjs` sur Redis 8 local, rejoué)

#### H-16 · `hub.flush()` pendant un dispatch ferme son journal et perd silencieusement la suite des événements

- **Brique :** Observabilité
- **Où :** `src/application/dispatch-observation.ts:72-75` ; `src/domain/observation.ts:100-115` ; `src/infrastructure/transport-journal.ts:77` ; appelant `src/application/speculation-run.ts:417`
- **Problème :** Le sink journal implémente `flush()` par `log.close()` ; `hub.flush()` appelle le `flush` de toutes les livraisons. Après fermeture, `record()` ignore les événements sans erreur ni compteur `dropped`.
- **Scénario :** dispatch en cours, `text:before`, `root.flush()`, `text:after` + `usage` → le journal ne contient que `dispatch-start, text:before`. `journals.md` promet un `dispatch-finished` final.
- **Correctif :** Fermer le journal seulement dans `finish()` ; `flush()` du sink = attendre les écritures en attente.
- **Confiance :** haute (repro `triggers/journal-flush-repro.mjs`, rejoué)

### 🟡 Moyenne

#### M-01 · Le masquage ignore les secrets JSON dès qu'un autre motif a matché la chaîne brute

- **Brique :** Domaine (aussi relevé par l'audit Observabilité)
- **Où :** `src/domain/redaction.ts:16`
- **Problème :** Si un motif a modifié la chaîne, la branche « parser le JSON et masquer en profondeur » est court-circuitée ; une valeur échappée (`a`, `\n`) reste en clair.
- **Scénario :** `redactValue('sk-abc123 {"t":"sk-\\u0061bc123"}', [/sk-[a-z0-9]{6}/])` → `"[REDACTED] {\"t\":\"sk-\\u0061bc123\"}"`.
- **Correctif :** Appliquer la passe JSON sur `masked` plutôt que sur `value`.
- **Confiance :** haute (repros `domain/redact2.mjs`, `triggers/journal-flush-repro.mjs`)

#### M-02 · `integrate()` sur un HEAD hôte détaché renvoie `process` sans détail de recovery

- **Brique :** Dispatch/Workspaces
- **Où :** `src/infrastructure/git/workspace-lease.ts:66-73`
- **Problème :** `git symbolic-ref --short HEAD` est exécuté hors `try` ; sur HEAD détaché l'erreur brute `git exited with status 128` remonte sans `recovery`. La doc annonce `conflict` et conseille de retenter les autres codes.
- **Scénario :** `git checkout --detach` sur l'hôte entre la fin de l'agent et `workspace.integrate()` → `code: process`, `recovery: {}` ; un workflow réessaie inutilement.
- **Correctif :** Lever `OutpostError("conflict", …, { directory, branch })` et `recordRecovery`.
- **Confiance :** haute (repro `dispatch/repro-integrate.mjs` C)

#### M-03 · `passes > 1` en dispatch froid : un sandbox, une branche et des hooks par passe

- **Brique :** Dispatch/Workspaces
- **Où :** `src/application/dispatch.ts:54-71`
- **Problème :** Chaque passe rappelle `dispatchOperation({ passes: 1 })`, crée un nouveau sandbox, rejoue `hostReady`/`sandboxReady` et, en mode `integrate`, une branche `outpost/job-<uuid>` différente fusionnée après chaque passe. Le chemin chaud `sandbox.dispatch()` boucle sans réallouer.
- **Scénario :** `dispatch({ branch: { mode: "integrate" }, passes: 3, hooks: { sandboxReady: [npm ci] } })` → 3 `npm ci`, 3 worktrees, 3 merges. `limits-and-cancellation.md` dit « same branch », `environment-setup.md` dit « No hook runs between passes ».
- **Correctif :** Exécuter les passes froides dans un seul sandbox/workspace, ou corriger les deux guides.
- **Confiance :** haute (repro `dispatch/repro-passes.mjs`)

#### M-04 · L'outil `git` « read-only » lit n'importe quel fichier via `diff --no-index`

- **Brique :** Harness
- **Où :** `src/adapters/tools/git-tools.ts:34,48` ; `src/adapters/tools/tools.constants.ts:13`
- **Problème :** La liste noire par préfixe ne bloque pas `--no-index` ; les arguments sont passés tels quels.
- **Scénario :** `git { command: "diff", arguments: ["--no-index", "/etc/hostname", "/dev/null"] }` → contenu renvoyé au modèle (hôte avec le provider local) ; les règles `paths` ne s'appliquent pas.
- **Correctif :** Ajouter `--no-index` à `GIT_BLOCKED_OPTIONS` et refuser les arguments absolus/`..`.
- **Confiance :** haute (ligne exacte exécutée en shell)

#### M-05 · Découverte OAuth du bridge MCP sans validation : le client secret peut partir vers un token endpoint choisi par le serveur

- **Brique :** Harness
- **Où :** `src/adapters/tools/mcp-launcher.constants.ts:162-176` ; `src/domain/mcp-server.ts:124-127`
- **Problème :** `discover()` suit `resource_metadata` du challenge 401 sans vérifier que `resource` correspond à l'URL MCP (RFC 9728), ni l'`issuer` (RFC 8414), ni `https` sur `token_endpoint`.
- **Scénario :** serveur MCP compromis ou MITM (`http:` accepté) répond 401 avec `resource_metadata` vers un hôte attaquant → `client_id:client_secret` envoyés à son endpoint.
- **Correctif :** Exiger `resource === URL MCP`, `issuer` cohérent et `https`, ou documenter la confiance totale dans le serveur MCP.
- **Confiance :** haute (trace ; non exécuté en réseau)

#### M-06 · `truncateToolResults` recompacte à chaque pas

- **Brique :** Harness
- **Où :** `src/domain/context.ts:58-64` ; `src/application/harness-context.ts:35-47`
- **Problème :** La note ajoutée rend le bloc > `maxCharacters`, donc `changed` est vrai à chaque pas ; chaque passage réécrit la note et `history.replace()` ajoute tout l'historique au transcript, en retirant les blocs `reasoning` récents.
- **Scénario :** résultat de 5 000 caractères → notes « truncated from 5000 », puis « from 148 », « from 147 » ; dispatch de 6 pas → 4 records `compaction`.
- **Correctif :** Ne tronquer que les blocs non encore marqués ; test d'idempotence.
- **Confiance :** haute (repro `harness/repro3.mjs`)

#### M-07 · La consigne du watchdog pour une répétition de la boucle principale est livrée au sous-agent suivant

- **Brique :** Harness
- **Où :** `src/application/repetition-watchdog.ts:105-108` ; `src/application/harness-steering.ts:7-12`
- **Problème :** Sans `event.subagentId`, l'envoi est non ciblé (`{}`) et `take()` d'un sous-agent accepte les messages non ciblés.
- **Scénario :** parent appelle `inspect` 3× avec la même entrée → la consigne « STOP REPEATING » est consommée par le 3e sous-agent ; la répétition suivante arrête l'agent. Contredit `stuck-agents.md`.
- **Correctif :** Envoyer `{ subagent: null }` quand la détection concerne la boucle principale.
- **Confiance :** haute (repro `harness/repro.mjs` B)

#### M-08 · Un profil `allowedTools` interdit `load_skill` et les outils ressources/prompts MCP des serveurs déclarés

- **Brique :** Harness
- **Où :** `src/domain/agent-profile-permissions.ts:12-17,27-42` ; `src/domain/agent-profile.constants.ts:13-17`
- **Problème :** Seuls les outils fichiers/shell et `mcp__<server>__*` passent ; `load_skill`, `mcp_list_resources`, `mcp_read_resource`, `mcp_list_prompts`, `mcp_get_prompt` sont refusés.
- **Scénario :** `defineAgentProfile({ allowedTools: ["read"], mcpServers: { docs } })` + `skills` → le modèle ne peut ni charger un skill ni lire les ressources de `docs`. `agent-profiles.md` dit « Explicit MCP declarations grant tools separately ».
- **Correctif :** Autoriser `load_skill` et les outils MCP dont `input.server` est déclaré, ou documenter l'exclusion.
- **Confiance :** haute (repro `harness/repro.mjs` A)

#### M-09 · Steering reçu pendant l'ouverture du transcript ou le démarrage MCP est ajouté après les instructions de réponse finale

- **Brique :** Harness
- **Où :** `src/application/steering-turns.ts:26-34` ; `src/application/harness-loop.ts:101-104` ; `src/application/custom-turn.ts:198-208`
- **Problème :** La boucle reprend l'inbox après la construction du prompt ; un message arrivé entre les deux prises (jusqu'à 60 s par serveur MCP) est placé après le bloc « Final response format ».
- **Scénario :** `response: defineTextResponse(...)`, `steering.send()` sur l'événement `conversation` → premier message = `["Go\n\nFinal response format…", "Also check docs/"]`. Viole l'invariant AGENTS.md.
- **Correctif :** Insérer les messages pris au démarrage avant le prompt rendu, ou re-rendre les instructions après eux.
- **Confiance :** haute (repro `harness/repro4.mjs` J)

#### M-10 · Identifiants d'appel d'outil dupliqués : résultat perdu, effets exécutés, tour échoué au pas suivant

- **Brique :** Harness
- **Où :** `src/application/tool-execution.ts:50-66`
- **Problème :** `outcomes` est une `Map` par `call.id` ; deux appels de même id sont exécutés mais le second écrase le premier ; rien n'est validé à la frontière provider.
- **Scénario :** réponse avec deux `tool-call` id `same` → deux `tool-result` identiques, la lecture réussie perdue ; les adaptateurs réels rejettent ensuite l'historique (« Each tool call needs exactly one result ») après exécution d'éventuels `write_file`.
- **Correctif :** Rejeter les ids dupliqués/vides avant toute exécution (erreur `response`).
- **Confiance :** haute (repro `harness/repro2.mjs`)

#### M-11 · Une sortie non-JSON est rejouée à chaque `retry`

- **Brique :** Workflows durables
- **Où :** `src/domain/workflow/task-runner.ts:148`
- **Problème :** `checkpointValue(value)` est dans le `try` du cycle de retry ; une erreur de sérialisation déterministe (Date, NaN, classe) relance `perform` (dispatch payant) jusqu'à `retry.attempts`.
- **Scénario :** `retry: { attempts: 3 }` + `perform` renvoie `{ when: new Date() }` → 3 exécutions facturées, échec final. `task-cache.md` affirme « without a retry ».
- **Correctif :** Valider la valeur hors du cycle de retry ou rendre l'erreur non-retryable.
- **Confiance :** haute (repro `workflows/r2-nonjson-retry.mjs`)

#### M-12 · Un échec transitoire à la libération du bail masque un résultat réussi et verrouille le run

- **Brique :** Workflows durables
- **Où :** `src/domain/workflow/workflow-scheduler.ts:76-79` ; `src/infrastructure/transport-checkpoint.ts:100-113`
- **Problème :** Si l'écriture `owner: null` échoue une fois, `start()` rejette avec l'erreur transport alors que le workflow est terminé et persisté ; l'owner reste posé.
- **Scénario :** write transitoire en erreur → le `WorkflowResult` n'est jamais rendu ; `start()` suivant : « Workflow is already in use » jusqu'à `recoverWorkflowCheckpoint()`.
- **Correctif :** Réessayer la libération une fois ou rendre le résultat avec l'erreur de libération attachée.
- **Confiance :** haute (repro `workflows/r4-release-failure.mjs`)

#### M-13 · Les sorties restaurées ou produites sont mutables : un consommateur réécrit la sortie persistée du producteur

- **Brique :** Workflows durables
- **Où :** `src/domain/workflow/workflow-state.ts:109` ; `src/domain/workflow/task-runner.ts:99` ; `src/domain/workflow/checkpoint.ts:85-90`
- **Problème :** `context.value(dep)` et `result.value()` partagent la référence ; toute mutation est persistée sous la clé du producteur au prochain checkpoint.
- **Scénario :** `consumer` fait `ctx.value(producer).files.push("X")` → le checkpoint contient la valeur altérée pour `producer` ; une reprise `done` la renverra.
- **Correctif :** Geler profondément les valeurs à la complétion et à la restauration, ou cloner dans `context.value()`.
- **Confiance :** haute (repro `workflows/r12-value-mutation.mjs`)

#### M-14 · Un seed échoué laisse un bundle d'historique complet orphelin sous `.outpost/recovery`, jamais élagable

- **Brique :** Recovery/Sync
- **Où :** `src/application/remote-workspace.ts:34-40,144` ; `src/application/sandbox-provision.ts:146` ; `src/application/recovery-retention.ts:92`
- **Problème :** Le répertoire de recovery est créé avant le seed et seul `close()` (jamais appelé si `seedRemote` lance) le supprime. Chaque échec laisse `initial.bundle` sans `state.json` : non restaurable, protégé par la rétention.
- **Scénario :** panne réseau pendant `lease.upload` en boucle de retry → croissance illimitée de `.outpost/recovery/<uuid>/initial.bundle`.
- **Correctif :** Supprimer `recovery` dans un `catch` quand aucun `state.json` n'a été produit, ou rendre ces répertoires éligibles à la rétention.
- **Confiance :** haute (repro `recovery/repro-seed-orphan.mjs`)

#### M-15 · L'élagage Transport supprime l'`index` du journal avant ses segments ; un échec partiel orphelinise les segments à vie

- **Brique :** Recovery/Sync
- **Où :** `src/application/transport-retention.ts:204-212` ; `:95-118`
- **Problème :** Après suppression de l'index, une erreur sur un segment laisse des objets `logs/<id>/<segment>` sans index ; ils deviennent `LOG_ACTIVITY_OR_CONTENT_UNKNOWN`, jamais éligibles, comptés dans le quota.
- **Scénario :** `remove(index)` OK, `remove(segment)` échoue (S3 transitoire) → 4 objets résiduels protégés.
- **Correctif :** Supprimer les segments d'abord et l'index en dernier.
- **Confiance :** haute (repro `recovery/repro-retention-orphan.mjs`)

#### M-16 · Claude : `transcriptUsage` remplace l'usage cumulé du tour par le dernier message assistant

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/claude/claude-events.ts:141-150` ; `src/application/sandbox-dispatch.ts:141-160`
- **Problème :** L'événement `result` de Claude cumule les appels API du tour ; après capture, Outpost substitue l'usage du dernier message assistant sans condition.
- **Scénario :** tour de 5 appels outils → usage et coût rapportés ≈ 1/5 du réel ; budgets de jetons franchis sans détection.
- **Correctif :** N'utiliser `transcriptUsage` que si le tour n'a pas d'usage final, ou sommer les messages assistants du tour.
- **Confiance :** moyenne (sémantique cumulée de `result.usage` non rejouée avec le CLI payant)

#### M-17 · Kimi : le brief passe en argument de ligne de commande (limite 128 KiB, visible dans `ps`)

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/kimi/kimi-request.ts:39-48`
- **Problème :** Contrairement aux autres agents (stdin), le brief rendu est un seul argv ; Linux limite une chaîne d'argument à 128 KiB et le texte est lisible par tout processus du sandbox.
- **Scénario :** brief > 128 KiB → `spawn E2BIG`, tour en échec sans message explicite. Limite absente de `kimi-code.md`.
- **Correctif :** Vérifier la taille avec une `OutpostError` claire et documenter la limite.
- **Confiance :** haute (repro `agents/kimi-arg-size.mjs`)

#### M-18 · Steering `resumed` Copilot/Kimi : l'identifiant n'est connu qu'au dernier événement, aucune interruption possible

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/copilot/copilot-events.ts:31-35` ; `src/adapters/agents/kimi/kimi-events.ts:39-42` ; `src/application/cli-steering.ts:102-105`
- **Problème :** `interruptingSteering` n'arrête le processus qu'une fois la conversation connue ; pour ces agents c'est en fin de tour.
- **Scénario :** `send("stop and do X")` pendant un long tour Copilot → aucun effet avant la fin du tour, alors que `steering.md` annonce « the action in progress is cut short ».
- **Correctif :** Décoder un identifiant précoce ou documenter que `resumed` attend la fin du tour pour Copilot/Kimi.
- **Confiance :** haute (Copilot) ; moyenne (Kimi)

#### M-19 · Corps des réponses HTTP en erreur jeté : crédit épuisé non classé, aucun diagnostic

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/http-provider.ts:79-96` ; `src/adapters/decisions/system-one-provider.ts:105`
- **Problème :** Seul le statut HTTP est utilisé ; le corps est annulé sans lecture. Un solde insuffisant Anthropic (HTTP 400) devient `provider` sans `quota` ni `unavailable` ; une erreur de validation n'expose que « HTTP 400 ».
- **Scénario :** crédit épuisé → tâche en `provider`, `onQuota` et fallback inactifs, opérateur sans message.
- **Correctif :** Lire le corps (borné) et passer `error.type/code` à la classification de `streamFailure`.
- **Confiance :** haute (mécanisme, repro `models/f-errors.mjs`) ; moyenne (statut Anthropic du solde)

#### M-20 · `Retry-After` serveur non borné dans les retries de tâche

- **Brique :** Providers modèles
- **Où :** `src/domain/workflow/retry.ts:45-52` ; `src/adapters/models/retry-after.ts:19`
- **Problème :** `Math.max(duration, server)` s'applique après `maxDelayMs` ; un en-tête de 10 ans est accepté et `waitForRetry` attend sans plafond.
- **Scénario :** proxy mal configuré renvoie 429 + `Retry-After: 315360000` → workflow bloqué jusqu'au deadline global. Documenté « even beyond maxDelayMs » mais sans borne ni option.
- **Correctif :** Plafonner le délai serveur (`maxRetryAfterMs`) en gardant « au moins Retry-After » en dessous.
- **Confiance :** haute (repro `models/e-retry.mjs`)

#### M-21 · `reasoning: "none"` Anthropic validé à la composition mais `thinking: disabled` refusé par les modèles actuels

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/anthropic-model-provider.constants.ts:7` ; `src/adapters/models/anthropic-model-provider.ts:46-51`
- **Problème :** `none` → `thinking: { type: "disabled" }`, paramètre refusé par les modèles Claude 5.x ; `validate()` l'accepte, contrairement à `model-providers.md`.
- **Scénario :** `{ name: "claude-opus-5-5", reasoning: "none" }` → composition OK, chaque requête échoue « HTTP 400 » sans message (M-19).
- **Correctif :** Émettre `output_config.effort: "low"` sans `thinking` pour `none`, ou documenter l'incompatibilité.
- **Confiance :** moyenne (règle API non testée en direct)

#### M-22 · Un cache contenant un composant `.git` ne peut être ni sauvegardé ni restauré ; l'échec surgit à la fermeture

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/cloud-cache.ts:151` ; `src/infrastructure/transport-archive.ts:42` ; `src/infrastructure/files.ts:48,83`
- **Problème :** `archiveFiles`/`restoreArchiveFiles` réutilisent `safeDestination`, qui rejette tout segment `.git`, alors que les caches cargo/go/pip VCS en contiennent.
- **Scénario :** cache `cargo` après `cargo fetch` d'une dépendance git → `release()` rejette après `stop()` ; le cache n'est jamais publié et chaque run termine en erreur.
- **Correctif :** Validateur de chemin dédié aux archives (sans la règle `.git`) ou exclusion documentée.
- **Confiance :** haute (repro `cloud/repro-git-cache.mjs`)

#### M-23 · Délai fixe de 60 s pour restauration/sauvegarde des caches avec un appel API par fichier

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/cloud-cache.constants.ts:5` ; `src/providers/cloud-cache.ts:67-69,121,129` ; `docs/src/content/docs/guide/environment-setup.md:134`
- **Problème :** Le délai n'est pas configurable et couvre des transferts fichier par fichier (`writeFiles`/`readFile` Vercel, `uploadFile`/`downloadFile` Daytona, plus un `chmod` par fichier), incompatibles avec les limites documentées (100 000 fichiers).
- **Scénario :** cache npm de 3 000 fichiers → restauration > 60 s → `TimeoutError` → acquisition échoue tant que le pointeur `current` existe.
- **Correctif :** Exposer le délai, utiliser les lots (`fileBatches`) et documenter une taille pratique.
- **Confiance :** moyenne (latence réelle non mesurée ; validation live « pending » dans le guide)

#### M-24 · Daytona : les secrets de `variables` sont inscrits dans le texte de la commande de session

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/daytona-command.ts:54`
- **Problème :** Les variables sont sérialisées `env 'KEY=VALUE'` dans la commande envoyée à `executeSessionCommand`, conservée par Daytona dans la session jusqu'au `deleteSession`. Vercel passe `env` au SDK ; le SDK Daytona offre `envVars` à la création.
- **Scénario :** runner tué pendant un tour → la session et son texte de commande (avec secrets) persistent jusqu'à expiration de la sandbox.
- **Correctif :** Passer les variables via `envVars` à la création et ne garder que les non secrètes dans la commande.
- **Confiance :** moyenne (comportement de rétention Daytona non vérifié en live)

#### M-25 · Provider local : une commande se termine à la fermeture de stdout/stderr, pas à la sortie du processus

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/infrastructure/process.ts:111` ; `src/providers/local.ts:60`
- **Problème :** Node n'émet `close` qu'une fois les tuyaux fermés ; un petit-fils héritant de stdout retient le résultat jusqu'à sa fin ou `deadlineMs`.
- **Scénario :** `sh -c 'sleep 4 & exit 3'` → `{ status: 3 }` après 4 007 ms (3 ms avec redirection) ; Docker plafonne à ~2 s. Contredit `sandbox-sessions.md` (« waits for the process to exit, not for its output to close »).
- **Correctif :** Résoudre sur `exit` avec drainage borné, ou documenter.
- **Confiance :** haute (repro `containers/scripts/exp-local.mjs`, Docker réel)

#### M-26 · `upload`/`download` n'ont pas la même sémantique sur local et conteneur

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/providers/local.ts:29-47` ; `src/providers/container-files.ts:54-62,72-80,114-116` ; `src/providers/container-plan.ts:33`
- **Problème :** Conteneur : `download("dir", existant)` imbrique, chemins relatifs résolus contre `root`, destination vérifiée. Local : `fs.cp` fusionne, relatifs contre `cwd`, aucun contrôle de symlink. En mode isolé, un `upload` relatif se résout contre `/`.
- **Scénario :** même script passant de Docker à `createLocalSandboxProvider()` → fichiers ailleurs ; `host-process.md` affirme « sandbox sessions work unchanged ».
- **Correctif :** Faire passer le provider local par `copyTransfer`/`transferDestination` avec résolution contre `root` ; `--workdir root` sur les `exec` d'upload.
- **Confiance :** haute (local/Docker exécutés) ; moyenne (mode isolé, trace)

#### M-27 · `download` rejette toute destination ayant un ancêtre symlink → `os.tmpdir()` macOS inutilisable, `doctor --transfers` en faux échec

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/infrastructure/transfer-copy.ts:17-24` ; `src/application/doctor-transfers.ts:17`
- **Problème :** La garde parcourt tout le chemin absolu ; sur macOS `/var → /private/var` et `doctor --transfers` télécharge dans `tmpdir()`.
- **Scénario :** Docker Desktop sur macOS → « Transfer destination traverses a symlink » ; sonde `sandbox.transfers` en FAIL alors que le transfert fonctionne.
- **Correctif :** N'interdire que les symlinks sous une racine résolue par `realpath` ; ne pas sonder dans `tmpdir()` brut.
- **Confiance :** moyenne (mécanisme prouvé sous Linux ; macOS non exécuté)

#### M-28 · SIGINT libère les conteneurs sans aborter la commande en cours ; au niveau lease elle « réussit » avec le statut 137

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/infrastructure/shutdown.ts:14-26` ; `src/providers/container-command.ts:11-14` ; `src/providers/container.ts:137-148`
- **Problème :** `release()` fait `rm --force` sans aborter les commandes en vol ; `docker exec` sort 137 et `invoke` résout normalement. Le processus continue et un nouvel `acquire` réinstalle les handlers.
- **Scénario :** Ctrl+C pendant `lease.invoke` → `{ status: 137 }` ; un appelant avec retries réalloue un sandbox et reprend après Ctrl+C. `sandbox-sessions.md` dit « Rejects ».
- **Correctif :** Aborter un contrôleur interne partagé par les commandes dans `release()` ; documenter le handler SIGINT.
- **Confiance :** haute (repro `containers/scripts/exp-sigint.mjs`, Docker réel)

#### M-29 · Podman : le home tmpfs est monté `mode=1777` alors que la doc promet un home privé en 700

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/providers/container-plan.ts:43-46`
- **Problème :** Docker reçoit `uid=…,gid=…,mode=0700`, Podman `rw,mode=1777` (world-writable sticky).
- **Scénario :** `createPodmanSandboxProvider()` → `/home/agent` inscriptible par tout UID du conteneur ; `agent-images.md` et `containers.md` ne distinguent pas Podman.
- **Correctif :** Utiliser `uid=/gid=` avec keep-id ou `chmod 700` après `start`, et documenter.
- **Confiance :** moyenne (Podman absent de l'environnement)

#### M-30 · S3 : repasser de `tombstone` à `conditional` laisse des clés irrécréables et des listings incohérents

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/s3-transport.ts:69,119,208-213`
- **Problème :** En mode `conditional`, un marqueur hérité est invisible à `read` mais présent dans `list` et bloque toute création `ifRevision: null` par 412 permanent.
- **Scénario :** writer R2 `tombstone` supprime `task-cache/<fp>.json` → writer `conditional` : `read` → `undefined`, `write(null)` → `TransportConflict` à chaque fois ; le cache se tait sans erreur.
- **Correctif :** Traiter un marqueur rencontré comme en mode tombstone ou échouer explicitement ; documenter la purge.
- **Confiance :** haute (repro `storage/s3-mode-switch.mjs`, serveur S3 factice)

#### M-31 · S3 `tombstone` : marqueurs d'activité de ressources accumulés sans limite, un HEAD par marqueur à chaque allocation

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/s3-transport.ts:190` ; `src/infrastructure/resource-activity.ts:44` ; `src/application/transport-retention.ts` (scopes)
- **Problème :** Chaque sandbox enregistre puis supprime `resources/<uuid>.json` ; en mode tombstone la suppression laisse un marqueur permanent qu'aucun scope de rétention ne purge, et `registerResourceActivity` liste `resources/` avec un HEAD par marqueur.
- **Scénario :** 10 000 dispatches sur R2 → 10 000 objets facturés et 10 000 HEAD par allocation ; `maxRecords` ne compte que les vivants.
- **Correctif :** Scope de rétention pour les marqueurs clos, ou identifiants listables sans HEAD.
- **Confiance :** haute (repro `storage/s3-markers.mjs`)

#### M-32 · Transport local : `list()` lit le corps complet de chaque objet pour produire une entrée

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/local-transport.ts:199`
- **Problème :** L'entrée est dans l'en-tête de 1 KiB, mais `list` lit jusqu'à 64 MiB par objet ; `reserveTransportStorage`, `registerResourceActivity` et `inspectTransportRecovery` paient O(octets stockés) à chaque appel.
- **Scénario :** 1 GiB d'artefacts → chaque réservation/allocation relit 1 GiB.
- **Correctif :** Lire seulement `headerBytes` et vérifier `size` contre la taille du fichier.
- **Confiance :** haute (repro `storage/list-cost.mjs`)

#### M-33 · Registre de réservations sans propriétaire : la récupération documentée est impossible à faire en sécurité

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/transport-reservations.ts:33,98`
- **Problème :** `retention.md` demande de retirer une entrée « after checking that its owner stopped », mais le ledger ne stocke que `uuid → octets`.
- **Scénario :** deux jobs réservent 2 GiB, l'un meurt → deux UUID indistinguables ; supprimer la mauvaise entrée casse la coordination du writer vivant.
- **Correctif :** Stocker `{ bytes, createdAt, pid, identity, repository }` et fournir une récupération conditionnelle.
- **Confiance :** haute (trace)

#### M-34 · Les expressions à joker perdent une heure réelle au passage à l'heure d'hiver

- **Brique :** Triggers/Cron
- **Où :** `src/domain/cron.ts:121-127`
- **Problème :** La règle « heure répétée = un seul tir » s'applique aussi aux champs `*`/`*/n`, contrairement à Vixie cron. `0 * * * *` Europe/Paris saute l'instant 01:00Z le 25/10/2026.
- **Scénario :** scheduler horaire → `schedule:h:…T00:00:00Z` puis `…T02:00:00Z`, trou de 2 h réelles. Le guide ne mentionne que les horaires fixes.
- **Correctif :** Documenter le trou pour les jokers, ou retourner les deux instants quand heure/minute sont des jokers.
- **Confiance :** haute (repro `triggers/cron-repro.mjs`)

#### M-35 · Créneaux sautés silencieusement quand la publication dure plus que l'intervalle

- **Brique :** Triggers/Cron
- **Où :** `src/application/schedules.ts:73-82`
- **Problème :** La boucle attend `publish()` puis reprend avec `previous(now)` : si `enqueue()` dépasse l'intervalle, les créneaux intermédiaires ne sont ni publiés ni signalés à `onError`.
- **Scénario :** `* * * * *`, `enqueue` de 150 s → jobs `00:00`, `00:03`, `00:05` ; `00:01`, `00:02`, `00:04` absents.
- **Correctif :** Signaler les créneaux ignorés via `onError`/un événement et documenter qu'une file lente est aussi un retard.
- **Confiance :** haute (repro `triggers/cron-repro.mjs`)

#### M-36 · L'image et le provider acceptent UID 0 sans refus ni avertissement

- **Brique :** CLI/Images
- **Où :** `src/cli/image.ts:24-25` ; `src/cli/scaffold.constants.ts:8,12` ; `src/providers/container.ts:88`
- **Problème :** `uid >= 0` autorise 0 ; `usermod -o -u 0 node` + `USER 0:0` produisent une image dont l'agent est root, et le provider par défaut (`process.getuid()`) l'exécute en root sur le checkout monté.
- **Scénario :** hôte en root (conteneur CI, VM) → `outpost init --yes` → agent root, fichiers root-owned dans le dépôt monté ; SECURITY.md promet « UID/GID choisi ».
- **Correctif :** Refuser `uid === 0` sauf `--uid` explicite, ou avertissement bloquant dans `init`/`doctor`.
- **Confiance :** haute (trace)

#### M-37 · `test/session-bundles-container.test.ts` n'est exécuté nulle part

- **Brique :** CLI/Images
- **Où :** `.github/workflows/ci.yml:88-98` ; `package.json` (`test:container` = `container.test.ts` seul)
- **Problème :** Le test Docker/Podman réel de capture/restauration des sessions Copilot/Kimi est gaté par `OUTPOST_CONTAINER_ENGINE` mais jamais invoqué par CI ni par un script.
- **Scénario :** régression de capture native en conteneur → CI verte.
- **Correctif :** L'ajouter au job `containers` et à `test:container`.
- **Confiance :** haute (`grep -rn session-bundles-container .github package.json` vide)

#### M-38 · Notes de release = CHANGELOG entier, dont `## Unreleased` ; aucune porte ne vérifie les changelogs

- **Brique :** Transverse
- **Où :** `.github/workflows/release.yml:36` ; `scripts/verify-release.mjs:4-11` ; `CHANGELOG.md:3`
- **Problème :** `verify-release` ne contrôle que `name`/`version`/tag ; AGENTS.md exige des changelogs cohérents avant tag.
- **Scénario :** tag `v11.0.2` poussé maintenant → release GitHub avec « Unreleased » (recipe engine) + tout l'historique en notes, sans section 11.0.2.
- **Correctif :** Extraire la section `## <version>` des deux changelogs, échouer si absente ou si `Unreleased` est non vide.
- **Confiance :** haute (trace, état actuel du dépôt)

#### M-39 · `fromSecrets()` efface aussi les diagnostics sûrs d'Outpost (statut HTTP, mapping manquant)

- **Brique :** Secrets
- **Où :** `src/application/secrets.ts:53-67` ; messages perdus : `src/adapters/secrets/vault.ts:73`, `secret-source.ts:34`, `infisical.ts:46-49`
- **Problème :** Le `catch` remplace toute erreur non-`configuration` par « Secret resolution failed » et toute `configuration` par « Invalid secret source configuration », y compris les messages construits par Outpost sans donnée sensible. Le guide n'annonce que la suppression des « vendor exceptions ».
- **Scénario :** Vault répond 403 (token expiré) ou le nom demandé manque dans le mapping 1Password → message générique indiscernable d'une panne réseau. En direct, `source.resolve` donne « Vault read failed with HTTP 403 » et « Missing secret reference: OTHER ».
- **Correctif :** Laisser passer les `OutpostError` créées par Outpost et ne remplacer que les exceptions étrangères.
- **Confiance :** haute (repro `newmods/secrets-repro.mjs`, serveur HTTP local)

### 🔵 Basse

#### B-01 · `?` en mode `text` (tools/commands) refuse `/`

- **Brique :** Domaine
- **Où :** `src/domain/glob.ts:10`
- **Problème :** `"?": () => "[^/]"` quel que soit le mode, alors que `*` dépend du mode.
- **Scénario :** `glob("git ?", "text").test("git /")` → `false`.
- **Correctif :** Rendre `?` dépendant du mode et tester `glob.ts` directement.
- **Confiance :** haute

#### B-02 · `shell:<cmd>` validé après `trim()` mais comparé sans trim

- **Brique :** Domaine
- **Où :** `src/domain/agent-profile.ts:38` ; `src/domain/agent-profile-permissions.ts:20`
- **Problème :** `"shell: npm test"` passe la validation mais n'autorise jamais `npm test`.
- **Scénario :** `defineAgentProfile({ allowedTools: ["shell: npm test"] })` → `Denied by agent profile allowedTools`.
- **Correctif :** Rejeter les entrées dont `slice(6) !== slice(6).trim()`.
- **Confiance :** haute

#### B-03 · Une écriture de checkpoint échouée empoisonne définitivement la chaîne `writes`

- **Brique :** Domaine
- **Où :** `src/domain/workflow/checkpoint.ts:93`
- **Problème :** Après un rejet, chaque `save()` suivant rejette avec la même erreur ; les statuts finaux ne sont jamais persistés et `start()` lève l'erreur de transport.
- **Scénario :** 3e écriture rejette (503 transitoire) → `start()` throw, checkpoint figé sur `a:active`.
- **Correctif :** Repartir d'une chaîne saine après erreur et documenter le comportement.
- **Confiance :** haute (repro `domain/cp-write.mjs`) ; « fail closed » reste défendable

#### B-04 · La doc de reprise ne couvre pas un checkpoint sans tâche démarrée

- **Brique :** Domaine
- **Où :** `src/domain/workflow/checkpoint.ts:51-73` ; `docs/src/content/docs/guide/durable-runs.md`
- **Problème :** Un checkpoint ne contenant que des records `waiting/0` exige `resume: "retry-incomplete"` ; le guide ne liste que « failed, cancelled or interrupted ».
- **Scénario :** processus mort juste après la persistance initiale → « resume retry-incomplete must explicitly authorize replay ».
- **Correctif :** Autoriser la reprise sans drapeau quand tout est `waiting/0`, ou l'écrire dans le guide (EN/FR).
- **Confiance :** haute (repro `domain/cp-waiting.mjs`)

#### B-05 · Avec `prices`, une convention de cache invalide fait échouer la tâche via `reportUsage`

- **Brique :** Domaine
- **Où :** `src/domain/workflow/budget.ts:156` ; `src/domain/pricing.ts:55`
- **Problème :** Un rapport `cached + cacheCreated > input` lève une `Error` brute depuis `context.reportUsage`, même sans budget de coût ; l'usage est perdu.
- **Scénario :** rapport manuel non conforme → tâche échouée, aucun événement `budget-exceeded`.
- **Correctif :** Marquer l'usage incomplet ou lever `WorkflowCostUnavailable` ; documenter la convention.
- **Confiance :** moyenne

#### B-06 · Doublons de domaines egress sensibles à la casse

- **Brique :** Domaine
- **Où :** `src/domain/egress.ts:11-18`
- **Problème :** `new Set(items)` sans normalisation ; `Example.COM` et `example.com` sont conservés tous deux et la casse est transmise au fournisseur.
- **Scénario :** `validateEgress({ mode: "allowlist", domains: ["Example.COM", "example.com"] })` → deux entrées.
- **Correctif :** Normaliser en minuscules avant validation.
- **Confiance :** haute (comportement) ; faible (impact chez Vercel/Daytona)

#### B-07 · Réutilisation d'un workspace `named` : `fetch origin` + fast-forward silencieux, non documenté

- **Brique :** Dispatch/Workspaces
- **Où :** `src/infrastructure/git/refresh-worktree.ts:19-38`
- **Problème :** À chaque réouverture, Outpost lance un `git fetch origin refs/heads/<branch>` (réseau, échec avalé) puis fast-forward la branche locale ; testé mais absent des guides.
- **Scénario :** branche locale en retard sur `origin` → la baseline saute au commit distant ; sans réseau, chaque réouverture attend le timeout du fetch.
- **Correctif :** Documenter et rendre le rafraîchissement opt-in.
- **Confiance :** haute

#### B-08 · Vérification de la branche hôte hors du verrou d'intégration

- **Brique :** Dispatch/Workspaces
- **Où :** `src/infrastructure/git/workspace-lease.ts:66-79,92`
- **Problème :** `current !== baseBranch` est contrôlé avant `lock(merge:<baseBranch>)` ; sans guard, aucun contrôle de HEAD n'est refait sous le verrou avant `git merge`.
- **Scénario :** `git switch other` entre le contrôle et le merge → commits intégrés dans `other` (fenêtre courte, acteurs coopératifs).
- **Correctif :** Déplacer le contrôle sous le verrou et le répéter avant le merge.
- **Confiance :** moyenne

#### B-09 · Empreinte du dépôt : lecture intégrale en mémoire de chaque fichier non suivi

- **Brique :** Dispatch/Workspaces
- **Où :** `src/application/workspace-fingerprint.ts:30`
- **Problème :** `digest()` fait `readFile` sur tout fichier non suivi, deux fois par preflight ; > 2 GiB → `ERR_FS_FILE_TOO_LARGE`.
- **Scénario :** `build/` non ignoré de 3 Go → `workspace.integrate({ onConflict })` bloqué/OOM.
- **Correctif :** Hacher en flux et plafonner/documenter.
- **Confiance :** haute

#### B-10 · `show-ref` hors du contrat Git commun ; `verificationGit` sans kill de groupe

- **Brique :** Dispatch/Workspaces
- **Où :** `src/infrastructure/git/managed-worktree.ts:83-85` ; `src/infrastructure/git/verification-command.ts:16-42`
- **Problème :** `show-ref` passe par `executeProcess` sans `core.hooksPath`/`LC_ALL` ; `execFile` avec `timeout` ne signale que le fils direct.
- **Scénario :** un filtre Git lancé par une commande de vérification survit à l'annulation.
- **Correctif :** Passer par `git()`/`executeProcess` (groupe de processus).
- **Confiance :** moyenne

#### B-11 · Un sous-agent est borné par `toolExecution.deadlineMs` du parent (5 min) ; `subagent failed` arrive après `finished`

- **Brique :** Harness
- **Où :** `src/application/tool-execution.ts:219-231` ; `src/application/harness-subagent.ts:99-102,142-147`
- **Problème :** Comportement testé mais absent de `subagents.md` ; le `runSubagent` orphelin continue après le `tool-result` et le `finished` du parent.
- **Scénario :** enfant à `maxSteps: 50` → « Tool inspect timed out after 300000 ms » ; ordre `tool-result → finished → subagent:failed`.
- **Correctif :** Documenter la borne, proposer un `deadlineMs` par sous-agent, émettre `failed` avant le résultat.
- **Confiance :** haute (repro `harness/repro4.mjs` H)

#### B-12 · `stopReason` inconnu d'un provider personnalisé → `TypeError`

- **Brique :** Harness
- **Où :** `src/application/harness-loop.ts:155`
- **Problème :** `stopHandlers[reason]` n'est pas gardé ; la donnée externe du contrat public `ModelProvider` n'est pas rétrécie.
- **Scénario :** provider renvoie `stopReason: "stop"` → `TypeError: stopHandlers[reason] is not a function`, sans `code`.
- **Correctif :** `invariant(Object.hasOwn(stopHandlers, reason))` → `OutpostError("response")`.
- **Confiance :** haute (repro `harness/repro3.mjs` G)

#### B-13 · Le serveur MCP stdio hérite de tout l'environnement de la sandbox

- **Brique :** Harness
- **Où :** `src/adapters/tools/mcp-launcher.constants.ts:4-13`
- **Problème :** `variables` ne sert qu'à vérifier la présence ; `spawn(..., { stdio: "inherit" })` sans `env` transmet toutes les variables du provider et de `.outpost/.env`.
- **Scénario :** serveur déclarant `variables: ["LINEAR_API_KEY"]` lit aussi `OPENAI_API_KEY`. SECURITY.md dit « receive the variables you name ».
- **Correctif :** `spawn` avec un `env` filtré, ou reformuler la doc.
- **Confiance :** haute

#### B-14 · L'ordre des clés d'un objet `interaction` change l'identité du checkpoint

- **Brique :** Workflows durables
- **Où :** `src/domain/workflow/task.ts:27-33` ; `src/domain/workflow/checkpoint.ts:22-23,41-43`
- **Problème :** `JSON.stringify` de l'objet tel quel ; `{identity, actors}` et `{actors, identity}` donnent deux identités.
- **Scénario :** réécriture cosmétique du code → « Invalid or incompatible workflow checkpoint ».
- **Correctif :** Canonicaliser le graphe (`canonicalJson`) avant hachage.
- **Confiance :** haute (repro `workflows/r9-identity-keyorder.mjs`)

#### B-15 · `recoverWorkflowCheckpoint()` ne demande pas la confirmation d'arrêt exigée par `recoverSpeculation()`

- **Brique :** Workflows durables
- **Où :** `src/infrastructure/transport-checkpoint.ts:119-132` ; `src/infrastructure/speculation-store.ts:80`
- **Problème :** Contrat incohérent entre deux APIs de récupération ; l'une encode « stop the runner first », l'autre non.
- **Scénario :** un opérateur libère l'owner d'un run vivant ; le runner écrit jusqu'au prochain `owned()` (fencing OK, mais double exécution possible entre-temps).
- **Correctif :** Aligner la signature (`runnerStopped: true`).
- **Confiance :** moyenne

#### B-16 · Un `archiveRecovery()` interrompu laisse des chunks sans manifeste, protégés par la rétention

- **Brique :** Recovery/Sync
- **Où :** `src/application/recovery-archive.ts:26-27` ; `src/infrastructure/transport-archive.ts:54-56,99`
- **Problème :** Les chunks sont écrits avant le manifeste ; une erreur avant la ligne 99 ne nettoie rien, et la catégorie `recovery` est protégée côté Transport.
- **Scénario :** panne après N chunks → objets inutilisables, jamais listés ni élagués.
- **Correctif :** Supprimer les chunks écrits en cas d'échec, ou autoriser l'élagage des préfixes sans manifeste.
- **Confiance :** haute

#### B-17 · Transfert batch : suppression hôte d'un fichier déjà transféré → `ENOENT` au lieu d'un `conflict`

- **Brique :** Recovery/Sync
- **Où :** `src/application/remote-download.ts:57-64`
- **Problème :** `fileManifest` lance `ENOENT` avant la vérification `digest()` ; le sync est `failed` sans `state.json` ni message « Host workspace changed ».
- **Scénario :** `pull()` 1 transfère `untracked.txt` → l'hôte le supprime → `pull()` 2 échoue `ENOENT`.
- **Correctif :** Attraper `ENOENT` et laisser `validateChanges` lever le `conflict`.
- **Confiance :** moyenne (non reproductible avec le provider local)

#### B-18 · Antigravity `usage` sur l'hôte : `settings.json` annoncé par la doc n'est pas écrit

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/antigravity/antigravity-authentication.ts:15-25` ; `docs/src/content/docs/guide/antigravity.md:56`
- **Problème :** En placement `host`, `plan.files` est ignoré ; seule `GEMINI_API_KEY` est passée.
- **Scénario :** `createLocalSandboxProvider()` + `usage` → aucun `modelProvider: gemini` dans le home.
- **Correctif :** Documenter ce cas ou refuser `usage` sur l'hôte si `agy` l'exige.
- **Confiance :** moyenne

#### B-19 · `codexProvider` lance une `Error` nue au lieu d'une `OutpostError("configuration")`

- **Brique :** Adaptateurs CLI
- **Où :** `src/adapters/agents/codex/codex-provider.ts:13-18`
- **Problème :** `baseUrl` invalide produit une erreur sans code, incohérente avec les autres validations de composition.
- **Scénario :** `modelProvider: { baseUrl: "not a url" }` → `Error` générique.
- **Correctif :** `invariant(URL.canParse(provider.baseUrl), ...)`.
- **Confiance :** haute

#### B-20 · Pas de `validate()` OpenAI : `reasoning: "max"` accepté à la composition

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/openai-protocols.ts:8-22`
- **Problème :** `max` est un niveau Outpost sans équivalent OpenAI ; l'échec n'arrive qu'en HTTP 400 à l'exécution.
- **Scénario :** `createAgent({ model: { name: "gpt-5", reasoning: "max" } })` → composition OK, échec au premier pas.
- **Correctif :** Ajouter `validate` OpenAI rejetant `max`.
- **Confiance :** haute (code) ; moyenne (liste exacte OpenAI)

#### B-21 · Les commentaires SSE keep-alive relancent indéfiniment le timeout

- **Brique :** Providers modèles
- **Où :** `src/infrastructure/sse.ts:27` ; `src/adapters/models/http-provider.ts:128-131`
- **Problème :** Tout chunk, y compris `: ping`, remet `timeoutMs` à zéro ; un proxy bloqué qui ping ne déclenche jamais `timeout`.
- **Scénario :** `timeoutMs: 300`, `: ping` toutes les 100 ms pendant 1,2 s → succès ; seul le `limits` du tour borne l'attente.
- **Correctif :** Ne rafraîchir que sur événement `data` décodé, ou plafond total optionnel.
- **Confiance :** haute (repro `models/d-keepalive.mjs`)

#### B-22 · Pannes de transport sans `cause` ; clé API non-ByteString classée `unavailable` et déclenche le fallback

- **Brique :** Providers modèles
- **Où :** `src/adapters/models/http-provider.ts:111-116` ; `src/adapters/decisions/system-one-provider.ts:134-139`
- **Problème :** Toute exception non-Outpost devient `provider` + `unavailable: "HTTP transport failure"` sans `cause` ; ECONNREFUSED, TLS et un `TypeError` d'en-tête sont indiscernables.
- **Scénario :** clé contenant un caractère > 0xFF → fallback sur tous les candidats pour une erreur de configuration.
- **Correctif :** Valider la clé en ByteString à la composition ; attacher `cause`.
- **Confiance :** haute (repros `models/f-errors.mjs`, `h-key.mjs`)

#### B-23 · Provider de décision : signal déjà annulé → `DOMException` au lieu d'`OutpostError("aborted")`

- **Brique :** Providers modèles
- **Où :** `src/adapters/decisions/system-one-provider.ts:82` (hors du `try` de la ligne 88)
- **Problème :** Incohérent avec `http-provider.ts` ; `executeDecision` émet `failed` sans `code`.
- **Scénario :** `decide({ signal: AbortSignal.abort() })` → `AbortError`.
- **Correctif :** Déplacer `throwIfAborted()` dans le `try`.
- **Confiance :** haute

#### B-24 · Décodeur de sortie Daytona : un chunk mêlant texte brut et trames émet les trames en base64

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/daytona-output.ts:12-14`
- **Problème :** Dès qu'un `pending` ne commence pas par le préfixe, tout le tampon est émis brut, y compris les trames `outpost-output:` qui suivent dans le même chunk.
- **Scénario :** avertissement Node sur stderr suivi d'une trame → l'observateur reçoit `outpost-output:cmVhbC…`.
- **Correctif :** Découper `pending` ligne par ligne.
- **Confiance :** haute (repro `cloud/repro-daytona-output.mjs`)

#### B-25 · Firecracker : le statut 255 d'`ssh` est retourné comme statut de la commande

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/firecracker-command.ts:137`
- **Problème :** Une coupure SSH ou un échec d'authentification produit `status: 255` indiscernable d'une commande ayant quitté 255.
- **Scénario :** reboot de l'invité pendant un tour → échec « normal » de l'agent (retries consommés) au lieu d'une indisponibilité.
- **Correctif :** Distinguer 255 + stderr `ssh:` en `OutpostError("provider")`.
- **Confiance :** moyenne

#### B-26 · Fichiers `.cancel` résiduels ; `release()` non idempotente après un échec de sauvegarde de cache

- **Brique :** Sandboxes cloud
- **Où :** `src/providers/daytona-command.ts:60,66` ; `src/providers/firecracker-command.ts:75,94` ; `src/providers/vercel.ts:51-66` ; `src/providers/daytona.ts:49-64`
- **Problème :** Les fichiers `/tmp/outpost-*.cancel` s'accumulent dans les sandboxes réutilisées ; après sauvegarde échouée mais `stop()` réussi, chaque `release()` rejette à nouveau.
- **Scénario :** `await using` + `release()` explicite → deux rejets pour un échec.
- **Correctif :** Supprimer `.cancel` dans `finally` ; mémoriser le succès du stop.
- **Confiance :** haute

#### B-27 · Guide Daytona muet sur `autoStopInterval` ; import dynamique superflu et `if/else`

- **Brique :** Sandboxes cloud
- **Où :** `docs/src/content/docs/guide/cloud-sandboxes.md:36-56` ; `src/providers/cloud-files.ts:27` ; `src/providers/daytona-files.ts:33`
- **Problème :** L'arrêt automatique Daytona (défaut SDK 15 min) n'est pas documenté alors que la validation live le règle ; `uploadTree` fait un `import()` dynamique de `readlink`.
- **Scénario :** tâche longue sur Daytona arrêtée par le provider sans indication dans la doc.
- **Correctif :** Documenter `autoStopInterval` ; import statique ; garde.
- **Confiance :** moyenne

#### B-28 · Escalade SIGTERM→SIGKILL de 100 ms dans le conteneur, 500 ms sur l'hôte, non documentée

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/providers/container-command.ts:78` ; `src/infrastructure/process.constants.ts:4` ; `src/providers/firecracker-command.ts:94`
- **Problème :** Un processus qui nettoie sur SIGTERM (flush de session avant reprise de steering) est tué avant la fin de son handler.
- **Scénario :** `trap 'sleep 0.5; echo cleaned > f' TERM` annulé → aucun fichier.
- **Correctif :** Aligner sur `killGraceMs` et mentionner le délai dans `limits-and-cancellation.md`.
- **Confiance :** haute (Docker réel)

#### B-29 · Un chemin de dépôt contenant `:` rend le montage `--volume` invalide sous Linux

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/providers/container-mounts.ts:79-80`
- **Problème :** Seule la virgule est refusée ; la forme `src:dst:opts` échoue avec « invalid volume specification ».
- **Scénario :** dépôt `…/a:b` → `acquire` échoue, message opaque.
- **Correctif :** `--mount type=bind,…` partout, ou valider `:` explicitement.
- **Confiance :** haute (Docker réel)

#### B-30 · Après un `rm --force` échoué, le nettoyage immédiat à la sortie du processus est sauté

- **Brique :** Sandboxes conteneurs/local
- **Où :** `src/providers/container.ts:138-147,240-247`
- **Problème :** `release()` marque `closed` avant le succès ; si `rm` échoue, le handler `exit` ignore le conteneur.
- **Scénario :** `release()` rejette (démon indisponible), `process.exit()` → conteneur orphelin.
- **Correctif :** Ne positionner `closed` qu'après succès.
- **Confiance :** haute

#### B-31 · Identité d'`enqueue` sensible à l'ordre des clés JSON de `input`

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/task-queue.ts:91` ; `src/infrastructure/task-queue-bullmq.constants.ts:12`
- **Problème :** La même requête logique sérialisée avec un autre ordre de clés est rejetée « Queue identity already has a different request ».
- **Scénario :** `{a:1,b:2}` puis `{b:2,a:1}` sous le même id → rejet.
- **Correctif :** Canonicaliser `request` (`canonicalJson`) avant stockage et comparaison.
- **Confiance :** haute (repro `storage/worker-loop.mjs` A)

#### B-32 · Queue SQLite : `get()` prend un verrou d'écriture, pas de WAL

- **Brique :** Stockage/Files
- **Où :** `src/infrastructure/task-queue.ts:48,99-104`
- **Problème :** Chaque sondage `get()` (250 ms) ouvre `BEGIN IMMEDIATE`, sérialisant lecteurs et workers ; au-delà de `busy_timeout`, `SQLITE_BUSY` déclenche H-04.
- **Scénario :** plusieurs pollers + workers sur disque lent → contention puis arrêt du worker.
- **Correctif :** `PRAGMA journal_mode=WAL` et lecture hors transaction immédiate.
- **Confiance :** moyenne (contention non reproduite)

#### B-33 · Portabilité des clés : noms réservés Windows acceptés, collisions de casse non distinguées

- **Brique :** Stockage/Files
- **Où :** `src/domain/transport.constants.ts:2` ; `src/infrastructure/transport-envelope.ts`
- **Problème :** `CON`, `a.` passent ; sur FS insensible à la casse, `Foo` et `foo` partagent un fichier et `read` échoue « Invalid or oversized transport object ».
- **Scénario :** `runs/<id>` en deux casses sur macOS → second observer en échec opaque.
- **Correctif :** Rejeter les noms réservés Windows et documenter la sensibilité à la casse.
- **Confiance :** moyenne

#### B-34 · `maxLateMs: 0` accepté et rend le scheduler muet

- **Brique :** Triggers/Cron
- **Où :** `src/application/schedules.ts:50`
- **Problème :** Avec 0, un créneau n'est publié que si `clock.now()` vaut exactement l'instant du créneau.
- **Scénario :** `runSchedules({ maxLateMs: 0 })` → aucune erreur, aucun job.
- **Correctif :** Exiger `maxLateMs >= 1`.
- **Confiance :** haute

#### B-35 · Fuseaux abrégés acceptés et canonisés silencieusement (`EST` → `America/Panama`)

- **Brique :** Triggers/Cron
- **Où :** `src/domain/cron.ts:77-96,129`
- **Problème :** `Intl` accepte des alias ambigus sans DST.
- **Scénario :** `createCronSchedule("0 12 * * *", { timeZone: "EST" })` → décalage d'une heure en été.
- **Correctif :** Refuser les identifiants non `Région/Ville` ou documenter l'alias.
- **Confiance :** haute

#### B-36 · Corps illisible après signature valide classé 401/`verify` au lieu de 400

- **Brique :** Triggers/Cron
- **Où :** `src/adapters/triggers/slack-request.ts:60-64` ; `gitlab-webhook.ts:54-62` ; `standard-webhook.ts:67-71` ; `github-webhook.ts:46`
- **Problème :** `JSON.parse` et la validation de `delivery` s'exécutent dans `verify()` ; `webhooks.md` réserve 401 à la signature.
- **Scénario :** signature Slack valide sans `trigger_id` → `401 verify:Trigger delivery identifier is missing or invalid`.
- **Correctif :** Séparer vérification de signature et décodage (étape `decode` → 400).
- **Confiance :** haute (repro `triggers/server-repro.mjs`)

#### B-37 · Sonde d'image à 5 s fixes : Copilot `--version` échoue sous charge avec un conseil trompeur

- **Brique :** CLI/Images
- **Où :** `src/application/doctor.constants.ts:5` ; `src/application/doctor-image.ts:106`
- **Problème :** `deadlineMs: 5_000` n'est pas configurable pour les sondes d'image ; `copilot --version` prend ~5 s dans l'image (5 229 et 4 952 ms mesurés) et le remède affiché est « Install copilot in the image and rebuild it ».
- **Scénario :** `test/container.test.ts` a échoué sous charge (`agent.sandbox: Check timed out`) puis réussi seul.
- **Correctif :** Délai configurable et remède distinguant timeout et absence.
- **Confiance :** haute (observé par l'orchestrateur)

#### B-38 · Validation du nom d'image incohérente entre `doctor` et `init`/`image`

- **Brique :** CLI/Images
- **Où :** `src/application/doctor.ts:47-52` ; `src/cli/image.ts:16` ; `src/cli/scaffold.ts:54`
- **Problème :** `init`/`image build|remove` acceptent `-x` et la chaîne vide.
- **Scénario :** `init --yes --no-build --image --no-cache` → `run.ts` contient `image: "--no-cache"`.
- **Correctif :** Partager l'invariant de `doctor.ts`.
- **Confiance :** haute

#### B-39 · Erreurs système brutes sur entrées invalides courantes

- **Brique :** CLI/Images
- **Où :** `src/cli/project-settings.ts:18-26` ; `src/cli/recovery-command.ts:38`
- **Problème :** Pas de garde explicite ; l'erreur système remonte telle quelle.
- **Scénario :** `recovery inspect --repository <non-git>` → `git exited with status 128` ; `init --directory <fichier>` → `ENOTDIR`.
- **Correctif :** Vérifier le type du chemin / l'existence du dépôt et émettre un message `configuration`.
- **Confiance :** haute

#### B-40 · `init` ne génère pas de `.dockerignore` ; la CI scaffolde dans la racine du checkout

- **Brique :** CLI/Images
- **Où :** `src/cli/scaffold-files.ts:13-23` ; `.github/workflows/ci.yml:87`
- **Problème :** `prepare-agent-image.mjs` écrit un `.dockerignore`, le scaffold non ; le job `containers` écrit `run.ts`, `brief.md`, `Dockerfile` à la racine du dépôt.
- **Scénario :** `podman build` lit `.env`, `node_modules`, `.outpost/` ; un lint futur dans ce job échoue sur les fichiers générés.
- **Correctif :** Scaffolder `.dockerignore` ; `--directory "$RUNNER_TEMP/agent-image"` en CI.
- **Confiance :** moyenne

#### B-41 · Durcissement supply-chain des workflows de publication

- **Brique :** Transverse
- **Où :** `.github/workflows/release.yml:4,13-16,44-46` ; `.github/workflows/agent-images.yml:75-80,104`
- **Problème :** Actions épinglées par tag majeur dans des jobs `id-token: write`/`packages: write` ; tout tag `v*` déclenche la publication sans vérifier que le commit est sur `main`.
- **Scénario :** tag poussé depuis une branche → publication npm avec provenance.
- **Correctif :** Pins SHA + `git merge-base --is-ancestor $GITHUB_SHA origin/main` dans `verify-release`.
- **Confiance :** haute

#### B-42 · `check-architecture.mjs` ne couvre pas plusieurs règles d'AGENTS.md

- **Brique :** Transverse
- **Où :** `scripts/check-architecture.mjs:43-72`
- **Problème :** Non détectés : ternaires imbriqués (10 sites, dont `src/application/execution.ts:67-72`, `src/domain/errors.ts:43-48`, `src/providers/container-mounts.ts:62`), commentaires > 2 lignes (`src/infrastructure/conversations/session-bundle.types.ts:22-25`), `as unknown as` (`src/domain/replay.ts:169,244`, `src/domain/model-messages.ts:137`), `import()` hors couche.
- **Scénario :** `bun run architecture` vert malgré ces écarts.
- **Correctif :** Étendre le script (ConditionalExpression imbriquée, longueur des commentaires, `ImportTypeNode`).
- **Confiance :** haute (scan AST)

#### B-43 · AGENTS.md décalé du dépôt

- **Brique :** Transverse
- **Où :** `AGENTS.md:158` ; `AGENTS.md:120-128`
- **Problème :** La phrase « do not restore … a root `examples/` directory » coexiste avec un `examples/` racine de 65 dossiers référencé par les guides ; les suites `session-bundles-container`, `cli-continuations-native`, `firecracker-*live`, `cloud-live.ts` et `scripts/harness-live.mjs` ne sont pas documentées.
- **Scénario :** un agent suivant AGENTS.md supprime `examples/` ou ignore les suites live.
- **Correctif :** Mettre AGENTS.md à jour.
- **Confiance :** haute

#### B-44 · `scriptedAgent()` échappe à la convention `create*`

- **Brique :** Transverse
- **Où :** `src/adapters/testing/scripted-agent.ts:12` ; `src/testing.ts:1` ; `test/unit/public-names.test.ts`
- **Problème :** Construit un agent runtime sans préfixe `create*` ; AGENTS.md:15 cite ce nom au lieu de l'aligner sur sa propre règle, et aucun test n'applique la convention aux nouveaux exports.
- **Scénario :** API publique incohérente entre `createMemorySandboxProvider` et `scriptedAgent`, figée par le subpath `/testing` publié en 11.0.1.
- **Correctif :** `createScriptedAgent` + alias `@deprecated`, ou assertion de convention.
- **Confiance :** moyenne

#### B-45 · Chemins critiques sans test de régression

- **Brique :** Transverse
- **Où :** `test/unit/`, `test/functional/`
- **Problème :** Aucun test unitaire n'importe `src/domain/glob.ts` ; la branche JSON du masquage, le cache hit après tentatives (C-01), un chunk `error` Chat Completions (H-10), un `Retry-After` > `maxDelayMs`, une erreur de backend dans `runQueueWorker` (H-04), un redémarrage Redis (H-15), `add -f` sur chemin ignoré (C-02), un dépôt imbriqué (H-05), `elevated` + annulation (H-13), un transfert > 120 s (H-14) et une cible HTTP invalide (C-03) ne sont pas couverts.
- **Scénario :** régressions silencieuses sur ces branches.
- **Correctif :** Ajouter une régression par constat Critique/Haute.
- **Confiance :** haute

#### B-46 · Message « payload must be valid base64 » inatteignable dans l'adapter GCP

- **Brique :** Secrets
- **Où :** `src/adapters/secrets/gcp.ts:38-48`
- **Problème :** Le `throw` base64 est à l'intérieur du `try` dont le `catch {}` reconvertit tout en « GCP secret payload must be UTF-8 text ».
- **Scénario :** `payload.data = "not base64!!"` → message UTF-8 trompeur.
- **Correctif :** Valider le base64 avant le `try` ou relancer les `OutpostError` dans le `catch`.
- **Confiance :** haute (repro `newmods/secrets-repro.mjs`)

#### B-47 · Liste des kinds d'agents et regex dupliquées hors modules `*.constants.ts`

- **Brique :** Recettes YAML
- **Où :** `src/cli/recipe-command.ts:40,74` ; `src/domain/recipe.ts:97` (regex identique à `SECRET_VARIABLE_NAME`) ; `src/adapters/secrets/azure.ts:22`, `gcp.ts:18`, `onepassword.ts:18`
- **Problème :** AGENTS.md demande les valeurs supportées dans `*.constants.ts` ; la liste `["cli","custom","replay","fallback"]` reproduit l'union `DispatchAgent` à la main.
- **Scénario :** ajout d'un kind d'agent → `outpost recipe run` rejette « Recipe agents must be composed Outpost agents » sans erreur de typage.
- **Correctif :** Déplacer ces listes/regex dans des constantes adjacentes et dériver les kinds d'une constante partagée.
- **Confiance :** haute

#### B-48 · Le texte d'aide `--file` de `recipe run` fuit dans `image build --help`

- **Brique :** Recettes YAML
- **Où :** `src/cli/main.constants.ts:68`
- **Problème :** L'option `file` est partagée entre `image` et `recipe` ; sa description est devenue « YAML or container recipe path ».
- **Scénario :** `outpost image build --help` suggère qu'un YAML est accepté pour une image.
- **Correctif :** Option dédiée ou description par commande.
- **Confiance :** haute (exécuté)

#### B-49 · Un signal reçu pendant le nettoyage force 130/143 malgré un rapport `done`

- **Brique :** Recettes YAML
- **Où :** `src/cli/recipe-command.ts:89-96,117-120`
- **Problème :** `cancel()` écrit `process.exitCode` sans vérifier `completed` ; un SIGINT pendant `sandbox.close()` après succès fait sortir 130 alors que stdout contient `status: "done"`.
- **Scénario :** Ctrl+C pendant la fermeture d'une sandbox cloud lente → la CI interprète un échec, workspace déjà intégré.
- **Correctif :** Ignorer le signal une fois `completed = true`.
- **Confiance :** moyenne (trace, pas de repro temporel)

#### B-50 · README ne référence pas le guide des sources de secrets

- **Brique :** Transverse
- **Où :** `README.md:97-98`
- **Problème :** Le changelog 11.0.1 annonce un guide bilingue « secret sources » ; le tableau README a reçu testing et recettes mais aucune ligne pour les secrets.
- **Scénario :** découverte de la fonctionnalité uniquement via la navigation docs.
- **Correctif :** Ajouter une ligne « Load secrets from a service » → `guide/secret-sources/`.
- **Confiance :** haute

## Limites connues

| Brique            | Limite                                                                                                                                            | Source                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Domaine           | Chemins absolus ou hors dépôt ne matchent aucun `paths` ; `commands: ["npm test*"]` autorise `npm test; rm -rf`                                   | `guide/harness-permissions.md` § Limits                            |
| Domaine           | Les valeurs substituées dans une commande `` !`…` `` gardent leur sémantique shell ; elles ne peuvent pas créer de commande (vérifié)             | SECURITY.md, `guide/briefs.md`                                     |
| Domaine           | Gates : `actor` ∈ `actors`, pas l'identité de la personne ; signature Ed25519 opt-in                                                              | `guide/approvals.md`, SECURITY.md                                  |
| Domaine           | `*.example.com` n'inclut pas l'apex ; wildcards partiels rejetés                                                                                  | `guide/network-restrictions.md`                                    |
| Domaine           | Un budget ne borne pas une requête en vol ; ce n'est pas un plafond de facturation                                                                | `guide/budgets.md`                                                 |
| Domaine           | Entrées de cache non authentifiées ; première écriture gagnante                                                                                   | `guide/task-cache.md`                                              |
| Dispatch          | Diff guard sur le diff final commité seulement ; métadonnées Git montées modifiables ; pas une frontière adversariale                             | SECURITY.md, `guide/repository-and-branch.md`                      |
| Dispatch          | Worktrees avec fichiers ignorés toujours retenus ; une passe refusée n'annule pas les intégrations précédentes                                    | `guide/repository-and-branch.md`, `guide/recovery.md`              |
| Dispatch          | Marqueur `completion` + `settleMs` tue le processus et conserve `status: 0`                                                                       | `guide/limits-and-cancellation.md`                                 |
| Dispatch          | Validation live de la résolution de conflits et du watchdog en attente                                                                            | `guide/repository-and-branch.md`, `guide/stuck-agents.md`          |
| Harness           | `.git/config` et `.git/hooks` modifiables par `write_file` ; `readOnly` n'est qu'une indication d'ordonnancement                                  | SECURITY.md, `guide/harness-tools.md`                              |
| Harness           | Budgets vérifiés après réception ; `limits` réinitialisés à chaque passe/réparation ; compaction retire tous les `reasoning`                      | `guide/budgets.md`, `guide/harness.md`, `guide/harness-context.md` |
| Harness           | Code des outils exécuté dans le processus hôte ; serveurs MCP redémarrés à chaque tour ; délégations sérialisées                                  | `guide/harness.md`, `guide/mcp-servers.md`, `guide/subagents.md`   |
| Harness           | Steering non ciblé pris par le sous-agent actif plutôt que par la boucle principale                                                               | AGENTS.md                                                          |
| Workflows         | `defineQueuedTask()` retenté retrouve le même job ; effets at-least-once, dédup côté service d'effet                                              | `guide/job-queues.md`, SECURITY.md                                 |
| Workflows         | Ownership d'un checkpoint n'expire jamais ; recovery explicite après arrêt du runner                                                              | `guide/durable-runs.md`                                            |
| Workflows         | Spéculation : crash → usage incomplet ; seul `quota` rouvert ; `cleanupMs` borne l'attente, pas le provider                                       | `guide/speculation.md`                                             |
| Workflows         | Interactif : questions sans expiration, réponses non signées ; reprise quota avec `passes > 1` redémarre du brief                                 | `guide/interactive-tasks.md`, `guide/quota-pauses.md`              |
| Recovery/Sync     | Bundle initial `--all` ; fenêtre TOCTOU entre `digest()` et `applyChanges` ; échec pendant `applyChanges` laisse l'hôte partiel                   | `guide/cloud-sandboxes.md`, SECURITY.md                            |
| Recovery/Sync     | Checksums contre un manifeste non signé ; restaurabilité hors submodules ; dépôts shallow refusés                                                 | `guide/recovery.md`                                                |
| Rétention         | Réservation orpheline reste dans le ledger ; Transport sans `clean-workspaces` ; PID jamais interprété                                            | `guide/retention.md`                                               |
| Adaptateurs CLI   | Copilot refuse le fork ; Antigravity ni capture ni fork ; `reasoning` refusé pour Copilot/Antigravity                                             | guides `copilot-cli`, `antigravity`                                |
| Adaptateurs CLI   | Provider local : MCP Kimi/Antigravity fusionnés dans le vrai home et conservés                                                                    | `guide/mcp-servers.md`                                             |
| Adaptateurs CLI   | Jeton de rafraîchissement copié en sandbox peut invalider le login hôte ; bootstrap réutilise un exécutable sans vérification                     | `guide/authentication.md`, SECURITY.md                             |
| Adaptateurs CLI   | Redaction des bundles exige des entrées UTF-8 ; expansion `${NAME}` Copilot non vérifiable hors ligne                                             | `guide/mcp-servers.md`                                             |
| Providers modèles | Une seule tentative HTTP ; raisonnement rejoué vers le même provider/modèle ; usage d'une requête interrompue non compté                          | `guide/model-providers.md`, `guide/budgets.md`                     |
| Providers modèles | Timeout relancé à chaque chunk ; `Retry-After` prime sur `maxDelayMs` ; egress ne couvre pas les appels hôte                                      | `fields.json`, `guide/concurrency-and-retries.md`, SECURITY.md     |
| Providers modèles | Codex custom provider = Responses API uniquement ; blocs Anthropic inconnus/`pause_turn` → `response`                                             | AGENTS.md, `guide/model-providers.md`                              |
| Cloud             | Vercel : règles de domaine sur SNI, validation live opt-in ; Daytona : confirmation = `updateNetworkSettings`, Tier 3/4                           | SECURITY.md, `guide/network-restrictions.md`                       |
| Cloud             | Caches : `current` invalide ⇒ échec sans repli « miss » ; snapshots immuables non élagués ; bytes précédents de confiance                         | `guide/environment-setup.md`, SECURITY.md                          |
| Cloud             | Vercel non live sans `setsid` ; sorties texte (`retain` en caractères) ; dépassement = `TimeoutError` DOM                                         | `guide/sandbox-sessions.md`                                        |
| Firecracker       | Téléchargements bufferisés ; TAP/firewall/known_hosts à l'opérateur ; jailer validé seulement en live ; pas de namespace PID                      | SECURITY.md, `guide/firecracker.md`                                |
| Conteneurs        | Egress `deny-all` uniquement ; image doit fournir `sh`, `setsid`, `kill`, `tar`, `cp` ; UID image ≠ UID demandé → échec                           | `guide/containers.md`                                              |
| Conteneurs        | Caches partagés par dépôt/image/UID/nom/clé, jamais supprimés ; descendants orphelins jusqu'à `release`                                           | `guide/environment-setup.md`, `guide/sandbox-sessions.md`          |
| Local             | Aucune isolation ; variables seulement, pas de fichiers d'identifiants                                                                            | `guide/host-process.md`, SECURITY.md                               |
| Stockage          | Token HTTP autorise toutes les opérations (un client peut `complete` le job d'un autre, confirmé) ; TLS à fournir                                 | `guide/job-queues.md`, SECURITY.md                                 |
| Stockage          | Redis standalone, `noeviction` requis ; transport local sans propriété distribuée (NFS)                                                           | `guide/redis-workers.md`, `guide/storage.md`                       |
| Stockage          | S3 tombstone : marqueur facturé par suppression, 1 HEAD par objet listé, même mode pour tous les writers                                          | `guide/object-storage.md`                                          |
| Stockage          | Rétention ne supprime jamais branches, checkpoints, artefacts, conversations (`snapshots/<uuid>` jamais référencés)                               | `guide/retention.md`                                               |
| Triggers          | GitHub sans horodatage : rejeu possible sous nouveau delivery ; GitLab `token` : corps non signé ; Slack Events API non supporté                  | `guide/webhooks.md`                                                |
| Cron              | Pas de `L`, `W`, `#`, `?` ni secondes ; heure sautée ne tire pas, heure répétée tire une fois                                                     | `guide/cron-schedules.md`                                          |
| Observabilité     | Masquage par chaîne complète, motifs exécutés dans `emit()` ; hub borné, sink > 5 s désactivé ; heartbeat = abandon suspecté                      | SECURITY.md, `guide/observability.md`, `guide/run-state.md`        |
| CLI/Images        | Recette `init` non entièrement épinglée (base, apt, deps transitives) ; image GHCR construite avec l'UID du runner                                | `guide/agent-images.md`, `agent-images.yml`                        |
| CI                | Secrets cloud limités à l'environnement `cloud-compatibility` ; modèles payants opt-in manuel                                                     | `cloud-compatibility.yml`                                          |
| Secrets           | Vault accepte `http:` (token en clair), conforme au « HTTP(S) » documenté ; GCP/1Password/Infisical ne reçoivent pas le signal d'annulation       | `vault.ts:33`, `guide/secret-sources.md`                           |
| Secrets           | Vault KV v2 et AWS JSON rapatrient le document entier sur l'hôte ; snapshot au démarrage, pas de rotation ; `redact` non alimenté automatiquement | SECURITY.md, `guide/secret-sources.md`                             |
| Recettes YAML     | Résultats d'agents non checkpointables en JSON ; concurrence 1 ; `--config` = code de confiance ; pas de catalogue                                | `guide/yaml-recipes.md`, AGENTS.md                                 |
| Kit de test       | Aucune isolation ; workspaces Git réels sur l'hôte ; hooks hôte exécutés ; ni capture ni fork ; installation de fichiers refusée explicitement    | `guide/testing-workflows.md`                                       |
| Release           | Tag `v11.0.0` poussé sur origin bien que non publié, documenté dans CHANGELOG                                                                     | `git ls-remote`, `CHANGELOG.md`                                    |

## Couverture de l'audit

**Vérifications lancées** (Node 24.21.0 via mise, Bun 1.3.14, Docker 29.6.2, Redis 8.0.5 ; Podman absent) :

| Vérification                                                                             | Sur `9a35f33e`                                                    | Sur `e52198b8`                                            |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| `bun run check` (architecture, typecheck, tests, build)                                  | passée, 1150 tests                                                | passée, 1182 tests                                        |
| `bun run coverage` (seuil 80 %)                                                          | passée, 97,55 % lignes / 92,87 % branches                         | passée, 97,57 % lignes / 93,02 % branches                 |
| `bun run test:package`                                                                   | passée                                                            | passée                                                    |
| `bun run format:check`                                                                   | passée                                                            | passée                                                    |
| `bun run test:redis` (Redis 8 dédié, port 6399)                                          | passée, 12 tests                                                  | non relancée                                              |
| `test/container.test.ts` (Docker, image `outpost-ci:latest` du 2026-09-28, sans rebuild) | 20/21 sous charge, 21/21 au rejeu isolé (B-37)                    | non relancée                                              |
| `test/fixtures/container-terminal.ts` (PTY)                                              | passée                                                            | non relancée                                              |
| `docs/scripts/sync-reference.mjs --check`, `check-content.mjs`, parité navigation en/fr  | —                                                                 | passées (585 symboles, 723 pages)                         |
| Modules 11.x : YAML (21 cas hostiles), secrets (serveur HTTP local), CLI `recipe`        | —                                                                 | passées, protections documentées tenues (M-39, B-46…B-49) |
| Podman, `docs:build`, tests navigateur, `test/session-bundles-container.test.ts`         | non exécutés (Podman absent ; docs hors périmètre runtime ; M-37) | non exécutés                                              |
| Tests live cloud, modèles payants, Firecracker, Kimi natif                               | non exécutés (exclus par la mission)                              | non exécutés                                              |

**Méthode :** 14 audits par brique (deux vagues, sept agents interrompus par une limite de session puis relancés, plus un audit des modules ajoutés en 11.x), chaque constat Critique/Haute revérifié par l'orchestrateur en rejouant le script de reproduction et en relisant le code sur `e52198b8`. Scripts de reproduction sous le scratchpad de session, hors dépôt ; aucun fichier du dépôt modifié hormis `AUDIT.md`, aucun commit.

**Appels réseau :** aucun appel payant ni identifiant réel. Un script de l'audit Adaptateurs CLI (`codex exec` avec une fausse clé et un `CODEX_HOME` vide) a ouvert une connexion non authentifiée vers `api.openai.com`, refusée en 401 ; aucun autre appel sortant. Un conteneur étranger `outpost-0c571fb8…` (état `Created`, 2026-10-07, antérieur à l'audit) a été laissé en place.

**Non audité ou non vérifiable :** services de secrets réels (Vault, AWS, GCP, Azure, 1Password, Infisical) ; comportement réel macOS/Windows (verrous, casse, symlinks `tmpdir`) ; Podman ; sémantique réelle de `Command.kill` Vercel, `updateNetworkSettings` Daytona, `autoStopInterval` ; contrat OpenAI `store: false`/`include` et `reasoning_effort` ; `thinking: disabled` Anthropic sur les modèles 5.x ; Jev/Laya en direct ; S3/R2 réels ; jailer Firecracker ; collisions de hash de worktree (12 hex) jugées négligeables.

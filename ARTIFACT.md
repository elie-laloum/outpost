# Outpost Horizon — roadmap détaillée

Base : dépôt à la version 6.0.1 (commit 36339c3), roadmap et changelog du dépôt, lecture du code. 49 points.

Les exemples des sections « Nouvelles features » et « Nouvelles idées » décrivent des **API proposées** qui n'existent pas encore.

## Sommaire

- [À tester (8)](#tester)
  - [Antigravity, Copilot et Kimi en réel](#t-agents)
  - [Campagnes cloud Vercel et Daytona](#t-cloud)
  - [Harness intégré face aux vrais modèles](#t-harness)
  - [Diagnostics de premier lancement](#t-doctor)
  - [Images d'agents signées](#t-images)
  - [Coût des transferts distants](#t-transfers)
  - [S3 et Redis en production](#t-storage)
  - [Firecracker en réel](#t-firecracker)
- [À renforcer (10)](#renforcer)
  - [Reprise et fork pour Antigravity, Copilot, Kimi](#r-resume)
  - [Consommation de tokens Copilot et Kimi](#r-usage)
  - [Version d'Antigravity non épinglée](#r-agy)
  - [Authentification Copilot](#r-copilot)
  - [Observabilité complète](#r-observability)
  - [Sortir le harness intégré de l'expérimental](#r-harness)
  - [Spéculation récupérable](#r-speculation)
  - [Workflows sur plusieurs workers](#r-workers)
  - [Politiques réseau](#r-network)
  - [Retry et délais plus robustes](#r-retry)
- [Nouvelles features (18)](#features)
  - [Tâches dynamiques](#f-dynamic)
  - [Boucle jusqu'à réussite](#f-loop)
  - [Pause sur quota](#f-quota)
  - [Agent ou modèle de secours](#f-fallback)
  - [Kit de test pour workflows](#f-testing)
  - [Enregistrer et rejouer un run](#f-replay)
  - [Cache de tâches](#f-cache)
  - [Snapshot et fork en cours de tâche](#f-snapshot)
  - [Pilotage d'un agent en cours](#f-steer)
  - [Garde-fous sur le diff](#f-guards)
  - [Conflits résolus par un agent](#f-conflicts)
  - [Spéculation « meilleur des N »](#f-best)
  - [PR et MR automatiques](#f-pr)
  - [Déclencheurs](#f-triggers)
  - [Serveurs MCP](#f-mcp)
  - [CLI plus complète](#f-cli)
  - [Coût en euros et secrets masqués](#f-cost)
  - [Plus de fournisseurs](#f-providers)
- [Nouvelles idées (13)](#idees)
  - [État d'un run ou d'un workflow par ID](#i-state)
  - [Rapport de run lisible](#i-report)
  - [Configuration portable des agents](#i-profile)
  - [Environnements cloud préconstruits](#i-templates)
  - [Caches de dépendances dans le cloud](#i-cloud-cache)
  - [Préparation incrémentale](#i-incremental)
  - [Mise à jour des images](#i-image-update)
  - [Sources de secrets](#i-secrets)
  - [Livraison multi-dépôts coordonnée](#i-multirepo)
  - [Détection d'agent qui tourne en rond](#i-stuck)
  - [Choix du modèle selon la tâche](#i-routing)
  - [Benchmark agents × modèles](#i-bench)
  - [Bibliothèque de recettes](#i-recipes)

---

<a id="tester"></a>

## À tester

Déjà codé, reste à prouver en conditions réelles.

<a id="t-agents"></a>

### Antigravity, Copilot et Kimi en réel

**Ce qu'on teste** — Un run complet (brief simple → commit) avec chacun des trois agents, d'abord avec `authentication: "account"` puis `"usage"`, sur Docker, puis sur Vercel et Daytona.

**Ce que ça vérifie** — Les identifiants arrivent bien dans la sandbox, les événements de la CLI sont correctement décodés (texte, outils, fin de tour), un commit est produit, et un identifiant invalide donne une erreur claire.

**Prérequis** — Un compte Google pour Antigravity, un abonnement GitHub Copilot, un compte Kimi (les deux régions). `GEMINI_API_KEY`, `KIMI_API_KEY`, un jeton Copilot fine-grained. Une image avec `agy`, `copilot` et `kimi`. Le workflow `cloud-compatibility` ne fait des appels modèles que pour Claude et Codex : il faut l'étendre à ces trois agents.

**À vérifier à la main** — Après le run, ta session sur ta machine fonctionne encore (le rafraîchissement du jeton dans la sandbox ne l'a pas invalidée). La consommation affichée chez chaque fournisseur est cohérente. Suivre le ticket amont n° 479 d'Antigravity.

<a id="t-cloud"></a>

### Campagnes cloud Vercel et Daytona

**Statut — validation technique locale réussie (non publiée)** : les fixtures corrigées passent sur les deux providers avec les deux modèles retenus ; les erreurs attendues sont classées et le nettoyage est confirmé, y compris après allocation tardive. Le réseau Daytona est exclu selon le périmètre convenu ; le quota reste injecté. Bilan et preuves : `temp/cloud-compatibility/SUMMARY.md`. La confirmation de facturation dans les consoles reste distincte.

**Ce qu'on teste** — La suite de compatibilité cloud exécutée localement sur Vercel et Daytona avec `gpt-5.6-luna` et `claude-haiku-4-5`, plus des échecs provoqués : mauvais jeton, quota refusé par injection, réseau coupé sur Vercel, démarrage trop long. Cette campagne ne lance pas GitHub Actions. Le blocage réseau dynamique Daytona est exclu du périmètre retenu : le compte ne permet pas de modifier cette politique par sandbox.

**Ce que ça vérifie** — Chaque échec est rangé dans la bonne catégorie (allocation, connexion de l'agent, accès au modèle, réseau), avec une raison distincte pour le quota et le délai dépassé ; le nettoyage est confirmé après l'échec, y compris pour une allocation tardive ; le rapport JSON ne contient aucun secret. Vercel arrête ses sandboxes éphémères, Daytona les supprime.

**Prérequis** — `VERCEL_TOKEN`, `VERCEL_TEAM_ID` (l'équipe propriétaire du projet, pas l'utilisateur), `VERCEL_PROJECT_ID`, `DAYTONA_API_KEY`, `OPENAI_API_KEY` et `ANTHROPIC_API_KEY` dans `test/.env`, Node.js 24+ et un budget total de 2 $ maximum. Les commandes et preuves de la campagne sont conservées dans `temp/cloud-compatibility/`.

**Limites convenues** — Le quota épuisé est simulé sans consommer de crédit pour atteindre une limite réelle. Le blocage réseau dynamique Daytona reste hors périmètre et n'est pas compté comme réussi. Les scénarios par abonnement et les autres agents relèvent des campagnes dédiées.

**À vérifier à la main** — Dans les consoles Vercel et Daytona, aucune sandbox de campagne ne tourne encore. Comparer la facture aux runs enregistrés ; une estimation locale ne vaut pas confirmation de facturation.

<a id="t-harness"></a>

### Harness intégré face aux vrais modèles

**État — validation bornée, point encore ouvert** : la campagne initiale a réussi 21 scénarios sur trois protocoles (`temp/harness-live/SUMMARY.md`). La stabilisation ajoute 14 scénarios réels OpenAI, dont délégation et édition dans Docker ; résultats récupérés dans `temp/harness-stable-live/recovered-command-results.json`. La nouvelle validation Anthropic a réussi sept scénarios le 28 septembre 2026, dont la délégation dans Docker, avec `claude-haiku-4-5-20251001` sans raisonnement activé ; rapports bruts et bilan dans `temp/harness-anthropic-renewed-20260928/`. La comparaison qualitative avec les CLI, la revue manuelle des réponses et la facturation restent à confirmer ; ne pas confondre ces validations avec la stabilité des contrats du moteur.

**Ce qu'on teste** — `harness()` avec `openaiModelProvider` (API Responses et Chat Completions) et `anthropicModelProvider` sur des tâches qui utilisent des outils, en streaming, avec continuation d'une conversation.

**Ce que ça vérifie** — Les appels d'outils sont bien formés, le raisonnement n'est rejoué qu'au même modèle, le cache fonctionne (tokens en cache supérieurs à zéro), la raison d'arrêt est correcte en cas de coupure, et les limites d'étapes et de tokens sont respectées.

**Prérequis** — `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, la liste des modèles ciblés, un budget, et un dépôt de test avec des tâches reproductibles.

**À vérifier à la main** — Comparer le résultat avec Claude Code et Codex sur la même tâche, et lire quelques transcriptions pour juger la qualité.

<a id="t-doctor"></a>

### Diagnostics de premier lancement

**Statut — validation locale partielle (non publiée)** : les 10 scénarios contrôlés de la campagne Linux passent après correction de l’annulation des sondes hôte et du diagnostic réseau conservé lors d’un timeout. La clarté des messages a été confirmée par le propriétaire. Traces et relance : `temp/first-launch-diagnostics/`. Les comptes réellement expirés/révoqués, macOS/Windows et les autres combinaisons agent/authentification restent à tester ; le point complet reste ouvert.

**Ce qu'on teste** — `outpost doctor --json` puis un premier dispatch dans des situations cassées : CLI absente, jeton expiré, endpoint injoignable, modèle inconnu, Docker arrêté. Sur Linux, macOS et Windows, en CI sans terminal, et avec une annulation (Ctrl-C).

**Ce que ça vérifie** — Le message dit quoi corriger, distingue « serveur injoignable » et « identifiants refusés », n'affiche aucun secret et ne bascule jamais vers un autre mode de facturation.

**Prérequis** — Les trois OS (la matrice CI existe déjà), des comptes volontairement expirés ou révoqués.

**À vérifier à la main** — Faire lire les messages à quelqu'un qui découvre Outpost : comprend-il quoi faire ?

<a id="t-images"></a>

### Images d'agents signées

- [x] **Validation terminée le 28 septembre 2026 (Docker Linux amd64)** : le [workflow de publication 36353567785](https://github.com/elie-laloum/outpost/actions/runs/36353567785) a construit la base épinglée avec le snapshot Debian daté, passé les tests, publié l’image sur GHCR et vérifié son attestation après approbation. Le rapport transmis depuis la seconde machine `rathena` confirme le téléchargement anonyme, la vérification de l’attestation et les cinq CLI sur le digest publié `sha256:3eb28c660bb7a5a93fdef8455872534fbcefb6396736b35762e1ad69158cc064`. La visibilité publique et le tag sont confirmés. Rapport et relance : `temp/signed-agent-images/SUMMARY.md`. L’installateur Antigravity non épinglé reste un point distinct ; aucune reproductibilité bit à bit n’est revendiquée.

**Ce qu'on teste** — Le workflow `agent-images` en mode publication : image de base épinglée par digest, snapshot Debian daté, publication sur ghcr.io et attestation.

**Ce que ça vérifie** — `gh attestation verify` réussit depuis une autre machine, et les CLI embarquées répondent sur le digest réellement publié.

**Prérequis** — L'approbation de l'environnement `agent-images`, la variable `OUTPOST_AGENT_IMAGES_PUBLISH=true`, le digest de l'image de base.

**À vérifier à la main** — La page du package sur ghcr.io (visibilité, tags), et une vérification depuis une machine sans accès au dépôt.

<a id="t-transfers"></a>

### Coût des transferts distants

**Ce qu'on teste** — Des dispatch sur des dépôts types : un gros fichier (environ 500 Mo), 50 000 petits fichiers, un transfert coupé en cours, et des fichiers modifiés sur ta machine pendant le run.

**Ce que ça vérifie** — Les temps de démarrage et de transfert sont mesurés, le transfert reprend après une coupure, et aucune modification locale n'est écrasée (sauvegarde puis validation avant application).

**Prérequis** — Des dépôts de test générés par script, Vercel et Daytona, une mesure de temps par étape.

**À vérifier à la main** — Le trafic réseau et la facture, et l'intégrité des fichiers modifiés localement pendant le run.

<a id="t-storage"></a>

### S3 et Redis en production

**Ce qu'on teste** — `s3Transport` sur AWS S3 et un service compatible (MinIO, R2) avec coupures réseau pendant l'écriture et plus de 1 000 objets. Un Redis managé avec bascule du primaire vers une réplique pendant un job.

**Ce que ça vérifie** — Les écritures conditionnelles empêchent les conflits, aucun objet n'est corrompu, et un job reprend sans être finalisé deux fois.

**Prérequis** — Un bucket dédié avec ses droits IAM, une instance Redis managée avec bascule automatique.

**À vérifier à la main** — Le contenu du bucket (aucun secret stocké) et le coût des requêtes S3.

<a id="t-firecracker"></a>

### Firecracker en réel

**Statut — validation locale renforcée réussie (non publiée), point encore ouvert** : le mode jailer est implémenté avec UID/GID dédiés, chemins privilégiés protégés et limites cgroup v2. Sur WSL2, les tests réels passent pour le fonctionnement, le confinement, le bridage CPU, l’arrêt OOM provoqué, le refus IPv4/IPv6 et le nettoyage de la VM. La revue ciblée a identifié des téléchargements chargés en mémoire dans le superviseur, hors limite du VMM, et du travail noyau hors quota. Le statut expérimental est conservé ; preuves et limites : `temp/firecracker-live/hardening/`.

**Ce qu'on teste** — `test/firecracker-live.test.ts` sur un hôte Linux avec KVM : démarrage, commande, annulation, transferts, nettoyage, jailer, limites CPU et mémoire.

**Ce que ça vérifie** — La VM démarre, le processus est bien tué à l'annulation, et rien ne reste après fermeture (interfaces réseau, rootfs, sockets).

**Prérequis** — Un hôte avec KVM (bare-metal ou virtualisation imbriquée), `OUTPOST_FIRECRACKER_CONFIG`, un noyau et un rootfs.

**À vérifier à la main** — Une revue de sécurité par quelqu'un qui cherche à sortir de la VM, et que le réseau sortant est réellement bloqué.

---

<a id="renforcer"></a>

## À renforcer

Existe, mais partiel ou expérimental pour un usage en production.

<a id="r-resume"></a>

### Reprise et fork pour Antigravity, Copilot, Kimi

**État (implémenté, non publié)** — Copilot et Kimi disposent de la capture native, de la reprise à chaud/à froid et des réparations JSON ; Kimi dispose aussi du fork natif. Antigravity reprend une conversation et répare ses réponses dans la même sandbox ouverte. La capture portable et la reprise à froid Antigravity, ainsi que le fork automatisé Antigravity/Copilot, restent explicitement refusés. Les campagnes authentifiées multi-providers restent à réaliser.

**Ce que ça complète** — Capturer la conversation native de chaque CLI quand son format est stable, puis la reprendre, la forker et réparer les réponses, avec le même contrat que Claude Code et Codex. Quand une CLI ne le permet pas, le refuser explicitement et le documenter.

<a id="r-usage"></a>

### Consommation de tokens Copilot et Kimi

**Statut — implémenté localement (non publié)** : collecte des compteurs de session Copilot `1.0.88` et Kimi `2.1.1` dans la sandbox, avec agrégation des sous-agents Kimi et réconciliation du flux Copilot. Les mesures absentes ou partielles portent `Usage.complete: false` jusque dans les checkpoints. Les budgets exclusivement en tokens refusent un usage incomplet ; un budget de tentatives permet le repli, à combiner avec les délais de tâche ou de dispatch. Régressions hors ligne de protocole, processus, annulation, workflow et spéculation ajoutées. Les appels authentifiés et la comparaison avec la facturation restent dans la campagne « Antigravity, Copilot et Kimi en réel ».

**Faiblesse initiale** — La consommation remonte vide. Les budgets de workflow et de spéculation ne voient rien, et un workflow avec ces agents peut dépenser sans limite.

**Périmètre traité** — Lire l'usage quand la CLI l'expose (sortie, fichier de session). Sinon, marquer l'usage comme inconnu, prévenir au démarrage et permettre un budget en tentatives ou en durée pour ces agents.

<a id="r-agy"></a>

### Version d'Antigravity non épinglée

**Statut — implémenté, non publié** : la version `1.2.12` est déclarée dans `agentVersions.antigravity`. Les images et le bootstrap partagent une installation d’archives versionnées vérifiées par SHA-512 ; les mises à jour automatiques sont désactivées dans les invocations Outpost et `doctor` compare la version installée à la référence. Les binaires préinstallés restent réutilisés. Validation : 573 tests unitaires/fonctionnels, couverture au-dessus des seuils, paquet, 11 tests Docker réels, fixture PTY, bootstrap réel puis réutilisation hors réseau et 37 tests navigateur de documentation réussis. Podman est absent ; les exécutions natives ARM64, musl et macOS ne sont pas validées ici. Les campagnes authentifiées de modèles restent distinctes. Bilan : `temp/antigravity-pinned/SUMMARY.md`.

**Faiblesse corrigée** — Le script d'installation récupère la dernière version d'`agy`. Deux images construites à des dates différentes, ou une image et un bootstrap distant, peuvent embarquer des versions différentes.

**Résultat** — Une version épinglée avec vérification de l'empreinte, déclarée dans `agentVersions` comme Copilot et Kimi, et affichée par `outpost doctor`.

<a id="r-copilot"></a>

### Authentification Copilot

**Faiblesse actuelle** — Copilot n'accepte que le mode compte : pas de clé API, et les jetons GitHub classiques (`ghp_`) sont refusés. En CI, il faut donc gérer un jeton lié à un compte.

**Ce que ça complète** — Documenter précisément les jetons fine-grained acceptés pour la CI, ajouter le mode `usage` si la CLI le permet un jour, et donner un message d'erreur qui dit quel jeton fournir.

<a id="r-observability"></a>

### Observabilité complète

**Statut — implémenté, non publié** : hub contextualisé, récepteurs bornés, corrélation workflows/agents/opérations, diagnostics de processus, adaptateurs des cinq CLI et événements du harness. La documentation bilingue décrit les garanties et limites. Les événements TTY, le relais complet des workers distants et le registre d’état durable par ID restent hors périmètre.

**Besoin traité** — Relier les événements d'agent et de workflow et rendre visibles les étapes de sandbox, Git, stderr et arrêt forcé.

**Périmètre livré** — Le plan des issues #1 à #7 : un hub central, un contexte commun (workflow, tâche, tentative, dispatch) et des récepteurs branchables. Les adaptateurs couvrent Claude, Codex, Antigravity, Copilot et Kimi. Le registre d'état par ID reste un chantier distinct.

<a id="r-harness"></a>

### Sortir le harness intégré de l'expérimental

**Statut — contrats stabilisés, implémenté et non publié** : le moteur intégré, les contrats publics et les adaptateurs OpenAI et Anthropic sont stabilisés. `defineHarnessSubagent()` exécute un enfant avec budget propre, historique séparé et sandbox empruntée ; permissions, annulation, profondeur et budgets cumulés sont contrôlés. Les réponses finales et les résumés comptent désormais dans les plafonds de tokens.

**Validation** — 14 scénarios réels OpenAI réussis (Responses/Chat Completions), dont édition/tests/commit par un enfant dans Docker et continuation ; scénarios à modèle simulé réussis sur les vrais backends Docker, Vercel et Daytona. Les résultats console sont conservés dans la session ; les rapports bruts de cette nouvelle campagne ont été perdus avec le worktree temporaire. Sources restaurées dans un worktree persistant et revalidées. La campagne précédente reste dans `temp/harness-live/`. Sept scénarios Anthropic authentifiés ont ensuite réussi le 28 septembre 2026 avec `claude-haiku-4-5-20251001`, sans raisonnement activé : délégation/édition/tests/commit/continuation dans Docker, cache réel, annulation, limites de sortie et d’étapes, budget de tokens et flux réel interrompu artificiellement. Leurs rapports bruts sont conservés dans `temp/harness-anthropic-renewed-20260928/`.

**Limites restantes** — Les autres modèles et configurations de raisonnement nécessitent leurs propres validations réelles. Podman absent localement, scénario ajouté à sa matrice CI. Terminal interactif, reprise automatique d’un enfant en cours, comparaison qualitative avec les CLI et confirmation de facturation restent distincts. Aucun changement de version ni publication.

<a id="r-speculation"></a>

### Spéculation récupérable

**Statut — implémenté, non publié, périmètre borné** : checkpoints via Transport avec propriété exclusive et révisions conditionnelles, reprise explicite après crash, budgets cumulés, conservation des anciennes tentatives, nettoyage borné et vérification de fusion Git sans mutation. Docker/Podman montés exposent une récupération par identifiant enregistré avant allocation. Les autres providers intégrés refusent le mode durable ; la récupération cloud/providers isolés et les campagnes multi-hôtes restent ouvertes. La spéculation conserve son statut expérimental.

**Faiblesse initiale** — Si le processus qui coordonne la course plante, les candidats en cours sont perdus et leurs sandboxes peuvent rester actives. Les conflits ne sont pas vérifiés avant d'intégrer le gagnant.

**Objectif du chantier** — Enregistrer qui possède chaque candidat dans le stockage, pouvoir reprendre la course, borner le nettoyage, et vérifier les conflits avant l'intégration.

<a id="r-workers"></a>

### Workflows sur plusieurs workers

**Faiblesse actuelle** — L'auteur d'une approbation est une donnée fournie par ton application, sans vérification. Rien n'est prévu pour faire tourner les identifiants, et une tâche interrompue peut répéter ses effets.

**Ce que ça complète** — Une identité vérifiée des approbateurs (signature ou jeton), la rotation des identifiants, une clé d'idempotence transmise à chaque tâche, et un guide d'exploitation.

<a id="r-network"></a>

### Politiques réseau

**Faiblesse actuelle** — La fonctionnalité est expérimentale et le blocage total ne marche que sur Docker et Podman. Aucune liste d'autorisation n'existe, donc un agent CLI bloqué ne peut plus joindre son propre modèle.

**Ce que ça complète** — Des listes d'autorisation par domaine (API du modèle, registres de paquets), leur prise en charge sur les fournisseurs cloud qui le permettent, et un comportement mesuré.

<a id="r-retry"></a>

### Retry et délais plus robustes

**Faiblesse actuelle** — Un retry attend toujours le même délai, ce qui provoque des rafales d'appels sur une API qui répond « trop de requêtes ». Un workflow n'a pas de durée maximale globale.

**Ce que ça complète** — Un délai progressif avec une part d'aléa, le respect de l'en-tête `Retry-After`, et un `timeoutMs` au niveau du workflow.

---

<a id="features"></a>

## Nouvelles features

Fonctionnalités qui n'existent pas encore. Les exemples montrent une API proposée, pas une API existante.

<a id="f-dynamic"></a>

### Tâches dynamiques

**Fonctionnel** — Créer des tâches pendant l'exécution à partir d'un résultat : une revue par fichier modifié, ou une tâche par étape d'un plan écrit par un agent.

**Projection technique** — Une primitive `mapTask` ajoute des nœuds au graphe une fois sa dépendance terminée. Chaque nœud a une clé stable dérivée de l'élément (`review:src/a.ts`), ce qui garde les checkpoints et la reprise fiables. La concurrence et le budget restent partagés.

**Exemple (API proposée)**

```ts
const files = task({ key: "files", perform: () => changedFiles() });
const reviews = mapTask({
  key: "review",
  after: [files],
  items: (ctx) => ctx.value(files),
  itemKey: (file) => file,
  perform: (file, ctx) => reviewFile(file, ctx),
});
await workflow("review", [files, reviews]).start({ concurrency: 4 });
```

<a id="f-loop"></a>

### Boucle jusqu'à réussite

**Fonctionnel** — Faire coder l'agent, vérifier, lui renvoyer l'erreur et recommencer jusqu'à ce que ça passe ou qu'on atteigne une limite. C'est aussi le mécanisme d'une relecture par un second agent.

**Projection technique** — `loopTask({ attempt, check, maxRounds })` : chaque tour est enregistré dans le checkpoint et compté dans le budget. Le retour de `check` est ajouté au brief suivant, ou envoyé comme continuation de conversation quand l'agent le permet.

**Exemple (API proposée)**

```ts
const fix = loopTask({
  key: "fix-tests",
  maxRounds: 4,
  attempt: (ctx, feedback) =>
    session.dispatch({
      brief: { text: `Fix the failing tests.\n${feedback ?? ""}` },
    }),
  async check() {
    const run = await session.command({
      executable: "npm",
      arguments: ["test"],
    });
    return run.status === 0
      ? { done: true }
      : { done: false, feedback: run.stdout };
  },
});
```

<a id="f-quota"></a>

### Pause sur quota

**Fonctionnel** — Quand un abonnement atteint sa limite ou qu'une API répond « trop de requêtes », le workflow se met en pause puis reprend tout seul à la réinitialisation, au lieu d'échouer.

**Projection technique** — Les adapters classent l'erreur en `quota` avec une date de reprise quand elle est connue. La tâche passe en `paused` comme pour une approbation, et le checkpoint permet de reprendre plus tard, dans le même processus ou un autre.

**Exemple (API proposée)**

```ts
await pipeline.start({
  checkpoint: { store, runId: "nightly", version: "1" },
  onQuota: { action: "pause", maxWaitMs: 6 * 60 * 60_000 },
});
```

<a id="f-fallback"></a>

### Agent ou modèle de secours

**Fonctionnel** — Donner une liste ordonnée d'agents. Si le premier est en panne ou à court de quota, le suivant prend le relais.

**Projection technique** — `fallbackAgent([...], { on: ["quota", "unavailable"] })` essaie les agents dans l'ordre, sur des erreurs typées seulement. Le journal indique quel agent a travaillé. Le repli doit être déclaré explicitement, jamais implicite.

**Exemple (API proposée)**

```ts
const coder = fallbackAgent(
  [
    agent({ harness: claudeHarness({ authentication: "account" }) }),
    agent({ harness: codexHarness({ authentication: "usage" }) }),
  ],
  { on: ["quota", "unavailable"] },
);
```

<a id="f-testing"></a>

### Kit de test pour workflows

**Fonctionnel** — Tester ses propres workflows en CI sans compte, sans réseau et sans coût, avec un agent qui suit un script.

**Projection technique** — Un sous-chemin `@elie-laloum/outpost/testing` qui exporte `scriptedAgent()` (événements et commits prédéfinis) et un fournisseur de sandbox en mémoire, construits à partir des outils déjà utilisés par la suite de tests d'Outpost.

**Exemple (API proposée)**

```ts
import { scriptedAgent } from "@elie-laloum/outpost/testing";

const coder = scriptedAgent({
  turns: [
    {
      text: "Done",
      commit: { message: "fix: parser", files: { "src/p.ts": "..." } },
    },
  ],
});
const result = await dispatch({
  repository,
  agent: coder,
  brief: { text: "Fix" },
});
assert.equal(result.commits.length, 1);
```

<a id="f-replay"></a>

### Enregistrer et rejouer un run

**Fonctionnel** — Conserver un run réel pour le rejouer à l'identique sans appeler de modèle. Pratique pour reproduire un bug ou transformer une exécution réelle en test.

**Projection technique** — Le journal existant, enrichi des sorties de commandes, sert d'enregistrement. `replayAgent({ journal })` renvoie les mêmes événements et signale toute divergence (commande différente, fichier différent).

**Exemple (API proposée)**

```ts
const recorded = await readJournal({
  transporter,
  reference: result.logReference!,
});
const replayed = await dispatch({
  repository,
  agent: replayAgent({ journal: recorded }),
  brief,
});
```

<a id="f-cache"></a>

### Cache de tâches

**Fonctionnel** — Si une tâche est relancée avec exactement les mêmes entrées, réutiliser son résultat au lieu de repayer l'exécution.

**Projection technique** — Une option `cache` calcule une empreinte (commit, brief, agent, version) et stocke le résultat JSON dans un transport. Un changement de version invalide le cache. Réservé aux tâches sans effet de bord hors dépôt.

**Exemple (API proposée)**

```ts
const review = task({
  key: "review",
  cache: {
    store: taskCache({ transporter }),
    key: (ctx) => [headCommit, briefHash, "claude"],
  },
  perform: (ctx) => reviewer(ctx),
});
```

<a id="f-snapshot"></a>

### Snapshot et fork en cours de tâche

**Fonctionnel** — Figer une exécution à un instant donné (fichiers, dépôt, conversation), puis repartir de ce point ou essayer une autre direction.

**Projection technique** — Combiner un snapshot du fournisseur (Daytona, Firecracker, image de conteneur), l'état Git et le fork de conversation existant. `sandbox.snapshot()` renvoie un identifiant, et `openSandbox({ from })` recrée l'environnement.

**Exemple (API proposée)**

```ts
const point = await session.snapshot({ label: "after-analysis" });
const tryA = await openSandbox({ from: point.id });
const tryB = await openSandbox({ from: point.id });
```

<a id="f-steer"></a>

### Pilotage d'un agent en cours

**Fonctionnel** — Envoyer une consigne à un agent qui travaille déjà, ou le laisser poser une question et attendre ta réponse.

**Projection technique** — `run.steer(message)` passe par l'entrée streaming quand la CLI la prend en charge (Claude Code), ou par un outil `ask_user` dans le harness intégré. Une question émet un événement et met la tâche en pause, comme une approbation.

**Exemple (API proposée)**

```ts
const run = session.start({ brief: { text: "Refactor the auth module" } });
await run.steer("Leave the legacy/ folder untouched.");
const result = await run.result;
```

<a id="f-guards"></a>

### Garde-fous sur le diff

**Fonctionnel** — Refuser automatiquement l'intégration si l'agent a touché des fichiers interdits ou produit un diff trop gros, quel que soit l'agent.

**Projection technique** — Une option `guard` vérifie les commits avant `integrate()` : motifs de chemins protégés et nombre maximal de lignes modifiées. Un refus lève une erreur typée et conserve la branche pour relecture.

**Exemple (API proposée)**

```ts
await dispatch({
  repository,
  agent: coder,
  brief,
  branch: { mode: "integrate" },
  guard: {
    protectedPaths: [".github/**", "migrations/**"],
    maxChangedLines: 800,
  },
});
```

<a id="f-conflicts"></a>

### Conflits résolus par un agent

**Fonctionnel** — Quand deux branches parallèles se chevauchent, confier la résolution à un agent puis vérifier par les tests avant la fusion.

**Projection technique** — L'intégration propose un point d'extension `onConflict`. Une stratégie fournie lance un agent sur la branche en conflit, puis une commande de vérification. En cas d'échec, les branches restent intactes.

**Exemple (API proposée)**

```ts
await session.integrate({
  onConflict: resolveWithAgent(coder, {
    verify: { executable: "npm", arguments: ["test"] },
  }),
});
```

<a id="f-best"></a>

### Spéculation « meilleur des N »

**Fonctionnel** — Laisser finir tous les candidats et choisir le meilleur selon un score, au lieu de garder le premier valide.

**Projection technique** — Une option `select: "best"` avec une fonction `score` (tests, taille du diff, coût, avis d'un agent juge). Les perdants sont nettoyés selon les règles de propriété actuelles.

**Exemple (API proposée)**

```ts
await speculate({
  repository,
  sandboxProvider,
  budget,
  candidates,
  validate,
  select: "best",
  score: async ({ result }) => -result.usage.output - diffSize(result),
});
```

<a id="f-pr"></a>

### PR et MR automatiques

**Fonctionnel** — À la fin d'un run, ouvrir une pull request GitHub ou une merge request GitLab avec un résumé, et inscrire dans les commits le run, l'agent et le modèle utilisés.

**Projection technique** — Un port `DeliveryProvider` avec des adapters GitHub et GitLab optionnels (SDK chargés à la demande). Des trailers de commit `Outpost-Run:` et `Outpost-Agent:`. Le push reste explicite, conformément aux règles actuelles.

**Exemple (API proposée)**

```ts
await dispatch({
  repository,
  agent: coder,
  brief,
  branch: { mode: "named", name: "outpost/fix-parser" },
  deliver: gitlabMergeRequest({
    token: process.env.GITLAB_TOKEN!,
    draft: true,
  }),
});
```

<a id="f-triggers"></a>

### Déclencheurs

**Fonctionnel** — Lancer un workflow à heure fixe ou sur un événement (label posé sur une issue, commentaire, webhook), et approuver depuis Slack, GitHub ou GitLab.

**Projection technique** — Un petit serveur ou une action CI qui reçoit l'événement, vérifie sa signature et démarre le workflow avec un checkpoint. Les approbations deviennent des décisions signées et vérifiées.

**Exemple (API proposée)**

```ts
onIssueLabel("outpost:fix", async (issue) => {
  await fixWorkflow.start({
    checkpoint: { store, runId: `issue-${issue.number}`, version: "1" },
  });
});
```

<a id="f-mcp"></a>

### Serveurs MCP

**Fonctionnel** — Donner aux agents l'accès à des outils externes (tickets, docs, bases de données) de façon standard.

**Projection technique** — Déclarer les serveurs une fois : Outpost écrit la configuration propre à chaque CLI dans le home de la sandbox, et les expose comme outils dans le harness intégré. Les secrets passent par les variables déclarées.

**Exemple (API proposée)**

```ts
const coder = agent({
  harness: claudeHarness({
    authentication: "account",
    mcpServers: { linear: { command: "npx", arguments: ["-y", "linear-mcp"] } },
  }),
});
```

<a id="f-cli"></a>

### CLI plus complète

**Fonctionnel** — Lancer un run sans écrire de script, voir ce qui tourne et suivre un run en direct depuis le terminal.

**Projection technique** — Trois commandes qui s'appuient sur la configuration générée par `init` et sur le registre d'état : `run`, `status` et `logs`, toutes avec une sortie `--json`.

**Exemple (API proposée)**

```sh
npx outpost run "Fix the failing tests" --agent codex
npx outpost status --json
npx outpost logs <run-id> --follow
```

<a id="f-cost"></a>

### Coût en euros et secrets masqués

**Fonctionnel** — Voir et limiter la dépense en € / $ plutôt qu'en tokens, et ne jamais retrouver une clé dans un journal ou une conversation sauvegardée.

**Projection technique** — Une table de prix par modèle, fournie par l'utilisateur, convertit l'usage en coût, et le budget accepte une dimension `cost`. Un filtre de masquage s'applique aux événements avant tout récepteur.

**Exemple (API proposée)**

```ts
await pipeline.start({
  budget: { cost: { currency: "EUR", limit: 20 }, prices: myPriceTable },
  redact: [/sk-[A-Za-z0-9]{20,}/g],
});
```

<a id="f-providers"></a>

### Plus de fournisseurs

**Fonctionnel** — Faire tourner les sandboxes sur Kubernetes, E2B ou Modal, utiliser Gemini ou Bedrock dans le harness intégré, et stocker sur GCS ou Azure Blob.

**Projection technique** — Chaque ajout se fait derrière les ports existants (`SandboxProvider`, `ModelProvider`, transport), dans son propre sous-chemin avec un SDK optionnel, sans alourdir le cœur.

**Exemple (API proposée)**

```ts
import { kubernetesSandboxProvider } from "@elie-laloum/outpost/providers/kubernetes";

const sandboxProvider = kubernetesSandboxProvider({
  namespace: "agents",
  image: "outpost:dev",
});
```

---

<a id="idees"></a>

## Nouvelles idées

Second tour d'exploration. Mêmes conventions que les features.

<a id="i-state"></a>

### État d'un run ou d'un workflow par ID

**Fonctionnel** — Donner un identifiant et lire exactement où en est l'exécution : statut, tâches, agent, commits, consommation, erreurs. C'est la base pour construire des interfaces.

**Projection technique** — Un récepteur de l'`ObservationHub` tient à jour une fiche par exécution dans le transport (local ou S3), lisible sans verrou. Un signal de vie régulier permet de marquer « abandonné » un run dont le processus a planté. Dépend des issues #2 et #3.

**Exemple (API proposée)**

```ts
const run = await readRun({ transporter, id: "wf_2026_09_27_nightly" });
console.log(
  run.status,
  run.tasks.map((t) => `${t.key}: ${t.status}`),
);

for await (const event of watchRun({ transporter, id: run.id, from: run.seq }))
  render(event);
```

<a id="i-report"></a>

### Rapport de run lisible

**Fonctionnel** — Obtenir un résumé clair d'un run : fichiers modifiés, taille du diff, commandes échouées, durée, consommation. Il peut servir de description de PR ou de message Slack.

**Projection technique** — `result.report()` assemble le résultat de dispatch, les statistiques Git et les événements du journal, puis les rend en Markdown ou en JSON.

**Exemple (API proposée)**

```ts
const result = await dispatch({ repository, agent: coder, brief });
await writeFile("run-report.md", result.report({ format: "markdown" }));
```

<a id="i-profile"></a>

### Configuration portable des agents

**Fonctionnel** — Décrire une seule fois les instructions, les outils autorisés et les serveurs MCP, et les appliquer à n'importe quel agent.

**Projection technique** — Un `agentProfile()` indépendant de la CLI. Chaque adapter le traduit dans son format (`settings.json` pour Claude, `config.toml` pour Codex…) et refuse explicitement ce qu'il ne prend pas en charge.

**Exemple (API proposée)**

```ts
const profile = agentProfile({
  instructions: "Never modify generated files.",
  allowedTools: ["read", "edit", "shell:npm test"],
});
const coder = agent({
  harness: codexHarness({ authentication: "account", profile }),
});
```

<a id="i-templates"></a>

### Environnements cloud préconstruits

**Fonctionnel** — Démarrer une sandbox Vercel ou Daytona en quelques secondes, avec les outils et dépendances déjà installés.

**Projection technique** — `outpost image build --provider daytona` produit un snapshot ou un template chez le fournisseur à partir de la même recette que l'image Docker. Le provider le réutilise ensuite à chaque allocation.

**Exemple (API proposée)**

```sh
npx outpost image build --provider daytona --name outpost-node24
```

```ts
const sandboxProvider = daytonaSandboxProvider({
  connection,
  create: { snapshot: "outpost-node24" },
});
```

<a id="i-cloud-cache"></a>

### Caches de dépendances dans le cloud

**Fonctionnel** — Réutiliser les téléchargements npm, pip ou autres entre sandboxes cloud, comme c'est déjà le cas avec Docker et Podman.

**Projection technique** — L'option `caches` accepte un transport : le cache est archivé en fin de run et restauré au démarrage, avec la même clé de compatibilité qu'aujourd'hui.

**Exemple (API proposée)**

```ts
vercelSandboxProvider({
  create: { runtime: "node24" },
  caches: [{ name: "npm", key: "app-node24", transport: s3 }],
});
```

<a id="i-incremental"></a>

### Préparation incrémentale

**Fonctionnel** — Sur une sandbox réutilisée, relancer l'installation seulement quand le lockfile a changé.

**Projection technique** — Un hook de cycle de vie peut porter une condition `when: changed([...])`. Outpost garde l'empreinte des fichiers surveillés et relance le hook si elle diffère.

**Exemple (API proposée)**

```ts
hooks: {
  sandboxReady: [
    { executable: "npm", arguments: ["ci"], when: changed(["package-lock.json"]) },
  ],
}
```

<a id="i-image-update"></a>

### Mise à jour des images

**Fonctionnel** — Savoir quand les CLI d'agents d'une image sont dépassées, et la reconstruire en une commande.

**Projection technique** — `outpost image outdated` compare les versions installées dans l'image à celles publiées sur npm, et `--update` reconstruit avec les nouvelles versions après confirmation.

**Exemple (API proposée)**

```sh
npx outpost image outdated --image outpost:dev
# claude-code 2.4.1 -> 2.5.0, codex 0.61.0 -> 0.63.2
npx outpost image build --image outpost:dev --update
```

<a id="i-secrets"></a>

### Sources de secrets

**Fonctionnel** — Lire les clés depuis Vault, 1Password ou un gestionnaire de secrets cloud au lieu d'un fichier `.env`.

**Projection technique** — Un port `SecretSource` résout seulement les noms déclarés, au moment du démarrage, sans les écrire sur disque. Les adapters sont optionnels, un par service.

**Exemple (API proposée)**

```ts
const variables = await fromSecrets(vaultSource({ path: "kv/outpost" }), [
  "OPENAI_API_KEY",
]);
const coder = agent({
  harness: codexHarness({ authentication: "usage", variables }),
});
```

<a id="i-multirepo"></a>

### Livraison multi-dépôts coordonnée

**Fonctionnel** — Quand un changement touche plusieurs dépôts, ouvrir des PR liées entre elles et, en option, n'intégrer que si tous les dépôts passent.

**Projection technique** — Une étape de livraison regroupe plusieurs résultats : elle vérifie chaque dépôt, puis intègre tout ou rien, et ajoute dans chaque PR les liens vers les autres.

**Exemple (API proposée)**

```ts
await deliverTogether([apiResult, webResult], {
  mode: "all-or-nothing",
  linkPullRequests: true,
});
```

<a id="i-stuck"></a>

### Détection d'agent qui tourne en rond

**Fonctionnel** — Repérer un agent qui répète les mêmes commandes ou modifications, puis l'arrêter ou le relancer avec une autre consigne.

**Projection technique** — Le watchdog d'activité compare les derniers appels d'outils sur une fenêtre glissante et émet un événement `stuck`. Une politique décide ensuite : arrêter, prévenir ou envoyer une consigne.

**Exemple (API proposée)**

```ts
await dispatch({
  repository,
  agent: coder,
  brief,
  watchdog: { repetition: { window: 20, maxRepeats: 3 }, onStuck: "stop" },
});
```

<a id="i-routing"></a>

### Choix du modèle selon la tâche

**Fonctionnel** — Utiliser automatiquement un modèle léger pour les tâches simples et un modèle puissant pour les tâches difficiles.

**Projection technique** — Un `routedAgent()` choisit l'agent selon des règles (taille du brief, type de tâche, label). La règle retenue est notée dans le journal pour pouvoir l'expliquer.

**Exemple (API proposée)**

```ts
const coder = routedAgent({
  routes: [
    { when: ({ brief }) => brief.text.length < 400, agent: fastAgent },
    { agent: strongAgent },
  ],
});
```

<a id="i-bench"></a>

### Benchmark agents × modèles

**Fonctionnel** — Rejouer un même jeu de tâches sur chaque agent et modèle, et comparer taux de réussite, coût et durée. Pratique pour choisir, et pour repérer une régression après une mise à jour de CLI.

**Projection technique** — Une commande qui lance chaque tâche plusieurs fois via la spéculation, applique une validation par tâche et produit un tableau JSON ou HTML.

**Exemple (API proposée)**

```sh
npx outpost bench --suite bench/ --agents claude,codex,kimi --repeat 3 --json > bench.json
```

<a id="i-recipes"></a>

### Bibliothèque de recettes

**Fonctionnel** — Partir d'un workflow prêt à l'emploi pour les cas fréquents : corriger une CI en échec, monter les versions de dépendances, relire une PR, migrer une API.

**Projection technique** — Des recettes versionnées livrées avec le paquet et proposées par `outpost init`. Chacune apporte son brief, ses vérifications et son workflow, que l'on peut ensuite modifier.

**Exemple (API proposée)**

```sh
npx outpost init --recipe fix-ci --repository ../app
node run.ts
```

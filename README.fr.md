# Outpost

[English](README.md) · [API](docs/api.md) · [Fournisseurs](docs/providers.md) · [Workflows](docs/workflows.md) · [Exploitation](docs/operations.md) · [Roadmap](ROADMAP.md)

Outpost est une bibliothèque TypeScript pour exécuter des agents de développement dans des sandbox réutilisables, gérer leurs espaces de travail Git et composer des workflows typés. La v1 fournit les adaptateurs **Codex** et **Claude Code**, ainsi que les environnements Docker, Podman, Vercel, Daytona et une exécution locale explicite. Les adaptateurs d’agents et les fournisseurs de sandbox sont deux points d’extension distincts.

[GitLab](https://gitlab.elielaloum.com/elielaloum/outpost) est le dépôt principal. [GitHub](https://github.com/elie-laloum/outpost) reçoit le miroir et exécute la CI ainsi que les publications de packages.

## Prérequis

- Node.js **24 ou supérieur**, Git et un dépôt possédant au moins un commit.
- Docker ou Podman pour l’isolation locale ; un compte et le SDK optionnel correspondant pour une sandbox cloud.
- Une authentification native de l’agent ou sa clé API. Un jeton GitHub/GitLab ne remplace pas une clé de modèle.
- Des imports ESM. Les déclarations TypeScript sont livrées ; Node exécute directement les scripts générés en `.ts`/`.mts`.

## Installation et premier lancement

Depuis les sources :

```sh
npm ci
npm run build
npm pack
```

Installez l’archive obtenue dans votre dépôt cible, ou utilisez [GitHub Packages](https://github.com/elie-laloum/outpost/packages). La configuration du registre figure dans le [guide d’exploitation](docs/operations.md).

```sh
npm install --save-dev /chemin/elie-laloum-outpost-1.1.2.tgz
npx outpost init --yes --agent codex --provider docker --template blank --build
```

Copiez `.outpost/.env.example` vers `.outpost/.env`. Renseignez `OPENAI_API_KEY`, ou laissez cette déclaration vide pour reprendre sa valeur dans le processus. Pour Claude, choisissez `--agent claude` et déclarez `ANTHROPIC_API_KEY` ou `CLAUDE_CODE_OAUTH_TOKEN`. Seules les clés déclarées sont importées dans les sandbox isolés.

```sh
node .outpost/run.mts "Ajouter la validation de configuration et ses tests"
```

Le script s’appelle `run.ts` si le projet déclare `"type": "module"`, sinon `run.mts`. L’initialisation refuse d’écraser des fichiers existants. `--install` installe la bibliothèque et le SDK optionnel avec le gestionnaire détecté : npm, pnpm, yarn ou bun. Sans `--build`, construisez ensuite l’image avec `npx outpost image build`.

## Exécution ponctuelle

```ts
import { dispatch, codex } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await dispatch({
  agent: codex(),
  provider: docker(),
  branch: { mode: "integrate" },
  brief: { text: "Corriger les tests en échec, vérifier et créer un commit." },
});

console.log(result.branch, result.commits, result.conversation);
```

`dispatch` crée l’environnement, lance l’agent, récupère les modifications et la conversation native, intègre les commits si demandé, puis ferme les ressources dont il est propriétaire. Le travail non commité est conservé. En cas d’échec, les worktrees séparés restent disponibles pour inspection.

| Politique Git                                                 | Comportement                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `{ mode: "current" }`                                         | Utilise le checkout actuel ; défaut des fournisseurs montés et locaux.                |
| `{ mode: "named", name: "feature/validation", from: "main" }` | Crée ou réutilise un worktree géré pour cette branche.                                |
| `{ mode: "integrate", from: "main" }`                         | Crée une branche temporaire puis fusionne ses commits dans la branche hôte d’origine. |

Les fournisseurs distants exigent `named` ou `integrate`. `from` est optionnel. Une branche déjà utilisée ailleurs produit une erreur explicite. L’intégration refuse un changement de branche hôte et conserve le worktree en cas de conflit.

## Sandbox réutilisable

```ts
import { createSandbox, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: claude({ model: "sonnet", reasoning: "high" }),
  branch: { mode: "named", name: "feature/settings" },
});

const first = await sandbox.dispatch({
  brief: { text: "Implémenter la validation." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
if (tests.status !== 0)
  await first.resume({ brief: { text: "Corriger les tests." } });
await sandbox.attach();
```

Une commande retourne son statut, même non nul. Une exécution d’agent en échec lève une erreur. L’annulation par `AbortSignal`, le délai maximal et la surveillance d’inactivité arrêtent l’opération courante sans détruire la sandbox réutilisable. Une sandbox accepte une opération active à la fois. Le parallélisme utilise plusieurs sandbox.

L’agent par défaut est optionnel pour une sandbox chaude. Fournissez `agent` à chaque appel de `sandbox.dispatch` ou `sandbox.attach` pour changer d’agent ou de modèle sans recréer l’environnement. Chaque exécution reçoit uniquement les variables de l’adaptateur choisi.

`await using` ferme automatiquement le handle. `close()` est également disponible et idempotent. `attach()` ouvre le terminal natif avec Docker, Podman ou le fournisseur local. Les fournisseurs cloud rejettent explicitement cette opération.

## Espace de travail indépendant

```ts
import { openWorkspace, codex, claude } from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  branch: { mode: "named", name: "feature/shared-work" },
  copies: [".env.test"],
});

await workspace.dispatch({
  agent: codex(),
  brief: { text: "Implémenter et commiter." },
});
await workspace.dispatch({
  agent: claude(),
  brief: { text: "Relire, tester et commiter les corrections." },
});
```

L’espace de travail fourni survit aux sandbox successives. Son propriétaire doit le fermer après elles. Un worktree contenant des modifications reste sur disque ; `close()` retourne alors `retainedDirectory`. Un worktree propre est supprimé, mais une branche nommée reste disponible. `close({ preserve: true })` conserve aussi un worktree propre.

`workspace.sandbox()` et `workspace.attach()` donnent accès aux autres cycles de vie. Avec une sandbox chaude en mode `integrate`, utilisez explicitement `sandbox.workspace.integrate()` au moment voulu. Les exécutions ponctuelles intègrent avant de retourner leur résultat.

## Prompts et boucles

Un `brief` contient exactement une source : `text` littéral, ou `file` avec des `values` primitives optionnelles. Les fichiers sont relus à chaque passage ; le texte littéral n’est jamais interprété.

```ts
const result = await dispatch({
  agent: codex(),
  brief: {
    file: ".outpost/brief.md",
    values: { OBJECTIVE: "Corriger la validation" },
  },
  passes: 5,
  until: ["<outpost>done</outpost>"],
  idleMs: 600_000,
  settleMs: 60_000,
});
```

Les fichiers acceptent `{{OBJECTIVE}}`, les variables réservées `{{WORK_BRANCH}}` et `{{BASE_BRANCH}}`, ainsi que des commandes comme `` !`git status --short` ``. Les commandes présentes dans le fichier d’origine s’exécutent en parallèle dans la sandbox après les hooks. Une valeur substituée ne peut pas introduire une nouvelle commande d’expansion. Une valeur insérée dans une commande existante conserve toutefois sa sémantique shell : utilisez des valeurs fiables ou correctement échappées.

Les variables absentes déclenchent une erreur ; les variables inutilisées passent par `warn`. Un marqueur de fin interrompt la boucle. Si l’agent reste actif après ce marqueur, le délai de grâce se renouvelle à chaque sortie, puis arrête sa commande. Un budget épuisé sans marqueur retourne `completed: false`.

Chaque tour fournit sa durée, son statut, son texte, sa conversation éventuelle et les tokens bruts. Chaque tour expose aussi son chemin `transcript` lorsqu’il est capturé. Le résultat regroupe `input`, `cached` (lecture du cache), `cacheCreated` (création du cache), `output`, les commits et le marqueur observé. Aucun coût monétaire n’est extrapolé.

## Réponses structurées

```ts
import { response } from "@elie-laloum/outpost";

const result = await dispatch({
  agent: codex(),
  brief: {
    text: "Analyser le dépôt et répondre avec <report>un JSON contenant ok</report>.",
  },
  response: response.json({
    tag: "report",
    repairs: 2,
    schema(input) {
      if (
        !input ||
        typeof input !== "object" ||
        !("ok" in input) ||
        typeof input.ok !== "boolean"
      ) {
        throw new Error("Un booléen ok est requis");
      }
      return { ok: input.ok };
    },
  }),
});

console.log(result.value.ok);
```

`response.text` extrait du texte balisé. `response.json` accepte une fonction ou un validateur Standard Schema, y compris asynchrone. La balise d’ouverture doit être demandée dans le prompt. Les réponses structurées exigent un seul passage ; les tentatives de correction reprennent la même conversation. En cas d’échec, `ResponseError.recovery` contient les informations de reprise disponibles.

## Conversations natives

```ts
await result.resume({ brief: { text: "Expliquer le résultat." } });
await result.fork({ brief: { text: "Explorer une autre solution." } });
```

La capture est active par défaut. Outpost enregistre les transcriptions dans le stockage natif de l’agent sur l’hôte et réécrit les champs de répertoire de travail. Le contenu des messages n’est pas remplacé globalement. Les transcriptions des sous-agents Claude sont récupérées au mieux, avec avertissement en cas d’échec. Un échec de capture de la transcription principale fait échouer l’exécution.

`saveConversations: false` désactive la capture sur l’adaptateur. Une reprise ponctuelle vérifie d’abord l’existence de la transcription hôte. `fork` crée une nouvelle conversation ; il faut aussi choisir un autre workspace pour isoler les fichiers. `conversationHome` permet de choisir un autre répertoire de stockage hôte.

## Workflows typés

```ts
import { task, workflow } from "@elie-laloum/outpost";

const inspect = task({
  key: "inspect",
  perform: async () => ({ ready: true }),
});
const implement = task({
  key: "implement",
  after: [inspect],
  retry: { attempts: 2, delayMs: 500 },
  perform: async (context) => context.value(inspect).ready,
});

const result = await workflow("delivery", [inspect, implement]).start({
  concurrency: 2,
});
result.unwrap();
console.log(result.value(implement));
```

Les dépendances absentes, doublons et cycles sont rejetés avant exécution. Les valeurs sont typées et propres à chaque lancement. Conditions, tentatives supplémentaires, limites de concurrence, événements d’observation et diagrammes Mermaid sont disponibles. `agentTask`, `commandTask` et `isolatedTask` relient le graphe aux opérations de sandbox.

L’annulation et le délai maximal des tâches sont coopératifs : le code d’une tâche doit respecter `context.signal`. Le planificateur attend le nettoyage des tâches actives avant de retourner. Les opérations Outpost respectent ce signal. Une fonction JavaScript arbitraire qui l’ignore ne peut pas être arrêtée de force.

Les cinq modèles CLI sont `blank`, `iterate`, `review`, `plan` et `plan-review`. Les deux derniers font travailler plusieurs analyses indépendantes avant l’implémentation. Les connecteurs GitHub Issues, Beads et personnalisés sont générés avec `--tracker`. Consultez le [guide des workflows](docs/workflows.md).

Un `dispatch({ passes })` ponctuel acquiert une nouvelle sandbox à chaque passe ; `sandbox.dispatch({ passes })` conserve son environnement. Les fichiers de prompt relatifs sont résolus depuis le répertoire de l’appelant. Les méthodes `resume`/`fork` d’un résultat ponctuel acceptent une nouvelle branche, un autre fournisseur et des hooks ; celles d’un résultat chaud restent liées à leur sandbox.

## Campagnes par issue

`campaign` relit le backlog à chaque cycle, valide un plan typé et attribue une branche par issue. Le parallélisme est borné ; la revue partage la sandbox d’implémentation. Une phase de fusion et de vérification intervient même pour une seule branche. La fermeture d’une issue a lieu uniquement après intégration des commits dans la branche hôte. GitHub et Beads fournissent les opérations de liste, détail et fermeture. Un connecteur personnalisé implémente `Backlog`.

Les starters exposent `cycles`, `concurrency`, `implementationPasses`, `reviewPasses`, les agents de chaque rôle et les règles de `.outpost/STANDARDS.md`. Une issue sans commit n’est ni revue ni fermée. Un cycle sans progression s’arrête. `recoveryDetails(error)` fournit les chemins disponibles en cas d’erreur, sans remplacer la raison d’annulation. [Guide de migration 1.1 en français](docs/migration-1.1.fr.md).

## Configuration et fournisseurs

Les fournisseurs prennent en charge les variables d’environnement, montages de fichiers/répertoires, réseaux, ressources, groupes supplémentaires, périphériques et labels SELinux selon le backend. Les SDK cloud sont des dépendances optionnelles, chargées uniquement à l’utilisation du fournisseur concerné. [Référence des fournisseurs](docs/providers.md).

Les hooks s’exécutent après la copie des entrées puis après la création de la sandbox. Les groupes `hostReady` et `sandboxReady` tournent en parallèle ; les commandes hôte restent séquentielles, tandis que les commandes du groupe sandbox démarrent ensemble et annulent leurs voisines en cas d’échec.

Seul `.outpost/.env` est lu. Une valeur non vide du fichier est prioritaire ; une déclaration vide reprend la valeur du processus. Le `.env` à la racine du dépôt n’est pas importé. Les variables explicites du fournisseur et de l’adaptateur restent prioritaires. Une clé déclarée simultanément par le fournisseur et l’adaptateur provoque une erreur. Les journaux sont écrits dans `.outpost/logs` par défaut ; `false`, `"stdout"`, un chemin personnalisé et le mode verbeux sont disponibles.

`AgentAdapter` permet d’ajouter un agent. `SandboxProvider`, `mountedProvider` et `remoteProvider` permettent d’ajouter un backend. Le domaine ne dépend pas d’un SDK cloud. [Architecture](docs/architecture.md) et [API complète](docs/api.md).

## Vérification et publication

```sh
npm ci
npm run check
npm run coverage
npm run test:package
```

La CI GitHub exécute les tests unitaires et fonctionnels sous Linux, Windows et macOS, impose 80 % de couverture des lignes, fonctions et branches, installe le package réellement produit et teste Docker/Podman. Les tests de contrats cloud utilisent des doubles contrôlés ; les essais avec de vrais modèles et comptes cloud nécessitent leurs identifiants.

Les tags de version sont créés dans GitLab puis répliqués. Le workflow de release valide le tag et la CI, publie GitHub Packages et joint l’archive installable à une release GitHub. La publication npm est optionnelle, via trusted publishing une fois configuré. [Procédure d’exploitation](docs/operations.md).

## Limites d’isolation et récupération

Docker et Podman montent le worktree sélectionné et les métadonnées Git. L’agent peut modifier ce dépôt et son état Git. Les autres chemins hôte ne sont pas exposés par défaut, mais ce montage ne constitue pas une protection contre un agent hostile visant le dépôt partagé. `local()` s’exécute directement sur votre machine, sans isolation.

Les fournisseurs cloud synchronisent l’historique, les changements suivis et les fichiers nouveaux. Les identifiants et auteurs des commits sont conservés. Une modification hôte concurrente déclenche une erreur de récupération plutôt qu’un écrasement. Les bundles, patches et fichiers de secours sont conservés sous `.outpost/recovery`.

Les logs, transcriptions et fichiers de récupération peuvent contenir des données privées. Les dossiers d’exécution et `.env` sont exclus du versionnement. [Détails de sécurité](SECURITY.md).

Licence MIT : [LICENSE](LICENSE).

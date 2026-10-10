---
title: "Tester les workflows hors ligne"
description: "Tester les branches, retries et commits d’un workflow en CI avec un agent scripté et des commandes de sandbox simulées."
---

## Remplacer l’agent dans votre test

Importez le kit depuis `@elie-laloum/outpost/testing` et passez explicitement son fournisseur de sandbox. Il nécessite Node.js 24+ et Git, sans compte, conteneur, appel modèle ni connexion réseau. Utilisez un dépôt Git jetable avec un commit initial : les commits scriptés modifient les fichiers et l’historique Git réels.

Enregistrez la fixture d’agent dans `coder.ts`. Sa première requête émet la réponse et crée le commit déclaré ; une seconde requête échoue car le script est épuisé. Créez un nouvel agent pour chaque test indépendant.

```ts title="coder.ts"
import { scriptedAgent } from "@elie-laloum/outpost/testing";

export const coder = scriptedAgent({
  turns: [
    {
      text: "Done",
      commit: {
        message: "fix: parser",
        files: { "src/p.ts": "export const parse = () => true;\n" },
      },
    },
  ],
});
```

Utilisez le chemin de votre dépôt temporaire dans `workflow.test.ts`, puis lancez `node --test workflow.test.ts`. L’assertion vérifie un commit réel collecté par le cycle normal du dispatch. Dispatch libère sa sandbox simulée ; le test possède et supprime ensuite le dépôt temporaire.

```ts title="workflow.test.ts"
import assert from "node:assert/strict";
import test from "node:test";
import { dispatch } from "@elie-laloum/outpost";
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";
import { coder } from "./coder.ts";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test("coder commits the fix", async (t) => {
  const repository = await mkdtemp(join(tmpdir(), "outpost-test-"));
  t.after(() => rm(repository, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", repository, ...args]);
  git("init");
  git("config", "user.name", "Outpost test");
  git("config", "user.email", "test@example.invalid");
  git("commit", "--allow-empty", "-m", "Initial commit");
  const result = await dispatch({
    repository,
    agent: coder,
    sandboxProvider: createMemorySandboxProvider(),
    brief: { text: "Fix the parser." },
    logging: false,
  });
  assert.equal(result.commits.length, 1);
});
```

## Exercer les retries et la comptabilité

Donnez un statut non nul à un tour en échec, suivi d’un tour réussi. La politique de retry de votre workflow consomme le tour suivant à sa prochaine tentative. L’usage fourni participe aux budgets normaux du workflow ; sans usage déclaré, les compteurs sont nuls et complets. Les événements simulent des outils, échecs de quota et autres sorties d’agent décodées. Un tour en échec peut néanmoins créer le commit déclaré, pour tester une progression partielle.

Cet agent échoue une fois puis renvoie la réponse demandée. Les dispatchs dans une sandbox réutilisée et les nouvelles sandboxes consomment la même séquence de l’agent ; les réparations de réponse consomment aussi des tours. Réparations et reprises de conversation fonctionnent dans la même sandbox ouverte. Capture de conversation, reprise à froid et fork sont indisponibles.

```ts
import { scriptedAgent } from "@elie-laloum/outpost/testing";

const agent = scriptedAgent({
  turns: [
    { status: 7, stderr: "Simulated failure\n" },
    { text: "Done", usage: { input: 10, cached: 0, output: 5 } },
  ],
});
```

## Simuler les commandes de vérification

Fournissez les résultats des commandes que votre workflow exécute dans sa sandbox. Chaque appel doit correspondre exactement à l’exécutable et aux arguments de la prochaine fixture ; une différence échoue sans consommer cette entrée. La file est partagée entre les allocations du même fournisseur. Les tours d’agent scriptés ne consomment pas de fixtures de commande. Créez un nouveau fournisseur pour réinitialiser la file.

Cette fixture permet à un `defineCommandTask()` exécutant `npm test` de réussir sans lancer npm. Un statut de fixture non nul suit le comportement normal d’échec et de retry de la tâche. Elle teste l’orchestration du workflow ; elle ne valide pas les tests du projet eux-mêmes.

```ts
import { createMemorySandboxProvider } from "@elie-laloum/outpost/testing";

const sandboxProvider = createMemorySandboxProvider({
  commands: [
    {
      executable: "npm",
      arguments: ["test"],
      stdout: "Tests passed\n",
    },
  ],
});
```

Le fournisseur ne lance jamais de commandes arbitraires. Les hooks hôte et les commandes des prompts s’exécutent toujours sur l’hôte selon le cycle normal d’Outpost : omettez-les des fixtures hors ligne ou injectez des implémentations de test. Transferts, terminal, entrée en direct et élévation sont refusés. Le fournisseur simule l’exécution sans imposer d’isolation du système de fichiers ou du réseau. Intégration Git, garde-fous, annulation et politiques de workflow conservent leurs chemins applicatifs normaux.

Lancez l’exemple complet du dépôt avec `node examples/62-workflow-testing/index.ts` depuis un checkout Outpost compilé. Il crée et supprime son propre dépôt temporaire, vérifie un retry et un commit réel, et simule la vérification sans appel payant.

API : [scriptedAgent](../../reference/scriptedagent/) · [ScriptedTurn](../../reference/scriptedturn/) · [ScriptedCommit](../../reference/scriptedcommit/) · [createMemorySandboxProvider](../../reference/creatememorysandboxprovider/) · [MemoryCommand](../../reference/memorycommand/).

## Workspaces de fichiers

Les fixtures de fichiers utilisent des workspaces éphémères et des agents scriptés sans créer de dépôt Git. Memory refuse toujours les transferts non pris en charge. Publication et récupération utilisent de vrais dossiers temporaires ; les garanties de montage nécessitent des tests Docker/Podman réels. Voir [les workspaces de fichiers](../workspaces/).

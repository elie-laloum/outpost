---
title: "Exécuter en CI"
description: "Lancer un script Outpost dans un job de CI avec une clé API, faire échouer le job quand l’agent ou vos contrôles échouent, et pousser le résultat vous-même."
---

## Ce qu’il faut sur le runner

<!-- features -->

- **Node.js 24+** : Exécute Outpost et vos scripts.
- **L’historique Git** : Un clone complet, pour que l’agent lise l’historique et que les sandboxes cloud le téléversent.
- **Une sandbox** : Docker ou Podman sur le runner, ou le SDK d’une [sandbox cloud](../cloud-sandboxes/) et ses identifiants d’allocation.
- **L’image de l’agent** : Construite dans le job depuis votre `Dockerfile` commité, pour les sandboxes en conteneur.
- **Un identifiant sans surveillance** : Une clé API ou un jeton de compte dédié, rangé dans un secret de CI.
- **Votre projet de workflow** : `package.json`, le lockfile, `outpost.config.mts` et vos scripts, commités.

## S’authentifier sans personne

Un runner n’a aucune connexion de CLI à copier. Dans `outpost.config.mts`, passez `coder` sur une clé API lue dans l’environnement du job.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

Claude Code et Copilot CLI acceptent aussi un jeton d’abonnement via `{ account: { variable } }`, comme `CLAUDE_CODE_OAUTH_TOKEN`. Formes, facturation et destination de chaque identifiant : [Authentification](../authentication/).

## Ajouter le workflow

Ce job GitHub Actions lance `review.mts`, tiré de [Votre première tâche](../first-request/), sur chaque pull request.

```yaml title=".github/workflows/outpost.yml"
name: Outpost review
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - run: npm ci
      - run: npx outpost image build --image outpost:dev
      - run: npx outpost doctor --image outpost:dev --json
      - run: node review.mts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

Construisez l’image dans le job : le provider Docker refuse une image construite pour un autre identifiant utilisateur, et celui du runner diffère en général du vôtre. Ajoutez `--directory` quand le `Dockerfile` n’est pas à la racine.

`doctor` sort avec le statut 1 quand le moteur, l’image ou la CLI de l’agent manque ([Diagnostic](../diagnostics/)). Il vérifie Codex sur Docker, sauf si vous passez `--agent` ou `--sandbox-provider`, et ne teste pas la clé API.

[Réparer une CI en échec](../fix-failing-ci/) est un script complet à lancer de cette façon.

## Faire échouer le job quand le travail échoue

Un job échoue quand le script sort avec un statut non nul. Afficher une erreur ne suffit pas.

| Ce qui échoue                       | Ce que fait Outpost                           | Ce que vous faites                 |
| ----------------------------------- | --------------------------------------------- | ---------------------------------- |
| `dispatch()`, allocation de sandbox | Rejette ; Node sort avec le statut 1          | Rien, ou journaliser puis relancer |
| Un `sandbox.command()`              | Se résout avec son `status` non nul           | Lever une erreur si `status` ≠ 0   |
| Un workflow lancé par `start()`     | Se résout avec un `status` autre que `"done"` | Appeler `result.unwrap()`          |
| `outpost doctor`                    | Sort avec le statut 1                         | Rien                               |

```ts title="fix.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const signal = AbortSignal.timeout(30 * 60_000);
await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: `outpost/fix-${process.env.GITHUB_RUN_ID}` },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit the fix." },
  signal,
});
const tests = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  signal,
});
if (tests.status !== 0) throw new Error(`npm test failed:\n${tests.stderr}`);
```

Gardez l’échéance de `signal` plus courte que le `timeout-minutes` du job. Outpost arrête alors l’agent et l’étape échoue, au lieu que GitHub annule le job et saute vos étapes `if: failure()` ([Limites et annulation](../limits-and-cancellation/)).

## Nommer la branche par exécution

Une branche `named` qui existe déjà est réutilisée, avec les commits de l’exécution précédente. Mettez l’identifiant d’exécution dans le nom, comme dans `fix.mts`, pour que chaque job parte du commit extrait. C’est important sur les runners auto-hébergés, qui gardent les branches d’un job à l’autre.

## Livrer les changements

Outpost commite sur la branche et s’arrête là. Poussez depuis le job une fois vos contrôles passés, avec un jeton autorisé à écrire.

```yaml
permissions:
  contents: write
steps:
  # ...les étapes ci-dessus, qui lancent fix.mts
  - run: git push origin "outpost/fix-${GITHUB_RUN_ID}"
```

Ouvrez la pull request ou fusionnez selon vos règles habituelles de revue et de validation. Pour attendre une personne pendant l’exécution, utilisez les [Approbations](../approvals/).

## Conserver les données de récupération

Un runner hébergé est supprimé après le job, avec le répertoire `.outpost/` du dépôt. Téléversez ce qu’il faut pour inspecter ou reprendre une exécution en échec.

```yaml
- if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: outpost-recovery
    include-hidden-files: true
    if-no-files-found: ignore
    retention-days: 7
    path: |
      .outpost/recovery/
      .outpost/storage/objects/checkpoints/
      .outpost/storage/objects/logs/
```

Ces chemins contiennent les transferts conservés après une synchronisation en échec, les checkpoints de workflow et les [journaux](../journals/) ([Où vivent les données](../storage/)). Ne téléversez jamais les conversations, `.env` ni les fichiers d’identifiants : toute personne ayant accès en lecture au dépôt peut télécharger les artefacts de CI.

Les commits de l’agent restent sur sa branche : poussez-la depuis une étape `if: failure()` pour les garder. Pour reprendre une exécution dans un job ultérieur, gardez ses checkpoints dans [S3 ou R2](../object-storage/) plutôt que sur le runner.

## Lancer des exécutions sans job de CI

<!-- features -->

- [Planification cron](../cron-schedules/) : Publie un job de workflow à heures fixes depuis un processus de longue durée.
- [Webhooks](../webhooks/) : Publient un job à l’arrivée d’un événement du dépôt, après vérification de sa signature.
- [Files de jobs et workers](../job-queues/) : Exécutent les jobs publiés sur vos propres workers.

## Limites

- Outpost ne pousse jamais, n’ouvre pas de pull request et ne fusionne rien sur un dépôt distant.
- `doctor` ne teste ni la connexion, ni les clés API, ni l’accès au modèle.
- Les commits utilisent `user.name` et `user.email` du dépôt, ou `Outpost <outpost@localhost>` quand le runner n’en définit aucun.

API : [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [createCodexHarness](../../reference/createcodexharness/).

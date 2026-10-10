---
title: "Comparer et intégrer les résultats des recettes"
description: "Choisir un candidat et vérifier la résolution des conflits avant intégration."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="déclarer-les-rapports-et-la-télémétrie"></span>
<span id="suivre-la-couverture-et-les-validations"></span>

Le format de recette 3 et la configuration 2 composent les familles déclaratives publiques avec les moteurs natifs. Les [composants disponibles](../yaml-components/) sont générés depuis leurs descripteurs. Les fonctions, clients SDK et objets personnalisés passent par des extensions locales explicites ; les utilitaires de consultation, signature et récupération restent appelables depuis des modules TypeScript de confiance. Les restrictions des fournisseurs et agents continuent de s’appliquer.

## Partager une sélection de candidats

Gardez les chemins locaux et les références d’authentification dans la configuration obligatoire. Une recette peut référencer une spéculation nommée, comme une tâche isolée peut référencer `isolatedTasks`. La recette distribuée `compare-candidates` attend `speculations.compare` ; son paramètre `goal` peut être interpolé dans les briefs des candidats. Une référence absente ou incompatible échoue à la validation.

```yaml title="recipe.yaml — sélection"
version: 3
name: select-a-candidate
inputs:
  goal:
    type: string
    description: Modification à tenter.
tasks:
  - key: select
    speculation: { $ref: speculations.compare }
```

La spéculation exige `experimental: true` dans la configuration. Ses règles natives de budget, validation et sélection restent applicables. Pour `select: best`, fournissez une fonction de notation en plus de la validation. Déclarez ces fonctions avec les contrats `speculation.options.validate` et `speculation.options.score` ; consultez les [extensions locales](../yaml-recipes/).

```yaml title="outpost.yaml — candidats"
experimental: true
speculations:
  compare:
    repository: ../project
    sandboxProvider: { $ref: sandboxProviders.build }
    budget: { attempts: 2 }
    select: best
    validate: { $ref: extensions.validate }
    score: { $ref: extensions.score }
    candidates:
      - key: solution
        agent: { $ref: agents.coder }
        request:
          brief: { text: "{{ inputs.goal }}" }
```

Ajoutez cette section à la configuration locale complète contenant version, dépôt, sandbox, fournisseur, agent et extensions. La sélection conserve la branche gagnante et le contrôle préalable d’intégration natifs ; elle ne fusionne jamais implicitement le gagnant. Les projections JSON dans `outputs.select.value` incluent les résultats des candidats, les workspaces conservés et la consommation cumulée. Le guide [spéculation](../speculation/) explique sélection et récupération. Après `bun run build`, lancez l’exemple hors ligne avec `node --test examples/71-recipe-speculation/index.ts`.

La spéculation durable exige aussi un checkpoint de workflow et un fournisseur avec récupération native.

L’identifiant interne effectif est le tuple JSON `[workflowRunId, taskKey, configuredSpeculationRunId]`, renvoyé dans `value.runId` ; deux runs du workflow ne réutilisent pas les candidats l’un de l’autre. L’identité du checkpoint interne inclut recette, paramètres résolus et configuration locale pertinente.

Le journal de consommation et les reçus du workflow conservent les tokens après interruption de publication ou rejeu.

`recipe resume --retry-incomplete` autorise le rejeu des candidats interrompus ; cette commande ne récupère pas une spéculation encore possédée et ne supprime aucun verrou de workspace.

Arrêtez l’ancien coordinateur puis utilisez `recoverSpeculation` avec sa révision exacte avant le rejeu. Les fournisseurs local et mémoire n’annoncent pas de récupération ; les combinaisons incompatibles échouent avant allocation.

## Résoudre les conflits d’intégration

Déclarez un résolveur séparément puis reliez-le avec `integration.onConflict`. Il reçoit un workspace nommé distinct et un fournisseur explicite. Le runtime ferme et synchronise la sandbox d’exécution avant l’intégration, conserve le travail refusé et laisse ouverts les workspaces empruntés. La consommation du résolveur figure dans `report.integration.usage`, séparément de celle du workflow.

```yaml title="outpost.yaml — intégration"
resolvers:
  repair:
    type: agent
    agent: { $ref: agents.resolver }
    sandboxProvider: { $ref: sandboxProviders.build }
    verify: { executable: npm, arguments: [test] }
integration:
  onConflict: { $ref: resolvers.repair }
  deadlineMs: 600000
```

Le [contrat natif de résolution](../workspaces/) vérifie toujours le commit combiné, réapplique les guards de diff et refuse les changements concurrents des commits source ou hôte. Un échec de vérification conserve les workspaces de récupération. Une affirmation non vérifiée de l’agent ne remplace pas ces contrôles.

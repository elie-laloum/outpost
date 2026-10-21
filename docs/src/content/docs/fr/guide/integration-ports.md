---
title: "Étendre Outpost"
description: "Trouvez le contrat à implémenter pour ajouter un agent, une sandbox, un service de modèle, un stockage ou une file."
---

<!-- Retained section anchors for existing bookmarks. -->

<span id="remplacer-une-intégration"></span>
<span id="ce-quoutpost-continue-de-faire"></span>

## Choisir le contrat à implémenter

Choisissez le contrat qui correspond à l’intégration souhaitée. Chaque contrat a une responsabilité précise : vous pouvez ajouter un adaptateur d’agent, un fournisseur de sandbox ou un transport de stockage sans remplacer le reste d’Outpost.

<!-- features -->

- [Ajouter un agent CLI](../custom-agents/): Construire la commande qui lance la CLI et décoder ses lignes de sortie.
- [Formats de conversation natifs](../conversation-formats/): Trouver, capturer et restaurer les transcriptions qu’écrit une CLI.
- [Ajouter un fournisseur de sandbox](../custom-sandbox-providers/): Allouer un environnement, exécuter des commandes, transférer des fichiers, le libérer.
- [Fournisseurs de modèles](../model-providers/): Envoyer les requêtes du harness intégré à une API de modèle.
- [Où vivent les données](../storage/): Lire, lister et écrire sous condition des octets versionnés pour chaque stockage durable.
- [Files de jobs](../job-queues/): Conserver les jobs, protéger les baux des workers et garder leurs résultats.
- [Sources de secrets](../secret-sources/) : Résolvez les noms déclarés sur l’hôte avant d’allouer une sandbox.

## Valider une intégration

Testez ce qu’un utilisateur observe quand les choses tournent mal : un code de sortie non nul, une sortie fermée avant la fin du processus, une exécution annulée ou expirée, une libération appelée deux fois. Vérifiez qui possède chaque ressource et que les fichiers temporaires disparaissent en cas de succès, d’échec et d’annulation.

Pour un fournisseur de sandbox, `diagnose()` lance une sonde limitée contre une vraie sandbox : Node.js, Git, flux de sortie séparés, code de sortie non nul, répertoire personnel et, avec `transfers`, transferts de fichiers binaires.

```ts
import { createSandbox } from "@elie-laloum/outpost/core";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ sandboxProvider, repository });
const report = await sandbox.diagnose({ transfers: true });
console.log(report.hasFailures, report.checks);
// Example output: false [ { id: "sandbox.node", status: "pass", … }, … ]
```

:::caution
Des tests simulés prouvent le protocole, pas l’environnement. Montages, tmpfs, terminaux et isolation réseau exigent un test contre le vrai moteur.
:::

## Isoler les dépendances facultatives

Chargez un SDK tiers uniquement depuis le point d’entrée de votre intégration, et déclarez-le comme dépendance pair optionnelle. Outpost fait de même : `@elie-laloum/outpost/providers/vercel`, `/transports/s3` et `/queues/bullmq` chargent leur SDK, l’import principal non.

Pour ajouter à Outpost lui-même un agent ou un fournisseur intégré, suivez `AGENTS.md` dans le [dépôt](https://gitlab.elielaloum.com/elielaloum/outpost).

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [ConversationStore](../../reference/conversationstore/) · [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [ModelProvider](../../reference/modelprovider/) · [Transport](../../reference/transport/) · [TaskQueue](../../reference/taskqueue/) · [diagnoseSandbox](../../reference/diagnosesandbox/).

## Connecter des services de décision

[`DecisionProvider`](../../reference/decisionprovider/) évalue des questions typées sur un état JSON sans perte. Il est indépendant de `ModelProvider` et n’alloue aucune sandbox. Utilisez l’adapter HTTP System One commun à Jev et aux endpoints Laya compatibles, ou implémentez une requête annulable renvoyant les réponses natives et l’usage disponible. Voir les [décisions typées](../decisions/) et le [routage par étape](../model-routing/).

## Choisir un point d’entrée du paquet

Importez chaque fonction et type depuis le module qui le fournit. Tous les modules ci-dessous appartiennent au même paquet npm : aucun paquet supplémentaire à installer. Outpost 13 supprime l’import à la racine `@elie-laloum/outpost` ; remplacez ces imports avant de quitter la version 12. Les guides et exemples utilisent directement les sous-chemins correspondants.

| Import après `@elie-laloum/outpost/` | Contenu                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `core`                               | Agents, harness CLI, dispatch, sessions sandbox, réponses et observation courante.                       |
| `workspaces`                         | Création des workspaces, instantanés, publication et intégration des conflits.                           |
| `harness`                            | Boucle d’agent intégrée, fournisseurs de modèles, outils, contexte et sous-agents.                       |
| `workflows`                          | Tâches, dépendances, décisions, budgets, checkpoints, caches et approbations.                            |
| `queues`                             | Workers, tâches en file, planification et sources webhook.                                               |
| `storage`                            | Contrats de transport et stockage des artefacts.                                                         |
| `observation`                        | Sorties personnalisées, hubs bas niveau, journaux, rejeu et lecteurs de suivi autonomes.                 |
| `recovery`                           | Inspection, restauration, rétention et récupération des réservations de stockage.                        |
| `integrations`                       | Contrats d’agents et de sandboxes, formats natifs des conversations et diagnostics.                      |
| `recipes`                            | Compilation des recettes, runtime et enregistrement des extensions locales.                              |
| `experimental/speculation`           | Courses entre candidats, vérification préalable à l’intégration et récupération du coordinateur durable. |

Les chemins `/providers/*`, `/secrets/*`, `/transports/s3`, `/queues/bullmq`, `/opentelemetry` et `/testing` restent identiques. Les fonctions, leurs options et les données persistées conservent leur comportement. La syntaxe des recipes YAML reste identique ; mettez à jour les imports TypeScript de leurs extensions locales. La référence API indique le chemin exact de chaque symbole.

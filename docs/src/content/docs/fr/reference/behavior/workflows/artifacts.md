---
title: Artefacts typés entre dépôts
description: Publier des artefacts JSON ou binaires durables avec des contrats validés et leur filiation.
sidebar:
  order: 7
---

Les artefacts transmettent des données entre tâches dont les dépôts et les sandboxes ont des durées de vie distinctes. Une `ArtifactReference` est une petite valeur JSON immuable contenant le nom et la version du contrat, l'encodage, le SHA-256 et la taille du contenu, l'exécution, la tâche et la tentative productrices, et les identifiants ordonnés des références parentes. Son propre identifiant lie ces champs. Les références tiennent dans les checkpoints ; les données restent dans un stockage explicitement possédé.

## Publier et consommer un contrat

Ce workflow complet côté hôte nécessite Node.js 24+ et Outpost. Il n'appelle aucun modèle. Les fonctions de validation et les validateurs Standard Schema sont acceptés. La validation s'exécute à la publication et à la lecture ; changez la version du contrat lorsque son sens évolue.

```ts
import { resolve } from "node:path";
import {
  artifact,
  artifactTask,
  fileArtifactStore,
  fileWorkflowCheckpointStore,
  readArtifact,
  task,
  workflow,
} from "@elie-laloum/outpost";

const store = fileArtifactStore({
  directory: resolve(".outpost/artifacts"),
  maxBytes: 1024 * 1024,
});
const api = artifact.json({
  name: "service-api",
  version: "1",
  schema(input: unknown) {
    if (
      !input ||
      typeof input !== "object" ||
      !("endpoint" in input) ||
      typeof input.endpoint !== "string"
    )
      throw new Error("Expected an endpoint string");
    return { endpoint: input.endpoint };
  },
});
const publish = artifactTask({
  key: "publish-api",
  store,
  contract: api,
  produce: () => ({ endpoint: "/users" }),
});
const consume = task({
  key: "consume-api",
  after: [publish],
  async perform(context) {
    const value = await readArtifact(context, publish, api, store);
    return value.endpoint;
  },
});
const result = await workflow("api-contract", [publish, consume]).start({
  checkpoint: {
    store: fileWorkflowCheckpointStore({ directory: resolve(".outpost/runs") }),
    runId: "api-contract-1",
    version: "1",
  },
});
result.unwrap();
console.log(result.value(consume)); // /users
```

`readArtifact` exige une dépendance déclarée dans `after` et vérifie que la référence désigne cette tâche et l'exécution courante. Le contrat fournit le type retourné et valide les données réelles. Un objet absent, une version incompatible, un contenu altéré ou un schéma invalide rejette l'opération et fait échouer la tâche.

Pour deux dépôts, faites produire une réponse structurée par un `isolatedTask`. Ajoutez un `artifactTask` après lui avec `produce: context => context.value(backend).value`. Un second `isolatedTask` déclare `after: [publish]` ; sa fonction `request` peut être asynchrone et appeler `await readArtifact(context, publish, api, store)` pour construire le brief consommateur. Définissez explicitement le `repository` de chaque tâche isolée. Cela n'intègre ni ne pousse automatiquement aucun dépôt. Voir les [tâches de sandbox](../../../../guide/workflows/sandbox-tasks/).

Le résultat complet d'un `isolatedTask` contient des méthodes de continuation et ne peut pas être sauvegardé tel quel en JSON. Ajouter ensuite une tâche d'artefact ne modifie pas ce résultat antérieur. Pour un producteur agent avec checkpoint, appelez `dispatch` dans `artifactTask.produce`, transmettez `context.signal`, déclarez `result.usage` via `context.reportUsage` et retournez uniquement `result.value`. Le résultat sauvegardé est alors la référence d'artefact.

## Données dérivées et autre processus

Une tâche d'artefact peut déclarer `parents: context => [context.value(publish)]` avec `after: [publish]`. La référence enregistre ces identifiants ordonnés ; modifier la filiation modifie l'identifiant même si les octets restent identiques. Déclarez vous-même chaque artefact d'entrée comme parent : la filiation est explicite, pas déduite des lectures. Les parents dupliqués sont rejetés. Leurs identifiants désignent des références, pas des chemins ; conservez les références parentes séparément si les lecteurs doivent parcourir la filiation.

Sérialisez la référence avec `JSON.stringify` ou retournez-la comme résultat d'une tâche pour la [persistance par checkpoint](../../../../guide/advanced/checkpoints/). Un autre processus ouvre `fileArtifactStore` avec le même répertoire, ou sa copie, puis appelle `readStoredArtifact(store, api, parsedReference, { producer, parents })`. Cela valide la structure d'une référence non fiable, le contrat, le contenu, le schéma, le producteur attendu et les parents ordonnés exacts. Les attentes optionnelles `producer` et `parents` doivent provenir de votre état d'orchestration de confiance ; sans elles, seule la cohérence interne de ces champs est vérifiée. La référence ne contient aucun chemin propre à l'hôte. Un `ArtifactStore` personnalisé peut transporter les octets par identifiant vers une autre machine ; le lecteur vérifie toujours leur intégrité.

Pour publier hors d'un workflow, utilisez `publishArtifact(store, api, value, { producer: { executionId, taskKey, attempt }, parents })`. `attempt` commence à 1. Dans un workflow, `artifactTask` fournit automatiquement l'identité du producteur et l'annulation.

## Fichiers binaires, propriété et limites

Utilisez `artifact.binary({ name: "bundle", version: "1" })` pour des données `Uint8Array`, y compris des `Buffer` Node. Lisez un fichier que vous possédez avec `node:fs/promises.readFile`, puis publiez ses octets. Les lectures renvoient un nouveau tableau d'octets. Aucun nom de fichier, permission, répertoire, extraction d'archive ou lien symbolique n'est transporté. Téléchargez les fichiers de la sandbox via sa capacité de transfert avant publication ; sa destruction ne supprime pas les artefacts stockés. Les contrats JSON exigent des valeurs JSON sans perte ; dates, champs undefined, nombres non finis et instances de classes sont rejetés.

`fileArtifactStore` limite par défaut chaque contenu à 16 Mio ; `maxBytes` configure cette limite en lecture et en écriture. Les opérations chargent un contenu borné en mémoire ; les appelants doivent limiter la taille des fichiers sources avant de les charger. Ce n'est ni un quota disque total ni un service de diffusion de gros fichiers.

L'appelant possède le répertoire et gère sa conservation. Gardez-le hors des worktrees jetables, privé aux auteurs de confiance et hors du contrôle de version. Les composants du répertoire et les fichiers objets ne doivent pas être des liens symboliques ; fournissez un chemin canonique sur les plateformes dont les répertoires temporaires ont des alias. Des objets identiques peuvent être republiés simultanément ; un contenu conflictuel est rejeté. La publication prépare, synchronise et lie atomiquement un objet immuable, puis synchronise le répertoire sur les plateformes compatibles. L'annulation et les échecs ordinaires nettoient les fichiers temporaires. Un crash peut laisser des fichiers cachés `.tmp` ou des objets complets sans référence ; inspectez-les et supprimez-les uniquement lorsque les auteurs sont arrêtés. Aucun nettoyage automatique n'est exécuté : conservez chaque objet nécessaire aux checkpoints retenus et à la filiation avant toute suppression.

Une annulation, un échec d'écriture de checkpoint ou la perte du processus peut survenir après la publication d'un objet mais avant le retour ou la sauvegarde de sa référence. Publication et checkpoints sont des transactions distinctes. Il n'existe aucune transaction ou annulation globale entre dépôts. Les empreintes détectent une incohérence par rapport à une référence fiable ; elles n'authentifient pas un producteur et n'empêchent pas un auteur de remplacer à la fois la référence et les octets. Le stockage local suppose un propriétaire de confiance, sans remplacement hostile concurrent des répertoires parents.

---
title: "Sélection de candidats"
description: "Valider des résultats concurrents avant de choisir un gagnant."
---

:::note[Expérimental]
`speculate()` est un helper explicite pour des exécutions concurrentes bornées.
:::

Fournissez dépôt, fournisseur de sandbox, jusqu’à huit candidats, budget partagé et callback `validate`. Chaque candidat tourne sur une branche distincte. `concurrency` vaut deux par défaut.

```ts
import { speculate } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await speculate({
  repository,
  sandboxProvider,
  budget: { attempts: 2, usage: { output: 20_000 } },
  candidates: ["minimal", "refactor"].map((key) => ({
    key,
    agent: coder,
    request: {
      brief: {
        text: `Fix the parser using a ${key} approach. Test and commit.`,
      },
    },
  })),
  async validate({ sandbox }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch);
```

## Valider le comportement réel

Le callback reçoit la sandbox active et la sortie du candidat. Exécutez-y les contrôles requis et renvoyez true uniquement si le candidat est acceptable. Une affirmation de réussite de l’agent ne suffit pas à le sélectionner.

## Budget et nettoyage

Le budget partagé contrôle tentatives et tokens observés. Les candidats déjà actifs peuvent consommer davantage avant l’arrivée de leurs résultats. Les perdants sont annulés et les ressources fermées selon leur propriété ; le travail récupérable reste soumis aux règles de conservation.

Examinez le résultat sélectionné et l’état hôte avant intégration. La mise en concurrence n’autorise pas la publication et ne résout pas tous les conflits hôte possibles. Consultez le contrat exact `SpeculationResult` et la [roadmap](../../project/roadmap/) avant de dépendre de ce chemin de recherche.

API : [speculate](../../reference/speculate/) · [SpeculationResult](../../reference/speculationresult/) · [recoverSpeculation](../../reference/recoverspeculation/) · [checkSpeculationIntegration](../../reference/checkspeculationintegration/).

## Courses durables et récupération

Ces ajouts sont disponibles en 7.0.0 ; la spéculation reste expérimentale. Ajouter `durability: { transporter, runId: "parser-race", version: "1" }` aux options ci-dessus. Utiliser `createLocalTransport({ directory: join(repository, ".outpost", "storage") })` pour la persistance locale, ou un Transport distant explicitement configuré. L’appelant possède le transport. Changer `version` lorsque les agents, la validation ou les réglages du provider changent. Les résultats doivent contenir des valeurs JSON sans perte ou `undefined` au premier niveau.

Docker/Podman en mode monté prennent en charge le nettoyage durable. L’exécution hôte locale, les conteneurs isolés, Vercel, Daytona et Firecracker refusent actuellement les courses durables, sauf si un provider personnalisé implémente le contrat de récupération. Celui-ci doit attendre `context.registerRecovery(resourceId)` exactement une fois avant l’allocation et implémenter `recover(resourceId, options)` de façon idempotente en préservant les données du dépôt. Un enregistrement après allocation laisse une fenêtre de crash irrécupérable et viole ce contrat.

Après un crash du coordinateur :

1. Arrêter indépendamment l’ancien coordinateur. Un délai expiré ou un PID distant ne prouve pas son arrêt.
2. Inspecter l’enveloppe de la course avec `transporter.list("speculations/")` et `transporter.read(entry.key)`. La clé est `speculations/<SHA-256 de runId>.json` ; conserver la `revision` de l’objet inspecté et les identifiants de ressources.
3. Appeler `recoverSpeculation({ transporter, runId, revision, coordinatorStopped: true })`. Une révision modifiée refuse la récupération. Cela libère la propriété sans supprimer directement les ressources.
4. Appeler `speculate()` avec la même configuration et `durability.resume: "retry-incomplete"` pour autoriser le rejeu. Les ressources enregistrées sont réconciliées avant les nouvelles tentatives. Une course terminée est renvoyée sans réallouer de candidats.

Une course terminée avec le statut `quota` n’est pas définitive : l’appel suivant relance seulement les candidats arrêtés par une limite d’usage ou de débit, en nouvelles tentatives. Voir les [pauses sur quota](../quota-pauses/#spéculation).

Les candidats validés survivent à un crash entre validation et nettoyage. Les exécutions interrompues repartent sur une nouvelle branche depuis le commit initial ; leurs anciennes branches et worktrees restent disponibles dans `previousAttempts`. Le mode durable conserve les worktrees candidats même en cas de réussite. Les workspaces, l’historique Git et les transcripts sur disque doivent rester accessibles : stocker le checkpoint dans S3 ne rend pas le checkout portable. La reprise concerne l’orchestration, pas un processus d’agent interrompu. Un rejeu peut répéter des effets externes et consomme une tentative supplémentaire ; aucune exécution exactement une fois n’est garantie.

L’usage observé et les tentatives restent cumulés. Un crash pendant l’exécution marque l’usage incomplet car les tokens non rapportés ne peuvent pas être reconstruits. Les budgets exclusivement en tokens refusent alors toute nouvelle admission ; fournir aussi un budget de tentatives. Les écritures conditionnelles bloquent les anciens coordinateurs. Une erreur de stockage arrête les admissions ; la propriété est conservée pour une récupération explicite. Les erreurs sont persistées sous forme de chaînes diagnostiques, pas d’instances Error actives.

`cleanupMs` vaut 30 secondes par défaut pour chaque fermeture/récupération et pour les workers après annulation. Le délai borne l’attente, pas la capacité physique du provider à s’arrêter. `cleanup: "pending"` et les identifiants enregistrés restent visibles si le travail ne se termine pas ; la propriété reste détenue. Arrêter le coordinateur avant de la récupérer, puis réconcilier toute ressource encore active. Une allocation tardive reste possible tant que ce coordinateur n’est pas arrêté. Un crash avant l’enregistrement ne laisse aucune sandbox allouée selon le contrat du provider, mais peut laisser un worktree à inspecter.

## Vérifier l’intégration

Le gagnant sélectionné comporte `result.integration` : `clean`, `conflict` avec les chemins concernés, ou `blocked` avec une raison. Un checkout hôte sale ou détaché bloque la vérification. Git doit prendre en charge `merge-tree --write-tree` ; son absence produit blocked. La vérification enregistre les commits exacts sans modifier les fichiers de travail ni l’index.

Juste avant une fusion explicite, relancer `checkSpeculationIntegration(repository, winner.branch, winner.commit)`. Une branche candidate déplacée bloque la vérification. Toute modification hôte rend un ancien résultat périmé ; un contrôle clean n’est ni un verrou ni une autorisation de fusion. Résoudre explicitement les conflits et conserver la branche candidate pour revue.

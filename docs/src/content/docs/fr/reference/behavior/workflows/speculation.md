---
title: Candidats spéculatifs
description: Comparer des branches candidates avec validation explicite et limites d’usage observé.
sidebar:
  order: 12
---

`speculate()` est un prototype de recherche facultatif pour essayer plusieurs approches d’agent sur un dépôt. Il fixe le commit initial de l’hôte, crée des branches nommées et des worktrees distincts, puis exécute jusqu’à huit candidats avec une concurrence configurable (deux par défaut). Chaque candidat utilise le fournisseur indiqué. Les worktrees ne constituent pas une frontière de sécurité face à un agent hostile ; `local()` exécute explicitement sur l’hôte.

```ts
import { codex, speculate } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const result = await speculate({
  repository: "/path/to/repository",
  provider: docker({ image: "outpost-agent:local" }),
  concurrency: 2,
  budget: { attempts: 2, usage: { input: 100_000, output: 20_000 } },
  candidates: [
    {
      key: "minimal",
      agent: codex(),
      request: {
        brief: { text: "Fix the bug with a small patch and commit it." },
      },
    },
    {
      key: "alternative",
      agent: codex(),
      request: {
        brief: { text: "Try another solution, test it and commit it." },
      },
    },
  ],
  async validate({ sandbox, signal }) {
    const test = await sandbox.command({
      executable: "npm",
      arguments: ["test"],
      signal,
    });
    return test.status === 0;
  },
});
console.log(result.status, result.winner?.branch, result.host.changed);
```

Construisez et authentifiez l’image selon la [configuration du fournisseur](../../../../guide/environment/providers/overview/). Cette fonction ne configure pas les identifiants de l’agent. Le validateur obligatoire intervient après un dispatch réussi, avec la sandbox encore ouverte. Retournez `true` seulement si la sortie satisfait vos critères. Une exception de validation fait échouer ce candidat. Limitez les modifications du validateur aux sorties temporaires des tests ; les commits retournés décrivent le dispatch, avant validation.

Le premier candidat à réussir la validation **et le nettoyage de ses ressources** gagne. Sa sélection annule coopérativement les concurrents actifs et empêche le démarrage des candidats en attente. La fonction attend chaque candidat admis, la synchronisation et le nettoyage des sandboxes avant de retourner. Les adaptateurs, fournisseurs et validateurs doivent respecter l’annulation ; aucun délai strict ne peut arrêter du code personnalisé arbitraire. Transmettez le signal du validateur aux commandes et autres opérations annulables.

## Budgets et récupération

Le `budget` partagé utilise le même comptage de jetons observés que les workflows, y compris les événements d’usage des tentatives échouées. `attempts` compte les candidats admis, pas les tours, les réparations ou les requêtes facturables. Une limite de tentatives bloque les admissions suivantes tout en laissant les candidats admis terminer. Atteindre une limite d’usage déclaré annule le groupe actif. L’usage concurrent et les rapports tardifs ou absents peuvent dépasser la limite ; il ne s’agit pas d’un plafond de facturation. Utilisez les contrôles de dépenses du fournisseur si nécessaire. Un budget vide `{}` laisse explicitement l’usage illimité ; les limites de candidats et de concurrence restent actives.

Les résultats comprennent le statut, la branche unique, la sortie du dispatch réussi si disponible, l’erreur et le chemin de récupération de chaque candidat. Les worktrees gérés propres sont supprimés après succès ou rejet par le validateur ; leurs branches nommées restent disponibles. Les échecs, annulations, worktrees modifiés ou détachés et erreurs de nettoyage conservent les emplacements de récupération. Consultez `error` et `recoveryDetails(error)` pour les métadonnées du dispatch, dont les journaux et transcriptions. Les branches perdantes ne sont jamais supprimées automatiquement. Un candidat annulé peut avoir produit des commits utiles.

Aucun candidat n’est poussé ou intégré automatiquement. Examinez `winner.branch`, ses commits et tout `retainedDirectory` ; les fichiers non commités nécessitent une revue distincte. `baseline` indique le commit initial commun. `host.before`, `host.after` et `host.changed` comparent la branche, le commit, l’index, les modifications suivies et les fichiers non suivis non ignorés de l’hôte (hors `.outpost`). Les modifications initiales de l’hôte restent intactes et sont signalées par `host.before.dirty` ; elles ne sont pas copiées dans les candidats. Une erreur du dernier instantané renseigne `host.changed` et `host.error` sans perdre les résultats des candidats.

Ces instantanés sont indicatifs, sans verrou atomique d’intégration. Les fichiers ignorés sont exclus, et l’hôte peut changer après le retour. Avant une fusion ou un cherry-pick manuel, inspectez les modifications actuelles de l’hôte, comparez la branche à `baseline` et résolvez explicitement les conflits. Aucune opération d’intégration automatique n’est exposée.

Ce prototype conserve l’ordonnancement et la sélection en mémoire. Il ne reprend pas une course après redémarrage, ne garantit pas le nettoyage après un crash de l’hôte, ne classe pas les solutions au-delà de votre validateur et n’effectue pas de transaction entre dépôts. Utilisez les branches conservées et [l’inspection de récupération](../../../../guide/operations/recovery/) pour examiner les exécutions interrompues.

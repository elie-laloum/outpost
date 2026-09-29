---
title: "Erreurs"
description: "Distinguer échecs d’exécution, résultats de commandes et statuts de workflow."
---

Les échecs de requête et d’allocation rejettent leur promesse. Les commandes renvoient un code de sortie. Le `start()` du workflow renvoie un résultat structuré ; appelez `unwrap()` pour lever une exception sur une exécution non réussie.

```ts
import { OutpostError, recoveryDetails } from "@elie-laloum/outpost";

function reportFailure(error: unknown) {
  if (error instanceof OutpostError) console.error(error.code, error.message);
  console.error(recoveryDetails(error));
}
```

## Échecs courants

| Symptôme                    | À vérifier                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| Fichier de compte absent    | Stockage des identifiants en fichier ou jeton explicite sur le harness.                          |
| Réglage non pris en charge  | Formes de modèle et d’authentification du harness sélectionné.                                   |
| Moteur ou exécutable absent | Contenu de l’image et `outpost doctor`.                                                          |
| Échec d’analyse de réponse  | Dernière balise complète, JSON valide et schéma.                                                 |
| Sandbox occupée             | Attendre l’opération active ou allouer une autre sandbox.                                        |
| Synchronisation refusée     | Modifications concurrentes et données de récupération conservées.                                |
| Checkpoint possédé          | Arrêter l’ancien runner, inspecter la révision et récupérer explicitement la propriété.          |
| Limite d’usage ou HTTP 429  | Code `quota` et `quotaFault` ; mettre les workflows en pause avec [`onQuota`](../quota-pauses/). |
| Service indisponible        | `unavailableFault` ; passer la main avec un [agent de secours](../fallback-agents/).             |

## Reprendre délibérément

Reprenez les erreurs transitoires seulement si leurs effets peuvent être répétés sans problème. Préservez les chemins de récupération avant de rapporter une erreur à un autre processus. Un délai dépassé ne prouve pas que tous les effets externes ont été annulés.

Journalisez les codes d’échec et le contexte pertinent sans exposer identifiants ou transcriptions privées. Voir [Récupérer les changements](../recovery/) pour le travail conservé.

API : [OutpostError](../../reference/outposterror/) · [recoveryDetails](../../reference/recoverydetails/) · [WorkflowResult](../../reference/workflowresult/).

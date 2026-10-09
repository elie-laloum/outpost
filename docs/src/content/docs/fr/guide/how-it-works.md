---
title: "Comment Outpost exécute une tâche"
description: "Comprenez le rôle de l’agent, de la sandbox et du workspace, ainsi que ce qui reste après une tâche."
---

## Trois choix pour chaque tâche

Votre code TypeScript fournit à Outpost un agent, un fournisseur de sandbox et un dépôt. L’agent reçoit vos consignes, le fournisseur démarre son environnement d’exécution et Outpost prépare la copie Git sur laquelle il travaille.

| Votre choix            | Ce qu’il détermine                                                         | Pour en savoir plus                              |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| Agent                  | L’outil en ligne de commande ou la boucle de modèle qui réalise le travail | [Choisir un agent](../choose-an-agent/)          |
| Fournisseur de sandbox | L’environnement qui exécute les commandes, par exemple un conteneur Docker | [Choisir une sandbox](../choose-a-sandbox/)      |
| Branche                | La copie du dépôt qui sera modifiée et l’emplacement des commits           | [Choisir le dépôt et la branche](../workspaces/) |

Vous pouvez changer d’agent en conservant le même fournisseur de sandbox. Vous pouvez aussi exécuter le même agent dans un autre environnement pris en charge.

## Un appel à `dispatch()`

Un appel prépare le workspace, ouvre une sandbox, lance l’agent et récupère sa réponse, ses commits et sa consommation. Il ferme ensuite les ressources qu’il a ouvertes. Avec une branche nommée, les commits restent sur cette branche pour que vous puissiez les examiner.

```ts
import { reportValue } from "./reporter.ts";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-links" },
  brief: { text: "Fix the broken links in the README and commit the change." },
});
reportValue(result.text);
// Example output: Fixed the broken README links and committed the change.
reportValue(result.branch, result.commits);
// Example output: outpost/fix-links [ { oid: '8f3a21c…', subject: 'Fix README links' } ]
```

La configuration vient de la page [Installation](../setup/). Chaque appel ouvre une nouvelle sandbox. Les dépendances installées et les fichiers temporaires de cet environnement ne passent pas au prochain appel ; le travail Git conservé dépend de la stratégie de branche.

## Garder un environnement pour plusieurs opérations

Utilisez `createSandbox()` si vous voulez qu’un échange avec l’agent et une commande de test partagent les fichiers et les dépendances installées. L’environnement reste ouvert jusqu’à sa fermeture.

```ts
import { reportValue } from "./reporter.ts";
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit the change." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
reportValue(tests.status);
// Example output: 0
```

Ici, `await using` ferme la sandbox à la sortie du bloc, même en cas d’erreur. Une sandbox accepte une seule opération à la fois. Pour travailler en parallèle, utilisez des sandboxes séparées. La page [Réutiliser une sandbox](../sandbox-sessions/) détaille les commandes, les terminaux et l’intégration explicite.

## Séparer le workspace de la sandbox

Le workspace gère la branche et la copie du dépôt. La sandbox gère l’environnement d’exécution. `openWorkspace()` permet de conserver un workspace tout en changeant de sandbox, par exemple pour exécuter l’étape suivante dans le cloud.

Fermez la sandbox courante avant d’en ouvrir une autre sur le même workspace. Quand vous ouvrez ces ressources vous-même, fermez chaque sandbox, puis le workspace. Vous pouvez appeler `close()` plusieurs fois sans risque.

La page [Choisir le dépôt et la branche](../workspaces/) explique comment réutiliser un workspace et intégrer ses commits.

## Retrouver les fichiers après une exécution

Les fichiers d’exécution se trouvent dans le dossier `.outpost` du dépôt cible. Outpost exclut ce dossier de Git au moyen de `.git/info/exclude`.

| Dossier          | Contenu                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `workspaces/`    | Copies de travail gérées par Outpost, y compris celles conservées après un échec                 |
| `locks/`         | Informations de réservation des workspaces et des branches                                       |
| `storage/`       | Journaux et activité des ressources par défaut ; autres données si leur stockage y est configuré |
| `conversations/` | Transcriptions du harness intégré et sessions de Copilot et Kimi                                 |
| `recovery/`      | Transferts conservés après un échec de synchronisation                                           |

Claude Code et Codex utilisent leurs propres espaces de conversation dans votre dossier personnel. Le [guide du stockage](../storage/) précise quelles données peuvent être transférées et quels fichiers doivent rester locaux.

Après un échec, examinez le travail conservé avant de le nettoyer. Le nettoyage peut lui aussi échouer, et la récupération à distance dépend des données qui ont pu être enregistrées. Utilisez [Récupérer du travail](../recovery/) pour consulter les fichiers disponibles et [Nettoyer les données enregistrées](../retention/) pour supprimer les données admissibles.

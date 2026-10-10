---
title: "Partager un rapport de run"
description: "Exporter le résumé d’un dispatch avec fichiers commités, outils échoués, durée et consommation."
---

Un rapport aide à relire une tâche terminée. Il n’impose pas les tests et ne publie aucune pull request. Pour suivre la tâche en cours, utilisez la [progression en direct](../progress/) ; pour retrouver les événements, consultez un [journal](../journals/).

## Enregistrer un résumé pour la relecture

Après [votre première tâche](../first-request/), utilisez `result.report()` pour transformer le résultat du dispatch en document de relecture. Enregistrez ce script dans `report.ts`, à côté de la configuration de [mise en place](../setup/), puis lancez `node report.ts`. L’agent doit commiter ses changements pour qu’ils apparaissent dans le diff.

```ts title="report.ts"
import { writeFile } from "node:fs/promises";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  agent: coder,
  sandboxProvider,
  branch: { mode: "named", name: "outpost/readme-improvement" },
  brief: { text: "Améliore le README et commite le changement." },
});
await writeFile("run-report.md", result.report({ format: "markdown" }));
await writeFile("run-report.json", result.report({ format: "json" }));
```

Le Markdown contient la réponse de l’agent, la branche, le nombre de commits, la durée, un tableau des fichiers modifiés, les commandes et outils échoués observés et les tokens déclarés. Copiez-le dans une description de PR. Le JSON contient le même instantané pour composer votre message Slack ou votre automatisation ; aucun format ne publie quoi que ce soit.

## Comprendre ce que le rapport établit

Le diff compare le commit exact avant exécution avec celui après synchronisation. Il exclut les fichiers non commités et non suivis. Un renommage présente les deux chemins mais compte pour un fichier ; les changements binaires sont comptés séparément des lignes de texte. Sur plusieurs passes froides, le rapport montre le diff net : une ligne ajoutée puis supprimée ne contribue pas au changement final.

Une condition de fin satisfaite signifie que le dispatch a trouvé son marqueur ou validé sa réponse typée. Il ne certifie pas la réussite des tests. Les commandes shell échouées apparaissent lorsque l’adaptateur émet des résultats d’outils en erreur ; les autres outils échoués apparaissent aussi. L’absence d’échecs observés ne prouve pas que toutes les commandes ont réussi. Les entrées indiquent leur passe et leur sous-agent lorsque ces informations existent.

La durée couvre le cycle de vie du dispatch, dont allocation et nettoyage pour un dispatch froid. Un `sandbox.dispatch()` chaud mesure sa propre opération et garde la sandbox empruntée ouverte. L’usage inclut réparations, instructions en cours de run et tentatives de secours. Avec les [tarifs](../estimating-costs/), le rapport inclut une estimation et signale une tarification partielle ; sans tarifs, il indique que le coût est indisponible.

## Conserver l’instantané après le nettoyage

Les statistiques Git sont collectées avant la suppression du workspace. `report()` est synchrone, ne lit pas le disque et renvoie le même instantané même après disparition du worktree ou du journal. Les modifications ultérieures du dépôt ne le changent pas. La collecte utilise les mêmes événements d’observation normalisés que le [journal](../journals/) : elle fonctionne avec `logging: false` et les journaux transportés, sans les relire.

La liste d’échecs conserve au plus 100 entrées et compte les échecs supplémentaires. Descriptions et aperçus sont limités à 4096 caractères. Les avertissements de collecte signalent les événements perdus, statistiques indisponibles ou descriptions tronquées. Un diff indisponible se distingue d’un diff vide ; un échec de collecte ne transforme pas un dispatch réussi en échec.

Le [masquage](../redacting-secrets/) hérité s’applique à toutes les chaînes du rapport, dont réponses, chemins et commandes. Le Markdown échappe le balisage intégré. Relisez avant de partager : des secrets non déclarés peuvent subsister dans la réponse, les sujets de commits ou les aperçus d’outils. Si le dispatch lève une erreur, aucun résultat n’est disponible ; utilisez la [récupération d’erreurs](../error-handling/) et le journal.

Consultez [`DispatchResult.report`](../../reference/dispatchresult/), [`RunReport`](../../reference/runreport/) et [`RunReportOptions`](../../reference/runreportoptions/) pour les contrats exacts. L’[exemple hors ligne](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/56-run-reports) du dépôt exerce une commande locale réellement échouée et un commit sans compte ni appel payant à un modèle.

## Workspaces de fichiers

Les rapports de dispatch de fichiers utilisent la version 2 avec `workspaceInfo` discriminé et `fileOutputs`. Ils conservent consommation, échecs d’outils observés, masquage et rendu JSON/Markdown, sans branches ni commits artificiels. Les rapports Git version 1 restent inchangés. Voir [les résultats de fichiers](../workspaces/).

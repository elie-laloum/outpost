---
title: "Rédiger les consignes de l’agent"
description: "Confiez une tâche à un agent avec du texte ou un modèle Markdown."
---

Utilisez la [configuration initiale](../setup/). Enregistrez les deux fichiers ci-dessous ensemble et lancez `node feature.ts` après avoir adapté la demande et la commande de test au projet. Examinez ensuite la réponse et la branche.

## Envoyer du texte ou un fichier

Le `brief` contient les consignes envoyées à l’agent. Utilisez `text` pour une demande écrite dans votre script, ou `file` pour des consignes que vous souhaitez conserver et réutiliser en Markdown.

|                    | Brief texte `{ text }`               | Brief fichier `{ file, values }`                         |
| ------------------ | ------------------------------------ | -------------------------------------------------------- |
| Source             | Une chaîne construite par votre code | Un fichier Markdown rangé à côté de vos scripts          |
| Variables          | Aucune : interpolez dans votre code  | `{{NAME}}` depuis `values`, `WORK_BRANCH`, `BASE_BRANCH` |
| Sortie de commande | Aucune                               | `` !`command` `` remplacé par sa sortie                  |
| Idéal pour         | Demandes générées ou ponctuelles     | Tâches réutilisées par plusieurs scripts                 |

Un brief texte est envoyé tel quel. La suite de la page traite des briefs fichier.

## Utiliser un modèle avec des variables

Écrivez les emplacements sous la forme `{{NAME}}`, avec des lettres, des chiffres et des tirets bas. Outpost lit le fichier et les remplit avant le démarrage de l’agent.

```md title="task.md"
Add {{FEATURE}} to the signup form.

You work on {{WORK_BRANCH}}, created from {{BASE_BRANCH}}.
Run `npm test` and commit your change.
```

```ts title="feature.ts"
import { fileURLToPath } from "node:url";
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/email-validation" },
  brief: {
    file: fileURLToPath(new URL("task.md", import.meta.url)),
    values: { FEATURE: "email validation" },
  },
});
console.log(result.text);
// Example output: Added email validation to the signup form and committed it.
```

Un `file` relatif se résout depuis le répertoire de travail du processus. Construisez le chemin à partir de `import.meta.url` pour lancer le script depuis n’importe où.

Un emplacement sans valeur fait échouer la tâche avec le code d’erreur `prompt` avant le lancement de l’agent. Les valeurs que le fichier n’utilise pas sont signalées à votre fonction de rappel `warn`.

<span id="insérer-la-sortie-dune-commande"></span>

Pour cette étape, suivez [Inclure la sortie d’une commande dans un brief](../prompt-commands/).

## Demander à l’agent, contrôler dans le code

Les consignes indiquent à l’agent ce que vous attendez. Si une condition détermine l’acceptation du travail, vérifiez-la dans le code du workflow.

| Condition            | Demander dans le brief      | Contrôler dans le code                                                                                                            |
| -------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Les tests passent    | « Run `npm test`. »         | Lancez-les vous-même dans une [session de sandbox](../sandbox-sessions/) ou une [boucle de vérification](../verification-loops/). |
| Format de la réponse | « Reply with a JSON list. » | Validez une [réponse typée](../typed-responses/).                                                                                 |
| Fichiers intacts     | « Do not edit `config/`. »  | Inspectez le diff, ou interdisez l’écriture avec les [permissions](../harness-permissions/) du harness intégré.                   |
| Validation humaine   | « Do not merge yet. »       | Arrêtez-vous à une étape d’[approbation](../approvals/).                                                                          |

Fournir une [réponse typée](../typed-responses/) ajoute automatiquement son format de réponse finale après le brief rendu ; les contrats JSON incluent aussi le JSON Schema d’entrée. Vous n’avez pas besoin de placer ses balises dans le brief.

## Limites

- Les briefs texte n’acceptent pas `values` et n’exécutent jamais de commande.
- `WORK_BRANCH` et `BASE_BRANCH` sont réservées : les passer dans `values` est une erreur de configuration.
- `BASE_BRANCH` est vide lorsque votre dépôt a un `HEAD` détaché.
- Une commande ne peut pas contenir d’accent grave (backtick).
- Avec l’[exécution sur l’hôte](../host-process/), les commandes tournent sur votre machine : `sh -c`, ou PowerShell sous Windows.
- Un `{{WORK_BRANCH}}` généré et la sortie des commandes changent d’une exécution à l’autre ; voir [Rejouer sans modèle](../record-replay/).

API : [Brief](../../reference/brief/) · [PromptVariables](../../reference/promptvariables/) · [DispatchOptions](../../reference/dispatchoptions/) · [dispatch](../../reference/dispatch/).

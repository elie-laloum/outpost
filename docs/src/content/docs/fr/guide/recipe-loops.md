---
title: "Composer les étapes d’une boucle"
description: "Enchaîner agents et commandes dans la tentative et la vérification d’une boucle, et décider à partir d’une réponse typée."
---

Une `loop` déclarative répète sa tentative jusqu’à ce que sa vérification accepte le travail, en au plus `maxRounds` tours. Chaque phase est une liste ordonnée d’étapes agent et commande, exécutées dans le workspace configuré. Partez de la [boucle à une étape](../recipe-workflows/#recommencer-jusquà-ce-quune-vérification-passe) et de la configuration du [tutoriel local](../yaml-recipes/).

## Enchaîner les étapes de tentative et de vérification

Cette recette fait travailler un développeur et un rédacteur dans le même workspace, puis lance les tests et un relecteur. Le rôle `reviewer` et la réponse `review` sont déclarés dans la configuration ci-dessous.

```yaml title="recipe.yaml — loop steps"
version: 3
name: reviewed-change
inputs:
  goal: { type: string, description: The change to implement. }
  threshold: { type: number, description: Minimum review score., default: 8 }
tasks:
  - key: change
    loop:
      maxRounds: 4
      attempt:
        - agent: coder
          conversation: continue
          brief: "Implement {{ inputs.goal }} and commit it."
        - agent: documenter
          brief: "Document the changes and commit them."
          followUp: "Document the changes and commit them. Previous check: {{ loop.feedback }}"
      check:
        - command: { executable: npm, arguments: [test] }
        - agent: reviewer
          brief: "Review the changes (git log -p) and score them."
          dispatch:
            deadlineMs: 600000
            response: { $ref: responses.review }
          done:
            all:
              - { gte: [{ $response: [score] }, { $input: threshold }] }
              - { eq: [{ $response: [issues] }, []] }
```

Les étapes de la tentative s’exécutent dans l’ordre et doivent contenir au moins un agent. Les étapes de la vérification s’exécutent aussi dans l’ordre : la première qui refuse termine le tour, et son retour part au tour suivant sans lancer les étapes suivantes. Quand toutes les étapes de vérification acceptent, la boucle est terminée.

Une commande de la tentative qui se termine avec un statut non nul fait échouer la tâche, sans nouveau tour, comme une tâche `command`. Une commande de la vérification accepte sur le statut 0 ; sinon, son statut et les 4 000 derniers caractères de stdout et stderr deviennent le retour.

```yaml title="outpost.yaml — loop agents"
version: 3
workspace:
  kind: git
  repository: ./project
  branch: { mode: named, name: reviewed-change, from: main }
sandbox: { provider: local }
agents:
  coder: { harness: codex, authentication: account }
  documenter: { harness: codex, authentication: account }
  reviewer: { harness: claude, authentication: account }
responses:
  review:
    type: json
    tag: review
    jsonSchema:
      type: object
      properties:
        score: { type: number }
        issues: { type: array, items: { type: string } }
        feedback: { type: string }
      required: [score, issues, feedback]
```

Un objet est le raccourci d’une liste d’une étape : `attempt: { agent: coder, brief: ... }` et `check: { command: ... }` fonctionnent sans changement.

## Envoyer les briefs d’un tour à l’autre

Au tour 1, chaque agent reçoit son `brief`. Les tours suivants dépendent de sa conversation :

| `conversation`     | Tours 2 et suivants                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `new` (par défaut) | Une nouvelle conversation reçoit `followUp`, qui doit redonner toute la tâche, ou à défaut `brief`.     |
| `continue`         | La conversation précédente de l’agent reçoit `followUp`, ou à défaut un message intégré avec le retour. |

Chaque agent de la tentative garde sa propre conversation. Tous les agents de la tentative reçoivent le même retour. Quand plusieurs agents poursuivent leur conversation, donnez un `followUp` à ceux qui ne doivent pas corriger : le message intégré leur demande de traiter le retour.

| Valeur                | Disponible dans                                  | Contenu                                         |
| --------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `{{ loop.round }}`    | Toutes les étapes                                | Numéro du tour, à partir de 1                   |
| `{{ loop.feedback }}` | `brief` et `followUp` des agents de la tentative | Retour du tour refusé ; vide au premier tour    |
| `{{ loop.text }}`     | `brief` des agents de vérification               | Réponse finale du dernier agent de la tentative |

`{{ loop.text }}` vient du dernier agent de la tentative. Placez en dernier l’agent dont la réponse sert au relecteur, ou demandez au relecteur de lire les commits, comme `git log -p` ci-dessus. Les valeurs de boucle sont insérées une seule fois et jamais réinterprétées : une réponse d’agent qui contient `{{ inputs.x }}` reste littérale.

## Décider à partir d’une réponse typée

Un agent de vérification ouvre une nouvelle conversation à chaque tour et ne se souvient pas de ses relectures précédentes. Son verdict dépend de son `response` :

| Déclaration                 | Verdict                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| Sans `response`             | L’agent répond au contrat intégré `{ done, feedback }`.          |
| `response` JSON sans `done` | La réponse doit exiger `done` (booléen) et `feedback` (texte).   |
| `response` JSON avec `done` | La condition décide ; la réponse doit exiger `feedback` (texte). |

`done` utilise le langage des [conditions `when`](../recipe-workflows/#transmettre-paramètres-et-résultats) : `all`, `any`, `not`, `exists` et les comparaisons. `{ $response: [score] }` lit un champ de la réponse typée de l’agent et `[]` lit la réponse entière ; cette référence n’est acceptée que dans `done`. Une condition peut aussi lire les entrées et les tâches déclarées dans `after`, mais pas les valeurs `{{ loop.* }}`.

Quand la condition est fausse, le champ `feedback` de la réponse devient le retour ; un éventuel champ `done` de la réponse est ignoré. Un champ absent, des valeurs incomparables ou un `feedback` absent lors d’un refus font échouer la tâche, comme une exception dans un `check` TypeScript. Rendez obligatoires, dans le schéma de la réponse, les champs que la condition lit. La validation contrôle `properties` et `required` au premier niveau d’un schéma déclaré ; un schéma plus complexe est contrôlé quand l’agent répond. Une réponse texte est refusée.

`$response` est une clé réservée dans les expressions du format 3 : pour écrire un objet littéral qui porte cette clé, entourez-le de `{ $literal: ... }`.

## Configurer la dispatch de chaque agent

Le `dispatch` d’une étape agent accepte les [options de dispatch d’une tâche agent](../../reference/dispatchoptions/), en ligne ou avec `$ref`, sauf `continuation` : la boucle gère les conversations. Une conversation poursuivie ou une réponse typée exige une seule passe ; un agent de vérification en utilise donc toujours une. Les `repairs` d’une réponse personnalisée s’appliquent. `quotaResume` reste sur la tâche de boucle et s’applique à tous ses agents. La tâche de boucle garde `after`, `when`, `timeoutMs`, `options` et `quotaResume`, et refuse `retry`, `gate` et `interaction`.

Ces cas sont refusés avant le premier tour, pour chaque agent concerné : `conversation: continue` sur un agent de repli ou un agent qui ne peut pas reprendre une conversation, et une réponse personnalisée avec `repairs` supérieur à 0 sur un agent, ou un candidat d’agent de repli, qui ne peut pas reprendre sa conversation.

## Lire le résultat

`outputs.change` contient la projection du dernier agent de la tentative (`text`, `conversation`, `value` et les autres champs de la dispatch, sans `usage` ni `turns`), les `commits` de tous les agents de tous les tours et `rounds`. Avec plusieurs agents dans la tentative, `conversations` liste la conversation de chaque agent dans l’ordre, ou `null` quand il n’en a pas rapporté. Les commits faits par une étape commande ne figurent pas dans `commits`.

Quand le dernier tour est refusé, la tâche échoue avec un message qui se termine par son retour. L’échec d’une étape indique la tâche, le tour, la phase, le rang de l’étape et son agent ou sa commande.

## Délais, budgets et masquage

Une commande de vérification qui dépasse son `deadlineMs` refuse le tour, avec la sortie déjà produite. Un agent de vérification dont la dispatch dépasse son `deadlineMs` fait échouer la tâche, comme toute dispatch. `timeoutMs` borne un tour entier et `budget.attempts` compte des tours ; un tour peut donc contenir plusieurs dispatch, voir les [budgets](../budgets/).

La sortie d’une commande de vérification entre non masquée dans le brief suivant et dans le checkpoint. Le message d’échec et l’événement `loop` de chaque tour refusé masquent le retour avec `workflow.redact`, puis en gardent les 1 000 premiers et 1 000 derniers caractères.

## Reprise et pauses de quota

Avec un [checkpoint](../recipe-durability/), un crash pendant la vérification ne refait pas la tentative, mais relance toutes les étapes de vérification. Un crash pendant la tentative rejoue toutes ses étapes, y compris celles qui étaient terminées, après `resume --retry-incomplete` : les commandes s’exécutent de nouveau, et les commits déjà faits restent dans la branche sans apparaître dans `commits`. L’usage des étapes terminées est conservé, et celui du rejeu s’y ajoute.

Une [pause de quota](../quota-pauses/) reprend la phase interrompue. Dans une phase à un seul agent, `quotaResume: continue` poursuit sa conversation comme avant. Dans une phase à plusieurs agents, la pause n’indique pas quel agent s’est arrêté : la phase repart de zéro, chaque agent avec son brief, comme avec `quotaResume: restart`. Les fichiers et les commits déjà produits restent dans le workspace.

## Correspondance avec TypeScript

Une boucle déclarative se compile en [`defineLoopTask()`](../../reference/definelooptask/) ; voir le [guide des boucles TypeScript](../verification-loops/).

| YAML                                | TypeScript                                                        |
| ----------------------------------- | ----------------------------------------------------------------- |
| Étapes de `attempt`                 | Code de `attempt(context, feedback, previous)`                    |
| Étapes de `check`                   | Code de `check(context, result)` qui renvoie un `LoopCheckResult` |
| `followUp` en nouvelle conversation | `feedback === undefined ? premierBrief : briefDeRelance`          |
| Condition `done`                    | Code qui transforme une réponse typée en `{ done, feedback }`     |
| Commande de tentative qui échoue    | Exception levée par `attempt`                                     |

## Limites

- Aucune exécution réelle avec Claude Code ou Codex n’est validée : ces boucles sont testées avec des agents scriptés. Poursuivre une conversation dans une nouvelle sandbox après une reprise n’est validé que hors ligne.
- Après un crash, une phase est rejouée en entier. Après une pause de quota, une phase à plusieurs agents repart de zéro.
- `done` ne lit que la réponse de son propre agent, les entrées et les tâches amont, ni le résultat de la tentative ni celui des autres étapes.
- Un tour peut dépasser un budget de jetons de la consommation de plusieurs agents.
- Les événements ne distinguent pas les étapes d’un même tour, sauf par le nom de l’agent.
- Un agent de repli ou qui ne peut pas reprendre une conversation n’est refusé qu’à la compilation, avant l’allocation ; dans un workspace Git, `recipe validate` ne le détecte pas.

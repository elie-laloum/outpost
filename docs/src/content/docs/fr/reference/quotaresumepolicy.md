---
title: "QuotaResumePolicy"
description: "QuotaResumePolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { QuotaResumePolicy } from "@elie-laloum/outpost/workflows";
```

## Rôle et comportement

Option quotaResume de defineAgentTask() et defineIsolatedTask() : manière dont une tâche reprend après une pause de quota. Valeurs : "continue" (par défaut ; poursuit la conversation capturée avec un brief de reprise quand l’agent est reprenable et que passes vaut 1, et un agent de repli relance le brief sur la branche interrompue), "restart" (exécute le brief d’origine dans une nouvelle conversation).

[Exemple complet et règles détaillées](../../guide/quota-pauses/).

<span id="outpost-instructions"></span>

## Instructions ajoutées par Outpost

Les templates ci-dessous conservent le texte anglais envoyé au modèle. `${…}` désigne les valeurs insérées à l’exécution, pas la syntaxe des variables d’un brief.

La continuation automatique après une pause de quota remplace le brief initial par :

```text
Your previous turn was interrupted by a usage or rate limit before it finished. Continue the same task from where you stopped. Inspect the workspace first: changes that were not committed may be missing.
```

Pour les tâches d’agent ordinaires avec une balise de réponse, cette ligne suit :

```text
Return the final answer inside <${tag}> and </${tag}>.
```

Le dispatch ajoute ensuite les [consignes complètes de format de réponse](../responsespec/#outpost-instructions). Les tâches interactives utilisent le même message de base, suivi de leur [protocole de dialogue](../defineinteractiveagenttask/#outpost-instructions).

Pour les tâches ordinaires, ce remplacement exige `quotaResume: "continue"` (le défaut), une conversation capturée lors du quota, un agent reprenable sans repli, une seule passe et aucune `continuation` explicite dans la requête. Sinon, le brief demandé est conservé. Un agent de repli redémarre avec le brief initial. Les tâches interactives gèrent leur continuation après quota en interne et n’exposent pas `quotaResume`.

Le texte de reprise n’est pas remplaçable. `quotaResume: "restart"` sélectionne la requête initiale au lieu de cette continuation automatique ; il ne modifie pas le message de reprise.

Implémentation : [quota-resume.constants.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/quota-resume.constants.ts) · [quota-resume.ts](https://gitlab.elielaloum.com/elielaloum/outpost/-/blob/main/src/application/quota-resume.ts).

## Signature

```ts
export type QuotaResumePolicy = "continue" | "restart";
```

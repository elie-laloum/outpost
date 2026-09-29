---
title: "Agents de secours"
description: "Confier un dispatch à un autre agent ou modèle quand le premier atteint une limite d’usage ou que son service est indisponible."
---

## Composer un agent de secours

Listez les candidats dans l’ordre où les essayer, et les échecs qui passent la main dans `on`. Ici, Claude Opus s’exécute d’abord, puis Claude Sonnet, puis l’agent Codex de l’[Installation](../setup/).

```ts
import {
  createAgent,
  createClaudeHarness,
  createFallbackAgent,
  dispatch,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const claude = createClaudeHarness({ authentication: "account" });
const agent = createFallbackAgent(
  [
    createAgent({ harness: claude, model: "opus" }),
    createAgent({ harness: claude, model: "sonnet" }),
    coder,
  ],
  { on: ["quota", "unavailable"] },
);

const result = await dispatch({
  repository,
  sandboxProvider,
  agent,
  brief: { text: "Fix the failing tests." },
});
console.log(result.fallback?.selected.name);
```

Un agent de secours s’utilise partout où un agent est accepté, y compris `createSandbox()`, les tâches d’agent et les [candidats concurrents](../speculation/). Chaque candidat garde sa propre [authentification](../authentication/) : un abonnement peut ainsi se replier sur une clé d’API.

## Choisir quand passer la main

`on` est obligatoire et nomme une catégorie ou les deux.

| Valeur de `on` | Passe la main quand le tour échoue sur                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `quota`        | Une limite d’usage ou de débit : `OutpostError` de code `quota`, classée comme dans [Pauses sur quota](../quota-pauses/). |
| `unavailable`  | Une panne du service : surcharge, HTTP 408, 5xx ou 529, ou échec de connexion ou de transport.                            |

Tout autre échec, y compris une annulation ou un délai dépassé, est relancé immédiatement. Une panne garde son code (`process` ou `provider`) ; détectez-la avec `unavailableFault(error)`.

## Ce que voit le candidat suivant

<!-- features -->

- **Même workspace** : Les fichiers et commits laissés par le candidat en échec restent en place ; rien n’est réinitialisé.
- **Brief d’origine** : Il démarre une nouvelle conversation à partir du brief ; la conversation en échec reste capturée pour la [récupération](../recovery/).
- **Préparation à la demande** : Il n’est préparé et authentifié que lorsque son tour arrive.

:::note
Le candidat suivant n’est pas informé du travail partiel. Si cela compte, précisez dans le brief que le workspace peut déjà contenir des changements.
:::

## Savoir quel candidat a répondu

Un dispatch par un agent de secours renvoie `result.fallback` :

| Champ      | Contenu                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------- |
| `selected` | `index`, `name` et `model` du candidat qui a produit le résultat.                            |
| `attempts` | Candidats arrêtés avant lui, chacun avec `failure`, `message` et, le cas échéant, `resetAt`. |

Chaque passage de relais émet un [événement d’agent](../progress/) `fallback` avec `from`, `to`, `failure` et `message`. `result.usage` et les [budgets](../budgets/) de workflow incluent les tokens des candidats en échec. `resume()` et `fork()` sur le résultat continuent avec le candidat retenu.

## Quand tous les candidats échouent

La dernière erreur est relancée, et `recoveryDetails(error).fallback` liste les candidats arrêtés. S’ils ont tous atteint une limite, l’erreur a le code `quota` et porte la réinitialisation la plus proche, à condition que chaque candidat en ait indiqué une.

Avec [`onQuota`](../quota-pauses/), le workflow se met en pause jusqu’à cette réinitialisation. La tentative reprise repart du premier candidat, avec le brief d’origine :

| Tâche                                 | Tentative reprise                                                           |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `defineAgentTask`                     | S’exécute dans la sandbox de la tâche, sur le travail déjà présent.         |
| `defineIsolatedTask` avec intégration | Repart de la branche interrompue ; `quotaResume: "restart"` repart de zéro. |

Parmi des [candidats concurrents](../speculation/), un agent de secours prend le statut `quota` quand l’erreur qui termine sa liste est une limite.

## Limites

- Seuls les messages de limite et de panne reconnus passent la main. Un avis de nouvelle tentative, affiché par la CLI pendant qu’elle réessaie, ne compte pas.
- Chaque candidat doit prendre en charge les options du dispatch, comme le pilotage ou les réparations de réponse ; c’est vérifié avant le démarrage du premier.
- Dans un conteneur ou sur l’hôte, la CLI de chaque candidat doit déjà être installée. Seules les [sandboxes cloud](../cloud-sandboxes/) installent une CLI manquante quand le candidat est essayé.
- Une conversation appartient à un seul agent : un agent de secours refuse une `continuation` explicite et `attach()`.
- Un [rejeu](../record-replay/) reproduit un passage de relais enregistré, mais ne renvoie pas `result.fallback`.

API : [createFallbackAgent](../../reference/createfallbackagent/) · [FallbackAgentOptions](../../reference/fallbackagentoptions/) · [FallbackRecord](../../reference/fallbackrecord/) · [unavailableFault](../../reference/unavailablefault/) · [recoveryDetails](../../reference/recoverydetails/)

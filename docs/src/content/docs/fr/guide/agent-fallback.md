---
title: "Agents de secours"
description: "Confier un dispatch à un autre agent ou modèle quand le premier atteint une limite ou que son service est indisponible."
---

Implémenté, pas encore publié. `createFallbackAgent()` prend une liste ordonnée d’agents. Quand un candidat échoue pour une raison listée dans `on`, le suivant prend le relais dans le même sandbox et le même workspace.

```ts
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
  createSandbox,
  createFallbackAgent,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const coder = createFallbackAgent(
  [
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
      model: "opus",
    }),
    createAgent({
      harness: createClaudeHarness({ authentication: "account" }),
      model: "sonnet",
    }),
    createAgent({ harness: createCodexHarness({ authentication: "usage" }) }),
  ],
  { on: ["quota", "unavailable"] },
);

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const result = await sandbox.dispatch({
  brief: { text: "Fix the failing tests." },
});
console.log(result.fallback?.selected, result.fallback?.attempts);
```

Un modèle de secours est le même harness avec un autre `model` ; un agent de secours est un autre harness. Chaque candidat garde sa propre authentification : l’exemple peut utiliser d’abord un abonnement Claude, puis se replier sur l’API Codex, facturée à l’usage.

## Quand le candidat suivant prend le relais

`on` est obligatoire ; listez les catégories explicitement :

| Catégorie     | Échecs reconnus                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quota`       | Une limite d’usage ou de débit, classée comme pour les [pauses sur quota](../quota-pauses/#ce-qui-compte-comme-quota) : `OutpostError` de code `quota`.       |
| `unavailable` | Une panne terminale signalée par un tour en échec : surcharge, HTTP 408/5xx/529, échec de connexion ou de transport. Lisez-la avec `unavailableFault(error)`. |

Seul un tour en échec portant l’un de ces signaux passe la main. Tout le reste est relancé immédiatement : annulation, délais, erreurs de configuration et d’authentification, réponses invalides et plantages. Les avis de nouvelle tentative qu’une CLI affiche pendant qu’elle réessaie encore sont ignorés. Une panne conserve son code d’origine (`process` ou `provider`) ; `unavailableFault()` lit le marqueur à travers les causes imbriquées.

## Ce que voit le candidat suivant

- **Même workspace.** Les fichiers et commits laissés par le candidat en échec restent en place. Rien n’est réinitialisé ni supprimé.
- **Brief d’origine.** Les conversations ne sont pas portables d’un agent à l’autre : le candidat suivant démarre une nouvelle conversation à partir du brief d’origine. Son prompt ne décrit pas le travail partiel ; indiquez dans le brief que le workspace peut déjà contenir des changements si cela compte.
- **Préparation à la demande.** Un candidat n’est bootstrappé et authentifié que lorsqu’il est essayé. Sa CLI doit exister dans l’image du sandbox et ses identifiants doivent être déclarés. Tous les candidats sont validés avant le démarrage du premier.
- **Historique capturé.** Les conversations des candidats en échec sont toujours capturées pour la [récupération](../failure-recovery/).

## Résultats, événements et usage

`result.fallback` indique le candidat qui a produit le résultat et pourquoi les candidats précédents se sont arrêtés :

```ts
import type { FallbackRecord } from "@elie-laloum/outpost";

function describe(fallback: FallbackRecord | undefined) {
  if (!fallback) return "single agent";
  const tried = fallback.attempts.map(
    (attempt) => `${attempt.name}: ${attempt.failure}`,
  );
  return `${fallback.selected.name} after ${tried.join(", ")}`;
}
```

Chaque passage de relais émet un [événement d’agent](../live-events/) `fallback` avec `from`, `to`, `failure` et `message`, que les journaux enregistrent. Les numéros de passe continuent d’un candidat à l’autre. `result.usage` et les budgets de workflow incluent les tokens signalés par les candidats en échec.

`resume()` et `fork()` continuent avec le candidat retenu. Passer un agent de secours avec une `continuation` explicite, ou à `attach()`, est refusé : une conversation appartient à un seul agent.

## Quand tous les candidats échouent

La dernière erreur est relancée, avec les candidats arrêtés dans `recoveryDetails(error).fallback`. Quand tous les candidats ont atteint une limite, l’erreur a le code `quota` et sa réinitialisation est la plus proche, fournie seulement si chaque candidat en a indiqué une.

Avec [`onQuota`](../quota-pauses/), le workflow se met alors en pause jusqu’à cette réinitialisation. La tentative reprise repart du premier candidat, avec le brief d’origine au lieu d’une continuation de conversation : `defineAgentTask` réutilise son sandbox, et un `defineIsolatedTask` intégré automatiquement repart de la branche interrompue. `quotaResume: "restart"` repart de zéro. Dans une [course spéculative](../candidate-selection/), un candidat ne prend le statut `quota` que lorsque tous ses secours ont atteint une limite.

## Limites

Les motifs de panne et de limite proviennent de formats CLI et fournisseurs enregistrés ; un message non reconnu ne déclenche pas de repli. Un [rejeu](../record-replay/) reproduit un passage de relais enregistré, sans `result.fallback`. Le comportement est couvert par des tests déterministes avec des agents simulés, pas par des campagnes réelles sur des comptes épuisés.

API : [createFallbackAgent](../../reference/createfallbackagent/) · [FallbackAgentOptions](../../reference/fallbackagentoptions/) · [FallbackRecord](../../reference/fallbackrecord/) · [unavailableFault](../../reference/unavailablefault/).

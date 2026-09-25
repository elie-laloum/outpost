---
title: "Capture, reprise et fork"
description: "Capture, reprise et fork — Outpost"
sidebar:
  order: 9
---

La capture native des conversations est active par défaut pour Claude Code et Codex. [Gemini](../../../agents/gemini/) ne prend en charge ni capture native, ni reprise, ni fork dans Outpost. Le transcript est copié dans le stockage de l’agent sur l’hôte ; ses chemins de travail sont réécrits pour permettre une reprise native dans le bon dépôt.

```ts
import { agent as composeAgent, dispatch, codex } from "@elie-laloum/outpost";

const first = await dispatch({
  agent: composeAgent({ harness: codex.harness({}) }),
  brief: { text: "Examine le code de validation." },
});
await first.resume({ brief: { text: "Ajoute maintenant des tests ciblés." } });
await first.fork({
  brief: { text: "Explore une autre implémentation." },
  branch: { mode: "named", name: "experiment/alternative" },
});
```

## Choisir la continuation

- `resume`/`fork` sur un résultat ponctuel accepte un nouveau provider, une branche et des hooks.
- Le résultat d’une sandbox active garde sa configuration et accepte uniquement les options de dispatch.
- `sandbox.resume(id, options)` et `sandbox.fork(id, options)` utilisent une conversation connue.
- `continuation: { id, fork: true }` exprime directement un fork dans un dispatch ou un attachement.

Les continuations exigent une seule passe. Le dispatch ponctuel vérifie le transcript local avant d’allouer un environnement. Une sandbox active réutilise une session présente ou la restaure depuis l’hôte. Le fork crée une nouvelle identité de conversation ; utilisez un autre workspace ou une autre branche pour isoler aussi les fichiers.

## Stockage et échecs de capture

`conversationHome` est le répertoire hôte contenant `.claude` ou `.codex`, égal au home du système par défaut. `saveConversations: false` sur l’adapter désactive la capture automatique. Sans transcript capturé ou restaurable, une reprise dans un nouvel environnement peut échouer.

L’échec de capture du transcript principal fait échouer le dispatch. La capture des transcripts enfants de Claude reste facultative et avertit en cas d’échec. Les transcripts peuvent contenir prompts, sorties et sources privés.

L’utilitaire [conversations](../../../../reference/conversations/) expose `native`, `locate`, `capture`, `restore`, `rewrite`, `projectKey`, `claudePath`, `directory` et `destination`. Consultez [les stores personnalisés](../../../extend/conversations/) avant de fournir un autre stockage.

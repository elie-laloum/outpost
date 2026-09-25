---
title: "Exécution explicite sur l’hôte"
description: "Exécution explicite sur l’hôte — Outpost"
sidebar:
  order: 3
---

`localSandboxProvider()` exécute les commandes directement avec votre compte système. Il convient à l’automatisation locale de confiance ou aux tests de contrat sans moteur de containers.

```ts
import {
  agent as composeAgent,
  dispatch,
  codexHarness,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

await dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  sandboxProvider: localSandboxProvider({
    variables: { PROJECT_MODE: "test" },
  }),
  branch: { mode: "named", name: "local/inspection" },
  brief: { text: "Examine le dépôt et résume tes observations." },
});
```

Installez et authentifiez d’abord le CLI sur l’hôte. `localSandboxProvider()` accepte les `variables` du provider ; il ne construit pas d’image et ne crée aucun service externe. Les commandes utilisent le répertoire du workspace par défaut. Environnement et accès aux fichiers suivent votre compte système.

Les branches et worktrees séparent toujours le travail Git, mais ne restreignent pas l’accès aux autres fichiers. `elevated` n’accorde jamais d’élévation de privilèges sur l’hôte. L’attachement natif est disponible ; les transferts copient les fichiers et répertoires localement.

Outpost ne choisit pas automatiquement l’exécution locale en cas d’échec d’un autre provider. Sélectionnez-la explicitement et considérez les commandes de l’agent comme des commandes lancées avec votre propre compte.

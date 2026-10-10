---
title: "Ouvrir un terminal interactif d’agent"
description: "Travaillez avec la CLI native dans une sandbox ouverte."
---

Partez de [Réutiliser une sandbox](../sandbox-sessions/) et de sa configuration. Travaillez avec la CLI native dans une sandbox ouverte.

## Ouvrir un terminal interactif

`sandbox.attach()` lance la CLI de l’agent dans votre terminal, à l’intérieur de la sandbox. Vous travaillez avec elle à la main ; l’appel résout quand vous quittez, avec `status` et les `commits` créés pendant la session.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
});
const session = await sandbox.attach({
  brief: { text: "Walk me through the payment module." },
});
console.log(session.status, session.commits);
// Example output: 0 []
```

Lancez-le depuis un vrai terminal. `continuation` rouvre une conversation capturée. La fonction [`attach()`](../../reference/attach/) de premier niveau ouvre et ferme sa propre sandbox, et applique la politique de branche quand la session sort avec le statut 0.

| Fournisseur          | `attach()`     |
| -------------------- | -------------- |
| Docker, Podman, hôte | Pris en charge |
| Daytona              | Pris en charge |
| Vercel, Firecracker  | Rejeté         |

`attach()` exige un agent CLI comme Codex ou Claude Code. Le [harness intégré](../harness/), les [agents de secours](../fallback-agents/) et les [agents de rejeu](../record-replay/) sont rejetés.

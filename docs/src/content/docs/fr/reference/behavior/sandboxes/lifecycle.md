---
title: "Sandboxes réutilisables"
description: "Sandboxes réutilisables — Outpost"
sidebar:
  order: 1
---

Gardez une sandbox active lorsque plusieurs tâches successives ont besoin du même environnement. L’allocation, l’installation et les hooks de préparation ne s’exécutent qu’une fois pour cette sandbox.

```ts
import { createSandbox, codex, claude } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({
  agent: codex(),
  branch: { mode: "named", name: "feature/validation" },
});
const implementation = await sandbox.dispatch({
  brief: { text: "Implémente la validation et crée un commit." },
});
await sandbox.dispatch({
  agent: claude(),
  brief: { text: "Relis le code, lance les tests et commite les corrections." },
});
console.log(implementation.commits, sandbox.workspace.branch);
```

Docker est le provider par défaut. L’option `provider` sélectionne un autre backend. L’agent par défaut est facultatif : fournissez un adapter à chaque `dispatch` ou `attach`. Chaque tâche reçoit les variables de son adapter, y compris lorsque vous changez d’agent.

## Fermeture et annulation

`await using` ferme la sandbox à la sortie de la portée, même en cas d’erreur. Pour une gestion explicite, appelez `await sandbox.close()` dans `finally`. `close({ preserve: true })` conserve le workspace possédé. La fermeture attend le travail actif et effectue le nettoyage ; les opérations concurrentes sont refusées, pas mises en file.

Le `signal` de `createSandbox` contrôle l’allocation. Transmettez un signal à chaque opération suivante pour l’annuler. Un délai dépassé ou l’annulation d’un dispatch ne détruit pas à lui seul une sandbox réutilisable. La page [délais et annulation](../../../../guide/agents/cancellation/) distingue les limites.

`sandbox.root` désigne le répertoire de travail dans l’environnement d’exécution. `sandbox.workspace.directory` désigne son répertoire Git sur l’hôte. Ils diffèrent avec les containers et les providers distants.

Pour un workspace d’intégration, appelez explicitement `sandbox.workspace.integrate()` lorsque le travail doit rejoindre la branche de l’hôte. Relisez et commitez d’abord les changements souhaités. Le [guide des workspaces](../../../../guide/environment/workspaces/) décrit la propriété séparée.

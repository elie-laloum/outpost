---
title: "Workspaces indépendants"
description: "Workspaces indépendants — Outpost"
sidebar:
  order: 2
---

Créez le workspace séparément lorsqu’il doit survivre aux sandboxes individuelles. Il possède la branche, le worktree, les fichiers copiés et le verrou Git.

```ts
import {
  agent as composeAgent,
  openWorkspace,
  codexHarness,
  claudeHarness,
} from "@elie-laloum/outpost";

await using workspace = await openWorkspace({
  branch: { mode: "named", name: "feature/shared" },
  copies: [".env.test"],
  label: "validation",
});
await workspace.dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Implémente la fonctionnalité et crée un commit." },
});
await workspace.dispatch({
  agent: composeAgent({ harness: claudeHarness({}) }),
  brief: { text: "Relis les changements et commite les corrections." },
});
```

`workspace.dispatch()` crée et ferme sa sandbox tout en gardant le workspace ouvert. `workspace.sandbox()` retourne un environnement réutilisable. `workspace.attach()` ouvre une session native dans le terminal. `workspace.integrate()` applique les commits d’un workspace d’intégration à la branche de l’hôte.

## Configuration

`repository` utilise le répertoire courant par défaut et accepte un sous-répertoire du dépôt. `copies` liste les entrées relatives au dépôt à copier avant les hooks. Utilisez-le pour la configuration ignorée dont un nouveau worktree a besoin. Ne copiez pas un identifiant uniquement parce qu’il existe sur l’hôte.

`label` nomme les branches et répertoires générés. `hooks.workspaceReady` s’exécute à l’ouverture ; les autres hooks sont transmis aux sandboxes suivantes. `limits` configure les délais Git et de copie. Voir [les hooks](../../../environment/hooks/) et [WorkspaceOptions](../../../../reference/workspaceoptions/).

Passer `workspace` à `createSandbox` ou `dispatch` exclut `repository`, `branch` et `copies` dans cet appel : ces choix appartiennent déjà au workspace. Une seule sandbox peut l’utiliser à la fois. Fermez-la avant de fermer le workspace.

Les propriétés `repository`, `directory`, `branch`, `baseBranch`, `baseline`, `gitDirectories` et `policy` identifient l’emplacement du travail et sa révision de départ. Elles ne garantissent pas que les fichiers existent encore après fermeture.

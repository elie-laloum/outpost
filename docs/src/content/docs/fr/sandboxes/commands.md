---
title: "Commandes et sessions terminal"
description: "Commandes et sessions terminal — Outpost"
sidebar:
  order: 4
---

`sandbox.command()` exécute un programme et retourne son statut et sa sortie capturée. Un statut non nul est retourné ; il n’est pas levé comme un échec d’agent.

```ts
import { createSandbox, codex } from "@elie-laloum/outpost";

await using sandbox = await createSandbox({ agent: codex() });
const result = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  variables: { CI: "true" },
  deadlineMs: 120_000,
  retain: 65_536,
  observe: (channel, text) => process.stdout.write(`${channel}: ${text}`),
});
console.log(result.status, result.stdout, result.stderr);
```

Les arguments sont transmis directement ; les substitutions nécessitent un shell explicite comme `sh -c`. `directory` utilise le répertoire de la sandbox par défaut. `stdin` fournit du texte. `retain` limite la fin conservée de chaque flux ; `observe` reçoit toute la sortie. `signal` annule la commande. `elevated` demande une élévation prise en charge par le provider ; l’adapter local n’élève jamais les privilèges.

## Ouvrir une session interactive

```ts
import { attach, claude } from "@elie-laloum/outpost";

const session = await attach({
  agent: claude(),
  branch: { mode: "named", name: "feature/interactive" },
  brief: { text: "Aide-moi à relire cette branche." },
});
console.log(session.status, session.commits);
```

Utilisez `sandbox.attach()` pour garder l’environnement ensuite. `continuation: { id, fork? }` ouvre une conversation native. Les briefs en fichier peuvent demander les variables manquantes dans le terminal ou via `ask(name)` asynchrone. Les valeurs fournies sont conservées.

Docker, Podman, Daytona et l’exécution locale prennent en charge l’attachement ; Vercel le refuse explicitement. Daytona utilise un PTY natif avec stdout/stderr fusionnés, transmission des octets et du redimensionnement. Ses dimensions par défaut sont de 80 colonnes et 24 lignes lorsque le flux de sortie ne fournit pas de dimensions. `terminal: { input, output, error }` permet de fournir les flux. Le mode brut et la visibilité du curseur sont restaurés à la sortie. Le résultat contient statut, sortie, commits, branche, répertoire et informations de fermeture disponibles.

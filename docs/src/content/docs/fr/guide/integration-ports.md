---
title: "Ports d’intégration"
description: "Six contrats branchent dans Outpost une autre CLI d’agent, une sandbox, une API de modèle, un stockage ou une file. Vous en implémentez un ; Outpost continue de gérer tout le reste."
---

## Choisir le port

Chaque port porte une seule responsabilité. Implémentez celui qui correspond à ce que vous voulez brancher.

<!-- features -->

- [Ajouter un agent CLI](../custom-agents/): Construire la commande qui lance la CLI et décoder ses lignes de sortie.
  - `CliHarness`
  - `AgentAdapter`
- [Formats de conversation natifs](../conversation-formats/): Trouver, capturer et restaurer les transcriptions qu’écrit une CLI.
  - `ConversationStore`
- [Ajouter un provider de sandbox](../custom-sandbox-providers/): Allouer un environnement, exécuter des commandes, transférer des fichiers, le libérer.
  - `SandboxProvider`
  - `SandboxLease`
- [Fournisseurs de modèles](../model-providers/): Envoyer les requêtes du harness intégré à une API de modèle.
  - `ModelProvider`
- [Où vivent les données](../storage/): Lire, lister et écrire sous condition des octets versionnés pour chaque stockage durable.
  - `Transport`
- [Files de jobs](../job-queues/): Conserver les jobs, protéger les baux des workers et garder leurs résultats.
  - `TaskQueue`

## Remplacer un port, garder les autres

Les ports s’ignorent. Un adaptateur se contente de construire une commande et de lire des lignes ; n’importe quelle sandbox l’exécute. Un provider exécute des commandes sans savoir quel agent les envoie.

```ts
import { createAgent, dispatch, type AgentAdapter } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

const mycli: AgentAdapter = {
  name: "mycli",
  request: ({ text }) => ({
    executable: "mycli",
    arguments: ["--json"],
    stdin: text ?? "",
  }),
  events: (line) => [{ kind: "text", text: line }],
};

await dispatch({
  agent: createAgent({ harness: { kind: "cli", bind: () => mycli } }),
  sandboxProvider,
  repository,
  brief: { text: "Summarize the README." },
});
```

Passer cet agent sur votre propre sandbox ne change que `sandboxProvider`. Stocker les checkpoints dans votre propre backend ne change que le `transporter` des stockages.

## Ce qu’Outpost continue de faire

Votre implémentation reste courte, car le runtime qui l’entoure ne change pas.

<!-- features -->

- **Supervision des processus**: Attend le code de sortie, borne la sortie et arrête les agents inactifs.
- **Annulation**: Transmet signaux et échéances aux commandes, aux transferts et aux requêtes de modèle.
- **Reprises et réparations**: Reprises de tâche, réparations des réponses typées, [pauses de quota](../quota-pauses/) et [agents de secours](../fallback-agents/).
- **Observation**: Transmet les événements décodés aux observateurs et aux journaux, et cumule les tokens consommés.
- **Workspace et Git**: Worktrees, verrous de branche, intégration et synchronisation vers l’hôte.
- **Home de l’agent**: Installe les plans d’identifiants et de configuration de l’adaptateur dans le home privé de la sandbox.

## Valider une intégration

Testez ce qu’un utilisateur observe quand les choses tournent mal : un code de sortie non nul, une sortie fermée avant la fin du processus, une exécution annulée ou expirée, une libération appelée deux fois. Vérifiez qui possède chaque ressource et que les fichiers temporaires disparaissent en cas de succès, d’échec et d’annulation.

Pour un provider de sandbox, `diagnose()` lance une sonde bornée contre une vraie sandbox : Node.js, Git, flux de sortie séparés, code de sortie non nul, répertoire home et, avec `transfers`, transferts de fichiers binaires.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({ sandboxProvider, repository });
const report = await sandbox.diagnose({ transfers: true });
console.log(report.hasFailures, report.checks);
```

:::caution
Des tests simulés prouvent le protocole, pas l’environnement. Montages, tmpfs, terminaux et isolation réseau exigent un test contre le vrai moteur.
:::

## Livrer les SDK optionnels à part

Chargez un SDK tiers uniquement depuis le point d’entrée de votre intégration, et déclarez-le comme dépendance pair optionnelle. Outpost fait de même : `@elie-laloum/outpost/providers/vercel`, `/transports/s3` et `/queues/bullmq` chargent leur SDK, l’import principal non.

Pour ajouter à Outpost lui-même un agent ou un provider intégré, suivez `AGENTS.md` dans le [dépôt](https://gitlab.elielaloum.com/elielaloum/outpost).

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [ConversationStore](../../reference/conversationstore/) · [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [ModelProvider](../../reference/modelprovider/) · [Transport](../../reference/transport/) · [TaskQueue](../../reference/taskqueue/) · [diagnoseSandbox](../../reference/diagnosesandbox/).

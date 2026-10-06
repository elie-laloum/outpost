---
title: "Étendre Outpost"
description: "Trouvez le contrat à implémenter pour ajouter un agent, une sandbox, un service de modèle, un stockage ou une file."
---

## Choisir le contrat à implémenter

Choisissez le contrat qui correspond à l’intégration souhaitée. Chaque contrat a une responsabilité précise : vous pouvez ajouter un adaptateur d’agent, un fournisseur de sandbox ou un transport de stockage sans remplacer le reste d’Outpost.

<!-- features -->

- [Ajouter un agent CLI](../custom-agents/): Construire la commande qui lance la CLI et décoder ses lignes de sortie.
- [Formats de conversation natifs](../conversation-formats/): Trouver, capturer et restaurer les transcriptions qu’écrit une CLI.
- [Ajouter un fournisseur de sandbox](../custom-sandbox-providers/): Allouer un environnement, exécuter des commandes, transférer des fichiers, le libérer.
- [Fournisseurs de modèles](../model-providers/): Envoyer les requêtes du harness intégré à une API de modèle.
- [Où vivent les données](../storage/): Lire, lister et écrire sous condition des octets versionnés pour chaque stockage durable.
- [Files de jobs](../job-queues/): Conserver les jobs, protéger les baux des workers et garder leurs résultats.

## Remplacer une intégration

L’adaptateur d’agent décrit la commande à lancer et interprète sa sortie. Le fournisseur de sandbox exécute cette commande. En séparant ces responsabilités, le même adaptateur peut fonctionner avec différents fournisseurs.

```ts
import { createAgent, dispatch, type AgentAdapter } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

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

Passer cet agent sur votre propre sandbox ne change que `sandboxProvider`. Stocker les checkpoints dans votre propre système de stockage ne change que le `transporter` des stockages.

## Ce qu’Outpost continue de faire

Outpost continue de gérer le cycle d’exécution autour de votre intégration. Votre adaptateur ou fournisseur implémente son contrat, tandis que l’application prend en charge les opérations suivantes.

<!-- features -->

- **Supervision des processus**: Attend le code de sortie, borne la sortie et arrête les agents inactifs.
- **Annulation**: Transmet signaux et échéances aux commandes, aux transferts et aux requêtes de modèle.
- **Reprises et réparations**: Reprises de tâche, réparations des réponses typées, [pauses de quota](../quota-pauses/) et [agents de secours](../fallback-agents/).
- **Observation**: Transmet les événements décodés aux observateurs et aux journaux, et cumule les tokens consommés.
- **Workspace et Git**: Worktrees, verrous de branche, intégration et synchronisation vers l’hôte.
- **Répertoire personnel de l’agent**: Installe les plans d’identifiants et de configuration de l’adaptateur dans le répertoire personnel privé de la sandbox.

## Valider une intégration

Testez ce qu’un utilisateur observe quand les choses tournent mal : un code de sortie non nul, une sortie fermée avant la fin du processus, une exécution annulée ou expirée, une libération appelée deux fois. Vérifiez qui possède chaque ressource et que les fichiers temporaires disparaissent en cas de succès, d’échec et d’annulation.

Pour un fournisseur de sandbox, `diagnose()` lance une sonde limitée contre une vraie sandbox : Node.js, Git, flux de sortie séparés, code de sortie non nul, répertoire personnel et, avec `transfers`, transferts de fichiers binaires.

```ts
import { reportValue } from "./reporter.ts";
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ sandboxProvider, repository });
const report = await sandbox.diagnose({ transfers: true });
reportValue(report.hasFailures, report.checks);
// Example output: false [ { id: "sandbox.node", status: "pass", … }, … ]
```

:::caution
Des tests simulés prouvent le protocole, pas l’environnement. Montages, tmpfs, terminaux et isolation réseau exigent un test contre le vrai moteur.
:::

## Isoler les dépendances facultatives

Chargez un SDK tiers uniquement depuis le point d’entrée de votre intégration, et déclarez-le comme dépendance pair optionnelle. Outpost fait de même : `@elie-laloum/outpost/providers/vercel`, `/transports/s3` et `/queues/bullmq` chargent leur SDK, l’import principal non.

Pour ajouter à Outpost lui-même un agent ou un fournisseur intégré, suivez `AGENTS.md` dans le [dépôt](https://gitlab.elielaloum.com/elielaloum/outpost).

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [ConversationStore](../../reference/conversationstore/) · [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [ModelProvider](../../reference/modelprovider/) · [Transport](../../reference/transport/) · [TaskQueue](../../reference/taskqueue/) · [diagnoseSandbox](../../reference/diagnosesandbox/).

## Connecter des services de décision

[`DecisionProvider`](../../reference/decisionprovider/) évalue des questions typées sur un état JSON sans perte. Il est indépendant de `ModelProvider` et n’alloue aucune sandbox. Utilisez l’adapter HTTP System One commun à Jev et aux endpoints Laya compatibles, ou implémentez une requête annulable renvoyant les réponses natives et l’usage disponible. Voir les [décisions typées](../decisions/) et le [routage par étape](../model-routing/).

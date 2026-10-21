---
title: "Utiliser les hooks natifs des CLI"
description: "Exécuter votre code au démarrage, à l’appel d’un outil ou à la fin d’une CLI."
---

Branchez un callback sur votre CLI pour observer ou contrôler ses actions. Partez d’un [agent configuré](../choose-an-agent/). La [boucle Outpost](../harness-hooks/) possède ses propres hooks.

## Refuser un appel d’outil

Ce hook Claude refuse les appels à `Bash` et demande à l’agent d’utiliser les outils de lecture. Passez `harness` à `createAgent({ harness })`, puis [exécutez l’agent](../first-request/).

```ts title="native-hooks.ts"
import {
  createClaudeHarness,
  defineClaudeHook,
} from "@elie-laloum/outpost/core";

export const harness = createClaudeHarness({
  authentication: "account",
  hooks: [
    defineClaudeHook({
      on: "PreToolUse",
      matcher: "Bash",
      run() {
        return {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "Use file-reading tools for this task.",
          },
        };
      },
    }),
  ],
});
```

Le callback s’exécute sur l’hôte. Il reçoit l’`event` natif, un `sandbox` emprunté et un `signal` d’annulation. Sans retour, l’action continue ; une décision applique les règles propres à la CLI.

## Inventaire des événements natifs

Chaque CLI possède sa fabrique, ses noms d’événements et ses décisions. L’API répertorie les 85 événements exposés et renvoie à leur documentation native.

| CLI         | Déclarer un hook                                                | Événements disponibles                                        |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Claude Code | [defineClaudeHook](../../reference/defineclaudehook/)           | [ClaudeHookPhase](../../reference/claudehookphase/)           |
| Codex       | [defineCodexHook](../../reference/definecodexhook/)             | [CodexHookPhase](../../reference/codexhookphase/)             |
| Copilot CLI | [defineCopilotHook](../../reference/definecopilothook/)         | [CopilotHookPhase](../../reference/copilothookphase/)         |
| Kimi Code   | [defineKimiHook](../../reference/definekimihook/)               | [KimiHookPhase](../../reference/kimihookphase/)               |
| Antigravity | [defineAntigravityHook](../../reference/defineantigravityhook/) | [AntigravityHookPhase](../../reference/antigravityhookphase/) |

## Exécution et configuration

- Les callbacks nécessitent Node.js et un sandbox avec `liveInput`. Une décision invalide ou une erreur du callback fait échouer le tour. Respectez `signal` pour les opérations hôte.
- Pour un script existant, remplacez `run` par `command: { executable: "node", arguments: ["scripts/check-hook.mjs"] }`. Il reçoit le JSON natif sur stdin et suit les règles de sortie de la CLI.
- Outpost installe puis retire ses déclarations autour de chaque processus CLI. L’ordre et les filtres restent natifs ; les hooks existants sont conservés.

:::note
Disponible depuis Outpost 11.2.0. Le déclenchement des événements dépend de la version des CLI et reste à valider en conditions réelles pour les cinq CLI et les fournisseurs distants. Les hooks ne remplacent ni les [permissions](../agent-profiles/), ni l’isolation du sandbox.
:::

Pour partager ces hooks, déclarez-les dans [`defineAgentProfile({ hooks })`](../agent-profiles/#partager-les-hooks). Le harness sélectionne sa section du profil avant d’ajouter ses hooks locaux.

## Exécuter l’exemple

Après compilation du package, lancez `node examples/74-lifecycle-hooks/index.ts claude` depuis le dépôt. L’[exemple complet](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/74-lifecycle-hooks) couvre les cinq CLI et précise le compte et l’image Docker nécessaires.

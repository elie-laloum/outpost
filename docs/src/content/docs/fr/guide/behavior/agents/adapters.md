---
title: "Harness des CLI d’agents"
description: "Harness Claude Code, Codex, Antigravity, Copilot et Kimi — Outpost"
sidebar:
  order: 2
---

Un harness CLI configure le CLI natif d’un agent : `claudeHarness()`, `codexHarness()`, `antigravityHarness()`, `copilotHarness()` ou `kimiHarness()`. Il est indépendant du provider de sandbox et réutilisable entre les appels. Le moteur intégré [`harness()`](../../../agents/harness/) exécute au contraire la boucle du modèle dans Outpost.

```ts
import {
  agent as composeAgent,
  claudeHarness,
  codexHarness,
  agentVersions,
} from "@elie-laloum/outpost";

const reviewer = composeAgent({
  harness: claudeHarness({ permissions: "acceptEdits" }),
  model: { name: "sonnet", reasoning: "high", maxOutputTokens: 32_000 },
});
const implementer = composeAgent({
  harness: codexHarness({ approvalReviewer: "auto_review" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
console.log(reviewer.name, implementer.name, agentVersions);
```

Le modèle appartient à `agent()`, pas au harness. Passez un nom, ou un objet avec `name`, `reasoning` et `maxOutputTokens` :

| Champ du modèle   | Claude Code                                          | Codex                                                              | Antigravity, Copilot, Kimi |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------- |
| `name`            | `--model`                                            | `--model`                                                          | `--model`                  |
| `reasoning`       | `--effort` : `low`, `medium`, `high`, `xhigh`, `max` | `model_reasoning_effort` : `low`, `medium`, `high`, `xhigh`, `max` | Refusé                     |
| `maxOutputTokens` | `CLAUDE_CODE_MAX_OUTPUT_TOKENS`                      | Refusé : Codex n’a pas de limite de sortie                         | Refusé                     |

`agent()` refuse un niveau de raisonnement ou une limite de sortie que le CLI choisi ne sait pas exprimer, comme `none` ou `minimal`. Il ne l’ignore ni ne le convertit jamais. Claude Code ramène `CLAUDE_CODE_MAX_OUTPUT_TOKENS` au plafond du modèle ; ne définissez pas aussi cette variable dans `variables`. Avec l’authentification `usage`, Kimi exige un modèle sur `agent()` et le transmet par l’environnement plutôt que par `--model` ; avec un compte, les noms de modèle de Kimi sont les alias de sa configuration, comme `kimi-code/<id>`.

| Option du harness   | Claude Code                                                              | Codex                          | Antigravity                    | Copilot                      | Kimi                          |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------ | ------------------------------ | ---------------------------- | ----------------------------- |
| `authentication`    | `account` (fichier ou jeton) ou `usage`                                  | `account` (fichier) ou `usage` | `account` (fichier) ou `usage` | `account` (fichier ou jeton) | `account` (profil) ou `usage` |
| `permissions`       | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` | Sans objet                     | Sans objet                     | Sans objet                   | Sans objet                    |
| `approvalReviewer`  | Sans objet                                                               | `user` ou `auto_review`        | Sans objet                     | Sans objet                   | Sans objet                    |
| `mode`              | Sans objet                                                               | Sans objet                     | `accept-edits` ou `plan`       | Sans objet                   | Sans objet                    |
| `variables`         | Variables de cet adapter                                                 | Variables de cet adapter       | Variables de cet adapter       | Variables de cet adapter     | Variables de cet adapter      |
| `saveConversations` | `true` par défaut                                                        | `true` par défaut              | Sans objet                     | Sans objet                   | Sans objet                    |

Chaque harness n’accepte que les [formes d’authentification](../../../manual/authentication/) prises en charge par son CLI ; `agent()` refuse les autres et liste les formes acceptées. Sans `authentication`, Outpost ne prépare rien et le CLI utilise ce que son environnement fournit déjà.

Sans `model`, le CLI installé choisit son défaut. La disponibilité des modèles et les niveaux de raisonnement acceptés par un modèle donné dépendent du CLI et de votre compte. `agentVersions` expose les versions épinglées utilisées par les images générées et le bootstrap distant (Claude Code, Codex, Copilot et Kimi) ; reconstruisez les anciennes images lorsque ces versions changent. Antigravity n’a pas de version épinglée : les images générées et le bootstrap distant installent la version courante d’`agy` avec son script d’installation officiel, si bien qu’une reconstruction peut récupérer une version plus récente.

Les défauts non interactifs évitent de bloquer sur une demande de permission et s’appuient sur la frontière d’exécution choisie : Antigravity passe `--dangerously-skip-permissions` sauf si `mode` est défini, et Copilot passe `--allow-all --no-ask-user`, qui autorise tous les outils, chemins et URL dans la sandbox choisie. Sélectionnez les permissions avec soin pour l’exécution locale. L’attachement interactif utilise le comportement natif du terminal ; Kimi n’accepte aucun prompt initial en session interactive.

Claude Code et Codex capturent, reprennent et forkent les conversations natives. Antigravity, Copilot et Kimi n’exécutent que de nouvelles sessions : `resume()`, `fork()` et les continuations explicites échouent, les réponses structurées exigent `repairs: 0`, et l’identifiant de conversation éventuellement signalé est purement informatif. Copilot compte des requêtes premium plutôt que des jetons, et Kimi ne signale aucune consommation de jetons : leur usage reste à `0`. Kimi reçoit le prompt comme argument de commande, soumis à la limite de taille des arguments du système d’exploitation. Outpost désactive la mise à jour automatique des CLI par des variables par défaut de l’adapter (`AGY_CLI_DISABLE_AUTO_UPDATE`, `COPILOT_AUTO_UPDATE`, `KIMI_CODE_NO_AUTO_UPDATE`) ; vos `variables` peuvent les remplacer.

L’image générée contient Claude Code, Codex, Copilot CLI, Kimi Code et le CLI Antigravity (`agy`, installé dans `/usr/local/bin`). L’exécution locale exige l’installation des CLI et la connexion sur l’hôte ; pour `agy`, suivez le [guide d’installation officiel](https://antigravity.google/docs/cli/install/). Les providers distants peuvent installer un CLI manquant, sauf avec `bootstrap: false` : Claude Code, Codex, Copilot et Kimi depuis leurs paquets npm épinglés dans `~/.outpost-tools`, et `agy` avec son script d’installation officiel dans `~/.local/bin`. Les identifiants d’agent sont distincts de ceux du provider.

Voir [l’environnement](../../../agents/environment/), [les conversations](../../../agents/conversations/) et [les adapters personnalisés](../../../extend/agents/). Pour connecter chaque CLI, voir [Claude Code](../../../agents/connect-claude/), [Codex](../../../agents/connect-codex/), [Antigravity](../../../agents/connect-antigravity/), [Copilot](../../../agents/connect-copilot/) et [Kimi](../../../agents/connect-kimi/).

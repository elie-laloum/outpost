---
title: "Diagnostics — Vue d’ensemble"
description: "Vérifiez un hôte, une image, une sandbox ouverte ou un adapter d’agent avant de payer un appel de modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un diagnostic

| Outil                                                     | Ce qu’il sonde                                                                                              | Ce qu’il exécute                                                      | Résultat                                                       |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- |
| `outpost doctor`                                          | L’hôte : Node.js 24+, Git, le moteur de conteneurs, `tar`, la CLI de l’agent. Avec `--image`, l’image aussi | Des commandes sur l’hôte, plus un conteneur temporaire pour `--image` | Texte ou `--json` ; statut de sortie `1` si un contrôle échoue |
| `sandbox.diagnose(options)` ou `diagnoseSandbox(sandbox)` | Votre sandbox ouverte, avec son vrai provider et ses montages                                               | Des commandes de sonde dans la sandbox, en opération exclusive        | `SandboxDiagnosticReport` ; la sandbox reste ouverte           |
| `diagnoseSandbox(lease, options)`                         | Un `SandboxLease` issu d’un provider personnalisé                                                           | Les mêmes sondes sur le lease                                         | `SandboxDiagnosticReport` ; vous libérez le lease              |
| `diagnoseAgentProtocol(agent)`                            | Le décodage des événements par l’adapter                                                                    | Aucun processus : des fixtures intégrées, de façon synchrone          | `AgentProtocolReport`, un contrôle par fixture                 |

Avec `--image`, doctor lance les mêmes sondes de version et d’aide de la CLI que `diagnoseSandbox` avec `agent`, avec un délai fixe de 5000 ms par sonde.

## Ce que vérifie diagnoseSandbox

Chaque sonde s’arrête après `deadlineMs`, 5000 par défaut et 60000 au maximum. Une sonde en échec devient un contrôle `fail` et l’appel se résout quand même ; `hasFailures` vaut `true` dès qu’un contrôle est `fail`.

| Contrôle                                         | S’exécute si                                                | Ce qu’il lance                                                                                       | `pass` signifie                                                   | Sinon                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `sandbox.node`, `sandbox.git`                    | Toujours                                                    | `node --version`, `git --version`                                                                    | Une version a été lue                                             | `fail`                                                                              |
| `sandbox.command`                                | Toujours                                                    | Un script Node.js qui écrit sur stdout et stderr, puis sort avec le statut 7                         | Les deux flux et le statut sont revenus intacts                   | `fail`                                                                              |
| `sandbox.home`                                   | Toujours                                                    | Une vérification Node.js du home du lease                                                            | Le home est un répertoire lisible et inscriptible                 | `fail`                                                                              |
| `agent.sandbox`                                  | `agent` est renseigné                                       | La CLI de l’agent avec `--version`                                                                   | La version est celle qu’épingle Outpost                           | `warn` pour une autre version ; `fail` si absente ou illisible                      |
| `agent.cli.<mode>`                               | `agent` est renseigné et `agent.sandbox` a réussi ou averti | L’aide de la CLI pour `start`, `resume` et, pour Claude Code, Codex et Kimi, `fork`                  | L’aide montre l’usage attendu et chaque option passée par Outpost | `warn` si l’usage est introuvable ; `fail` si l’aide échoue ou qu’une option manque |
| `sandbox.transfers`, `sandbox.transfers.cleanup` | `transfers: true`                                           | Envoi d’un fichier binaire sous la racine, vérification dans la sandbox, téléchargement, suppression | Les octets correspondent et le répertoire de sonde a été supprimé | `fail`                                                                              |
| `model`                                          | Toujours                                                    | Rien                                                                                                 | —                                                                 | Toujours `skipped`                                                                  |

`capabilities` reprend `command` et `transfers` de ces contrôles ; `batchTransfers` et `interactiveTerminal` ne sont jamais sondés.

:::note
Un rapport sans échec ne prouve ni la connexion au compte ni l’accès au modèle. Lancez une petite tâche pour les vérifier.
:::

## Points d’entrée

Guide : [Diagnostic](../../../guide/diagnostics/) · [Commandes CLI](../../../guide/cli/) · [Ajouter un provider de sandbox](../../../guide/custom-sandbox-providers/)

- [diagnoseSandbox](../../diagnosesandbox/)
- [diagnoseAgentProtocol](../../diagnoseagentprotocol/)
- [SandboxDiagnosticOptions](../../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)
- [DiagnosticCheck](../../diagnosticcheck/)
- [DiagnosticStatus](../../diagnosticstatus/)
- [DiagnosticCapability](../../diagnosticcapability/)
- [AgentProtocolReport](../../agentprotocolreport/)
- [DoctorAgent](../../doctoragent/)

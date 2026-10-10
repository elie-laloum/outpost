---
title: "Diagnostiquer un problème"
description: "Vérifiez vos outils et votre sandbox avant de rechercher un problème d’agent ou de modèle."
---

## Vérifier les prérequis

Lancez `outpost doctor` pour vérifier les outils nécessaires au fournisseur de sandbox et à l’agent. Ajoutez `--image` pour tester l’image dans un conteneur temporaire avant d’envoyer votre première demande.

```sh
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev
```

Chaque ligne affiche un statut (`PASS`, `WARN`, `FAIL`, `SKIPPED`), le nom d’un contrôle et un remède quand quelque chose manque. Corrigez chaque `FAIL` avant votre premier dispatch et lisez chaque `WARN`.

| Option               | Défaut    | Ce qu’elle sélectionne                                                               |
| -------------------- | --------- | ------------------------------------------------------------------------------------ |
| `--sandbox-provider` | `docker`  | `docker`, `podman`, `local`, `vercel` ou `daytona`.                                  |
| `--agent`            | `codex`   | `claude`, `codex`, `antigravity`, `copilot` ou `kimi`.                               |
| `--image`            | aucune    | Une image locale à tester dans un conteneur temporaire. Docker et Podman uniquement. |
| `--json`             | désactivé | Affiche le rapport en JSON au lieu de texte.                                         |

| Code de sortie | Signification                                                                          |
| -------------- | -------------------------------------------------------------------------------------- |
| `0`            | Aucun contrôle n’a échoué. Les avertissements et contrôles ignorés restent à lire.     |
| `1`            | Un contrôle a échoué, ou une option est invalide.                                      |
| `130`          | Interrompu par Ctrl+C (SIGINT). La sonde en cours et ses processus enfants s’arrêtent. |
| `143`          | Arrêté par SIGTERM, avec le même nettoyage.                                            |

Une exécution interrompue supprime aussi son conteneur temporaire.

## Ce que vérifie doctor

Chaque sonde a un délai de cinq secondes. Les contrôles de l’hôte s’exécutent toujours ; ceux de l’image seulement avec `--image`.

| Contrôle                                | Ce qu’il vérifie                                                                | En cas d’échec                                |
| --------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| `host.node`, `host.git`                 | Node.js 24 ou plus récent, et Git dans le `PATH`.                               | `FAIL`                                        |
| `provider.cli`, `provider.connection`   | Docker ou Podman est installé et son moteur répond.                             | `FAIL`                                        |
| `host.tar`                              | `tar` est disponible pour les transferts vers les conteneurs.                   | `FAIL`                                        |
| `agent.host`                            | La CLI de l’agent sur l’hôte et sa version comparée à celle qu’Outpost épingle. | `WARN` : une sandbox peut avoir sa propre CLI |
| `image.runtime`                         | L’image démarre avec le réseau désactivé et un workspace vide.                  | `FAIL`                                        |
| `image.node`, `image.git`, `image.home` | Node.js et Git dans l’image, et un répertoire personnel accessible en écriture. | `FAIL`                                        |
| `agent.sandbox`                         | La CLI de l’agent dans l’image. Une version autre que celle épinglée avertit.   | `FAIL` si elle manque                         |
| `agent.cli.*`                           | L’aide de la CLI déclare les options qu’Outpost lui passe.                      | `FAIL`                                        |
| `image.cleanup`                         | Le conteneur temporaire a été supprimé.                                         | `FAIL`, avec le nom du conteneur              |

Les contrôles du moteur et `host.tar` concernent Docker et Podman. Pour Vercel et Daytona, `provider.cloud` est ignoré : le SDK, les identifiants et l’allocation ne sont pas vérifiés. Le dernier contrôle, `execution`, est toujours ignoré et liste ce que doctor ne teste jamais.

## Lire le rapport JSON

`--json` affiche les mêmes contrôles pour un script ou un job de CI ([Exécuter en CI](../ci-automation/)).

```sh
npx outpost doctor --image outpost:dev --json > doctor.json
jq -r '.checks[] | select(.status != "pass") | "\(.status) \(.id): \(.message)"' doctor.json
```

```json
{
  "sandboxProvider": "docker",
  "agent": "codex",
  "image": "outpost:dev",
  "scope": "host-and-image",
  "placement": "mounted",
  "interactiveTerminal": true,
  "checks": [
    {
      "id": "agent.sandbox",
      "status": "warn",
      "version": "0.155.0",
      "referenceVersion": "0.156.1",
      "message": "Differs from the version pinned by Outpost; compatibility is unverified."
    }
  ],
  "hasFailures": false
}
```

Référence API : [SandboxDiagnosticReport](../../reference/sandboxdiagnosticreport/) et [DiagnosticCheck](../../reference/diagnosticcheck/).

## Diagnostiquer une sandbox ouverte

`sandbox.diagnose()` sonde la sandbox que votre code détient déjà, avec son vrai fournisseur et ses montages. Elle laisse la sandbox ouverte.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({ repository, sandboxProvider });
const report = await sandbox.diagnose({ agent: "codex", transfers: true });
for (const check of report.checks)
  console.log(check.status, check.id, check.message);
// Example output: pass sandbox.node v24.15.0
```

Référence API : [SandboxDiagnosticOptions](../../reference/sandboxdiagnosticoptions/).

Chaque sonde s’arrête après `deadlineMs` (5 000 ms par défaut, 60 000 au maximum). `report.capabilities` compare ce que le fournisseur annonce avec ce qui a été observé. Le diagnostic est une opération de la sandbox : il échoue si un dispatch ou une commande s’exécute déjà dans la même sandbox.

Pour un [fournisseur de sandbox personnalisé](../custom-sandbox-providers/), `diagnoseSandbox(lease)` lance les mêmes sondes sur un `SandboxLease`.

## Vérifier un adaptateur d’agent hors ligne

`diagnoseAgentProtocol()` rejoue à travers l’adaptateur d’un agent des événements synthétiques fournis avec Outpost. Il ne lance ni CLI ni modèle.

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";

const report = diagnoseAgentProtocol("claude");
console.log(report.referenceVersion, report.hasFailures);
// Example output: 2.1.280 false
```

<!-- check:run -->

Il affiche la version de Claude Code qu’Outpost épingle, puis `false` si chaque échantillon est décodé comme prévu.

## Tester l’accès au modèle

Doctor s’arrête avant la connexion et l’accès au modèle. Une fois qu’il passe, lancez une petite tâche qui ne modifie rien, comme le script de revue de [Votre première tâche](../first-request/), et lisez son résultat réel.

## Comprendre un délai de connexion dépassé

Un agent CLI peut retenter un point d’accès injoignable jusqu’à sa limite de temps. L’erreur garde le code `timeout`. Si le dernier échec signalé par l’agent était un problème de connexion, Outpost ajoute une indication.

Référence API : [OutpostError](../../reference/outposterror/).

L’indication résume le signalement de l’agent sans recopier son URL ni ses identifiants. Elle ne prouve pas que le point d’accès est arrêté. Les autres codes d’erreur sont listés dans [Erreurs](../error-handling/).

## Limites

- Doctor ne teste ni la connexion, ni les identifiants, ni l’accès au modèle, et n’alloue aucune sandbox sans `--image`.
- `--image` utilise une image locale et n’en télécharge jamais. L’UID de l’utilisateur de l’image doit correspondre au vôtre, et l’image doit contenir `sh`, `sleep`, `setsid`, `kill`, `tar` et `cp`.
- Sans `--image`, la version de l’agent dans un conteneur ou une sandbox cloud n’est pas vérifiée : la version de l’hôte n’en dit rien.
- `diagnoseAgentProtocol()` vérifie l’adaptateur sur des événements enregistrés, pas la CLI que vous avez installée.

API : [diagnoseSandbox](../../reference/diagnosesandbox/) · [Sandbox](../../reference/sandbox/) · [SandboxDiagnosticReport](../../reference/sandboxdiagnosticreport/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/) · [unavailableFault](../../reference/unavailablefault/)

---
title: "Erreurs — Vue d’ensemble"
description: "Lisez une OutpostError : son code, ses détails structurés, sa récupération, et s’il s’agit d’un quota ou d’une panne."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Codes d’erreur

Chaque `OutpostError` porte un `code` : testez-le plutôt que `message`. `details` contient le contexte propre à ce code.

| Code            | Levé quand                                                                                                                                                                   | Relancer                                                        | `details` typiques                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| `configuration` | Les options échouent à la validation, une sandbox est fermée ou occupée, un fichier d’identifiants de compte manque ou est invalide, une réservation de stockage est refusée | Non : corrigez l’appel                                          | `path`, `overlap`                                                    |
| `process`       | Un agent sort avec un statut non nul ou sans événement final, une tâche de commande sort avec un statut non nul                                                              | Si `unavailableFault()` correspond                              | `status`, `stdout`, `stderr`, `conversation`, `agent`, `unavailable` |
| `timeout`       | `idleMs`, `deadlineMs`, une commande, un outil, un transfert, le démarrage MCP, une requête de modèle ou le `timeoutMs` d’un workflow expire                                 | Après avoir relevé la limite ; les effets peuvent être partiels | `deadlineMs`, `timeoutMs`, `stopReason`, `unavailable`               |
| `aborted`       | La sandbox se ferme pendant une opération, un tour du harness ou un appel d’outil se termine, une requête de modèle est annulée                                              | Dans une sandbox ouverte                                        | —                                                                    |
| `workspace`     | Chemin ou lien symbolique dangereux, admission refusée par le quota de recovery, échec de la synchronisation distante ou de la restauration                                  | Après inspection des fichiers conservés                         | `path`, `directory`, `recovery`                                      |
| `conflict`      | Worktree verrouillé, branche extraite ailleurs, modifications de l’hôte pendant la synchronisation, échec de l’intégration automatique                                       | Après résolution sur l’hôte                                     | `directory`, `branch`, `files`, `recovery`, `lock`                   |
| `prompt`        | Une variable de prompt manque ou une commande de prompt échoue                                                                                                               | Non : corrigez le brief                                         | `key`, `command`, `status`, `stderr`                                 |
| `response`      | Une réponse typée manque ou est invalide (`ResponseError`), une réponse de modèle ou de serveur MCP est invalide                                                             | Les réponses typées reçoivent d’abord des tours de correction   | `tag`, `raw`, `server`, `rpcCode`                                    |
| `session`       | Une conversation ou un transcript à reprendre manque ou est illisible                                                                                                        | Non                                                             | `id`, `repository`                                                   |
| `provider`      | Une opération du provider de sandbox échoue, un modèle renvoie une erreur HTTP autre que 429 ou une erreur de flux                                                           | Si `unavailableFault()` correspond                              | `status`, `retryAfterMs`, `type`, `unavailable`                      |
| `limit`         | Un harness intégré atteint `maxSteps`, `maxToolCalls`, `maxOutputTokens`, son budget de tokens ou sa profondeur de délégation                                                | Non : relevez la limite                                         | `limit`, `step`                                                      |
| `quota`         | Une CLI d’agent ou un fournisseur de modèle signale une limite d’usage ou de débit terminale                                                                                 | Après `resetAt`                                                 | `resetAt`, `retryAfterMs`, `status`, `agent`, `fallback`             |
| `replay`        | Un agent de rejeu diverge de son journal (`ReplayDivergence`)                                                                                                                | Non : enregistrez à nouveau                                     | `kind`, `turn`, `expected`, `actual`                                 |
| `steering`      | Une consigne de steering n’est pas remise avant la fin du dispatch ou la fermeture du contrôleur                                                                             | Au dispatch suivant                                             | `text`, `subagent`                                                   |

`recoveryDetails(error)` indique où le travail a survécu, par exemple `branch`, `directory`, `commits`, `transcript`, `logReference` ou `conversation`. Un échec de synchronisation distante indique plutôt son répertoire de transfert dans `details.recovery`.

:::caution
Les gates, checkpoints, artefacts, transports, files d’attente et planifications lèvent des `Error` ou leurs sous-classes sans `code`, et un appel dont vous annulez le `signal` rejette avec la raison de l’annulation. Testez `instanceof OutpostError` avant de lire `code`.
:::

## Quotas et pannes

`quotaFault()` et `unavailableFault()` examinent l’erreur et jusqu’à sept causes imbriquées. Une panne conserve son code d’origine : reconnaissez-la avec `unavailableFault()`.

| Signal                                                                         | `code`     | `quotaFault()`                                                | `unavailableFault().message` |
| ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------- | ---------------------------- |
| La CLI d’agent signale une limite d’usage terminale                            | `quota`    | Correspond ; `resetAt` s’il est signalé                       | —                            |
| HTTP 429 d’un modèle                                                           | `quota`    | Correspond ; `resetAt` issu de `Retry-After`                  | —                            |
| Flux de modèle `rate_limit_error`, `rate_limit_exceeded`, `insufficient_quota` | `quota`    | Correspond                                                    | —                            |
| Chaque candidat d’un agent de secours atteint un quota                         | `quota`    | Correspond ; `resetAt` le plus proche si tous en signalent un | —                            |
| Texte d’échec que l’adapter de l’agent reconnaît comme une panne               | `process`  | —                                                             | Le texte reconnu             |
| HTTP 408, 500, 502, 503, 504 ou 529 d’un modèle                                | `provider` | —                                                             | `HTTP <status>`              |
| Flux de modèle `overloaded_error`, `api_error`, `server_error`                 | `provider` | —                                                             | Le type d’erreur             |
| Échec de connexion ou de redirection vers un modèle                            | `provider` | —                                                             | `HTTP transport failure`     |
| Délai dépassé après un échec de connexion signalé par l’agent                  | `timeout`  | —                                                             | `connection failure`         |

Ce dernier délai reçoit aussi `details.agentDiagnostic: "connection"` : un agent de secours qui couvre `unavailable` passe donc au candidat suivant. Une `retry` de tâche attend au moins `details.retryAfterMs`, lu dans l’en-tête HTTP `Retry-After`.

## Points d’entrée

Guide : [Erreurs](../../../guide/error-handling/) · [Récupérer du travail](../../../guide/recovery/) · [Pauses sur quota](../../../guide/quota-pauses/)

- [quotaFault](../../quotafault/)
- [unavailableFault](../../unavailablefault/)
- [recoveryDetails](../../recoverydetails/)
- [OutpostError](../../outposterror/)
- [FaultCode](../../faultcode/)
- [QuotaFault](../../type-quotafault/)
- [UnavailableFault](../../type-unavailablefault/)

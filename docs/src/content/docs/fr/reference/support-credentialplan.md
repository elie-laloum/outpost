---
title: "CredentialPlan"
description: "CredentialPlan — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom         | Type                               | Présence | Rôle                                                                                                                                               |
| ----------- | ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variables` | `Readonly<Record<string, string>>` | Requis   | Variables d’environnement transmises à chaque commande de l’agent, y compris avec le provider local.                                               |
| `host`      | `readonly HostCredential[]`        | Requis   | Fichiers de credentials de l’hôte à lire puis installer dans le home privé de la sandbox ou exposer en variables ; ignorés avec le provider local. |
| `files`     | `readonly GeneratedCredential[]`   | Requis   | Fichiers fixes générés par Outpost dans le home privé de la sandbox, comme les réglages Antigravity qui sélectionnent l’API Gemini.                |
| `commands`  | `readonly Command[]`               | Requis   | Commandes de connexion lancées dans la sandbox après l’installation des fichiers, avec les secrets sur stdin ; ignorées avec le provider local.    |

## Signature

```ts
export interface CredentialPlan {
  readonly variables: Variables;
  readonly host: readonly HostCredential[];
  readonly files: readonly GeneratedCredential[];
  readonly commands: readonly Command[];
}
```

## Contrats associés

- [Command](../command/)
- [GeneratedCredential](../support-generatedcredential/)
- [HostCredential](../support-hostcredential/)
- [Variables](../variables/)

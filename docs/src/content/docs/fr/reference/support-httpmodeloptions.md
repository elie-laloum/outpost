---
title: "HttpModelOptions"
description: "HttpModelOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                   |
| ------------------ | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`          | `string`              | Requis    | URL de base HTTP(S) absolue avec son préfixe de version, par exemple https://api.openai.com/v1 ; chat/completions ou responses y est ajouté. Identifiants, requête ou fragment échouent avec le code configuration, et les redirections sont refusées. |
| `apiKey`           | `string \| false`     | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement.                                                                                           |
| `timeoutMs`        | `number \| undefined` | Optionnel | Délai de la requête en millisecondes, 120000 par défaut, au plus 2147483647. En streaming, il repart à chaque fragment reçu ; son expiration rejette avec le code timeout.                                                                             |
| `maxResponseBytes` | `number \| undefined` | Optionnel | Taille maximale du corps de réponse en octets après décompression, 8388608 (8 Mio) par défaut ; une réponse en streaming compte tous ses fragments. Au-delà, la requête échoue avec le code response.                                                  |

## Signature

```ts
export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```

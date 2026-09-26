---
title: "HttpModelOptions"
description: "HttpModelOptions — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom                | Type                  | Présence  | Rôle                                                                                                                                                         |
| ------------------ | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`          | `string`              | Requis    | URL HTTP(S) absolue de base de l’API, avec son éventuel préfixe /v1 ; sans identifiants, requête ni fragment. Le chemin du protocole choisi est ajouté.      |
| `apiKey`           | `string \| false`     | Requis    | Clé API bearer explicite, ou false pour un endpoint sans authentification. Aucune variable d’environnement ni connexion de compte n’est lue automatiquement. |
| `timeoutMs`        | `number \| undefined` | Optionnel | Délai positif en millisecondes ; 120000 par défaut, sans dépasser 2147483647. Il couvre toute la requête, ou le silence entre deux fragments en streaming.   |
| `maxResponseBytes` | `number \| undefined` | Optionnel | Taille maximale positive du corps après décompression HTTP, en octets ; 8388608 (8 Mio) par défaut. Les réponses dépassant cette limite échouent.            |

## Signature

```ts
export interface HttpModelOptions {
  readonly baseUrl: string;
  readonly apiKey: string | false;
  readonly timeoutMs?: number;
  readonly maxResponseBytes?: number;
}
```

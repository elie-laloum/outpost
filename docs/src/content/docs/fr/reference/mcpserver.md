---
title: "McpServer"
description: "McpServer — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { McpServer } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                   | Type                                            | Présence          | Rôle                                                                                                                                                                                              |
| --------------------- | ----------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`             | `string`                                        | Selon la variante | Exécutable lancé dans la sandbox. Texte littéral ; il ne peut pas contenir ${ ni NUL.                                                                                                             |
| `arguments`           | `readonly string[] \| undefined`                | Selon la variante | Arguments littéraux transmis à la commande, sans référence ${.                                                                                                                                    |
| `environment`         | `Readonly<Record<string, string>> \| undefined` | Selon la variante | Valeurs d’environnement non secrètes définies pour le serveur, écrites telles quelles dans la configuration.                                                                                      |
| `variables`           | `readonly string[] \| undefined`                | Selon la variante | Noms de variables déclarées transmises au serveur. Les valeurs n’apparaissent jamais dans les arguments ni dans les fichiers ; une variable manquante fait échouer avant le démarrage de l’agent. |
| `url`                 | `string`                                        | Selon la variante | URL http ou https absolue d’un point d’accès MCP Streamable HTTP, sans identifiants intégrés.                                                                                                     |
| `headers`             | `Readonly<Record<string, string>> \| undefined` | Selon la variante | En-têtes HTTP non secrets envoyés avec chaque requête. Utilisez bearerTokenVariable pour un jeton Authorization.                                                                                  |
| `bearerTokenVariable` | `string \| undefined`                           | Selon la variante | Nom d’une variable déclarée dont la valeur est envoyée en Authorization: Bearer. Incompatible avec un en-tête Authorization.                                                                      |

## Signature

```ts
export type McpServer = McpStdioServer | McpHttpServer;
```

## Contrats associés

- [McpHttpServer](../mcphttpserver/)
- [McpStdioServer](../mcpstdioserver/)

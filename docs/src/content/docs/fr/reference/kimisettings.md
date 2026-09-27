---
title: "KimiSettings"
description: "KimiSettings — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { KimiSettings } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom              | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Service du compte : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com. Sélectionne le fichier OAuth, les endpoints de compte et la région de connexion dans la sandbox sans copier la configuration hôte. Exige le mode compte lorsqu’une authentification est fournie ; les formes usage refusent une région explicite. Son absence sélectionne global pour les comptes et ne modifie pas l’authentification API. Les endpoints de compte déclarés contradictoires sont refusés, y compris avec la région par défaut. |
| `authentication` | `AgentAuthentication \| undefined`              | Optionnel | Le mode account lit le fichier OAuth de la région choisie et device_id sous ~/.kimi-code ou KIMI_CODE_HOME ; account.file sélectionne un dossier de profil dédié. Les formes usage acceptent KIMI_API_KEY ou une clé/variable explicite et exigent un modèle sur agent(). Les formes account.key/variable ne sont pas prises en charge. Son absence ne prépare aucun identifiant.                                                                                                                                                      |
| `variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Signature

```ts
export interface KimiSettings {
  readonly region?: "mainland-cn" | "global";
  readonly authentication?: AgentAuthentication;
  readonly variables?: Variables;
}
```

## Contrats associés

- [AgentAuthentication](../agentauthentication/)
- [Variables](../variables/)

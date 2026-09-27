---
title: "kimiHarness"
description: "kimiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { kimiHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un harness Kimi Code à partir des réglages d’exécution, d’authentification et de permissions, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément un nom de modèle ; reasoning et maxOutputTokens sont refusés. Chaque exécution démarre une session neuve : capture native, reprise, fork et réparations automatiques des réponses ne sont pas pris en charge. La CLI possède sa boucle interne modèle/outils. Les profils de compte utilisent region: "global" par défaut pour kimi.ai ; définissez explicitement mainland-cn pour kimi.com. La région détermine le fichier d’identifiants et les endpoints de connexion de la sandbox.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `KimiSettings \| undefined`                     | Optionnel | Configuration du harness Kimi Code ; transmettez le modèle choisi à agent().                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `settings.region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Service du compte : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com. Sélectionne le fichier OAuth, les endpoints de compte et la région de connexion dans la sandbox sans copier la configuration hôte. Exige le mode compte lorsqu’une authentification est fournie ; les formes usage refusent une région explicite. Son absence sélectionne global pour les comptes et ne modifie pas l’authentification API. Les endpoints de compte déclarés contradictoires sont refusés, y compris avec la région par défaut. |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Le mode account lit le fichier OAuth de la région choisie et device_id sous ~/.kimi-code ou KIMI_CODE_HOME ; account.file sélectionne un dossier de profil dédié. Les formes usage acceptent KIMI_API_KEY ou une clé/variable explicite et exigent un modèle sur agent(). Les formes account.key/variable ne sont pas prises en charge. Son absence ne prépare aucun identifiant.                                                                                                                                                      |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Retour

`CliHarness`

## Signature

```ts
export declare function kimiHarness(settings?: KimiSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [KimiSettings](../kimisettings/)

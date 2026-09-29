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

Crée un harness Kimi Code à partir des réglages d’exécution, d’authentification et de permissions, sans lancer la CLI. Composez-le avec agent({ harness, model }) pour sélectionner séparément un nom de modèle ; reasoning et maxOutputTokens sont refusés. Les bundles natifs permettent capture, reprise à chaud/à froid et réparations. Le fork exécute la commande native kimi fork et continue un identifiant enfant distinct. La CLI possède sa boucle interne modèle/outils. Les profils de compte utilisent region: "global" par défaut pour kimi.ai ; définissez explicitement mainland-cn pour kimi.com. La région détermine le fichier d’identifiants et les endpoints de connexion de la sandbox.

[Exemple complet et règles détaillées](../../guide/agents/harness/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `KimiSettings \| undefined`                     | Optionnel | Configuration du harness Kimi Code ; transmettez le modèle choisi à agent().                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `settings.region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Service du compte : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com. Sélectionne le fichier OAuth, les endpoints de compte et la région de connexion dans la sandbox sans copier la configuration hôte. Exige le mode compte lorsqu’une authentification est fournie ; les formes usage refusent une région explicite. Son absence sélectionne global pour les comptes et ne modifie pas l’authentification API. Les endpoints de compte déclarés contradictoires sont refusés, y compris avec la région par défaut. |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | Le mode account lit le fichier OAuth de la région choisie et device_id sous ~/.kimi-code ou KIMI_CODE_HOME ; account.file sélectionne un dossier de profil dédié. Les formes usage acceptent KIMI_API_KEY ou une clé/variable explicite et exigent un modèle sur agent(). Les formes account.key/variable ne sont pas prises en charge. Son absence ne prépare aucun identifiant.                                                                                                                                                      |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Déclarations d’environnement explicites ; les valeurs sont des chaînes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `settings.conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Kimi au lieu du store natif par défaut, par exemple transportConversations("kimi", …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                                                                                                                                                                                                                                                      |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .kimi-code/mcp.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée.                                                                                                                                                                                                                                                                                     |

## Retour

`CliHarness`

## Signature

```ts
export declare function kimiHarness(settings?: KimiSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [KimiSettings](../kimisettings/)

---
title: "defineKimiHook"
description: "defineKimiHook — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineKimiHook } from "@elie-laloum/outpost/core";
```

## Rôle et comportement

Déclare un hook natif du lifecycle de Kimi pour son harness CLI. Sélectionnez un événement documenté et fournissez un callback hôte ou une commande dans le sandbox. La réponse du callback est validée selon le schéma natif de cet événement. Les hooks existants doivent utiliser les tables TOML [[hooks]] ; les tableaux inline sont refusés avant modification. KIMI_CODE_HOME doit correspondre au répertoire personnel du sandbox. Seuls PreToolUse, Stop et UserPromptSubmit traitent les décisions ; le code de sortie 2 les bloque, tandis que d’autres erreurs de commande peuvent laisser continuer.

[Exemple complet et règles détaillées](../../guide/cli-hooks/).

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom                 | Type                                                                                                                                                                     | Présence          | Rôle                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `KimiHookOptions<Phase>`                                                                                                                                                 | Requis            | Événement natif Kimi, filtre et délai optionnels, et exactement un callback hôte ou une commande dans le sandbox.                                                                                                            |
| `options.on`        | `Phase`                                                                                                                                                                  | Requis            | Nom natif de l’événement ; détermine son contenu et les réponses acceptées.                                                                                                                                                  |
| `options.name`      | `string \| undefined`                                                                                                                                                    | Optionnel         | Nom de diagnostic optionnel ; utilise par défaut le nom natif de l’événement.                                                                                                                                                |
| `options.matcher`   | `string \| undefined`                                                                                                                                                    | Optionnel         | Filtre natif interprété par la CLI sélectionnée. Omettez-le pour recevoir toutes les occurrences prises en charge par cet événement.                                                                                         |
| `options.timeoutMs` | `number \| undefined`                                                                                                                                                    | Optionnel         | Délai positif du callback ou de la commande en millisecondes ; 30000 par défaut, 600000 au maximum. Les limites natives de l’événement restent applicables.                                                                  |
| `options.command`   | `HookCommand \| undefined`                                                                                                                                               | Selon la variante | Exécutable lancé dans le sandbox avec le JSON natif sur stdin. Stdout, stderr et le code de sortie conservent leur sens natif. Exclusif avec run.                                                                            |
| `options.run`       | `undefined \| (context: AgentHookContext & { readonly event: KimiHookEvents[Phase]; }) => void \| KimiHookDecisions[Phase] \| Promise<void \| KimiHookDecisions[Phase]>` | Selon la variante | Callback hôte recevant l’événement natif, un sandbox emprunté et un signal d’annulation. Sans retour, conserve le comportement natif ; les décisions doivent être prises en charge par cet événement. Exclusif avec command. |

## Retour

`KimiHook<Phase>`

## Signature

```ts
export declare function defineKimiHook<Phase extends KimiHookPhase>(
  options: KimiHookOptions<Phase>,
): KimiHook<Phase>;
```

## Contrats associés

- [KimiHook](../kimihook/)
- [KimiHookOptions](../kimihookoptions/)
- [KimiHookPhase](../kimihookphase/)

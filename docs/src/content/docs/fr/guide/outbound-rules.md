---
title: "Règles de sortie réseau"
description: "Demander des restrictions réseau explicitement prises en charge."
---

:::note[Expérimental]
Les politiques de sortie sont explicites et dépendent des capacités du fournisseur.
:::

Utilisez `egress` pour demander une restriction réseau. Les restrictions non prises en charge sont rejetées explicitement.

```ts
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = dockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

## Exécution hors ligne

`deny-all` bloque les accès sortants chez les fournisseurs de conteneurs compatibles. Préparez dépendances et outils dans l’image avant de l’utiliser. Un agent CLI privé de réseau ne peut pas joindre une API de modèle cloud ; réservez cette politique aux commandes hors ligne ou à une architecture où l’accès au modèle se fait hors de cette sandbox.

## Listes d’autorisations

Le contrat de politique décrit aussi des domaines et règles CIDR pour les fournisseurs compatibles. Ne supposez pas que les réseaux Docker appliquent ces règles ou que tous les fournisseurs acceptent la même politique. Consultez le contrat exact et l’état de validation réelle du fournisseur.

Une politique réseau est distincte des montages et identifiants. Restreindre l’un ne restreint pas automatiquement les autres.

API : [EgressPolicy](../../reference/egresspolicy/).

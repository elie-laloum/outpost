---
title: Restreindre le réseau sortant
description: Prototype de politique réseau optionnelle pour Vercel, Docker et Podman.
sidebar:
  order: 9
---

`egress` est un prototype de recherche optionnel configuré lors de la création du provider. Son omission conserve le comportement réseau existant. Outpost valide et copie la politique avant l'allocation ; il n'installe pas de proxy dans le processus et ne dépend pas de la coopération de l'agent.

| Provider        | `deny-all`                    | `allowlist`                        |
| --------------- | ----------------------------- | ---------------------------------- |
| Docker / Podman | Réseau du conteneur `none`    | Rejet avant allocation             |
| Vercel          | Pare-feu natif                | Pare-feu natif par domaine et CIDR |
| Local / Daytona | Pas d'option Outpost `egress` | Pas d'option Outpost `egress`      |

## Exécuter une commande hors ligne

Utilisez un dépôt Git existant et une image Outpost déjà construite. Cet exemple n'appelle aucun modèle. L'installation de paquets et les appels API des agents nécessitent le réseau : installez les dépendances dans l'image au préalable.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const box = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({
    image: "outpost:my-project",
    egress: { mode: "deny-all" },
  }),
  branch: { mode: "named", name: "offline-check" },
});
try {
  const result = await box.command({
    executable: "git",
    arguments: ["status"],
  });
  console.log(result.status, result.stdout);
} finally {
  await box.close();
}
```

Podman accepte la même politique. Combiner `deny-all` avec une entrée `networks` différente de `none` échoue. La boucle locale reste disponible avec le [réseau `none` de Docker](https://docs.docker.com/engine/network/drivers/none/). L'hôte conserve son réseau pour télécharger les images et orchestrer l'exécution. Les sockets montés, périphériques, accès privilégiés à l'hôte et services accessibles par fichiers peuvent fournir d'autres voies de communication ; cette option ne les inspecte pas.

## Choisir les destinations Vercel

Configurez les [prérequis Vercel](../../providers/vercel/) avant l'allocation. Les sandboxes cloud peuvent entraîner des frais fournisseur.

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import { vercel } from "@elie-laloum/outpost/providers/vercel";

const policy: EgressPolicy = {
  mode: "allowlist",
  domains: ["registry.npmjs.org", "api.example.com", "*.packages.example.com"],
  denyCidrs: ["10.0.0.0/8"],
};
const provider = vercel({ egress: policy });
```

Passez `provider` à `createSandbox` et fermez la sandbox dans `finally`. Adaptez les destinations au workflow réel ; cet exemple ne constitue pas une liste complète pour l'authentification d'un agent ou un registre de paquets. Une destination manquante provoque un échec sans ouverture automatique du réseau.

Les domaines sont des noms DNS ASCII d'au moins deux labels, éventuellement préfixés par `*.`. Les URL, ports, jokers partiels et adresses IP seules sont rejetés. Utilisez `allowCidrs` pour les plages IPv4/IPv6. Une liste vide échoue : choisissez explicitement `deny-all`. L'option SDK `create.networkPolicy` reste disponible mais ne peut pas être combinée avec `egress`.

Le [contrat du pare-feu Vercel](https://vercel.com/docs/sandbox/concepts/firewall/) définit l'application : filtrage par SNI TLS, sans inspection des chemins HTTP ou hôtes virtuels. Les jokers excluent le domaine racine. Les CIDR autorisés contournent les domaines ; les CIDR refusés prévalent. Une politique uniquement CIDR laisse le DNS ouvert ; les infrastructures partagées peuvent permettre le domain fronting. Une liste autorisée ne garantit donc pas l'absence d'exfiltration. `deny-all` bloque aussi le DNS.

Ce prototype ne propose pas de modification dynamique, filtrage par requête, injection d'identifiants, audit du trafic ou listes de domaines pour conteneurs. La traduction Vercel est couverte par des tests de contrat déterministes ; l'application réelle du pare-feu cloud nécessite une validation distincte avec un compte. Les tests réels de conteneurs vérifient l'isolation réseau et l'échec par IP sans dépendre d'un service externe.

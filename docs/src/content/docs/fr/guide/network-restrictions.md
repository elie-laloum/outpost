---
title: "Restrictions réseau"
description: "Bloquer ou filtrer par liste d’autorisation le trafic sortant d’une sandbox avec une politique egress sur Docker, Podman, Vercel ou Daytona."
---

## Choisir une politique

:::caution[Expérimental]
Les politiques egress sont expérimentales. Vérifiez que votre provider et votre compte appliquent la politique avant de vous y fier.
:::

Définissez `egress` sur le provider de sandbox. Sans cette option, le provider garde ses propres réglages réseau par défaut.

| Politique                               | Effet                                                               |
| --------------------------------------- | ------------------------------------------------------------------- |
| `{ mode: "deny-all" }`                  | Bloque tout le trafic sortant de la sandbox.                        |
| `{ mode: "allowlist", domains }`        | Autorise uniquement les noms DNS listés.                            |
| `{ mode: "allowlist", allowCidrs }`     | Autorise les plages IP listées, indépendamment de `domains`.        |
| `{ mode: "allowlist", ..., denyCidrs }` | Refuse ces plages IP même quand un domaine ou un CIDR les autorise. |

La prise en charge dépend du provider. Outpost refuse une politique non prise en charge par une erreur `configuration` dès la création du provider.

| Provider           | `deny-all`                | `domains`   | `allowCidrs`                       | `denyCidrs` |
| ------------------ | ------------------------- | ----------- | ---------------------------------- | ----------- |
| Docker, Podman     | Oui (réseau `none`)       | Non         | Non                                | Non         |
| Vercel             | Oui                       | Oui         | IPv4 et IPv6                       | Oui         |
| Daytona            | Oui, confirmé par serveur | Jusqu’à 100 | Jusqu’à 10 en IPv4, sans `domains` | Non         |
| Local, Firecracker | Non                       | Non         | Non                                | Non         |

## Autoriser les API de modèles et les registres

Un agent CLI dans une sandbox cloud a besoin de l’API de son modèle et des registres depuis lesquels il installe. Listez chaque hôte qu’il contacte.

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = createVercelSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

Les entrées de `domains` suivent ces règles :

- Des noms DNS uniquement, sans protocole, chemin ni port : `api.openai.com`.
- Un nom exact correspond à cet hôte, pas à ses sous-domaines.
- `*.example.com` correspond aux sous-domaines ; ajoutez `example.com` pour le domaine racine.
- Les listes vides, adresses IP, `*` seul, noms sans point et jokers partiels comme `api*.example.com` sont refusés.

Outpost n’ajoute aucune destination à votre place. Incluez les hôtes de téléchargement, les cibles de redirection, les endpoints d’authentification et les URL de modèles personnalisées. Si le bootstrap exige un accès large, préinstallez plutôt les outils dans une [image d’agent](../agent-images/).

## Particularités de Vercel

Vercel applique la politique avec son [pare-feu natif](https://vercel.com/docs/sandbox/concepts/firewall).

- Les règles de domaine portent sur le nom de serveur TLS (SNI). Le HTTP non chiffré exige une règle CIDR.
- `allowCidrs` ouvre un accès IP à lui seul ; une plage large contourne votre liste de domaines.
- `denyCidrs` l’emporte sur toutes les règles d’autorisation.
- Une politique uniquement CIDR laisse la sandbox résoudre d’autres noms DNS.

Pour des règles de requête par domaine et des transformations, utilisez plutôt l’option native de Vercel `create.networkPolicy`. Elle sort de la politique portable, et Outpost refuse un provider qui définit les deux.

## Particularités de Daytona

Daytona n’applique des règles réseau propres à une sandbox que sur les comptes Tier 3 ou 4 disposant de la permission `WRITE_SANDBOXES`.

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = createDaytonaSandboxProvider({
  egress: { mode: "allowlist", allowCidrs: ["203.0.113.0/24"] },
});
```

Outpost transmet la politique à la création, puis l’applique de nouveau par l’API réseau de Daytona avant de préparer le workspace. Si Daytona refuse, l’acquisition échoue avec une erreur `provider` et Outpost supprime la sandbox.

- Utilisez `domains` ou `allowCidrs`, pas les deux, et aucun `denyCidrs`.
- Listez au plus 100 domaines ou 10 CIDR IPv4.
- Chez Daytona, `*.example.com` correspond aussi à `example.com` : Outpost exige donc `example.com` dans la liste.
- Choisissez `egress` ou les réglages réseau natifs de Daytona dans `create`, `outboundProxyUrl` compris. Les réglages natifs gardent la sémantique de Daytona, sans la confirmation d’Outpost.

La confirmation intervient après le démarrage de la sandbox : du code lancé par l’image elle-même peut s’exécuter avant. Utilisez des images de confiance, sans tâche au démarrage ni secret embarqué. Consultez les [limites réseau de Daytona](https://www.daytona.io/docs/en/network-limits/).

## Exécuter un conteneur hors ligne

`deny-all` rattache un conteneur Docker ou Podman au réseau `none`. Préparez d’abord outils et dépendances dans l’[image](../agent-images/).

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

Un agent CLI dans cette sandbox ne peut pas joindre son modèle. Le [harness intégré](../harness/) le peut : ses requêtes au modèle partent de votre hôte, et seuls ses outils s’exécutent hors ligne.

La politique egress de la sandbox ne couvre pas le trafic qu’Outpost gère sur l’hôte :

- Les requêtes au modèle du harness intégré.
- Les téléchargements d’images et les transferts de fichiers.
- Les requêtes vers le plan de contrôle d’un fournisseur cloud.

## Limites

- Une politique est fixée à la création du provider. Outpost ne la modifie pas pendant une exécution.
- Docker et Podman n’appliquent que `deny-all`, incompatible avec tout `networks` autre que `none`. Pour une liste d’autorisation, utilisez Vercel ou un pare-feu que vous gérez.
- L’exécution locale et [Firecracker](../firecracker/) refusent `egress` ; le réseau de Firecracker se configure sur votre hôte.
- Un service cloud peut encore refuser une politique quand Outpost acquiert la sandbox.
- Les destinations autorisées peuvent toujours recevoir des données de l’agent.
- Les règles réseau ne restreignent ni les montages, ni les identifiants, ni les sockets de l’hôte que vous exposez à la sandbox. Consultez [Sécurité](../security/).

API : [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/).

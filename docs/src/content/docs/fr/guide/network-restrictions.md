---
title: "Limiter les accès réseau"
description: "Configurez les règles de sortie réseau prises en charge et comprenez leur périmètre."
---

## Choisir une politique

:::caution[Expérimental]
Les politiques egress sont expérimentales. Vérifiez que votre fournisseur et votre compte appliquent la politique avant de vous y fier.
:::

Définissez `egress` sur le fournisseur de sandbox pour limiter les connexions sortantes. Sans cette option, les règles réseau par défaut du fournisseur s’appliquent. Consultez le tableau de prise en charge avant de choisir une politique.

Référence API : [EgressPolicy](../../reference/egresspolicy/).

La prise en charge dépend du fournisseur. Outpost refuse une politique non prise en charge par une erreur `configuration` dès la création du fournisseur.

| Fournisseur        | `deny-all`                | `domains`        | `allowCidrs`                       | `denyCidrs` |
| ------------------ | ------------------------- | ---------------- | ---------------------------------- | ----------- |
| Docker, Podman     | Oui (réseau `none`)       | Proxy HTTP/HTTPS | TCP/UDP IPv4 et IPv6               | Oui         |
| Vercel             | Oui                       | Oui              | IPv4 et IPv6                       | Oui         |
| Daytona            | Oui, confirmé par serveur | Jusqu’à 100      | Jusqu’à 10 en IPv4, sans `domains` | Non         |
| Local, Firecracker | Non                       | Non              | Non                                | Non         |

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

Outpost n’ajoute aucune destination à votre place. Incluez les hôtes de téléchargement, les cibles de redirection, les points d’accès d’authentification et les URL de modèles personnalisées. Si le bootstrap exige un accès large, préinstallez plutôt les outils dans une [image d’agent](../agent-images/).

## Particularités de Vercel

Vercel applique la politique avec son [pare-feu natif](https://vercel.com/docs/sandbox/concepts/firewall).

- Les règles de domaine portent sur le nom de serveur TLS (SNI). Le HTTP non chiffré exige une règle CIDR.
- `allowCidrs` ouvre un accès IP à lui seul ; une plage large contourne votre liste de domaines.
- `denyCidrs` l’emporte sur toutes les règles d’autorisation.
- Une politique uniquement CIDR laisse la sandbox résoudre d’autres noms DNS.

Pour des règles de requête par domaine et des transformations, utilisez plutôt l’option native de Vercel `create.networkPolicy`. Elle sort de la politique portable, et Outpost refuse un fournisseur qui définit les deux.

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

## Filtrer le trafic Docker et Podman

Une allowlist démarre automatiquement un conteneur egress dédié par sandbox. La sandbox partage son namespace réseau, mais ni son système de fichiers ni son namespace de processus. Seul le conteneur de filtrage reçoit `NET_ADMIN` ; la sandbox ne peut pas modifier le pare-feu, même avec une commande `elevated`. Les deux conteneurs sont supprimés à la fermeture ; la récupération explicite retrouve aussi le conteneur de filtrage laissé par une allocation interrompue. Outpost ne demande ni modification du pare-feu hôte ni `sudo`.

Cette implémentation n’est pas encore publiée. Sa première image publique et son digest par défaut restent à publier. Depuis les sources, construisez l’image et sélectionnez-la explicitement. Remplacez `docker` par `podman` pour utiliser Podman.

```sh
bun install --frozen-lockfile
bun run build
docker build -t outpost-egress:dev -f images/egress/Dockerfile .
```

Utilisez un domaine pour le web et un CIDR pour les connexions TCP/UDP directes. Cet exemple autorise un registre en HTTPS et une plage IP réservée à la documentation ; remplacez cette plage par les adresses réelles de votre service. `denyCidrs` est prioritaire sur les autorisations de domaines et de CIDR.

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  egressImage: "outpost-egress:dev",
  egress: {
    mode: "allowlist",
    domains: ["registry.npmjs.org"],
    allowCidrs: ["192.0.2.0/24"],
    denyCidrs: ["192.0.2.42/32"],
  },
});
```

La factory Podman accepte les mêmes options. Après publication d’une image testée et enregistrement de son digest dans Outpost, omettre `egressImage` utilisera cette référence immuable ; le moteur téléchargera l’image si nécessaire. Une image de remplacement est du code de confiance : épinglez son digest en production. Le conteneur de filtrage reçoit la politique, sans workspace ni identifiants de l’agent.

Outpost définit `HTTP_PROXY`/`HTTPS_PROXY` en majuscules et minuscules, un `NO_PROXY` limité au loopback et `NODE_USE_ENV_PROXY=1`. Un logiciel ignorant le proxy doit utiliser un CIDR explicitement autorisé, sinon sa connexion échoue. Les domaines autorisent HTTP sur le port 80 et HTTPS CONNECT sur le port 443. Pour une cible par domaine, CONNECT doit contenir un ClientHello TLS borné dont le SNI correspond à l’hôte demandé ; les en-têtes HTTP chiffrés ne sont pas inspectés. En HTTP, le proxy impose l’en-tête Host de la destination autorisée. Les upgrades WebSocket en HTTP non chiffré et les autres ports du proxy sont refusés.

Les CIDR autorisent indépendamment TCP et UDP directs sur tous les ports, avec IPv6 lorsque le moteur fournit cette connectivité. Un CIDR large ouvre donc des accès au-delà des domaines déclarés. Les destinations interdites le restent via le proxy et avec des adresses IPv4 mappées en IPv6. ICMP et les autres protocoles sortants sont bloqués, sauf la découverte IPv6 des voisins et routeurs nécessaire au lien réseau. Les CIDR IPv4 mappés sont normalisés en IPv4 et exigent un préfixe d’au moins 96. Le localhost (`127.0.0.1` et `::1`) reste disponible pour les services locaux et le proxy, hors politique de sortie externe. Les noms non autorisés demandés au proxy sont refusés avant résolution DNS, même avec une règle CIDR ; utilisez un domaine déclaré ou une adresse IP autorisée. Le DNS direct n’est pas autorisé automatiquement : le conteneur de filtrage résout les cibles du proxy ; une sandbox ayant besoin de son propre résolveur doit autoriser explicitement son CIDR. Cela lui accorde aussi le trafic permis par une règle CIDR. Les interdictions concernent également le résolveur du conteneur de filtrage : interdire son adresse empêche la résolution des domaines.

L’allocation attend le pare-feu et le proxy avant de démarrer la sandbox. Les autorisations externes expirent dans le noyau en trois secondes au maximum si le service de filtrage disparaît ou ne les renouvelle plus ; il n’existe aucun repli vers un réseau sans restrictions. Les commandes locales restent utilisables. L’UID 65532 est réservé au proxy. Des `networks` supplémentaires sont refusés avec une allowlist.

Le test réel couvre HTTP/HTTPS, TCP/UDP, la priorité des interdictions, les commandes élevées, les adresses IPv4 mappées, la perte du service et le nettoyage. Docker sur Linux, ainsi que Docker et Podman sans root dans des environnements Linux imbriqués, ont été exercés. Les VM natives macOS/Windows, les hôtes autonomes sans root et le routage IPv6 natif restent à valider en conditions réelles ; le nom du système seul ne démontre pas la prise en charge. Un moteur incapable d’installer le pare-feu refuse l’allocation. Les téléchargements d’images et les appels modèles faits sur l’hôte restent hors de cette politique.

L’exemple source se trouve dans `exemples/container-egress/` et ne demande aucun identifiant de modèle. La publication de l’image est décrite dans `images/egress/README.md`.

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

- Une politique est fixée à la création du fournisseur. Outpost ne la modifie pas pendant une exécution.
- Docker et Podman exigent une image egress compatible et le filtrage du namespace réseau pour les allowlists. Des `networks` explicites sont incompatibles avec une allowlist ; des réseaux autres que `none` restent incompatibles avec `deny-all`.
- L’exécution locale et [Firecracker](../firecracker/) refusent `egress` ; le réseau de Firecracker se configure sur votre hôte.
- Un service cloud peut encore refuser une politique quand Outpost acquiert la sandbox.
- Les destinations autorisées peuvent toujours recevoir des données de l’agent.
- Les règles réseau ne restreignent ni les montages, ni les identifiants, ni les sockets de l’hôte que vous exposez à la sandbox. Consultez [Sécurité](../security/).

API : [EgressPolicy](../../reference/egresspolicy/) · [ContainerOptions](../../reference/containeroptions/) · [VercelOptions](../../reference/verceloptions/) · [DaytonaOptions](../../reference/daytonaoptions/).

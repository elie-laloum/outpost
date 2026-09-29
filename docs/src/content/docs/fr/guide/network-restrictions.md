---
title: "Restrictions réseau"
description: "Demander des restrictions réseau explicitement prises en charge par le provider."
---

:::note[Expérimental]
Les politiques réseau sont opt-in. Le support Daytona et la configuration Vercel immuable sont disponibles en 7.0.0. La validation réelle propre à chaque provider reste nécessaire.
:::

Définissez `egress` sur le provider de sandbox. Outpost valide les combinaisons non prises en charge avant allocation ; un service cloud peut encore refuser une politique pendant l’acquisition. Sans politique, les valeurs réseau par défaut du provider restent applicables.

## Choisir un provider

| Provider            | `deny-all`                   | Liste de domaines                              | Règles CIDR                                            |
| ------------------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Docker / Podman     | Oui, espace réseau isolé     | Refusée                                        | Refusées                                               |
| Vercel              | Pare-feu natif               | Noms exacts et `*.example.com`                 | Autorisations et refus IPv4/IPv6                       |
| Daytona             | Confirmation serveur requise | Noms exacts ; racine explicite pour les jokers | Autorisation IPv4 seule ; pas de mélange domaines/CIDR |
| Local / Firecracker | Refusé par Outpost           | Refusée                                        | Refusées                                               |

Les listes d’autorisation des conteneurs et les changements de politique en cours d’exécution restent des travaux futurs distincts. Le réseau hôte de Firecracker relève de l’opérateur.

## Autoriser les API de modèles et les registres

```ts
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

const sandboxProvider = createVercelSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

Cet exemple autorise l’API du modèle et le registre, pas tous les endpoints dont un agent pourrait avoir besoin. Outpost n’ajoute aucun domaine automatiquement. Déclarez explicitement les hôtes de téléchargement, redirections, endpoints d’authentification et URL de modèles personnalisés. Préférez des outils préinstallés si le bootstrap demande des accès plus larges ; consultez [l’authentification](../authentication/) et les [images](../agent-images/).

Les entrées sont des noms DNS sans protocole, chemin ni port. Un nom exact n’autorise pas les sous-domaines. `*.example.com` autorise les sous-domaines ; ajoutez `example.com` séparément si la racine est nécessaire. Les listes vides, IP brutes dans `domains`, `*` seul et jokers partiels sont refusés. Utilisez des CIDR pour l’accès explicite par IP. Limitez les destinations : les services autorisés peuvent toujours recevoir des données de l’agent.

## Comportement Vercel

Vercel filtre les domaines par TLS SNI, pas par chemin HTTP ni par en-tête `Host` chiffré. HTTP non chiffré exige une autorisation CIDR. Les CIDR autorisés donnent un accès IP indépendant ; ils ne restreignent pas les domaines autorisés. Les CIDR refusés sont prioritaires. Des CIDR larges peuvent donc neutraliser la restriction par domaine. Une politique exclusivement CIDR permet aussi la résolution DNS d’autres destinations. Consultez les [garanties du pare-feu natif](https://vercel.com/docs/sandbox/concepts/firewall).

Choisissez `egress` ou `create.networkPolicy`. Outpost copie les deux formes pour que les mutations ultérieures de l’appelant ne changent pas les allocations futures. Les transformations de requêtes et redirections natives restent accessibles par `create.networkPolicy`, hors du contrat portable.

## Confirmation Daytona

```ts
import { createDaytonaSandboxProvider } from "@elie-laloum/outpost/providers/daytona";

const sandboxProvider = createDaytonaSandboxProvider({
  egress: {
    mode: "allowlist",
    domains: ["api.openai.com", "registry.npmjs.org"],
  },
});
```

Daytona exige Tier 3/4 et `WRITE_SANDBOXES` pour les restrictions propres à une sandbox. Outpost transmet la politique à la création, puis la réapplique par l’API réseau du serveur avant de préparer le workspace ou de rendre le lease. Un refus fait échouer l’acquisition et déclenche la suppression. Cette confirmation ne couvre pas le démarrage autonome de l’image avant la fin de l’acquisition ; utilisez des images de confiance sans tâche au démarrage ni secret embarqué.

Daytona accepte au plus 100 domaines ou 10 CIDR IPv4. Il ne représente ni `denyCidrs` ni les mélanges domaines/CIDR. Son joker natif inclut la racine : Outpost exige donc cette racine explicitement dans `domains` pour éviter d’élargir silencieusement l’accès. Choisissez `egress` ou les paramètres réseau natifs de création, proxy compris. Sans `egress`, les options natives gardent la sémantique Daytona et ne reçoivent pas de confirmation Outpost. Consultez les [limites réseau Daytona](https://www.daytona.io/docs/en/network-limits/).

## Exécution hors ligne et périmètre

```ts
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const sandboxProvider = createDockerSandboxProvider({
  image: "outpost:dev",
  egress: { mode: "deny-all" },
});
```

Préparez d’abord outils et dépendances dans l’image. Une CLI dans cette sandbox ne peut pas joindre un modèle distant. Les appels du fournisseur de modèles effectués sur l’hôte par le harness intégré sont hors du périmètre réseau de la sandbox, comme les téléchargements d’images, transferts et requêtes de contrôle cloud de l’hôte. Les règles réseau ne limitent pas les montages, identifiants ou sockets hôtes volontairement exposés par montage.

## Reproduire les contrôles réels

Depuis un checkout du dépôt avec Node.js 24 et les dépendances installées :

```sh
OUTPOST_NETWORK_LIVE=1 OUTPOST_NETWORK_PROVIDER=vercel \
  node --env-file=test/.env test/network-live.ts
```

Utilisez `daytona` pour cet autre backend. Ces contrôles créent des sandboxes cloud temporaires facturables, ne font aucun appel de modèle et libèrent les leases acquis. Fournissez les identifiants du provider dans le fichier d’environnement ignoré. Les rapports comparent une connexion témoin sans restriction aux sondes filtrées, dont redirections, accès IP et réutilisation à chaud. Une destination témoin inaccessible est `unverified`, jamais une preuve de filtrage. Les codes de sortie sont 0 pour réussi, 1 pour échec et 2 pour validation partielle/ignorée. Un refus de confirmation Daytona est signalé comme indisponible, pas comme une isolation réussie.

La campagne du 28 septembre 2026 a vérifié sur Vercel les domaines exacts et jokers, redirections bloquées, accès IPv4 et priorité des refus CIDR, ainsi que deny-all et la réutilisation à chaud. IPv6 n’avait pas de témoin accessible et reste non vérifié. Le compte Daytona disponible a refusé les restrictions domaines, CIDR et deny-all ; leur application sur un compte éligible reste à valider. Les tests Docker réels ont réussi ; Podman était indisponible sur cet hôte.

API : [EgressPolicy](../../reference/egresspolicy/) · [DaytonaOptions](../../reference/daytonaoptions/) · [VercelOptions](../../reference/verceloptions/).

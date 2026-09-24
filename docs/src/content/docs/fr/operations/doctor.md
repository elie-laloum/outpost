---
title: "Diagnostiquer l’hôte et les images"
description: "Vérifier les prérequis et les versions des CLI agents sur l’hôte ou dans une image de container."
sidebar:
  order: 3
---

`outpost doctor` inspecte l’hôte par défaut. Ajoutez `--image` pour inspecter aussi une image Docker/Podman locale dans une sandbox temporaire. Aucun des deux modes n’installe d’outil ni n’appelle de modèle. Cette commande est disponible sur main et n’est pas encore publiée.

```sh
outpost doctor --provider docker --agent codex
outpost doctor --provider podman --agent claude --json
outpost doctor --provider docker --agent codex --image outpost:mon-workflow
```

Depuis les sources, utilisez Node.js 24+ :

```sh
node src/cli/main.ts doctor --provider docker --agent codex
```

## Choisir l’environnement

`--provider` accepte `docker` (défaut), `podman`, `local`, `vercel` ou `daytona`. `--agent` accepte `codex` (défaut) ou `claude`. Les options sont explicites : la commande ne lit ni le script de workflow ni ses fichiers d’environnement. Elle ne nécessite pas de dépôt Git.

Chaque rapport vérifie la version de Node.js en cours, Git sur le PATH et le CLI hôte de l’agent choisi. Docker/Podman vérifient aussi le CLI du moteur, son accès via `info` et la disponibilité de tar sur l’hôte. Chaque commande externe dispose d’un délai de cinq secondes et d’une sortie bornée.

Le rapport décrit le placement et le support du terminal interactif du provider intégré sélectionné. Ce sont les contrats des adapters Outpost, pas des résultats obtenus dans une sandbox active. L’installation du SDK cloud, les identifiants, l’accès au compte et l’allocation restent non vérifiés.

## Vérifier une image

`--image NOM` est disponible uniquement avec Docker/Podman. L’image doit déjà exister dans le moteur choisi ; doctor ne la télécharge ni ne la construit. Utilisez la même image que votre workflow, par exemple :

```sh
node src/cli/main.ts doctor --provider docker --agent codex --image outpost:mon-workflow
```

La commande démarre un container séparé avec réseau désactivé, workspace temporaire vide et home privé éphémère. Elle ne monte pas votre dépôt et ne transmet pas les identifiants de l’hôte. Elle utilise l’utilisateur et l’adapter d’exécution habituels d’Outpost : un UID d’image incompatible ou des outils d’exécution manquants font échouer le démarrage. Les montages, variables d’environnement et personnalisations utilisateur propres au workflow ne sont pas reproduits.

Les vérifications identifient Node.js et Git dans le container, contrôlent l’accès au home et comparent le CLI de l’agent choisi à la version épinglée. L’agent de l’image apparaît dans `agent.sandbox`, séparément de `agent.host`. Aucune installation automatique d’agent, authentification ni appel modèle n’est lancé. Un agent absent ou en échec dans l’image fait échouer la vérification ; une différence de version produit un avertissement.

Chaque opération du moteur et chaque vérification disposent d’un délai de cinq secondes. Une annulation ou un dépassement de délai déclenche le nettoyage. Le rapport contient `image.cleanup` ; un échec de nettoyage indique le nom du container concerné et conserve le workspace temporaire pour inspection. La commande renvoie un échec si le nettoyage ne peut pas être confirmé.

## Vérifier les commandes du CLI agent

Après une vérification réussie de la version d’agent dans l’image, doctor lance aussi les commandes par défaut de l’adapter en mode non interactif pour un nouveau tour, une reprise et un fork, avec `--help`. Les vérifications sont `agent.cli.start`, `agent.cli.resume` et `agent.cli.fork`. Elles s’exécutent dans la même sandbox temporaire avec une entrée vide et un identifiant de conversation factice. Aucune conversation réelle n’est reprise ou forkée.

Un code de succès ne suffit pas : certains CLI affichent l’aide même avec des options inconnues. Doctor contrôle aussi la ligne d’usage de la commande attendue et les déclarations des options longues utilisées par Outpost. Une déclaration manquante ou une commande en échec produit `FAIL`. Une aide non reconnue produit `WARN` : le support reste non vérifié. Si la vérification de version échoue, les contrôles d’aide sont `SKIPPED`.

Ces contrôles confirment uniquement les commandes et noms d’options annoncés dans l’aide pour les réglages non interactifs par défaut. Ils ne valident ni les valeurs des options, ni les réglages personnalisés, les sessions interactives, les événements du protocole ou l’exécution effective d’une conversation. Une différence de version reste un avertissement même si tous les contrôles d’aide passent. Les sorties d’aide sont bornées par flux et ne sont pas copiées dans le rapport.

## Interpréter le rapport

| Statut    | Signification                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| `PASS`    | Cette vérification précise a réussi.                                                                                 |
| `WARN`    | Le CLI hôte de l’agent est absent/non identifié, une version diffère de celle épinglée ou l’aide n’est pas reconnue. |
| `FAIL`    | Une vérification de prérequis, d’image, d’aide CLI ou de nettoyage a échoué ; suivre l’action proposée.              |
| `SKIPPED` | La capacité n’a pas été vérifiée.                                                                                    |

Une correspondance exacte de version d’agent confirme uniquement la version épinglée dans la recette d’image et la configuration d’installation automatique d’Outpost. Elle ne prouve ni la compatibilité du protocole ni l’authentification. Une autre version est non vérifiée, pas nécessairement incompatible. L’absence d’agent hôte produit un avertissement : dispatch peut installer un CLI manquant et les providers isolés ont leur propre installation d’agent.

La version d’agent de l’hôte ne décrit pas celle d’un container ou d’une sandbox cloud existants. `--image` vérifie uniquement une nouvelle sandbox. Les montages du workflow, l’état du dépôt, les identifiants et l’accès au modèle nécessitent des vérifications dans l’environnement réel d’exécution. La réussite de doctor ne garantit pas celle d’un dispatch.

Le code de sortie `1` indique une vérification en échec ou une invocation invalide. Les avertissements et vérifications ignorées seuls laissent le code `0`. `--json` écrit uniquement le rapport sur stdout pour une invocation valide, y compris lorsque des vérifications échouent. Les champs comprennent `provider`, `agent`, `scope` (`host` ou `host-and-image`), éventuellement `image`, `placement`, `interactiveTerminal`, `checks` et `hasFailures`. Chaque vérification contient `id`, `status`, `message` et éventuellement `version`/`referenceVersion`. Les sorties brutes des commandes et les identifiants ne sont pas inclus.

Voir [dépannage](../troubleshooting/) pour les échecs d’exécution et [récupération](../recovery/) pour les travaux conservés.

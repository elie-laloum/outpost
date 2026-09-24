---
title: "Diagnostiquer l’hôte et les images"
description: "Vérifier les prérequis et les versions des CLI agents sur l’hôte ou dans une image de container."
sidebar:
  order: 3
---

`outpost doctor` inspecte l’hôte par défaut. Ajoutez `--image` pour inspecter aussi une image Docker/Podman locale dans une sandbox temporaire. Aucun des deux modes n’installe d’outil ni n’appelle de modèle. Les diagnostics hôte et image sont disponibles depuis 3.0.0 ; les contrôles Gemini sont disponibles depuis 4.0.0.

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

## Inspecter une sandbox déjà détenue

Appelez `sandbox.diagnose()` ou `diagnoseSandbox(sandbox)` dans le workflow qui détient la sandbox active. Les sondes inspectent ses véritables exécutables Node.js/Git, les permissions du home, les flux de sortie et le code de sortie non nul d’une commande. Elles n’allouent, ne libèrent, n’installent et ne remplacent aucune sandbox. Toute la séquence conserve l’exclusivité de la sandbox : aucun dispatch, attachement ou commande ne peut la chevaucher.

```ts
import { createSandbox, diagnoseSandbox } from "@elie-laloum/outpost";
import { docker } from "@elie-laloum/outpost/providers/docker";

const sandbox = await createSandbox({
  repository: "/path/to/repository",
  provider: docker({ image: "outpost:my-workflow" }),
});
try {
  const report = await diagnoseSandbox(sandbox, {
    agent: "codex",
    deadlineMs: 5000,
  });
  console.log(report.hasFailures, report.capabilities, report.checks);
} finally {
  await sandbox.close();
}
```

`agent` est facultatif. Sa présence ajoute les sondes de version et d’aide des commandes par défaut start/resume/fork de la CLI installée dans la sandbox. Aucune conversation n’est exécutée. Sans `agent`, aucun exécutable d’agent n’est invoqué. Les variables existantes restent celles de la sandbox détenue ; cela ne reproduit pas l’environnement sans réseau ni identifiants de `--image`.

Les commandes conservent une sortie bornée et disposent chacune de cinq secondes par défaut, configurables de 1 à 60 000 millisecondes avec `deadlineMs`. Un `signal` facultatif annule les sondes suivantes. Les providers doivent respecter les délais et l’annulation des commandes et transferts ; les diagnostics ne peuvent pas forcer un provider personnalisé qui ignore ce contrat à terminer. Les rapports contiennent des observations filtrées, sans sorties brutes ni erreurs du provider. `scope` vaut `owned-sandbox`, `ownership` vaut `caller` et `modelCompatibility` reste `unverified`.

### Sondes cloud et transferts explicites

`diagnoseSandbox(lease, options)` accepte une `SandboxLease` existante, notamment une lease cloud explicitement acquise par votre code. Doctor ne déclenche aucune allocation cloud ; votre workflow choisit le provider, les identifiants, le coût des ressources et leur libération. Vous devez conserver l’exclusivité d’une lease fournie directement pendant l’inspection et la libérer vous-même. Vous pouvez fournir `{ provider: { name, placement } }` comme métadonnées annoncées ; les diagnostics ne les vérifient pas. Une `Sandbox` fournit automatiquement son provider configuré.

Activez `transfers: true` pour tester l’envoi et le téléchargement binaires. La sonde crée un répertoire temporaire unique sous la racine de la lease, vérifie les octets envoyés via un processus Node.js dans la sandbox, puis compare le téléchargement sur l’hôte. Le nettoyage utilise un signal borné indépendant, même après annulation. Vérifiez `sandbox.transfers.cleanup` ; un échec indique le chemin conservé et laisse la propriété à l’appelant. Les sondes réussies suppriment leurs fichiers temporaires sur l’hôte et dans la sandbox. Par défaut, aucun fichier de transfert n’est créé.

`capabilities` sépare les méthodes annoncées (`advertised`) des résultats observés (`observed`). Une sonde de transfert réussie couvre uniquement ce petit fichier binaire. Les transferts par lots, liens symboliques, permissions, sémantique des répertoires et terminaux interactifs restent non vérifiés. L’annulation des descendants d’une charge arbitraire, l’accès réseau, la synchronisation du dépôt et l’accès au compte/modèle ne sont pas certifiés. Pour les tests explicites de compatibilité des SDK cloud, consultez [la compatibilité cloud](../cloud-compatibility/).

## Inspecter les fixtures de protocole intégrées

```ts
import { diagnoseAgentProtocol } from "@elie-laloum/outpost";

console.log(diagnoseAgentProtocol("codex"));
console.log(diagnoseAgentProtocol("claude"));
```

Ce rapport synchrone et hors ligne décode des événements synthétiques intégrés : identifiants de conversation, texte, outils, usage, fin, échecs, événements inconnus et entrées malformées. `scope` vaut `bundled-protocol-fixtures`. `referenceVersion` identifie la version configurée de l’agent ; `installedCli` et `modelCompatibility` restent `unverified`. Une réussite vérifie le parseur du package contre ces fixtures structurelles, sans certifier un exécutable installé, un compte authentifié ou un modèle. Aucune sonde de modèle réel n’est fournie ou appelée implicitement.

Les fixtures exécutables déterministes dans `test/fixtures/agent-protocol.ts` exercent également les arguments et l’entrée standard des requêtes start/resume/fork par défaut avec une sortie JSON par lignes fragmentée. Lancez-les depuis les sources avec `node --test test/functional/doctor-protocol.test.ts`. Elles n’utilisent ni CLI d’agent installée ni identifiants.

Lancez `node test/fixtures/sandbox-diagnostics.ts` depuis les sources pour une démonstration locale complète. Elle crée un dépôt Git temporaire, diagnostique une sandbox `local()` explicite avec sondes binaires, vérifie sa réutilisation par une commande, contrôle les deux protocoles intégrés puis supprime ses ressources temporaires. Elle n’invoque jamais d’agent réel. Pour exercer une image de conteneur locale existante, définissez `OUTPOST_CONTAINER_ENGINE=docker` ou `podman` ; `OUTPOST_CONTAINER_IMAGE` vaut `outpost-ci:latest` par défaut. La fixture conserve son dépôt temporaire si le nettoyage de la sandbox ne peut pas être confirmé.

---
title: Images d'agents préconstruites
description: Construire des images épinglées et vérifier leur provenance signée avant utilisation.
sidebar:
  order: 4
---

Outpost fournit un workflow de construction d'une image combinant Claude Code, Codex et Gemini. Les versions des agents proviennent des mêmes références épinglées que les projets générés. Le workflow et sa procédure de vérification sont disponibles ; cette page n'affirme pas qu'une image publique ou une attestation signée a été publiée. Utilisez uniquement le digest d'une publication réussie et vérifiée.

## Construire localement

Depuis un checkout des sources d'Outpost avec Node.js 24+, choisissez un digest vérifié de `node:24-bookworm-slim` et un instantané Debian daté. Le script exige les deux et rejette les tags de base mutables.

```sh
node scripts/prepare-agent-image.mjs /tmp/outpost-agent-build \
  "node:24-bookworm-slim@sha256:REVIEWED_BASE_DIGEST" \
  20260923T000000Z
docker build --build-arg AGENT_UID="$(id -u)" \
  --build-arg AGENT_GID="$(id -g)" \
  --tag outpost-agents:local /tmp/outpost-agent-build
```

Remplacez `REVIEWED_BASE_DIGEST` par 64 caractères hexadécimaux. Podman accepte le même Dockerfile et les mêmes arguments. Le contexte contient uniquement la recette et les manifestes de paquets ; les fichiers du dépôt, identifiants et transcriptions sont exclus.

Le contexte réutilise les paquets existants, l'utilisateur non root et le home privé, en ajoutant une base épinglée par digest, des dépôts Debian datés et `npm ci` avec `images/agents/package-lock.json`. Les dépendances des agents sont installées dans `/opt/outpost/agents`, hors du home éphémère. Les trois CLI sont dans `PATH`. Le générateur échoue si le manifeste ne correspond plus aux versions d'agents supportées. Mettez à jour le manifeste et son lockfile lorsque ces versions changent :

```sh
npm install --package-lock-only --ignore-scripts --prefix images/agents
```

Consignez le commit source, le digest de base, l'instantané, l'architecture, l'UID/GID et le digest obtenu. Ces entrées rendent la résolution des dépendances reproductible ; les horodatages et outils peuvent empêcher une identité octet par octet. Un instantané épinglé ne reçoit plus de nouveaux paquets de sécurité avant révision et mise à jour explicites. La construction locale n'est pas signée.

## Publier avec une provenance signée

Le workflow dédié `.github/workflows/agent-images.yml` est manuel et limité à `main`. Par défaut, il construit seulement. Il exécute les vérifications du projet, construit pour l'architecture native Linux du runner et lance les tests Docker réels et PTY avant de sauvegarder l'image testée et son contexte exact comme artefacts. Il utilise l'UID/GID du runner et conserve les artefacts sept jours. Il ne publie ni manifestes multiarchitectures ni images pour les providers cloud.

Avant d'activer la publication, les mainteneurs doivent configurer l'environnement GitHub `agent-images` avec des approbateurs obligatoires et uniquement `main`, puis définir la variable de dépôt `OUTPOST_AGENT_IMAGES_PUBLISH=true`. Lancez le workflow avec `publish=true` pour activer le job de publication distinct protégé par cet environnement. La protection de l'environnement relève de l'hébergement et n'est pas créée par le workflow. Synchronisez les changements depuis GitLab canonique avant de lancer le workflow sur le miroir GitHub.

Le job publie l'archive testée sous un tag unique de commit/run/tentative, crée une attestation signée de provenance SLSA pour le digest du registre et vérifie ce digest contre le dépôt, le commit source et ce workflow. Il affiche le digest vérifié et le commit source uniquement après réussite de la vérification, puis conserve le résultat JSON dans l'artefact `agent-image-verification` pendant quatorze jours. Téléchargez ce résultat avec les entrées de construction avant expiration des artefacts ; il contient l'attestation vérifiée, dont le digest de l'image et l'identité des sources. Une construction seule ou une publication ignorée ne constitue pas une preuve de publication signée. Un échec d'envoi, d'attestation ou de vérification marque le run en échec ; un tag dans le registre ne prouve pas une publication signée. Aucun tag `latest` ni release de paquet n'est créé. GitHub fournit l'identité de signature temporaire via OIDC ; aucune clé privée de signature ne doit être dans le dépôt. Consultez les [attestations GitHub](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) et l'[action attest](https://github.com/actions/attest).

## Vérifier avant de télécharger et d'exécuter

Utilisez le digest exact et le commit source du workflow réussi. Remplacez tous les paramètres ci-dessous, y compris le dépôt de publication pour un fork.

```sh
IMAGE='ghcr.io/elie-laloum/outpost/agents@sha256:VERIFIED_IMAGE_DIGEST'
COMMIT='FULL_SOURCE_COMMIT'
gh attestation verify "oci://$IMAGE" \
  --repo elie-laloum/outpost \
  --signer-workflow elie-laloum/outpost/.github/workflows/agent-images.yml \
  --source-ref refs/heads/main --source-digest "$COMMIT" &&
  docker pull "$IMAGE"
docker image inspect --format '{{.Config.User}}' "$IMAGE"
```

Arrêtez-vous si la vérification échoue. `gh attestation verify` valide l'identité signée et le digest ; il ne prouve pas l'absence de vulnérabilités. Ses contraintes figurent dans le [manuel GitHub CLI](https://cli.github.com/manual/gh_attestation_verify). Pour Podman, effectuez la même vérification puis `podman pull` avec le digest.

Passez cette référence complète par digest comme `image` du provider. Le contrôle préalable attend que l'UID de l'image corresponde à celui de l'hôte, sauf si `user` est explicite. S'ils diffèrent, définissez `user: { uid: hostUid, gid: hostGid }` ou reconstruisez pour votre hôte. Cet utilisateur doit pouvoir accéder au checkout monté. Outpost fournit son home tmpfs privé accessible en écriture ; ne persistez pas le home de l'image pour contourner les permissions. L'[authentification et la configuration des conteneurs](../containers/) habituelles s'appliquent.

La vérification du digest et le téléchargement sont des étapes explicites de l'opérateur. Outpost ne télécharge pas automatiquement les images et ne vérifie pas leurs attestations. Combinez une image vérifiée et les [caches de dépendances](../dependency-caches/) pour les exécutions répétées.

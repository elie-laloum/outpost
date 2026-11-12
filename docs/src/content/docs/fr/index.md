---
title: Outpost — Industrialiser vos agents
description: Passez de la tâche ponctuelle au processus que vous pouvez relancer, vérifier et suivre. Orchestrez vos agents avec Outpost, en TypeScript ou en YAML.
tableOfContents: false
head:
  - tag: title
    content: Outpost — Industrialiser vos agents
  - tag: meta
    attrs:
      property: og:type
      content: website
landing:
  category: Orchestration d’agents · Bibliothèque TypeScript et CLI
  headline:
    - Industrialiser
    - vos agents
  lead: Transformez une tâche réussie en un processus que votre équipe peut relancer, vérifier et suivre. Outpost orchestre vos agents, vos outils et vos validations dans des workflows en TypeScript ou en YAML.
  primary:
    label: Explorer les cas d’usage
    href: "#possibilities"
  secondary:
    label: Commencer avec le Guide
    href: guide/introduction/
  scenarios:
    label: Du travail ponctuel au processus
    title: Quel processus allez-vous industrialiser ?
    text: Trier les mails, produire une veille, traiter des documents ou préparer un changement logiciel. Pour chaque tâche récurrente, définissez les étapes, le résultat attendu et les points de contrôle.
    requestLabel: La demande
    resultLabel: Ce que vous obtenez
    note: Ces workflows sont des exemples à composer. Vous connectez vos services avec votre code, des API ou des outils MCP ; Outpost orchestre les étapes, les agents et les pauses.
    items:
      - id: mail
        label: Mails
        icon: message
        title: Une boîte mail qui aide à repérer l’essentiel.
        request: « Trie les nouveaux messages et prépare les réponses à ceux qui ont besoin de moi. »
        steps:
          - title: Lire les messages
            text: Votre API de messagerie fournit les nouveaux mails à traiter.
            role: Vos outils
            icon: plug
            mechanisms:
              - label: Tâches personnalisées
                href: guide/task-dependencies/
          - title: Qualifier le message
            text: Une décision typée classe le message, évalue sa priorité et indique si une réponse est nécessaire.
            role: Décision
            icon: split
            mechanisms:
              - label: Décisions typées · System One
                href: guide/decisions/
          - title: Préparer les réponses
            text: Rédiger des brouillons avec le contexte que vous choisissez de fournir.
            role: Agent
            icon: message
            mechanisms:
              - label: Briefs et contexte
                href: guide/briefs/
          - title: Valider avant l’envoi
            text: Attendre votre décision. Seules les réponses approuvées arrivent à votre action d’envoi.
            role: Vous
            icon: approve
            mechanisms:
              - label: Approbations humaines
                href: guide/approvals/
        result: Des messages regroupés par priorité et des brouillons à valider.
        boundary: Vous choisissez les accès à la messagerie et l’action qui envoie une réponse.
      - id: research
        label: Veille
        icon: search
        title: Suivre les sujets qui comptent pour vous.
        request: « Chaque lundi, dis-moi ce qui a changé dans les sources que je suis. »
        steps:
          - title: Collecter les sources
            text: Une tâche planifiée lance la collecte avec vos outils.
            role: Vos outils
            icon: clock
            mechanisms:
              - label: Planification
                href: guide/cron-schedules/
          - title: Lire en parallèle
            text: Des tâches d’agent indépendantes extraient les nouveautés pertinentes.
            role: Agents
            icon: split
            mechanisms:
              - label: Tâches en parallèle
                href: guide/concurrency-and-retries/
          - title: Rassembler les résultats
            text: Regrouper les sujets et conserver les références vers les sources.
            role: Agent
            icon: layers
            mechanisms:
              - label: Dépendances entre tâches
                href: guide/task-dependencies/
          - title: Transmettre la synthèse
            text: Votre action de publication enregistre ou transmet le rapport terminé.
            role: Vos outils
            icon: file
            mechanisms:
              - label: Tâches personnalisées
                href: guide/task-dependencies/
        result: Une synthèse régulière qui rassemble les nouveautés et leurs sources.
        boundary: Vous fournissez les sources, les outils de collecte et la destination de la synthèse.
      - id: documents
        label: Documents
        icon: file
        title: Transformer une pile de documents en informations utiles.
        request: « Extrais les champs importants et signale ce qui mérite une vérification. »
        steps:
          - title: Lire les fichiers
            text: Donner un dossier à la tâche, même sans dépôt Git.
            role: Vos fichiers
            icon: folder
            mechanisms:
              - label: Workspaces de fichiers
                href: guide/working-with-files/
          - title: Extraire les informations
            text: Un agent renvoie les champs dans la structure que vous déclarez.
            role: Agent
            icon: agent
            mechanisms:
              - label: Réponses structurées
                href: guide/typed-responses/
          - title: Vérifier les valeurs
            text: Votre code valide les données et repère les informations manquantes.
            role: Vos règles
            icon: braces
            mechanisms:
              - label: Validation des réponses
                href: guide/typed-responses/
          - title: Traiter les exceptions
            text: Demander à une personne de clarifier les cas ambigus avant d’exporter les données acceptées.
            role: Vous
            icon: approve
            mechanisms:
              - label: Dialogue humain
                href: guide/interactive-tasks/
        result: Des données structurées à exploiter et les cas ambigus à examiner.
        boundary: Vous fournissez les éventuels outils de conversion et définissez les critères d’acceptation des données.
      - id: support
        label: Demandes clients
        icon: users
        title: Donner une suite utile à chaque demande.
        request: « Retrouve le contexte, qualifie la demande et oriente-la vers la bonne équipe. »
        steps:
          - title: Recevoir la demande
            text: Votre application publie une tâche depuis un événement vérifié.
            role: Vos outils
            icon: queue
            mechanisms:
              - label: Webhooks
                href: guide/webhooks/
          - title: Retrouver le contexte
            text: L’agent retrouve les informations client et produit grâce aux outils MCP que vous connectez.
            role: Agent et outils
            icon: search
            mechanisms:
              - label: Outils MCP
                href: guide/mcp-servers/
          - title: Choisir la suite
            text: Une décision typée sélectionne une catégorie selon vos critères.
            role: Décision
            icon: split
            mechanisms:
              - label: Décisions typées · System One
                href: guide/decisions/
          - title: Orienter ou demander
            text: Votre code affecte la demande ou attend une précision humaine.
            role: Vos règles
            icon: users
            mechanisms:
              - label: Tâches conditionnelles
                href: guide/concurrency-and-retries/
              - label: Dialogue humain
                href: guide/interactive-tasks/
        result: Une demande qualifiée, accompagnée de son contexte, pour l’équipe concernée.
        boundary: Vous connectez le support ou le CRM et choisissez les actions qui peuvent être automatiques.
      - id: software
        label: Logiciel
        icon: branch
        title: Faire avancer un changement jusqu’à la revue.
        request: « Implémente ce changement, lance les tests et conserve le résultat pour revue. »
        steps:
          - title: Préparer le changement
            text: Un agent propose le travail et peut demander votre accord.
            role: Agent et vous
            icon: message
            mechanisms:
              - label: Approbations humaines
                href: guide/approvals/
          - title: Réaliser le travail
            text: L’agent intervient dans l’espace de travail et la sandbox choisis.
            role: Agent
            icon: agent
            mechanisms:
              - label: Sandboxes
                href: guide/choose-a-sandbox/
              - label: Workspaces Git
                href: guide/git-workspaces/
          - title: Exécuter les vérifications
            text: Transmettre les échecs à une boucle de correction bornée ; arrêter une fois les tentatives épuisées.
            role: Vos règles
            icon: ci
            mechanisms:
              - label: Boucles de correction
                href: guide/verification-loops/
          - title: Relire le résultat
            text: Inspecter la branche conservée et décider de son intégration.
            role: Vous
            icon: branch
            mechanisms:
              - label: Politiques de branche
                href: guide/git-workspaces/
        result: Une branche avec les changements proposés et les résultats de vos vérifications.
        boundary: Vous choisissez les tests, le nombre de tentatives et la politique d’intégration.
  overview:
    - icon: nodes
      title: Formalisez le travail
      text: Définissez les étapes, les dépendances et les résultats attendus. Votre équipe partage un workflow versionné, relançable avec de nouvelles entrées.
    - icon: approve
      title: Encadrez l’autonomie
      text: Choisissez les outils, l’environnement et les vérifications. Placez une approbation humaine avant les actions qui l’exigent.
    - icon: replay
      title: Préparez la suite
      text: Configurez le suivi des exécutions et la persistance des étapes. Inspectez les échecs et décidez comment reprendre le travail interrompu.
  capabilities:
    title: Les contrôles qui rendent le travail exploitable
    text: Un processus récurrent a besoin de résultats vérifiés, de limites et d’un chemin de reprise. Ajoutez ces contrôles là où votre travail les exige.
    items:
      - icon: split
        title: Organiser le travail en parallèle
        text: Exécutez les tâches indépendantes avec une concurrence bornée, puis transmettez leurs résultats aux étapes suivantes.
      - icon: braces
        title: Vérifier avant d’agir
        text: Validez les réponses structurées et exécutez vos propres contrôles avant de transmettre le résultat à vos outils.
      - icon: repeat
        title: Borner les tentatives
        text: Fixez des budgets et des limites de tentatives. Renvoyez les vérifications en échec à une boucle de correction bornée.
      - icon: pause
        title: Garder la décision humaine
        text: Suspendez le workflow pour une approbation ou une précision. Continuez avec la réponse acceptée.
      - icon: replay
        title: Organiser la reprise
        text: Avec des checkpoints persistés, reprenez un workflow durable. Inspectez et récupérez explicitement les tentatives interrompues.
      - icon: clock
        title: Suivre chaque exécution
        text: Configurez les rapports, les événements et le stockage de l’état pour retrouver la progression et examiner les résultats.
  closing:
    title: Industrialisez une première tâche.
    text: Choisissez un travail récurrent, définissez ce qui rend son résultat acceptable et construisez votre premier workflow. Le Guide vous accompagne de l’installation à l’exécution.
    link:
      label: Commencer avec le Guide
      href: guide/introduction/
  install:
    managers: Gestionnaire de paquets
    commands:
      - label: npm
        command: npm install @elie-laloum/outpost
      - label: yarn
        command: yarn add @elie-laloum/outpost
      - label: bun
        command: bun add @elie-laloum/outpost
      - label: pnpm
        command: pnpm add @elie-laloum/outpost
    copy: Copier la commande d’installation
    copied: Copié
    failed: La copie a échoué. Sélectionnez la commande pour la copier.
    prerequisites: Node.js 24+ · Vos agents, vos outils, votre environnement
  footer:
    documentation:
      title: Documentation
      links:
        - label: Guide
          href: guide/introduction/
        - label: API
          href: reference/
    source:
      title: Projet
      links:
        - label: GitLab
          href: https://gitlab.elielaloum.com/elielaloum/outpost
        - label: GitHub
          href: https://github.com/elie-laloum/outpost
        - label: npm
          href: https://www.npmjs.com/package/@elie-laloum/outpost
    license: Licence MIT
---

<span id="une-tâche-pour-commencer-un-workflow-pour-la-suite"></span>
<span id="livrer-un-export-csv-du-ticket-à-la-branche"></span>
<span id="commencez-par-ce-qui-vous-attend-déjà"></span>
<span id="vos-outils-habituels-votre-façon-de-les-assembler"></span>

<span id="votre-processus-peut-suivre-plusieurs-chemins"></span>
<span id="choisissez-comment-vos-agents-travaillent"></span>

## Un cadre explicite, de la demande au résultat

Industrialiser, c’est définir ce qui se passe à chaque exécution. L’agent propose un résultat, votre code le vérifie et le workflow décide de la suite. Les actions sensibles peuvent attendre une approbation humaine.

Voici un chemin possible. Vous choisissez les vérifications et les pauses utiles à votre travail.

<!-- canvas -->

- **Nouvelle entrée**: Un message, un document, une tâche planifiée ou une demande de votre application.
  - Vos outils
  - → **Comprendre**: contexte disponible
- **Comprendre**: Un agent analyse l’entrée et renvoie une proposition structurée.
  - Agent
  - → **Vérifier**: proposition prête
- **Vérifier**: Vos règles contrôlent le résultat et déterminent si une personne doit le relire.
  - Votre code
  - → **Agir**: résultat accepté
  - → **Demander un avis**: jugement nécessaire
- **Demander un avis**: Enregistrer la question et attendre une réponse acceptée avant de continuer.
  - Vous
  - → **Agir**: accord reçu
- **Agir**: Votre fonction enregistre le résultat, met à jour un service ou lance la tâche suivante.
  - Vos outils

## Vos agents. Votre infrastructure. Vos règles.

Utilisez un agent CLI comme Claude Code, Codex, Copilot, Kimi ou Antigravity, ou construisez une boucle d’agent avec un fournisseur de modèles et vos propres outils. Choisissez séparément l’environnement d’exécution : un conteneur, une sandbox cloud ou une exécution locale explicite.

Composez le workflow en TypeScript ou déclarez-le en YAML. Travaillez avec des dépôts, des dossiers ordinaires ou des fichiers temporaires. Gardez vos services existants et connectez les actions dont votre workflow a besoin.

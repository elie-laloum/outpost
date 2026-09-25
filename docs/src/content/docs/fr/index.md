---
title: "Outpost"
description: "Lancez un agent de code, comprenez son workspace, puis construisez un workflow."
---

Outpost est une bibliothèque TypeScript et une CLI pour exécuter des agents de code dans des sandboxes, organiser leur travail Git et relier leurs résultats dans des workflows typés.

**Commencez par un résultat concret :** corrigez un test en échec dans un petit projet de traitement de texte jetable. Choisissez Codex ou Claude, lancez le script généré, puis examinez le commit.

[Lancer votre premier agent →](guide/start/quickstart/)

<span id="choisir-un-parcours"></span>
<span id="utiliser-cette-documentation"></span>

## Deux façons de lire

| Apprendre par la pratique                                                                                | Retrouver un comportement précis                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Le [Guide](guide/) progresse d’une tâche d’agent vers les environnements réutilisables et les workflows. | La [Référence](reference/) explique API, commandes CLI, configuration et limites.                                                 |
| Chaque exemple pratique contient sa préparation, son code complet et le résultat attendu.                | Les signatures suivent les déclarations du package ; les contrats détaillés restent accessibles sans interrompre l’apprentissage. |

Vous connaissez déjà les bases ? Choisissez une [recette du cookbook](guide/cookbook/) ou [diagnostiquez un échec](guide/operations/troubleshooting/).

## Les prérequis

Node.js 24+, Git et Docker pour le premier agent. Choisissez explicitement compte ou clé API ; la facturation API est séparée de l’abonnement. Le téléchargement/build initial de l’image peut prendre plusieurs minutes. Les exemples suivants réutilisent cette préparation tout en restant reproductibles indépendamment.

Les exemples de workflow, validation et persistance fonctionnent aussi [sans modèle ni conteneur](guide/cookbook/offline/).

L’anglais et le français couvrent les mêmes fonctionnalités. Le site public suit la dernière release stable ; le [changelog](project/changelog/) répertorie les versions et la [roadmap](project/roadmap/) distingue le travail prévu.

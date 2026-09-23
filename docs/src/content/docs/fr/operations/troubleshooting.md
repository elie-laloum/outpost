---
title: "Dépannage"
description: "Dépannage — Outpost"
sidebar:
  order: 2
---

Commencez par le code d’erreur, le log et le chemin du workspace conservé. Changez une seule configuration à la fois pour garder le diagnostic lisible.

| Symptôme                                  | Vérification / action                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Image introuvable                         | Construire avec le même moteur et le même tag que le provider.                                 |
| UID incorrect ou montage non inscriptible | Aligner UID/GID de construction et d’exécution ; vérifier droits, namespace Podman et SELinux. |
| Podman indisponible sur macOS             | Démarrer Podman Machine et vérifier l’accès depuis le CLI hôte.                                |
| Authentification de l’agent refusée       | Vérifier variables API/OAuth déclarées ou fichiers natifs explicitement montés.                |
| Allocation cloud réussie, agent en échec  | Les identifiants cloud et modèle sont indépendants ; examiner stderr.                          |
| Option de CLI refusée                     | Comparer les versions à `agentVersions` et reconstruire les images anciennes.                  |
| Silence puis délai dépassé                | Vérifier identifiants, réseau, logs et limites ; ne pas seulement augmenter les délais.        |
| Variable de brief manquante               | Fournir `values`, corriger le modèle ou utiliser `ask` interactif.                             |
| Transcript introuvable à la reprise       | Vérifier agent, identifiant, `conversationHome` et capture précédente.                         |
| Opération déjà active                     | Sérialiser les opérations ou allouer plusieurs sandboxes.                                      |
| Branche utilisée ailleurs                 | Utiliser volontairement ce workspace ou choisir une autre branche.                             |
| Hôte modifié pendant l’exécution distante | Garder la récupération et réconcilier séparément changements locaux et entrants.               |
| Workflow en attente après annulation      | Les callbacks/providers personnalisés doivent respecter AbortSignal et finir leur nettoyage.   |
| Init refuse l’écrasement                  | Modifier les fichiers existants ou choisir un autre répertoire projet.                         |

Pour signaler un problème, fournissez OS, versions de Node/Outpost/provider/agent, code d’erreur expurgé et configuration minimale. Retirez identifiants, prompts privés et sources des logs partagés. Voir [récupération](../recovery/) et [sécurité](../security/).

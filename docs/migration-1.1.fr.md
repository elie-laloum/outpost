# Migrer vers la version 1.1

La version 1.1 complète les campagnes par issue et corrige plusieurs contrats d’exécution. Voici les changements visibles depuis la version 1.0.

| Domaine            | Comportement en 1.1                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boucle ponctuelle  | Chaque passe de `dispatch` acquiert une nouvelle sandbox. Utilisez `createSandbox()` pour conserver un environnement entre les passes.                                |
| Variables          | Seul `.outpost/.env` est lu. Une valeur non vide du fichier est prioritaire ; une déclaration vide reprend la valeur du processus.                                    |
| Prompts            | Les chemins relatifs partent du répertoire de l’appelant, même lorsque `repository` désigne un autre dossier.                                                         |
| Hooks              | `workspaceReady` intervient dès l’ouverture du workspace. Les hooks hôte sont séquentiels ; ceux de la sandbox sont concurrents.                                      |
| Copies             | Une entrée absente est ignorée. Les autres erreurs de copie restent bloquantes.                                                                                       |
| Cloud              | Les commits sont envoyés par défaut. `includeUncommitted: true` ajoute les modifications et fichiers non suivis. Les copies demandées explicitement sont transférées. |
| Branche distante   | Sans politique explicite, un workspace d’intégration est créé.                                                                                                        |
| Tokens Claude      | `input`, `cached` et `cacheCreated` distinguent entrée non cachée, lecture et création du cache.                                                                      |
| Événements         | `pass` et `at` identifient chaque observation. Les lignes brutes accompagnent les événements normalisés.                                                              |
| Journaux           | Un fichier explicite est complété sans écrasement. `logging: "stdout"` affiche une progression lisible.                                                               |
| Reprise            | Un résultat ponctuel accepte une nouvelle branche, un fournisseur et des hooks. Un résultat chaud conserve sa sandbox.                                                |
| Réponse structurée | La balise et la capacité de réparation sont validées avant allocation. Un bloc Markdown JSON peut apparaître dans la balise.                                          |

Le marqueur par défaut reste `<outpost>done</outpost>`. Les adaptateurs natifs restent Codex et Claude Code.

## Campagnes et starters

`campaign` utilise `Backlog.list/get/close`, recharge les issues à chaque cycle et ne les ferme qu’après intégration des commits dans la branche hôte. Le connecteur GitHub pagine les résultats et applique son label. Beads doit être installé sur l’hôte ; sa recette de conteneur générée inclut aussi `bd`.

Les paramètres du starter sont `cycles`, `concurrency`, `implementationPasses` et `reviewPasses`. `planner: false` traite les issues disponibles dans l’ordre ; `reviewer: false` désactive la revue. Les rôles `planner`, `reviewer` et `merger` acceptent des adaptateurs distincts pour choisir les modèles. Les règles de développement se trouvent dans `.outpost/STANDARDS.md`.

Un échec d’implémentation est enregistré sans interrompre les issues indépendantes. Un cycle sans commit s’arrête. Un échec de fusion conserve le travail et ne ferme aucune issue concernée. Si la fermeture chez le tracker échoue après une fusion réussie, vérifiez son état avant de relancer la campagne.

`init` ne remplace jamais les fichiers existants : adoptez le nouveau starter manuellement ou générez-le dans un autre dossier.

## Diagnostic et récupération

`recoveryDetails(error)` fournit les chemins, commits et journaux disponibles sans remplacer la raison d’annulation. Un échec de préparation nettoie le workspace s’il est propre ; le travail modifié et les artefacts d’une synchronisation échouée sont conservés. Les transferts réussis sont nettoyés à la fermeture.

`reporter({ label, verbose, quiet, write })` produit un observateur lisible. `idleWarningMs` règle les avertissements d’inactivité ; `diagnostic` reçoit l’estimation de taille des expansions de prompt. Cette estimation n’est pas un compteur de facturation.

## Extensions

Un adaptateur peut fournir `storage: ConversationStore`, `resumable` et `transcriptUsage`. Le service `conversations` expose chemins, recherche, capture, restauration et réécriture sélective. Chaque tour expose son propre chemin `transcript`.

Les transferts acceptent `{ signal, deadlineMs }` ; `limits.copyMs` borne leur attente. Un fournisseur personnalisé doit réellement respecter l’annulation pour empêcher des écritures tardives. `Command.terminal` accepte les flux de l’appelant et `attach.ask` complète les variables de prompt manquantes sans terminal interactif.

La CI vérifie Linux, Windows, macOS, Docker et Podman. Les contrats Vercel/Daytona sont testés avec des doubles SDK. Une authentification modèle et des comptes cloud distincts restent nécessaires pour les essais réels correspondants.

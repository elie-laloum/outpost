# Lot 15 — Référence API

[Retour à la synthèse](README.md).

La référence couvre beaucoup de contrats et garde les conséquences importantes sur les ressources, les erreurs et la récupération. Le déplacement depuis le Guide est utile, mais il ne suffit pas : certaines pages API restent des blocs compacts, et la génération perd des informations de type essentielles.

Les **723 pages par langue** ont été inventoriées : 673 symboles publics dans 31 familles et 50 contrats de support. [L’inventaire](api-pages.csv) contient une ligne par page avec les deux chemins et les observations structurelles. Il ne certifie pas les 723 contrats contre leur implémentation. La lecture sémantique a porté sur les entrées des 31 familles et sur les contrats sensibles cités ci-dessous.

## P1 — Les signatures ne montrent pas toutes les variantes

Les déclarations compilées exposent plusieurs signatures pour huit fonctions : `createAgent`, `attach`, `createSandbox`, `dispatch`, `defineAgentTask`, `defineIsolatedTask`, `defineInteractiveAgentTask` et `createWorkspace`. Chaque page affiche seulement la première déclaration dans « Signature ».

Exemple : [createWorkspace](../../src/content/docs/reference/createworkspace.md) annonce Git et fichiers, mais sa signature n’accepte que `GitWorkspaceOptions`. À l’inverse, [dispatch](../../src/content/docs/reference/dispatch.md) ne montre que `FileDispatchRequest`, alors que le premier tutoriel utilise la variante Git.

La mention « la signature précise les combinaisons autorisées » devient donc trompeuse. Le tableau fusionne des variantes que la signature affichée ne permet pas de démêler. Le générateur utilise `declaration.getText()` dans [sync-reference.mjs](../../scripts/sync-reference.mjs), tandis que les propriétés sont collectées sur toutes les signatures dans [reference-model.mjs](../../scripts/reference-model.mjs).

**Correction proposée :** afficher toutes les surcharges et leurs conditions, puis présenter les propriétés communes et celles des variantes sans perdre leur provenance. Corriger le générateur, puis régénérer les deux langues. [Inspection TypeScript réellement exécutée](evidence/api-overloads.json).

## P1 — `dispatch.agent` est déclaré facultatif

Le tableau de [dispatch](../../src/content/docs/reference/dispatch.md) indique `options.agent` comme facultatif. L’inspection du type résolu montre qu’il est obligatoire dans les trois surcharges. `createSandbox`, lui, peut recevoir un agent plus tard : ces contrats ne doivent pas être confondus.

Le tableau contient aussi des descriptions propres aux fichiers appliquées à la fonction générale : `options.variables` affirme l’absence de chargement implicite de `.env`, alors que le parcours Git conserve ce chargement. `repository` et `branch` n’expliquent que leur incompatibilité avec `workspaceSource`, sans décrire le cas Git historique.

**Correction proposée :** calculer présence et description depuis le contrat résolu de chaque variante, sans réutiliser aveuglément le premier champ trouvé.

## P1 — Le texte de `dispatch` promet une intégration inconditionnelle

La description dit que l’appel intègre la branche après réussite. Dans le code, un fournisseur monté sans politique explicite utilise `current`, un fournisseur distant utilise `integrate`, et `named` conserve sa branche sans fusion. Les exemples de relecture utilisent justement `named`.

**Correction proposée :** écrire que l’appel applique la politique de branche choisie, puis préciser les défauts selon le placement. Sources : [workspace.ts](../../../src/infrastructure/git/workspace.ts), [sandbox-provision.ts](../../../src/application/sandbox-provision.ts). Même correction dans les sources éditoriales EN/FR de [symbols.json](../../reference-content/symbols.json).

## P2 — Des liens Guide/API se renvoient la question

Le Guide remplace parfois une réponse pratique par un lien de contrat ; plusieurs contrats renvoient ensuite à un « exemple complet et règles détaillées » générique. Par exemple, la référence de `createRecipeRuntime` renvoie à la première recette YAML, qui n’enseigne pas cette API TypeScript. Le lien devrait viser `recipe-extensions`.

L’inventaire relève **508 pages sans lien direct vers le Guide** et **510 sans synthèse d’usage avant les propriétés**. Ce ne sont pas 510 erreurs : l’absence de prose est un choix actuel pour beaucoup d’interfaces. Mais une page atteinte depuis la recherche doit tout de même indiquer à quoi sert son contrat et quelle procédure l’utilise.

**Correction proposée :** une phrase d’usage pour les contrats qui en ont besoin, un lien pratique ciblé et des liens vers les membres concernés. Conserver les deux espaces Guide/API et les URL des symboles.

## P2 — Déplacer un catalogue ne le rend pas lisible

[FaultCode](../../src/content/docs/reference/faultcode.md) décrit les codes dans un seul paragraphe. [createCronSchedule](../../src/content/docs/reference/createcronschedule.md) accumule macros, syntaxe et règles des jours dans sa description. [defineAgentProfile](../../src/content/docs/reference/defineagentprofile.md) regroupe les projections natives dans un long bloc.

Ces informations ont leur place dans l’API. Elles demandent des sous-sections ou tableaux, pas un retour dans le Guide. Les grosses cellules de `WorkspaceOptions.guard` et de plusieurs options de ressources rendent également la lecture et le lien précis difficiles.

Onze pages utilisent la description générique « Options selecting source, execution capabilities or inspected recovery preconditions for this operation. ». Sur `PublicationJournal.options`, elle ne dit pas que le champ décrit les options de publication enregistrées. L’inventaire les repère sans les assimiler à des erreurs de type.

Les imports multiples d’un même identifiant, par exemple [EgressPolicy](../../src/content/docs/reference/egresspolicy.md), devraient être présentés comme des alternatives : copier le bloc entier répète la déclaration locale du même nom.

## Couverture des informations précédemment déplacées

| Information                                    | Contrat relu                                                                                                                                                 | Verdict                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Catalogue tarifaire, conversion et exclusions  | [loadModelPrices](../../src/content/docs/reference/loadmodelprices.md), [ModelPricesOptions](../../src/content/docs/reference/modelpricesoptions.md)         | Couverture présente ; le Guide peut rester court.                                         |
| Tarifs et budget monétaire                     | [WorkflowBudget](../../src/content/docs/reference/workflowbudget.md)                                                                                         | Conditions et usage incomplet présents ; garder les conséquences pratiques dans le Guide. |
| Cron : macros, champs et combinaison des jours | [createCronSchedule](../../src/content/docs/reference/createcronschedule.md)                                                                                 | Couverture présente, mais présentation trop compacte.                                     |
| Instructions et restrictions des profils       | [defineAgentProfile](../../src/content/docs/reference/defineagentprofile.md), [AgentProfileOptions](../../src/content/docs/reference/agentprofileoptions.md) | Projections et refus présents ; réorganiser dans la même API.                             |
| Restrictions réseau et différences providers   | [EgressPolicy](../../src/content/docs/reference/egresspolicy.md)                                                                                             | Contrat présent ; les implications de sécurité doivent rester près des exemples.          |
| Attente après quota                            | [WorkflowQuotaPolicy](../../src/content/docs/reference/workflowquotapolicy.md)                                                                               | Délai et défaut présents ; la page pratique doit montrer pause et reprise.                |

Ce tableau est un contrôle ciblé des déplacements, pas une certification exhaustive de tous les paragraphes retirés lors des passes précédentes.

## Retour par famille

| Famille                      | Pages publiques | Retour critique                                                                                                                                                                   |
| ---------------------------- | --------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspaces de fichiers       |              70 | Priorité aux variantes Git/fichiers et aux descriptions génériques. Ajouter des liens vers restauration et publication, pas seulement la création.                                |
| Recettes YAML                |              20 | `defineRecipe` décrit encore surtout les formats 1/2 et un workflow séquentiel, alors que le code traite le format 3. Les API runtime méritent un autre lien que le premier YAML. |
| Sources de secrets           |              18 | Bon positionnement des validations et de la propriété des clients. Aider à choisir l’adaptateur sans répéter les règles communes sur chaque page.                                 |
| Tests de workflows           |               7 | Les limites réelles du simulateur sont explicites. Le Guide lié doit réellement isoler son dépôt temporaire.                                                                      |
| Tarification                 |               7 | Bonne couverture des options déplacées. Séparer davantage tarif chargé, consommation rapportée et facture du fournisseur.                                                         |
| Décisions                    |              32 | Déclarations précises mais vocabulaire spécialisé ; relier chaque forme de question à un résultat concret dans le Guide.                                                          |
| Transports de stockage       |              27 | Ressources et concurrence bien décrites. La même phrase de propriété est répétée ; privilégier un lien précis vers le contrat partagé.                                            |
| Diagnostics                  |               9 | Les sondes et leurs limites sont identifiables. Les retours doivent mener vers l’interprétation pratique des résultats, pas seulement une liste de contrôles.                     |
| Workspaces                   |              19 | Grosses cellules de propriétés ; isoler politique de branche, garde-fou et reprise. Ne pas gommer le défaut `current`.                                                            |
| Sandboxes                    |               3 | La signature incomplète de `createSandbox` gêne tout le parcours Git. Distinguer propriété du workspace et de la sandbox.                                                         |
| Dispatch                     |              22 | Lot prioritaire : surcharges, agent requis et politique de branche. Vérifier chaque champ fusionné entre modes.                                                                   |
| Commandes et terminal        |               7 | `attach` souffre aussi des surcharges ; les restrictions des variantes natives de fichiers doivent être lisibles.                                                                 |
| Agents                       |              20 | Les détails de projection ont leur place ici, sous des sections lisibles. Distinguer composition et exécution.                                                                    |
| Harness                      |              95 | Famille la plus grosse. Ajouter des liens par tâche : outils, permissions, contexte, compétences, délégation ; conserver les pages symboles.                                      |
| Prompts et réponses          |               7 | Bons contrats d’extraction et de validation. Garder réparation, erreur et schéma reliés directement.                                                                              |
| Conversations                |              19 | Chemins et relocation sont documentés. Relier les contrats de stockage à un véritable exemple de capture/reprise entre processus.                                                 |
| Observabilité                |              54 | Unions d’événements difficiles à parcourir ; ancrages par événement et exemples ciblés aideraient davantage qu’une longue signature seule.                                        |
| Workflows                    |              48 | Dépendances et tentatives bien décrites. Les trois constructeurs de tâches surchargés demandent la correction du générateur.                                                      |
| Providers                    |              23 | Conserver le sous-chemin d’import et les contraintes. Relier chaque provider à sa procédure complète et à ses limites de validation.                                              |
| Fournisseurs de modèles      |              16 | Protocole et absence de repli sont clairs. Distinguer les délais HTTP du délai global d’un tour dans les liens pratiques.                                                         |
| Récupération et rétention    |              12 | Les raisons de conservation sont nécessaires ; offrir des liens précis depuis « pourquoi cette entrée reste ».                                                                    |
| Erreurs                      |               7 | `FaultCode` doit devenir un tableau lisible. Ne pas faire d’un lien vers une liste de codes la seule réponse pratique du Guide.                                                   |
| Réservations de stockage     |               4 | La différence quota physique/réservation et l’absence d’expiration sont importantes. Il manque une procédure pratique distincte pour un propriétaire arrêté.                      |
| Restauration de récupération |               5 | Bon découpage plan/application. Préciser les préconditions et effets sur la destination sans confondre « aucun résultat créé » avec les fichiers temporaires de validation.       |
| Activité des ressources      |              10 | Garder la distinction observation/propriété. Aider le lecteur à retrouver la procédure de récupération autorisée.                                                                 |
| Checkpoints de workflow      |               6 | La structure de l’état est détaillée ; une courte synthèse aiderait à distinguer ces types des options de reprise.                                                                |
| Approbations et pauses       |              15 | Acteur, refus et priorité des échecs sont explicités. Relier le contrat signé à une soumission complète.                                                                          |
| Artefacts typés              |              16 | Validation et intégrité sont couvertes. Distinguer clé logique et fichier physique dans les exemples liés.                                                                        |
| Exécution distribuée         |              23 | Baux, résultat et fermeture sont utiles. Orienter vers un essai de bout en bout avant les détails de finalisation.                                                                |
| Déclencheurs                 |              39 | Bon contenu technique, trop compact pour cron. Relier TypeScript et services YAML, sans affirmer qu’aucune CLI ne lance le serveur.                                               |
| Exécution spéculative        |              13 | Statut expérimental et absence de fusion bien annoncés. Orienter séparément vers essai, sélection par score et récupération.                                                      |

Les 50 contrats de support sont recensés dans le CSV avec la mention « Hors navigation » : leur présence n’est pas un défaut. Ils doivent rester accessibles depuis les signatures qui les utilisent.

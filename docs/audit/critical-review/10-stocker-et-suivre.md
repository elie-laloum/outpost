# Lot 10 — Stocker et suivre

La distinction terminal/journal/rapport/projection est utile mais trop dispersée. Corriger les modules de lecture/rejeu qui exécutent un agent à l’import, puis rendre chaque sortie observable.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Choisir où stocker les données — P2

[Français](../../src/content/docs/fr/guide/storage.md) · [English](../../src/content/docs/guide/storage.md)

**Sections à reprendre :** Ce qu’Outpost enregistre / Traiter un conflit d’écriture.

**Constat.** La page commence par l’abstraction Transport et dix familles avant d’aider à retrouver un fichier. Le bas devient un tutoriel de concurrence pour implémenteur.

**Action proposée.** Commencer par où se trouvent mes données et ce qui reste local ; déplacer la manipulation directe ifRevision dans une procédure avancée.

**Plan examiné :** Ce qu’Outpost enregistre · Tout garder sur disque · Partager un transport · Utiliser un stockage distant · Ce qui reste sur le disque local · Traiter un conflit d’écriture · Workspaces de fichiers · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 166 lignes EN / 166 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Stocker les données dans S3 ou R2 — P2

[Français](../../src/content/docs/fr/guide/object-storage.md) · [English](../../src/content/docs/guide/object-storage.md)

**Sections à reprendre :** Le passer aux stockages.

**Constat.** Les promesses « reprendre depuis une autre machine » et « n’importe où » précèdent loin la réserve sur les fichiers locaux. Le lecteur peut croire que S3 transporte aussi le workspace.

**Action proposée.** Rattacher immédiatement la condition de conservation/restauration du workspace à ces promesses ; garder R2 comme variante distincte avec son mode de suppression explicite.

**Plan examiné :** Créer le transport · Préparer le bucket · Le passer aux stockages · Garder les identifiants sur l’hôte · Utiliser Cloudflare R2 · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 126 lignes EN / 126 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Lire les journaux d’exécution — P1

[Français](../../src/content/docs/fr/guide/journals.md) · [English](../../src/content/docs/guide/journals.md)

**Sections à reprendre :** Enregistrer un journal / Relire un journal.

**Constat.** read-journal.ts importe record-journal.ts, qui lance un dispatch à l’import. Lire le fichier après coup réexécute donc la tâche au lieu de seulement consulter un journal existant. Introduction répétée deux fois sur les rapports.

**Action proposée.** Séparer le module de stockage, l’écriture de la référence et la lecture. Montrer la référence passée en argument ; supprimer la répétition initiale et rendre le choix logging concret.

**Vérification.** Lecture des modules nommés en EN et FR : import statique vers un module contenant await dispatch au niveau supérieur. Constat de flux d’exécution, sans appel de modèle réel.

**Plan examiné :** Enregistrer un journal · Choisir ce qui est enregistré · Relire un journal · Comprendre les événements enregistrés · Enregistrer une exécution pour la rejouer · Retrouver le journal d’un dispatch en échec · Supprimer les anciens journaux · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 136 lignes EN / 136 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Regrouper les événements d’une exécution — P2

[Français](../../src/content/docs/fr/guide/observability.md) · [English](../../src/content/docs/guide/observability.md)

**Sections à reprendre :** Ce que reçoit le hub / Observer les décisions.

**Constat.** Bon exemple initial mais plusieurs sous-sections ne livrent que des liens API ; fin technique sur accounting synchrone et scopes. Deux blocs de suites et trois annonces de déplacement.

**Action proposée.** Garder réunion et propagation du contexte ; fournir un événement lisible puis une seule liste de suites. Lier directement redaction et livraison, déplacer les détails de routage.

**Plan examiné :** Observer une exécution entière · Transmettre le contexte à vos propres tâches · Ce que reçoit le hub · Observer les décisions et sélections · Pour continuer · Pour aller plus loin.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 142 lignes EN / 144 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Gérer les observateurs lents ou défaillants — P2

[Français](../../src/content/docs/fr/guide/observation-delivery.md) · [English](../../src/content/docs/guide/observation-delivery.md)

**Sections à reprendre :** Livraison et erreurs / Sortie trop volumineuse.

**Constat.** Titre sur les observateurs lents, démonstration qui affiche uniquement done 0 0 : elle ne montre ni perte ni traitement d’erreur. La limite de ligne CLI appartient à un autre problème.

**Action proposée.** Ajouter une démo déterministe d’observateur qui échoue sans arrêter le workflow ; déplacer oversized-event vers diagnostic/contrat de protocole.

**Plan examiné :** Livraison et erreurs · Traiter une sortie trop volumineuse · Traiter les événements d’agent de façon asynchrone · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 93 lignes EN / 93 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Masquer les secrets dans les traces — P3

[Français](../../src/content/docs/fr/guide/redacting-secrets.md) · [English](../../src/content/docs/guide/redacting-secrets.md)

**Sections à reprendre :** Appliquer une règle / Ce qui reste visible.

**Constat.** Page courte avec résultat hors ligne et limites explicites. Les termes transcripts/bundles et raisonnement signé restent techniques, mais utiles au risque de reprise.

**Action proposée.** Conserver le parcours ; préférer « conversations enregistrées » et lier précisément l’impact sur la reprise. Ne pas supprimer les exclusions du masquage.

**Plan examiné :** Appliquer une règle de masquage · Protéger les captures et rapports · Savoir ce qui reste visible.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 66 lignes EN / 66 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Exporter les traces et les métriques — P2

[Français](../../src/content/docs/fr/guide/opentelemetry.md) · [English](../../src/content/docs/guide/opentelemetry.md)

**Sections à reprendre :** Exporter vers OpenTelemetry.

**Constat.** Le prérequis SDK enregistré est annoncé mais aucun code ne le fait ; copier les trois fichiers peut ne rien exporter. La page ne permet pas un premier résultat visible sans une configuration externe non montrée.

**Action proposée.** Fournir un exporteur console minimal complet ou pointer vers un fichier de démarrage précis ; montrer un span attendu et le flush du SDK.

**Plan examiné :** Exporter vers OpenTelemetry.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 63 lignes EN / 63 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Lire l’état d’une exécution — P2

[Français](../../src/content/docs/fr/guide/run-state.md) · [English](../../src/content/docs/guide/run-state.md)

**Sections à reprendre :** Enregistrer / Lire / Suivre un curseur.

**Constat.** Le guide répond à une vraie question mais six fichiers et beaucoup de contrats d’observation entravent la première lecture par ID. Le workflow check finit avant que le second terminal soit utile pour suivre du direct.

**Action proposée.** Garder d’abord écrire/lire une fiche hors ligne ; proposer ensuite un exemple assez long pour observer la progression, puis curseur et reprise. Corriger le lien masquage.

**Plan examiné :** Enregistrer une exécution · Démarrer un workflow · Lire depuis un autre processus · Suivre un curseur · Interpréter les heartbeats et les reprises.

**Repères :** 5 fichiers nommés dans les extraits, variantes comprises ; 112 lignes EN / 112 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Rejouer une exécution enregistrée — P1

[Français](../../src/content/docs/fr/guide/record-replay.md) · [English](../../src/content/docs/guide/record-replay.md)

**Sections à reprendre :** Enregistrer une exécution et la rejouer.

**Constat.** replay.ts importe record.ts qui lance la tâche modèle à l’import. L’exemple présenté comme rejeu sans modèle en déclenche donc un avant de rejouer. Les étapes internes sont formulées à l’impératif comme des actions du lecteur.

**Action proposée.** Persister le journal depuis record.ts puis le lire sans importer son exécution ; rendre la commande de rejeu indépendante et tester qu’elle n’appelle aucun modèle.

**Vérification.** Lecture des modules nommés en EN et FR : import statique vers un module contenant await dispatch au niveau supérieur. Constat de flux d’exécution, sans appel de modèle réel.

**Plan examiné :** Enregistrer une exécution et la rejouer · Enregistrer une exécution rejouable · Ce que fait un rejeu · Rejouer les réparations, les passes et les agents de secours · Traiter les divergences · Rejouer un brief qui nomme sa branche · Transformer une exécution en test · Limites.

**Repères :** 6 fichiers nommés dans les extraits, variantes comprises ; 193 lignes EN / 193 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

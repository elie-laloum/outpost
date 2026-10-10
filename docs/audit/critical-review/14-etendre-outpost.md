# Lot 14 — Étendre Outpost

Le niveau technique est adapté à l’audience, mais les exemples fictifs doivent être annoncés comme patrons ou accompagnés d’une fixture exécutable.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Étendre Outpost — P3

[Français](../../src/content/docs/fr/guide/integration-ports.md) · [English](../../src/content/docs/guide/integration-ports.md)

**Sections à reprendre :** Choisir le contrat / Connecter des décisions.

**Constat.** Bonne orientation pour intégrateurs, obligations observables bien nommées. La décision apparaît après la liste API plutôt qu’avec les autres ports ; plusieurs liens mènent à des guides utilisateurs au lieu d’un tutoriel d’extension.

**Action proposée.** Intégrer DecisionProvider au choix initial et nommer les guides qui ne sont encore que des descriptions de contrat.

**Plan examiné :** Choisir le contrat à implémenter · Valider une intégration · Isoler les dépendances facultatives · Connecter des services de décision.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 55 lignes EN / 55 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Ajouter un agent en ligne de commande — P2

[Français](../../src/content/docs/fr/guide/custom-agents.md) · [English](../../src/content/docs/guide/custom-agents.md)

**Sections à reprendre :** Écrire un adaptateur / Tester.

**Constat.** L’adaptateur fictif demande cinq fichiers puis une CLI mycli non fournie. Le test de protocole reste un helper sans scénario de sortie réel.

**Action proposée.** Livrer une mini-CLI locale avec deux événements pour un premier dispatch vérifiable ; séparer consommation, steering et auth avancés, garder le contrat strict des erreurs.

**Plan examiné :** Écrire un adaptateur minimal · Construire la commande · Décoder la sortie · Déclarer les capacités optionnelles · Mesurer la consommation de tokens · Réorienter un tour en cours · Ce qu’Outpost gère pour vous · Tester l’adaptateur · Limites.

**Repères :** 7 fichiers nommés dans les extraits, variantes comprises ; 244 lignes EN / 244 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Prendre en charge un format de conversation — P2

[Français](../../src/content/docs/fr/guide/conversation-formats.md) · [English](../../src/content/docs/guide/conversation-formats.md)

**Sections à reprendre :** Décrire l’emplacement / Archiver un dossier.

**Constat.** Page d’extension légitimement technique, mais elle ne termine pas par une capture/restauration exécutée. Les limites et transformations de chemins occupent la place du test central.

**Action proposée.** Donner une petite session fixture, la capturer puis la restaurer dans un autre chemin ; présenter transcription et dossier comme deux variantes autonomes.

**Plan examiné :** Choisir le format de stockage · Décrire l’emplacement d’une transcription · Suivre le chemin du workspace · Archiver un dossier de session · Écrire les fonctions exécutées dans la sandbox · Garder le format stable · Archiver par un transport · Limites.

**Repères :** 4 fichiers nommés dans les extraits, variantes comprises ; 152 lignes EN / 152 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Ajouter un fournisseur de sandbox — P2

[Français](../../src/content/docs/fr/guide/custom-sandbox-providers.md) · [English](../../src/content/docs/guide/custom-sandbox-providers.md)

**Sections à reprendre :** Écrire un fournisseur minimal / Récupération.

**Constat.** Huit fichiers de SDK fictif avant un bail : ce « minimal » est un patron, pas un exemple exécutable. Diagnostic, récupération durable et capacités fichiers s’ajoutent à la même page.

**Action proposée.** Annoncer les méthodes de SDK à adapter, fournir un exemple concret testable ; scinder implémentation minimale et récupération/capacités avancées sans supprimer les obligations.

**Plan examiné :** Écrire un fournisseur minimal · Implémenter les opérations · Choisir le mode d’accès au dépôt · Respecter les obligations · Déclarer les capacités facultatives · Préparer la récupération après un arrêt brutal · Tester sur l’environnement réel · Workspaces de fichiers · Limites.

**Repères :** 12 fichiers nommés dans les extraits, variantes comprises ; 287 lignes EN / 287 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

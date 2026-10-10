# Lot 06 — Agents

Les pages permettent de configurer un agent, mais leur gabarit répète installation, authentification, capacités et limites. Les différences réellement décisives doivent arriver avant les projections natives.

[Retour à la synthèse](README.md). Les priorités sont définies dans cette synthèse ; P2 est une proposition éditoriale, pas nécessairement un défaut fonctionnel.

## Choisir un agent — P2

[Français](../../src/content/docs/fr/guide/choose-an-agent.md) · [English](../../src/content/docs/guide/choose-an-agent.md)

**Sections à reprendre :** Sélectionner un modèle / Comparer les capacités.

**Constat.** Les cartes, deux matrices puis MCP, secours, harness et profils répètent les pages détaillées. ModelSpec et AgentModel sont liés deux fois autour d’un seul paragraphe.

**Action proposée.** Garder le choix par besoin et une comparaison courte ; supprimer les doublons API et la description des protocoles injected/resumed au profit du lien de tâche.

**Plan examiné :** Les agents · Composer un agent · Sélectionner un modèle · Comparer les capacités · Donner des outils MCP aux agents · Se replier sur un autre agent · Travailler sans CLI · Partager une configuration.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 108 lignes EN / 108 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Authentification — P2

[Français](../../src/content/docs/fr/guide/authentication.md) · [English](../../src/content/docs/guide/authentication.md)

**Sections à reprendre :** Compte ou clé API / Limites.

**Constat.** La séparation hôte/sandbox est utile. Le début donne le choix essentiel mais la fin reconstitue les particularités de chaque CLI et une limite de fichier sans aider à une connexion initiale.

**Action proposée.** Garder choix, source et destination ; renvoyer les exceptions à chaque agent et proposer un diagnostic de connexion manquante. Révalider les affirmations externes lors de toute correction.

**Plan examiné :** Compte ou clé API · Configurer les identifiants de l’agent · Identifiants transmis à la sandbox · Séparer les identifiants · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 94 lignes EN / 94 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Réutiliser une configuration d’agent — P2

[Français](../../src/content/docs/fr/guide/agent-profiles.md) · [English](../../src/content/docs/guide/agent-profiles.md)

**Sections à reprendre :** Déclarer le profil une fois / Traiter les projections.

**Constat.** Le premier profil dépend déjà d’un serveur mcp/docs.mjs absent de l’exemple. L’utilisateur voulant partager deux instructions doit lire MCP, restrictions, projections natives et état des tests.

**Action proposée.** Commencer avec un profil contenant seulement des instructions ; ajouter MCP et restrictions ensuite. Déplacer la matrice de projection et le détail des fixtures vers l’API et une note de validation.

**Plan examiné :** Déclarer le profil une fois · Choisir l’agent séparément · Restreindre les outils intégrés · Traiter les projections non prises en charge · Exécuter l’exemple hors ligne.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 100 lignes EN / 100 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer Claude Code — P3

[Français](../../src/content/docs/fr/guide/claude-code.md) · [English](../../src/content/docs/guide/claude-code.md)

**Sections à reprendre :** Fonctions disponibles / Limites.

**Constat.** Configuration assez directe ; le catalogue de six capacités répète la page de choix. Le mode de permissions effectif n’apparaît qu’en toute fin.

**Action proposée.** Conserver la page ; placer la conséquence des permissions près du premier dispatch et ne garder dans les capacités que les différences propres à Claude.

**Plan examiné :** Installer · Se connecter avec son compte · Utiliser une clé d’API · Choisir un modèle et des options · Fonctions disponibles · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 100 lignes EN / 100 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer Codex — P2

[Français](../../src/content/docs/fr/guide/codex.md) · [English](../../src/content/docs/guide/codex.md)

**Sections à reprendre :** Modèle et raisonnement / Limites.

**Constat.** « Hors de la liste ci-dessus » renvoie à une liste supprimée au profit d’un lien API. La partie modèle est enfouie après les capacités et les détails app-server/MCP.

**Action proposée.** Mettre modèle après authentification, corriger le renvoi orphelin et déplacer les arguments natifs vers l’API. Maintenir la limite Responses uniquement.

**Plan examiné :** Installation · Se connecter avec son compte · Utiliser une clé d’API · Fonctions disponibles · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 113 lignes EN / 113 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer Copilot CLI — P2

[Français](../../src/content/docs/fr/guide/copilot-cli.md) · [English](../../src/content/docs/guide/copilot-cli.md)

**Sections à reprendre :** Utiliser une clé d’API / Fonctions disponibles.

**Constat.** Un H2 intitulé « Utiliser une clé d’API » décrit une opération impossible. Le catalogue expose événements et fichiers internes ; « sous forme de archive » trahit une traduction mécanique.

**Action proposée.** Annoncer dès le choix compte/jeton l’absence de mode usage ; réduire aux différences pratiques : pas de fork, consommation tardive et requêtes premium.

**Plan examiné :** Installer · Se connecter avec son compte · Utiliser une clé d’API · Fonctions disponibles · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 62 lignes EN / 62 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer Kimi Code — P2

[Français](../../src/content/docs/fr/guide/kimi-code.md) · [English](../../src/content/docs/guide/kimi-code.md)

**Sections à reprendre :** Choisir la région / Usage des tokens.

**Constat.** La bonne contrainte modèle obligatoire en usage est visible, mais les fichiers d’identifiants et la correspondance inputOther/inputCacheCreation encombrent le guide.

**Action proposée.** Garder région/compte et API/modèle ; déplacer le mapping des compteurs et les chemins internes vers les contrats, conserver leur caractère tardif/incomplet.

**Plan examiné :** Installation · Se connecter avec son compte · Utiliser une clé d’API · Fonctions disponibles · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 110 lignes EN / 110 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Configurer Antigravity — P2

[Français](../../src/content/docs/fr/guide/antigravity.md) · [English](../../src/content/docs/guide/antigravity.md)

**Sections à reprendre :** Installer / Fonctions disponibles.

**Constat.** SHA-512 et désactivation de mises à jour prennent plus de place que la limitation centrale : aucune conversation portable. Celle-ci n’arrive explicitement qu’à la fin.

**Action proposée.** Annoncer la limite de reprise dès le début ; garder une configuration et un chemin vers une session ouverte. Renvoyer le détail du bootstrap à agentVersions/API.

**Plan examiné :** Installer · Se connecter avec son compte · Utiliser une clé d’API · Fonctions disponibles · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 78 lignes EN / 78 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Connecter des serveurs MCP — P2

[Français](../../src/content/docs/fr/guide/mcp-servers.md) · [English](../../src/content/docs/guide/mcp-servers.md)

**Sections à reprendre :** Où chaque CLI les reçoit / Les utiliser dans le harness intégré.

**Constat.** La page mélange connexion CLI, matrice de fichiers/arguments, loop Outpost, ressources et prompts. Le premier serveur stdio exige un paquet tiers sans petit test de fonctionnement.

**Action proposée.** Séparer connecter un outil MCP et exploiter ressources/prompts dans le harness ; donner un signe de réussite observable, déplacer la matrice de projection dans l’API.

**Plan examiné :** Déclarer les serveurs · Transmettre les secrets par leur nom · Où chaque CLI les reçoit · Filtrer les outils et régler le délai de démarrage · Les utiliser dans le harness intégré · Lire les ressources et les prompts · Limites.

**Repères :** 3 fichiers nommés dans les extraits, variantes comprises ; 176 lignes EN / 176 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Connecter les comptes MCP — P2

[Français](../../src/content/docs/fr/guide/mcp-oauth.md) · [English](../../src/content/docs/guide/mcp-oauth.md)

**Sections à reprendre :** Demander des jetons par identifiants client.

**Constat.** Le choix login/client est bon. Les étapes numérotées décrivent ensuite l’algorithme interne du pont comme si le lecteur devait les exécuter.

**Action proposée.** Présenter ces étapes comme comportement automatique ou les déplacer dans l’API ; montrer comment vérifier une connexion et traiter un login absent.

**Plan examiné :** Choisir un mode de connexion · Réutiliser une connexion CLI · Demander des jetons par identifiants client · Limites.

**Repères :** 0 fichiers nommés dans les extraits, variantes comprises ; 86 lignes EN / 86 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

## Utiliser un agent de secours — P1

[Français](../../src/content/docs/fr/guide/fallback-agents.md) · [English](../../src/content/docs/guide/fallback-agents.md)

**Sections à reprendre :** Préparation / Choisir quand passer la main.

**Constat.** Le début dit que seule la première CLI est installée ; les limites disent que les clouds installent la CLI du candidat essayé. « Tout autre échec est relancé » peut aussi se lire comme retry alors qu’il signifie propagation de l’erreur.

**Action proposée.** Corriger le début et cloud-sandboxes : en mode distant avec bootstrap activé, chaque candidat sélectionné est préparé à son tour. Écrire « l’erreur est propagée sans essayer le candidat suivant ». Garder le risque de modifications partielles.

**Vérification.** src/application/sandbox-dispatch.ts:112 prépare chaque candidat ; src/application/sandbox-agents.ts:28–36 appelle prepareAdapter pour tout candidat distant non préparé.

**Plan examiné :** Composer un agent de secours · Choisir quand passer la main · Ce que voit le candidat suivant · Savoir quel candidat a répondu · Quand tous les candidats échouent · Limites.

**Repères :** 2 fichiers nommés dans les extraits, variantes comprises ; 99 lignes EN / 99 lignes FR. Ces nombres servent à retrouver les pages, pas à imposer une taille cible.

---
title: "Contrôles préalables"
description: "Diagnostiquer les prérequis avant un appel de modèle payant."
---

Lancez `doctor` pour le fournisseur et l’agent que vous comptez utiliser.

```sh
npx outpost doctor --sandbox-provider docker --agent codex --image outpost:dev --json
```

Le rapport distingue les capacités disponibles, non prises en charge et défaillantes. Corrigez le problème d’exécutable, d’image ou de moteur signalé avant de relancer une requête.

Interrompre `doctor` arrête sa sonde hôte active et ses descendants. SIGINT termine avec le code 130 ; SIGTERM avec le code 143. Les diagnostics d’image nettoient aussi leur conteneur temporaire.

## Diagnostiquer une sandbox possédée

`sandbox.diagnose()` inspecte une sandbox existante sous son contrôle d’exclusivité. Le diagnostic ne possède pas et ne ferme pas la sandbox. Ne le lancez pas en parallèle d’une autre commande dans cette même sandbox.

`diagnoseAgentProtocol()` vérifie des fixtures de protocole enregistrées. Il n’authentifie pas un véritable compte et ne prouve pas la disponibilité d’un modèle en direct.

## Interpréter la validation

Un contrôle local réussi n’est pas un test de modèle payant. La configuration SDK cloud, l’allocation réelle et la disponibilité d’un modèle sont des contrôles distincts. Après configuration, envoyez une petite première requête sans modification et inspectez son résultat réel.

API : [diagnoseSandbox](../../reference/diagnosesandbox/) · [diagnoseAgentProtocol](../../reference/diagnoseagentprotocol/).

---
title: "Rétention et quotas"
description: "Planifier le nettoyage et coordonner l’admission au stockage."
---

La rétention est explicite. Prévisualisez une politique avant suppression ; ne supprimez pas `.outpost` comme nettoyage courant après une interruption.

```sh
npx outpost recovery prune --repository /projects/app --policy retention.json --json
```

## Définir une politique

Construisez `retention.json` selon `RecoveryRetentionPolicy` : choisissez les limites d’âge et de taille adaptées à vos besoins de récupération. La commande prévisualise par défaut. Ajoutez `--apply` pour exécuter la politique examinée.

`planRecoveryRetention()` produit le plan. `pruneRecoveryRetention()` revérifie candidats et propriété avant de supprimer les données éligibles. Du travail actif, incertain ou récupérable n’équivaut pas à des journaux fermés expirés.

Cette politique vise les journaux fermés de plus de sept jours, avec une cible de stockage conservé de 1 Gio. Elle ne rend pas les données actives ou protégées éligibles.

```json title="retention.json"
{
  "version": 1,
  "scopes": ["closed-logs"],
  "minAgeMs": 604800000,
  "maxBytes": 1073741824
}
```

## Réserver de la capacité

`assertRecoveryQuota()` vérifie le stockage observé. `reserveRecoveryStorage()` coordonne les écrivains coopératifs avec des réservations explicites d’octets et d’entrées. Un workspace peut posséder une réservation via `storageQuota`.

Les réservations comptabilisent l’admission ; ce ne sont pas des quotas du système de fichiers. Des écrivains non coopératifs peuvent les dépasser. Les réservations abandonnées et la propriété des checkpoints nécessitent une récupération explicite après arrêt indépendant de l’ancien propriétaire. Une activité distante ne prouve pas la vie d’un processus par son PID.

API : [RecoveryRetentionPolicy](../../reference/recoveryretentionpolicy/) · [planRecoveryRetention](../../reference/planrecoveryretention/) · [reserveRecoveryStorage](../../reference/reserverecoverystorage/).

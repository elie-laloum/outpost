---
title: "Charger les secrets depuis un service"
description: "Résoudre les clés déclarées sur l’hôte avec Vault, OpenBao, 1Password, Infisical ou un gestionnaire cloud."
---

Choisissez le service que vous utilisez déjà : [Vault/OpenBao](#utiliser-vault-ou-openbao), [1Password](#utiliser-1password), [Infisical](#utiliser-infisical), [AWS](#utiliser-aws-secrets-manager), [Google Cloud](#utiliser-google-cloud-secret-manager) ou [Azure](#utiliser-azure-key-vault). Suivez une seule procédure, puis transmettez les variables sélectionnées à votre agent.

## Résoudre avant d’allouer une sandbox

Appelez `fromSecrets()` au démarrage du script, puis passez le résultat comme `variables` à un harness CLI ou à un fournisseur de sandbox. La fonction renvoie un objet gelé contenant uniquement les noms demandés. Outpost n’écrit pas ces valeurs dans un fichier d’environnement et ne modifie pas `process.env`.

La résolution refuse une valeur absente, vide, non textuelle, contenant un caractère NUL ou trop volumineuse avant que votre script atteigne l’allocation. Les noms doivent être des identifiants de variables d’environnement valides, sans doublon. Une valeur peut contenir des sauts de ligne et ne dépasse pas 1 Mio. Consultez les [variables d’environnement](../environment-variables/) pour leur portée et leur priorité, et l’[installation](../setup/) pour l’image des agents.

## Utiliser Vault ou OpenBao

Les deux services utilisent l’API de lecture KV v2. Déclarez explicitement le serveur, le jeton, le point de montage et le chemin du document ; cet exemple lit le champ `OPENAI_API_KEY` du document `kv/outpost`. Une version et un espace de noms peuvent être fournis si nécessaire. Le jeton reste sur l’hôte.

```ts title="vault.ts"
import { fromSecrets } from "@elie-laloum/outpost";
import { createVaultSecretSource } from "@elie-laloum/outpost/secrets/vault";

export const variables = await fromSecrets(
  createVaultSecretSource({
    address: process.env.VAULT_ADDR ?? "https://vault.example.com",
    token: process.env.VAULT_TOKEN ?? "",
    mount: "kv",
    path: "outpost",
  }),
  ["OPENAI_API_KEY"],
);
```

Exécutez le script suivant avec `node run.ts` après avoir configuré le jeton et l’adresse sur l’hôte. Il résout la clé avant que `dispatch()` alloue une sandbox et conserve les modifications de l’agent sur une branche nommée. `authentication: "usage"` utilise la facturation API, indépendamment de l’authentification du gestionnaire de secrets.

```ts title="run.ts"
import {
  createAgent,
  createCodexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { variables } from "./vault.ts";

await dispatch({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "outpost/secret-source" },
  agent: createAgent({
    harness: createCodexHarness({ authentication: "usage", variables }),
  }),
  brief: { text: "Summarize this repository without reading credentials." },
});
```

KV v2 renvoie le document entier à l’hôte ; Outpost ne restitue que les champs sélectionnés. Placez les identifiants sans rapport dans des documents distincts s’ils ne doivent jamais être récupérés ensemble. Le support d’OpenBao couvre ce protocole de lecture, sans couvrir toutes les fonctionnalités de Vault. Consultez les API officielles de [Vault](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2) et d’[OpenBao](https://openbao.org/api-docs/).

## Utiliser 1Password

Installez `@1password/sdk` dans le projet de votre script et créez un client de compte de service sur l’hôte. Associez chaque variable à une référence explicite `op://vault/item/field` ; une section peut aussi précéder le champ. Seules les correspondances demandées sont résolues. Utilisez cette source avec `fromSecrets(source, ["OPENAI_API_KEY"])` à la place de Vault.

```ts title="onepassword.ts"
import { createClient } from "@1password/sdk";
import { createOnePasswordSecretSource } from "@elie-laloum/outpost/secrets/onepassword";

const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN ?? "",
  integrationName: "Outpost workflow",
  integrationVersion: "1.0.0",
});
export const source = createOnePasswordSecretSource({
  client,
  secrets: { OPENAI_API_KEY: "op://Automation/OpenAI/api-key" },
});
```

Ce montage utilise un compte de service déclaré, sans choisir l’authentification de l’application de bureau. La [documentation officielle du SDK 1Password](https://www.1password.dev/sdks) détaille les droits du compte et les plateformes compatibles.

## Utiliser Infisical

Installez `@infisical/sdk`, puis authentifiez une identité machine sur l’hôte avec Universal Auth. Le `siteUrl` du client sélectionne la région cloud ou votre propre instance. Outpost lit chaque nom demandé dans le projet, l’environnement et le chemin déclarés ; les imports et le développement des références sont désactivés pour garder une sélection explicite.

```ts title="infisical.ts"
import { InfisicalSDK } from "@infisical/sdk";
import { createInfisicalSecretSource } from "@elie-laloum/outpost/secrets/infisical";

const client = new InfisicalSDK({ siteUrl: "https://eu.infisical.com" });
await client.auth().universalAuth.login({
  clientId: process.env.INFISICAL_CLIENT_ID ?? "",
  clientSecret: process.env.INFISICAL_CLIENT_SECRET ?? "",
});
export const source = createInfisicalSecretSource({
  client,
  projectId: "your-project-id",
  environment: "prod",
  path: "/outpost",
});
```

Passez cette `source` à `fromSecrets()` avant de composer l’agent. Une valeur masquée fait échouer la résolution. Vous pouvez configurer d’autres méthodes d’authentification machine sur le client ; Outpost ne gère ni la connexion ni le renouvellement des jetons. Consultez la [documentation officielle du SDK Infisical](https://infisical.com/docs/sdks/languages/node).

## Utiliser AWS Secrets Manager

Installez `@aws-sdk/client-secrets-manager`. Configurez le client avec votre identité AWS sur l’hôte et associez les variables à des identifiants ou ARN exacts. Sans `field`, une correspondance utilise le `SecretString` entier ; cet exemple sélectionne un champ d’un secret JSON. Les secrets binaires sont refusés. Les sélecteurs de version optionnels appartiennent à [AwsSecretReference](../../reference/awssecretreference/).

```ts title="aws.ts"
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { createAwsSecretSource } from "@elie-laloum/outpost/secrets/aws";

export const client = new SecretsManagerClient({ region: "eu-west-3" });
export const source = createAwsSecretSource({
  client,
  secrets: { OPENAI_API_KEY: { id: "outpost/prod", field: "openai" } },
});
```

Résolvez avec `fromSecrets(source, ["OPENAI_API_KEY"])` et appelez `client.destroy()` quand vous n’avez plus besoin du client. Comme pour Vault, sélectionner un champ JSON récupère quand même le secret qui le contient. Consultez le [guide de lecture AWS](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets-javascript.html).

## Utiliser Google Cloud Secret Manager

Installez `@google-cloud/secret-manager` et configurez les identifiants applicatifs par défaut sur l’hôte, ou utilisez votre identité de workload. Associez les variables à des noms complets de ressources de version, avec `latest` ou une version numérique ; les ressources régionales sont également acceptées. Outpost décode le contenu en UTF-8 et refuse un texte invalide.

```ts title="gcp.ts"
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { createGcpSecretSource } from "@elie-laloum/outpost/secrets/gcp";

export const client = new SecretManagerServiceClient();
export const source = createGcpSecretSource({
  client,
  secrets: {
    OPENAI_API_KEY: "projects/demo/secrets/openai/versions/latest",
  },
});
```

Résolvez avant le dispatch et faites `await client.close()` quand le client n’est plus nécessaire. Le [guide officiel d’accès aux versions](https://docs.cloud.google.com/secret-manager/docs/access-secret-version) explique les permissions requises.

## Utiliser Azure Key Vault

Installez `@azure/keyvault-secrets` et `@azure/identity`. Créez un client sur l’hôte avec une identité managée ou un autre identifiant Azure configuré explicitement. Associez les identifiants de variables à des noms Key Vault, qui peuvent contenir des tirets ; chaque correspondance peut fixer une version.

```ts title="azure.ts"
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { createAzureSecretSource } from "@elie-laloum/outpost/secrets/azure";

const client = new SecretClient(
  "https://your-vault.vault.azure.net",
  new DefaultAzureCredential(),
);
export const source = createAzureSecretSource({
  client,
  secrets: { OPENAI_API_KEY: { name: "openai-api-key" } },
});
```

Seuls les noms sélectionnés sont transmis à `getSecret()`. Le [démarrage rapide JavaScript d’Azure](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node) détaille la configuration de l’identité et des rôles.

## Borner le démarrage et renouveler explicitement

`fromSecrets()` applique par défaut un délai de 30 secondes à l’ensemble de la résolution. Réglez `timeoutMs` et passez un `AbortSignal` pour une autre politique de démarrage. Une annulation rejette avec le code `aborted`, un délai dépassé avec `timeout`, un échec de lecture ou une valeur invalide avec `provider`, et une déclaration invalide avec `configuration`. Les exceptions des fournisseurs et leurs causes sont écartées pour éviter d’exposer des identifiants dans les diagnostics.

Les requêtes HTTP Vault, AWS et Azure reçoivent le signal d’annulation. Pour 1Password, GCP et Infisical, l’annulation termine l’attente et empêche les lectures suivantes, mais une requête SDK déjà lancée peut terminer en arrière-plan. L’authentification effectuée avant `fromSecrets()` suit sa propre politique de délai SDK. Vous restez propriétaire des clients injectés ; Outpost ne les ferme jamais.

Les valeurs constituent un instantané de démarrage : un retry ou une sandbox réutilisée les conserve. Rappelez `fromSecrets()` et composez un nouvel agent ou une nouvelle sandbox pour utiliser des valeurs renouvelées. Outpost n’ajoute ni cache persistant, ni renouvellement automatique, ni repli entre gestionnaires. Chaque SDK est une dépendance pair optionnelle chargée par l’entrée du service ou votre script, indépendamment de l’import principal.

:::caution
Les agents et commandes peuvent lire toutes les variables reçues. Résoudre une clé depuis un service ne la masque pas à l’agent choisi. Gardez les identifiants du gestionnaire sur l’hôte et évitez de journaliser l’objet renvoyé. L’exécution sur l’hôte hérite aussi de son environnement ; consultez les [limites de sécurité](../security/).
:::

## Implémenter une autre source

Implémentez `SecretSource` avec une méthode `resolve()` nommée qui ne lit que les noms demandés. Cet exemple hors ligne démontre la sélection sans compte ni réseau. Utilisez `fromSecrets()` comme frontière de validation au démarrage avant de transmettre les variables au harness.

```ts
import { fromSecrets, type SecretSource } from "@elie-laloum/outpost";

const source: SecretSource = {
  name: "fixture",
  async resolve(names, { signal } = {}) {
    signal?.throwIfAborted();
    return Object.fromEntries(names.map((name) => [name, "fixture-value"]));
  },
};
const variables = await fromSecrets(source, ["EXAMPLE_KEY"]);
if (Object.keys(variables).length !== 1)
  throw new Error("Unexpected selection");
console.log(Object.keys(variables));
```

<!-- check:run -->

## Limites de validation

Les tests déterministes couvrent le protocole HTTP KV v2, les frontières des méthodes SDK natives, la sélection, l’annulation, les délais, les valeurs malformées et le filtrage des erreurs. Ils ne prouvent pas une authentification réussie auprès de comptes réels Vault, OpenBao, 1Password, Infisical, AWS, GCP ou Azure. Exercez le service utilisé avec une identité dédiée avant de vous appuyer sur cette configuration en production.

API : [fromSecrets](../../reference/fromsecrets/) · [SecretSource](../../reference/secretsource/) · [FromSecretsOptions](../../reference/fromsecretsoptions/).

## Sélectionner les secrets avant allocation

Une valeur d’environnement peut utiliser `{ env: VARIABLE_NAME }`. Les composants de gestion de secrets reprennent leurs options publiques ; les clients SDK installés sont des extensions `object` empruntées. Le token Vault ci-dessous est ainsi lu sur l’hôte uniquement à l’exécution. Les sources natives sont déclarées sous `secrets` ; `variables.secrets` sélectionne des noms explicites avec `fromSecrets()`.

```yaml title="outpost.yaml — source de secrets sur l’hôte"
secrets:
  build:
    type: vault
    address: https://vault.example.com
    token: { env: VAULT_TOKEN }
    mount: secret
    path: build
variables:
  selected:
    type: secrets
    source: { $ref: secrets.build }
    names: [BUILD_TOKEN]
sandbox:
  provider: docker
  image: outpost:sandbox
  variables: { $ref: variables.selected }
```

Seules les valeurs sélectionnées atteignent la sandbox. La validation n’importe aucun module utilisateur et ne lit aucune valeur de secret. Une valeur absente échoue avant allocation ; le runtime masque les valeurs sélectionnées dans les observations, les rapports retournés et les diagnostics d’exécution. Il ne modifie pas l’environnement hôte. Conservez les restrictions de votre service et les identifiants du gestionnaire sur l’hôte, comme décrit plus haut.

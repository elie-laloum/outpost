export interface McpOAuthFixtureOptions {
  readonly resource?: unknown;
  readonly authorizationServers?: unknown;
  readonly issuer?: unknown;
  readonly tokenEndpoint?: unknown;
  readonly metadataRedirect?: boolean;
  readonly tokenRedirect?: boolean;
  readonly challengeMetadata?: string;
  readonly changedIssuer?: boolean;
  readonly authenticationMethods?: unknown;
}

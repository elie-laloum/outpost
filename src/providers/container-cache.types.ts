export interface DependencyCache {
  readonly name: string;
  readonly key: string;
}

export interface ContainerCacheMount {
  readonly volume: string;
  readonly target: string;
}

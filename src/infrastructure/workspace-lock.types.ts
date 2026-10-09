export interface WorkspacePathLock {
  readonly id: string;
  readonly directory: string;
  readonly writable: boolean;
  readonly identity?: WorkspacePathGate;
  readonly ancestors?: readonly WorkspacePathGate[];
  readonly excludedDirectories?: readonly string[];
}

export interface WorkspacePathRelease {
  (): Promise<void>;
  readonly id: string;
  readonly directory: string;
}

export interface WorkspacePathRecoveryOptions {
  readonly processesStopped: true;
}

export interface WorkspacePathGate {
  readonly device: number;
  readonly inode: number;
}

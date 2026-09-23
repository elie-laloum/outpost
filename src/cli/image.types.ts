export type ImageOptions = {
  directory?: string;
  engine?: "docker" | "podman";
  image?: string;
  file?: string;
  uid?: number;
  gid?: number;
};

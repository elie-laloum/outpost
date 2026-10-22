export const recipeWorkspaceKeys = {
  git: [
    "kind",
    "repository",
    "branch",
    "copies",
    "guard",
    "hooks",
    "limits",
    "label",
    "storageQuota",
  ],
  file: ["kind", "directory", "access", "paths", "retention", "inputs"],
} as const;

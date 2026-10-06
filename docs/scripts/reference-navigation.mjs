import families from "../reference-content/navigation.json" with { type: "json" };

export const referenceSidebar = families
  .flatMap((family) => family.items)
  .sort(
    (a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base" }) ||
      a.label.localeCompare(b.label, "en"),
  );

import ts from "typescript";

export const isContract = (declaration) =>
  ts.isInterfaceDeclaration(declaration) ||
  ts.isTypeAliasDeclaration(declaration);

export function referenceKind(declaration, checker, symbol) {
  if (ts.isInterfaceDeclaration(declaration)) return "interface";
  if (ts.isTypeAliasDeclaration(declaration)) return "type";
  if (ts.isClassDeclaration(declaration)) return "class";
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  if (checker.getSignaturesOfType(type, ts.SignatureKind.Call).length)
    return "function";
  if (ts.isVariableDeclaration(declaration)) return "constant";
  throw new Error(`Unsupported reference symbol kind: ${symbol.name}`);
}

export const referenceRank = (declaration, checker, symbol) => {
  const kind = referenceKind(declaration, checker, symbol);
  if (kind === "function") return 0;
  if (kind === "interface") return 2;
  return 1;
};

function properties(type, checker) {
  const variants = type.isUnion() ? type.types : [type];
  return variants.flatMap((variant) => {
    if (
      !(variant.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) ||
      checker.isArrayType(variant) ||
      checker.isTupleType(variant)
    )
      return [];
    return checker.getPropertiesOfType(variant);
  });
}

export function referenceModel(symbol, declaration, checker) {
  const contract = isContract(declaration);
  const type =
    contract || ts.isClassDeclaration(declaration)
      ? checker.getDeclaredTypeOfSymbol(symbol)
      : checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  const members = signatures.length
    ? [
        ...signatures.flatMap((signature) => signature.parameters),
        ...properties(type, checker),
      ]
    : properties(type, checker);
  const entries = [];
  const add = (property, prefix = "", container = type) => {
    const location =
      property.valueDeclaration ?? property.declarations?.[0] ?? declaration;
    const name = ts.isComputedPropertyName(location.name ?? declaration)
      ? location.name.getText()
      : property.name;
    let parent = location.parent;
    while (
      parent &&
      !ts.isInterfaceDeclaration(parent) &&
      !ts.isTypeAliasDeclaration(parent) &&
      !ts.isClassDeclaration(parent) &&
      !ts.isFunctionDeclaration(parent)
    )
      parent = parent.parent;
    const owner = parent?.name?.getText() ?? symbol.name;
    const fieldType = checker.getTypeOfSymbolAtLocation(property, location);
    entries.push({
      name: prefix + name,
      key: `${symbol.name}.${prefix}${name}`,
      owner: `${owner}.${name}`,
      field: name,
      type: checker.typeToString(
        fieldType,
        location,
        ts.TypeFormatFlags.NoTruncation,
      ),
      conditional:
        container.isUnion() &&
        container.types.some(
          (variant) => !checker.getPropertyOfType(variant, property.name),
        ),
      optional:
        !!(property.flags & ts.SymbolFlags.Optional) ||
        !!location.questionToken ||
        !!location.initializer,
    });
    return fieldType;
  };
  for (const member of members) {
    const fieldType = add(member);
    if (signatures.length && ["options", "settings"].includes(member.name)) {
      const optionsType = checker.getNonNullableType(fieldType);
      for (const property of properties(optionsType, checker))
        add(property, `${member.name}.`, optionsType);
    }
  }
  const unique = new Map();
  for (const entry of entries) {
    const previous = unique.get(entry.name);
    if (!previous) unique.set(entry.name, entry);
    if (previous) {
      if (previous.optional !== entry.optional) previous.conditional = true;
      previous.optional ||= entry.optional;
      if (previous.type !== entry.type) previous.type += ` | ${entry.type}`;
    }
  }
  return { contract, signatures, entries: [...unique.values()] };
}

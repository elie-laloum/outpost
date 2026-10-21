import ts from "typescript";

export function isPrivateLocalType(node, source) {
  let declaration = node;
  while (
    declaration &&
    !ts.isInterfaceDeclaration(declaration) &&
    !ts.isTypeAliasDeclaration(declaration)
  )
    declaration = declaration.parent;
  if (
    !declaration ||
    declaration.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
  )
    return false;
  const first = source.getLineAndCharacterOfPosition(
    declaration.getStart(source),
  ).line;
  const last = source.getLineAndCharacterOfPosition(declaration.end).line;
  if (last - first >= 5) return false;
  for (let parent = declaration.parent; parent; parent = parent.parent) {
    if (ts.isFunctionLike(parent)) return true;
  }
  return false;
}

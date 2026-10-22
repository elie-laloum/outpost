import type { Document, YAMLMap, YAMLSeq } from "yaml";
import type { DocumentMutation } from "../../domain/recipes/editor.types.ts";

export interface EditableYaml {
  readonly document: Document;
  /** Original inner padding of each non-empty flow collection, read from the source. */
  readonly padding: WeakMap<object, string>;
  readonly indentSequences: boolean;
}

export type FlowCollection = YAMLMap | YAMLSeq;

export type YamlContext = Parameters<YAMLSeq["toString"]>[0];

export type DocumentMutator = (
  editable: EditableYaml,
  mutation: DocumentMutation,
) => void;

export type DocumentMutators = {
  readonly [Op in DocumentMutation["op"]]: (
    editable: EditableYaml,
    mutation: Extract<DocumentMutation, { op: Op }>,
  ) => void;
};

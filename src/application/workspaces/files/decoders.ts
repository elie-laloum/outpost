import { createJsonDecoder } from "../../../infrastructure/json-schema.ts";
import {
  fileWorkspaceRecordSchema,
  fileWorkspaceSourceSchema,
} from "../../../domain/file-workspace.constants.ts";
import type {
  FileWorkspaceRecord,
  FileWorkspaceSource,
} from "../../../domain/file-workspace.types.ts";

export const workspaceRecordDecoder = createJsonDecoder<FileWorkspaceRecord>(
  fileWorkspaceRecordSchema,
  "workspace record",
);
export const workspaceSourceDecoder = createJsonDecoder<FileWorkspaceSource>(
  fileWorkspaceSourceSchema,
  "workspace source",
);

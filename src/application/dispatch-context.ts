import type { DispatchExecutionContext } from "./dispatch-context.types.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { Sandbox, DispatchResult } from "./outpost.types.ts";
import type { FileSandbox, FileDispatchResult } from "./file-sandbox.types.ts";

export function dispatchInContext<T>(
  sandbox: FileSandbox,
  options: DispatchOptions<T>,
  context: DispatchExecutionContext,
): Promise<FileDispatchResult<T>>;
export function dispatchInContext<T>(
  sandbox: Sandbox,
  options: DispatchOptions<T>,
  context: DispatchExecutionContext,
): Promise<DispatchResult<T>>;
export function dispatchInContext<T>(
  sandbox: Sandbox | FileSandbox,
  options: DispatchOptions<T>,
  context: DispatchExecutionContext,
): Promise<DispatchResult<T> | FileDispatchResult<T>> {
  const invoke: (
    options: DispatchOptions<T>,
    context?: DispatchExecutionContext,
  ) => Promise<DispatchResult<T> | FileDispatchResult<T>> =
    sandbox.dispatch.bind(sandbox);
  return invoke(options, context);
}

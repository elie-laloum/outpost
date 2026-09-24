import {
  maxUsageReceiptLength,
  maxUsageReceiptsPerTask,
} from "./usage-receipt.constants.ts";

export function validateUsageReceipt(
  receipt: unknown,
): asserts receipt is string {
  if (
    typeof receipt !== "string" ||
    !receipt.length ||
    receipt.length > maxUsageReceiptLength
  )
    throw new Error("Invalid workflow usage receipt");
}
export function validateUsageReceipts(receipts: unknown): void {
  if (receipts === undefined) return;
  if (!Array.isArray(receipts) || receipts.length > maxUsageReceiptsPerTask)
    throw new Error("Invalid workflow usage receipts");
  for (const receipt of receipts) validateUsageReceipt(receipt);
  if (new Set(receipts).size !== receipts.length)
    throw new Error("Duplicate workflow usage receipts");
}

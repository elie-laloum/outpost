// Pads an invoice number to 8 digits: 42 → "00000042".
import leftPad from "left-pad";

export const invoiceNumber = (value: number) => leftPad(String(value), 8, "0");

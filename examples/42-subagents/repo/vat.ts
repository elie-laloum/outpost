// Adds VAT to a price excluding tax.
export function withVat(price: number, rate = 0.2): number {
  return price * rate;
}

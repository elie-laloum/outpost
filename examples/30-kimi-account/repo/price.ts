// VAT rate, as a percentage.
const VAT = 20;

// Price including taxes, from a price excluding taxes.
export function priceWithVat(price: number): number {
  return price + VAT;
}

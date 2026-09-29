// VAT rate, as a percentage.
const VAT = 20;

// Price including tax, from a pre-tax price.
export function priceWithVat(price: number): number {
  return price + VAT;
}

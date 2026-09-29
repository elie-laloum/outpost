const skies = ["sunny", "cloudy", "rainy", "windy"];

// Fake weather, stable for a given city.
export function forecast(city: string): string {
  const index = [...city].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return skies[index % skies.length];
}

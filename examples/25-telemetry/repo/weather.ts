const temperatures: Record<string, number> = { Paris: 18, Lyon: 21, Lille: 14 };

export function today(city: string): string {
  const degrees = temperatures[city];
  return degrees === undefined ? `${city} : inconnue` : `${city} : ${degrees} °C`;
}

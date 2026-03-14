export const allSingleClub = (cities: { city: string; count: number }[]) =>
  cities.length > 0 && cities.every(c => c.count === 1)

export function clubInitial(name: string): string {
  const words = name.trim().split(/\s+/)
  const word = words[0].toLowerCase() === 'the' && words[1] ? words[1] : words[0]
  return word.charAt(0).toUpperCase()
}

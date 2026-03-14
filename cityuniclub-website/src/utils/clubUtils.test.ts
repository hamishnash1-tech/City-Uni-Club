import { describe, it, expect } from 'vitest'
import { allSingleClub, clubInitial } from './clubUtils'

describe('allSingleClub', () => {
  it('returns true when every city has exactly one club', () => {
    expect(allSingleClub([
      { city: 'Dublin', count: 1 },
      { city: 'Cork', count: 1 },
    ])).toBe(true)
  })

  it('returns false when any city has more than one club', () => {
    expect(allSingleClub([
      { city: 'Dublin', count: 3 },
      { city: 'Cork', count: 1 },
    ])).toBe(false)
  })

  it('returns false for an empty list', () => {
    expect(allSingleClub([])).toBe(false)
  })

  it('returns true for a single city with one club', () => {
    expect(allSingleClub([{ city: 'Reykjavik', count: 1 }])).toBe(true)
  })

  it('returns false for a single city with multiple clubs', () => {
    expect(allSingleClub([{ city: 'London', count: 20 }])).toBe(false)
  })

  it('returns false when all cities have zero clubs', () => {
    expect(allSingleClub([
      { city: 'A', count: 0 },
      { city: 'B', count: 0 },
    ])).toBe(false)
  })

  it('returns false when one city has zero clubs among single-club cities', () => {
    expect(allSingleClub([
      { city: 'Dublin', count: 1 },
      { city: 'Cork', count: 0 },
    ])).toBe(false)
  })
})

describe('clubInitial', () => {
  it('returns first letter of first word', () => {
    expect(clubInitial('Reform Club')).toBe('R')
  })

  it('skips "The" and uses the next word', () => {
    expect(clubInitial('The Athenaeum')).toBe('A')
  })

  it('is case-insensitive when detecting "the"', () => {
    expect(clubInitial('THE Oxford Union')).toBe('O')
  })

  it('uses "The" initial if no subsequent word exists', () => {
    expect(clubInitial('The')).toBe('T')
  })

  it('handles leading whitespace', () => {
    expect(clubInitial('  Carlton Club')).toBe('C')
  })

  it('handles single-word name', () => {
    expect(clubInitial('Boodles')).toBe('B')
  })

  it('returns uppercase initial even for lowercase input', () => {
    expect(clubInitial('garrick club')).toBe('G')
  })
})

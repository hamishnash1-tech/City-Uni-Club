// Complete reciprocal clubs list from Reciplist2024.docx (Updated 20/8/2024)
export interface Club {
  name: string
  location: string
  region: string
  country: string
  note?: string
}

export const reciprocalClubs: Club[] = [
  // UNITED KINGDOM - LONDON
  { name: "Buck's Club", location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Bush Hill Park Golf Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Eccentric Club (Snail Club)', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Gymkhana Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Lansdowne Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  { name: 'National Liberal Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  { name: 'Oxford and Cambridge Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Royal Over-Seas League', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: "University Women's Club", location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Winchester House Club', location: 'London', region: 'United Kingdom', country: 'England' },
]

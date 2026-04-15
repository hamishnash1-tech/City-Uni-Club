interface FilterableMember {
  last_name?: string | null
  email: string
  membership_number?: string | number | null
}

export function filterMembers<T extends FilterableMember>(members: T[], searchTerm: string): T[] {
  if (!searchTerm) return members
  const term = searchTerm.toLowerCase()
  return members.filter(m =>
    m.last_name?.toLowerCase().includes(term) ||
    m.email.toLowerCase().includes(term) ||
    String(m.membership_number ?? '').toLowerCase().includes(term)
  )
}

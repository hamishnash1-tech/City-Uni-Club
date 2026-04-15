import { describe, it, expect } from 'vitest'
import { filterMembers } from './filterMembers'

const members = [
  { last_name: 'Alice Smith', email: 'alice@example.com', membership_number: 1001 },
  { last_name: 'Bob Jones', email: 'bob@example.com', membership_number: '2002' },
  { last_name: null, email: 'charlie@example.com', membership_number: null },
]

describe('filterMembers', () => {
  it('returns all members when search term is empty', () => {
    expect(filterMembers(members, '')).toEqual(members)
  })

  it('filters by name', () => {
    expect(filterMembers(members, 'alice')).toEqual([members[0]])
  })

  it('filters by email', () => {
    expect(filterMembers(members, 'bob@')).toEqual([members[1]])
  })

  it('filters by numeric membership_number without crashing', () => {
    expect(filterMembers(members, '1001')).toEqual([members[0]])
  })

  it('filters by string membership_number', () => {
    expect(filterMembers(members, '2002')).toEqual([members[1]])
  })

  it('handles null membership_number and null name', () => {
    expect(filterMembers(members, 'charlie')).toEqual([members[2]])
  })

  it('returns empty array when nothing matches', () => {
    expect(filterMembers(members, 'zzz')).toEqual([])
  })
})

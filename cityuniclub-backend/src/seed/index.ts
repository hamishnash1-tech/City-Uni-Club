import { supabase } from '../lib/supabase.js'
import { hashPassword } from '../utils/crypto.js'

const seedMembers = [
  {
    email: 'stephen.rayner@email.com',
    password: 'password123',
    full_name: 'Stephen Raymond Rayner',
    first_name: 'Stephen',
    membership_number: 'CUC-2019-0847',
    membership_type: 'Full Membership' as const,
    member_since: '2019-03-01',
    member_until: '2026-03-31',
    phone_number: '+44 7700 900123'
  },
  {
    email: 'james.smith@email.com',
    password: 'password123',
    full_name: 'James William Smith',
    first_name: 'James',
    membership_number: 'CUC-2020-0123',
    membership_type: 'Full Membership' as const,
    member_since: '2020-06-15',
    member_until: '2026-06-30',
    phone_number: '+44 7700 900456'
  },
  {
    email: 'emma.jones@email.com',
    password: 'password123',
    full_name: 'Emma Louise Jones',
    first_name: 'Emma',
    membership_number: 'CUC-2021-0456',
    membership_type: 'Associate Membership' as const,
    member_since: '2021-01-10',
    member_until: '2026-01-31',
    phone_number: '+44 7700 900789'
  }
]

const seedEvents = [
  {
    title: 'Sri Lankan Lunch and Dinner',
    description: 'Experience the authentic flavors of Sri Lanka',
    event_type: 'lunch_dinner' as const,
    event_date: '2026-02-25',
    lunch_time: '12:30:00',
    dinner_time: '19:00:00',
    price_per_person: 45.00,
    is_tba: false
  },
  {
    title: 'Younger Member\'s Dinner',
    description: 'Monthly gathering for younger members',
    event_type: 'dinner' as const,
    event_date: '2026-02-26',
    dinner_time: '19:00:00',
    price_per_person: 40.00,
    is_tba: false
  },
  {
    title: 'New Member, Candidates Meeting',
    description: 'Welcome meeting for new members and candidates',
    event_type: 'meeting' as const,
    event_date: '2026-03-05',
    price_per_person: 0.00,
    is_tba: true
  },
  {
    title: 'St Patrick\'s Day Lunch',
    description: 'Celebrate St Patrick\'s Day with traditional Irish fare',
    event_type: 'lunch' as const,
    event_date: '2026-03-17',
    lunch_time: '12:30:00',
    price_per_person: 42.00,
    is_tba: false
  },
  {
    title: '4 Course French Tasting Menu with Paired Wines',
    description: 'An evening of French culinary excellence',
    event_type: 'special' as const,
    event_date: '2026-03-20',
    dinner_time: '19:00:00',
    price_per_person: 85.00,
    is_tba: false
  },
  {
    title: 'Royal Ascot Tent',
    description: 'Join us for a day at Royal Ascot',
    event_type: 'special' as const,
    event_date: '2026-06-17',
    price_per_person: 150.00,
    is_tba: false
  }
]

const seedReciprocalClubs = [
  // United Kingdom - London
  { name: 'Buck\'s Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Oxford and Cambridge Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Lansdowne Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  { name: 'National Liberal Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  
  // United Kingdom - Other
  { name: 'Hawks\' Club', location: 'Cambridge', region: 'United Kingdom', country: 'England' },
  { name: 'Vincent\'s Club', location: 'Oxford', region: 'United Kingdom', country: 'England' },
  { name: 'The New Club', location: 'Edinburgh', region: 'United Kingdom', country: 'Scotland' },
  { name: 'The Royal Scots Club', location: 'Edinburgh', region: 'United Kingdom', country: 'Scotland' },
  
  // Ireland
  { name: 'Royal Dublin Society', location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  { name: 'The Stephen\'s Green Hibernian Club', location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  
  // Australia
  { name: 'The Hong Kong Club', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'The Australian Club', location: 'Melbourne', region: 'Oceania', country: 'Australia' },
  { name: 'Tattersalls', location: 'Sydney', region: 'Oceania', country: 'Australia' },
  
  // USA
  { name: 'The Penn Club', location: 'New York', region: 'Americas', country: 'USA' },
  { name: 'The Explorers Club', location: 'New York', region: 'Americas', country: 'USA' },
  { name: 'Harvard Club of Boston', location: 'Boston', region: 'Americas', country: 'USA' },
  
  // Europe
  { name: 'Saint James', location: 'Paris', region: 'Europe', country: 'France' },
  { name: 'Cercle de Lorraine', location: 'Brussels', region: 'Europe', country: 'Belgium' },
  { name: 'Casino de Madrid', location: 'Madrid', region: 'Europe', country: 'Spain' },
  
  // Asia
  { name: 'Singapore Cricket Club', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'Tokyo Club', location: 'Tokyo', region: 'Asia', country: 'Japan' },
  { name: 'The Bengal Club', location: 'Kolkata', region: 'Asia', country: 'India' }
]

const seedNews = [
  {
    title: 'Dining Room open 23 February for Dinner',
    content: 'We are pleased to announce that the dining room will be open for dinner service starting 23 February. Our executive chef has prepared a special menu featuring seasonal British ingredients.',
    category: 'Dining' as const,
    published_date: '2026-02-20',
    is_featured: true
  },
  {
    title: 'Free Gin Friday - every Friday at lunch',
    content: 'Join us every Friday for our complimentary Gin Friday promotion. Enjoy a selection of premium gins with our sommelier\'s recommendations.',
    category: 'Special Offer' as const,
    published_date: '2026-02-01',
    is_featured: false
  },
  {
    title: 'Sri Lankan Lunch - 25 February',
    content: 'Experience the flavors of Sri Lanka with our special lunch menu on 25 February. The menu features authentic dishes prepared by our guest chef from Colombo.',
    category: 'Special Event' as const,
    published_date: '2026-02-15',
    is_featured: true
  },
  {
    title: 'Wine Tasting Evening - 8 March',
    content: 'Join our sommelier for an exclusive wine tasting featuring wines from the Loire Valley. Limited spaces available, booking essential.',
    category: 'Event' as const,
    published_date: '2026-02-18',
    is_featured: false
  },
  {
    title: 'Easter Sunday Roast',
    content: 'Book now for our special Easter Sunday Roast. Traditional roast beef with all the trimmings, followed by a selection of Easter desserts.',
    category: 'Dining' as const,
    published_date: '2026-03-01',
    is_featured: true
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Seed members
    console.log('\n📋 Seeding members...')
    for (const memberData of seedMembers) {
      const { password, ...memberFields } = memberData
      const passwordHash = await hashPassword(password)

      const { data: member, error } = await supabase
        .from('members')
        .upsert({
          ...memberFields,
          password_hash: passwordHash
        }, { onConflict: 'email' })
        .select()
        .single()

      if (error) {
        console.error(`Error seeding member ${memberData.email}:`, error)
        continue
      }

      // Create member profile
      await supabase
        .from('member_profiles')
        .upsert({
          member_id: member.id,
          dietary_requirements: null,
          preferences: {},
          notification_enabled: true
        }, { onConflict: 'member_id' })

      console.log(`  ✓ Seeded: ${memberData.email}`)
    }

    // Seed events
    console.log('\n📅 Seeding events...')
    const { data: existingEvents } = await supabase.from('events').select('title')
    const existingEventTitles = existingEvents?.map(e => e.title) || []
    
    for (const eventData of seedEvents) {
      if (existingEventTitles?.includes(eventData.title)) {
        console.log(`  ⊘ Skipped (exists): ${eventData.title}`)
        continue
      }
      
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) {
        console.error(`Error seeding event ${eventData.title}:`, error)
        continue
      }

      console.log(`  ✓ Seeded: ${eventData.title}`)
    }

    // Seed reciprocal clubs
    console.log('\n🌍 Seeding reciprocal clubs...')
    const { data: existingClubs } = await supabase.from('reciprocal_clubs').select('name')
    const existingClubNames = existingClubs?.map(c => c.name) || []
    
    for (const clubData of seedReciprocalClubs) {
      if (existingClubNames?.includes(clubData.name)) {
        console.log(`  ⊘ Skipped (exists): ${clubData.name}`)
        continue
      }
      
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .insert(clubData)
        .select()
        .single()

      if (error) {
        console.error(`Error seeding club ${clubData.name}:`, error)
        continue
      }

      console.log(`  ✓ Seeded: ${clubData.name}`)
    }

    // Seed news
    console.log('\n📰 Seeding news...')
    const { data: existingNews } = await supabase.from('club_news').select('title')
    const existingNewsTitles = existingNews?.map(n => n.title) || []
    
    for (const newsData of seedNews) {
      if (existingNewsTitles?.includes(newsData.title)) {
        console.log(`  ⊘ Skipped (exists): ${newsData.title}`)
        continue
      }
      
      const { data, error } = await supabase
        .from('club_news')
        .insert(newsData)
        .select()
        .single()

      if (error) {
        console.error(`Error seeding news ${newsData.title}:`, error)
        continue
      }

      console.log(`  ✓ Seeded: ${newsData.title}`)
    }

    console.log('\n✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    process.exit(1)
  }
}

seedDatabase()

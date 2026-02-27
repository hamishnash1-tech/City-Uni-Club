-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE membership_type AS ENUM ('Full Membership', 'Associate Membership', 'Junior Membership', 'Senior Membership', 'Corporate Membership');
CREATE TYPE event_type AS ENUM ('lunch', 'dinner', 'lunch_dinner', 'meeting', 'special');
CREATE TYPE meal_option AS ENUM ('lunch', 'dinner');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE loi_status AS ENUM ('pending', 'approved', 'rejected', 'sent');
CREATE TYPE visit_purpose AS ENUM ('Business', 'Leisure', 'Both');
CREATE TYPE news_category AS ENUM ('Dining', 'Special Offer', 'Special Event', 'Event', 'General');

-- ============================================================================
-- MEMBERS TABLE
-- ============================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    membership_type membership_type NOT NULL DEFAULT 'Full Membership',
    member_since DATE NOT NULL,
    member_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_number ON members(membership_number);
CREATE INDEX idx_members_is_active ON members(is_active);

-- ============================================================================
-- MEMBER PROFILES TABLE (Extended profile information)
-- ============================================================================
CREATE TABLE member_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    dietary_requirements TEXT,
    preferences JSONB DEFAULT '{}',
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_member_profiles_member_id ON member_profiles(member_id);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    event_date DATE NOT NULL,
    lunch_time TIME DEFAULT '12:30:00',
    dinner_time TIME DEFAULT '19:00:00',
    price_per_person DECIMAL(10, 2) DEFAULT 45.00,
    max_capacity INTEGER,
    is_tba BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_is_active ON events(is_active);

-- ============================================================================
-- EVENT BOOKINGS TABLE
-- ============================================================================
CREATE TABLE event_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    meal_option meal_option,
    guest_count INTEGER NOT NULL DEFAULT 1,
    special_requests TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_event_bookings_event_id ON event_bookings(event_id);
CREATE INDEX idx_event_bookings_member_id ON event_bookings(member_id);
CREATE INDEX idx_event_bookings_status ON event_bookings(status);

-- ============================================================================
-- DINING RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE dining_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch')),
    guest_count INTEGER NOT NULL DEFAULT 1,
    table_preference TEXT,
    special_requests TEXT,
    status reservation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_dining_reservations_member_id ON dining_reservations(member_id);
CREATE INDEX idx_dining_reservations_date ON dining_reservations(reservation_date);
CREATE INDEX idx_dining_reservations_status ON dining_reservations(status);

-- ============================================================================
-- RECIPROCAL CLUBS TABLE
-- ============================================================================
CREATE TABLE reciprocal_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    note VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_reciprocal_clubs_region ON reciprocal_clubs(region);
CREATE INDEX idx_reciprocal_clubs_country ON reciprocal_clubs(country);
CREATE INDEX idx_reciprocal_clubs_is_active ON reciprocal_clubs(is_active);

-- ============================================================================
-- LETTER OF INTRODUCTION REQUESTS TABLE
-- ============================================================================
CREATE TABLE loi_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    club_id UUID REFERENCES reciprocal_clubs(id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    purpose visit_purpose NOT NULL,
    special_requests TEXT,
    status loi_status NOT NULL DEFAULT 'pending',
    secretary_notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_loi_requests_member_id ON loi_requests(member_id);
CREATE INDEX idx_loi_requests_club_id ON loi_requests(club_id);
CREATE INDEX idx_loi_requests_status ON loi_requests(status);

-- ============================================================================
-- CLUB NEWS TABLE
-- ============================================================================
CREATE TABLE club_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category news_category NOT NULL,
    published_date DATE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_club_news_category ON club_news(category);
CREATE INDEX idx_club_news_published_date ON club_news(published_date);
CREATE INDEX idx_club_news_is_active ON club_news(is_active);

-- ============================================================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_member_id ON password_reset_tokens(member_id);

-- ============================================================================
-- SESSIONS TABLE (for tracking active sessions)
-- ============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_sessions_member_id ON sessions(member_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_profiles_updated_at BEFORE UPDATE ON member_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_bookings_updated_at BEFORE UPDATE ON event_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_reservations_updated_at BEFORE UPDATE ON dining_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reciprocal_clubs_updated_at BEFORE UPDATE ON reciprocal_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loi_requests_updated_at BEFORE UPDATE ON loi_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_news_updated_at BEFORE UPDATE ON club_news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reciprocal_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loi_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_news ENABLE ROW LEVEL SECURITY;

-- Members policies
CREATE POLICY "Members can view their own data" ON members
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members can update their own data" ON members
    FOR UPDATE USING (auth.uid() = id);

-- Member profiles policies
CREATE POLICY "Members can view their own profile" ON member_profiles
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can update their own profile" ON member_profiles
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Members can insert their own profile" ON member_profiles
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Events policies (public read, authenticated book)
CREATE POLICY "Events are viewable by authenticated members" ON events
    FOR SELECT TO authenticated USING (true);

-- Event bookings policies
CREATE POLICY "Members can view their own bookings" ON event_bookings
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can create their own bookings" ON event_bookings
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can cancel their own bookings" ON event_bookings
    FOR UPDATE USING (auth.uid() = member_id);

-- Dining reservations policies
CREATE POLICY "Members can view their own reservations" ON dining_reservations
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can create their own reservations" ON dining_reservations
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Members can update their own reservations" ON dining_reservations
    FOR UPDATE USING (auth.uid() = member_id);

-- Reciprocal clubs policies
CREATE POLICY "Reciprocal clubs are viewable by authenticated members" ON reciprocal_clubs
    FOR SELECT TO authenticated USING (true);

-- LOI requests policies
CREATE POLICY "Members can view their own LOI requests" ON loi_requests
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Members can create their own LOI requests" ON loi_requests
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Club news policies
CREATE POLICY "Club news is viewable by authenticated members" ON club_news
    FOR SELECT TO authenticated USING (is_active = true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get member by email (for authentication)
CREATE OR REPLACE FUNCTION get_member_by_email(p_email VARCHAR)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    password_hash VARCHAR,
    full_name VARCHAR,
    first_name VARCHAR,
    membership_number VARCHAR,
    membership_type membership_type,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.email, m.password_hash, m.full_name, m.first_name, 
           m.membership_number, m.membership_type, m.is_active
    FROM members m
    WHERE m.email = p_email AND m.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a session
CREATE OR REPLACE FUNCTION create_session(
    p_member_id UUID,
    p_device_info VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_token VARCHAR;
BEGIN
    v_session_id := uuid_generate_v4();
    v_token := encode(sha256(random()::text::bytea), 'hex');
    
    INSERT INTO sessions (id, member_id, token, device_info, ip_address, expires_at)
    VALUES (v_session_id, p_member_id, v_token, p_device_info, p_ip_address, 
            TIMEZONE('utc', NOW() + INTERVAL '30 days'))
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(p_token VARCHAR)
RETURNS TABLE (member_id UUID, is_valid BOOLEAN) AS $$
DECLARE
    v_member_id UUID;
BEGIN
    SELECT s.member_id INTO v_member_id
    FROM sessions s
    WHERE s.token = p_token 
      AND s.expires_at > TIMEZONE('utc', NOW());
    
    IF v_member_id IS NOT NULL THEN
        UPDATE sessions SET last_active_at = TIMEZONE('utc', NOW())
        WHERE token = p_token;
        RETURN QUERY SELECT v_member_id, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate session (logout)
CREATE OR REPLACE FUNCTION invalidate_session(p_token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM sessions WHERE token = p_token;
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE members IS 'Club members with authentication credentials';
COMMENT ON TABLE member_profiles IS 'Extended member profile information';
COMMENT ON TABLE events IS 'Club events (lunches, dinners, meetings, specials)';
COMMENT ON TABLE event_bookings IS 'Member bookings for club events';
COMMENT ON TABLE dining_reservations IS 'Dining room reservations';
COMMENT ON TABLE reciprocal_clubs IS 'Reciprocal clubs worldwide';
COMMENT ON TABLE loi_requests IS 'Letters of Introduction requests for reciprocal clubs';
COMMENT ON TABLE club_news IS 'Club news and announcements';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens';
COMMENT ON TABLE sessions IS 'User sessions for authentication';

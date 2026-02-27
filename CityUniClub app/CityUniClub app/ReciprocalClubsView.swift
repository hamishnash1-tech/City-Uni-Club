import SwiftUI

struct ReciprocalClubsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var selectedRegion = "All"
    @State private var selectedClub: ReciprocalClub?
    @State private var showLOISheet = false
    
    let regions = ["All", "United Kingdom", "Europe", "Asia", "Americas", "Africa", "Oceania"]
    
    let clubs: [ReciprocalClub] = [
        // UNITED KINGDOM - LONDON
        ReciprocalClub(name: "Buck's Club", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Bush Hill Park Golf Club", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Eccentric Club (Snail Club)", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Gymkhana Club", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Lansdowne Club", location: "London", region: "United Kingdom", country: "England", note: "Evenings only"),
        ReciprocalClub(name: "National Liberal Club", location: "London", region: "United Kingdom", country: "England", note: "Evenings only"),
        ReciprocalClub(name: "Oxford and Cambridge Club", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Royal Over-Seas League", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "University Women's Club", location: "London", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Winchester House Club", location: "London", region: "United Kingdom", country: "England"),
        
        // ENGLAND - OTHER CITIES
        ReciprocalClub(name: "Bath and Country Club", location: "Bath", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Bedford Club", location: "Bedford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Sandhurst Club", location: "Berkshire", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "St. Paul's Club", location: "Birmingham", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Bradford Club", location: "Bradford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Clifton Club", location: "Bristol", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Bristol Savages", location: "Bristol", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Hawks' Club", location: "Cambridge", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "University Pitt Club", location: "Cambridge", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Kent and Canterbury Club", location: "Canterbury", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Chelmsford Club", location: "Chelmsford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The New Club", location: "Cheltenham", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Chester City Club", location: "Chester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "The Essex Golf & County Club", location: "Colchester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Devonshire Club", location: "Eastbourne", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Harrogate Club", location: "Harrogate", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Leander Club", location: "Henley-on-Thames", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Phyllis Court Club", location: "Henley-on-Thames", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Hove Club", location: "Hove", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Unity Business Club", location: "Leeds", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Artists Club", location: "Liverpool", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Athenaeum Club", location: "Liverpool", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "St. James's Club", location: "Manchester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Northern Counties Club", location: "Newcastle-upon-Tyne", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Northampton and County Club", location: "Northampton", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Norfolk Club", location: "Norwich", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Nottingham Club", location: "Nottingham", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Vincent's Club", location: "Oxford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Royal Albert Yacht Club", location: "Portsmouth", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Castle Club", location: "Rochester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Sheffield Club", location: "Sheffield", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Potters Club", location: "Stoke-on-Trent", region: "United Kingdom", country: "England"),
        
        // SCOTLAND
        ReciprocalClub(name: "Royal Northern and University Club", location: "Aberdeen", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The New Club", location: "Edinburgh", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The Royal Scots Club", location: "Edinburgh", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "Western Club", location: "Glasgow", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The Royal Perth Golfing Society", location: "Perth", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "St. Rule Club", location: "St. Andrews", region: "United Kingdom", country: "Scotland"),
        
        // WALES
        ReciprocalClub(name: "Cardiff & County Club", location: "Cardiff", region: "United Kingdom", country: "Wales"),
        
        // IRELAND
        ReciprocalClub(name: "Royal Dublin Society", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "The Stephen's Green Hibernian Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "Royal Irish Automobile Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "The United Arts Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        
        // NORTHERN IRELAND
        ReciprocalClub(name: "Armagh Club", location: "Armagh", region: "Northern Ireland", country: "Northern Ireland"),
        ReciprocalClub(name: "Ulster Reform Club", location: "Belfast", region: "Northern Ireland", country: "Northern Ireland"),
        
        // AUSTRALIA
        ReciprocalClub(name: "The Adelaide Club", location: "Adelaide", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "The Brisbane Club", location: "Brisbane", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "The Australian Club", location: "Melbourne", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "Melbourne Club", location: "Melbourne", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "RACV Club", location: "Melbourne", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "Royal Automobile Club", location: "Sydney", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "Tattersalls", location: "Sydney", region: "Oceania", country: "Australia"),
        ReciprocalClub(name: "The Perth Club", location: "Perth", region: "Oceania", country: "Australia"),
        
        // CANADA
        ReciprocalClub(name: "The Calgary Winter Club", location: "Calgary", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "The Bow Valley Club", location: "Calgary", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "The Hamilton Club", location: "Hamilton", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "The Toronto Hunt", location: "Toronto", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "The National Club", location: "Toronto", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "Albany Club of Toronto", location: "Toronto", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "The University Club of Toronto", location: "Toronto", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "St. James Club", location: "Montreal", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "University Club of Montreal", location: "Montreal", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "Rideau Club", location: "Ottawa", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "Manitoba Club", location: "Winnipeg", region: "Americas", country: "Canada"),
        ReciprocalClub(name: "Union Club of British Columbia", location: "Vancouver", region: "Americas", country: "Canada"),
        
        // UNITED STATES
        ReciprocalClub(name: "University Club", location: "Chicago", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Union League Club", location: "Chicago", region: "Americas", country: "USA"),
        ReciprocalClub(name: "Harvard Club of Boston", location: "Boston", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The University Club of Boston", location: "Boston", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Penn Club", location: "New York", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Explorers Club", location: "New York", region: "Americas", country: "USA"),
        ReciprocalClub(name: "Manhattan Yacht Club", location: "New York", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Detroit Athletic Club", location: "Detroit", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Houston Club", location: "Houston", region: "Americas", country: "USA"),
        ReciprocalClub(name: "The Dallas Club", location: "Dallas", region: "Americas", country: "USA"),
        
        // EUROPE
        ReciprocalClub(name: "Cercle de Lorraine", location: "Brussels", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "St Johann's Club", location: "Vienna", region: "Europe", country: "Austria"),
        ReciprocalClub(name: "Saint James", location: "Paris", region: "Europe", country: "France"),
        ReciprocalClub(name: "International Club Berlin", location: "Berlin", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Anglo-German Club", location: "Hamburg", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "The Athens Club", location: "Athens", region: "Europe", country: "Greece"),
        ReciprocalClub(name: "Circolo Antico Tiro a Volo", location: "Rome", region: "Europe", country: "Italy"),
        ReciprocalClub(name: "Circulo Ecuestre", location: "Barcelona", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Casino de Madrid", location: "Madrid", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Sallskapet", location: "Stockholm", region: "Europe", country: "Sweden"),
        ReciprocalClub(name: "Club de Bale", location: "Basel", region: "Europe", country: "Switzerland"),
        
        // ASIA
        ReciprocalClub(name: "The Hong Kong Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Club Lusitano", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Kowloon Cricket Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "The Karnataka Club", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "Madras Gymkhana Club", location: "Chennai", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Bengal Club", location: "Kolkata", region: "Asia", country: "India"),
        ReciprocalClub(name: "Gymkhana Club", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Delhi Gymkhana Club", location: "New Delhi", region: "Asia", country: "India"),
        ReciprocalClub(name: "Mercantile Athletic Club", location: "Jakarta", region: "Asia", country: "Indonesia"),
        ReciprocalClub(name: "Kobe Club", location: "Kobe", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Tokyo Club", location: "Tokyo", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Tokyo American Club", location: "Tokyo", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Seoul Club", location: "Seoul", region: "Asia", country: "Korea"),
        ReciprocalClub(name: "Royal Selangor Club", location: "Kuala Lumpur", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Singapore Cricket Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "Singapore Recreation Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "The British Club", location: "Bangkok", region: "Asia", country: "Thailand"),
        
        // AFRICA
        ReciprocalClub(name: "The Capital Club", location: "Nairobi", region: "Africa", country: "Kenya"),
        ReciprocalClub(name: "The Durban Club", location: "Durban", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Country Club", location: "Johannesburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Owl Club", location: "Cape Town", region: "Africa", country: "South Africa"),
        
        // MIDDLE EAST
        ReciprocalClub(name: "The Capital Club", location: "Dubai", region: "Middle East", country: "UAE"),
        ReciprocalClub(name: "The Club", location: "Abu Dhabi", region: "Middle East", country: "UAE")
    ]
    
    var filteredClubs: [ReciprocalClub] {
        clubs.filter { club in
            (selectedRegion == "All" || club.region == selectedRegion) &&
            (searchText.isEmpty || club.name.localizedCaseInsensitiveContains(searchText) ||
             club.location.localizedCaseInsensitiveContains(searchText))
        }
    }
    
    var body: some View {
        ZStack {
            Color.oxfordBlue.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.oxfordBlue)
                    }
                    
                    Spacer()
                    
                    Text("Reciprocal Clubs")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.oxfordBlue)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.clear)
                }
                .padding()
                .background(Color.cardWhite)
                
                // Info Card
                VStack(alignment: .leading, spacing: 12) {
                    Text("Letter of Introduction")
                        .font(.system(size: 18, weight: .semibold, design: .serif))
                        .foregroundColor(.oxfordBlue)
                    
                    Text("When visiting reciprocal clubs, you may need a Letter of Introduction. Please contact the secretary at least 7 days before your visit.")
                        .font(.system(size: 13))
                        .foregroundColor(.secondaryText)
                        .lineSpacing(3)
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.cardWhite)
                )
                .padding()
                
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondaryText)
                    
                    TextField("Search clubs...", text: $searchText)
                        .font(.system(size: 14))
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.cardWhite)
                )
                .padding(.horizontal)
                .padding(.bottom, 12)
                
                // Region Filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(regions, id: \.self) { region in
                            Button {
                                selectedRegion = region
                            } label: {
                                Text(region)
                                    .font(.system(size: 13, weight: selectedRegion == region ? .semibold : .regular))
                                    .foregroundColor(selectedRegion == region ? .white : .oxfordBlue)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(
                                        Capsule()
                                            .fill(selectedRegion == region ? Color.oxfordBlue : Color.cardWhite)
                                    )
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Clubs List
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(filteredClubs) { club in
                            clubCard(club: club)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }
        }
        // FIXED: Use .sheet with isPresented instead of .sheet(item:)
        .sheet(isPresented: $showLOISheet) {
            if let club = selectedClub {
                LOIRequestView(club: club)
            }
        }
    }
    
    private func clubCard(club: ReciprocalClub) -> some View {
        Button {
            selectedClub = club
            showLOISheet = true
        } label: {
            HStack(spacing: 16) {
                // Globe Icon
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.cambridgeBlue.opacity(0.3),
                                    Color.oxfordBlue.opacity(0.3)
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    
                    Image(systemName: "globe.europe.africa.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.oxfordBlue)
                }
                .frame(width: 50, height: 50)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(club.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.oxfordBlue)
                    
                    HStack(spacing: 8) {
                        Label(club.location, systemImage: "location")
                            .font(.system(size: 12))
                            .foregroundColor(.secondaryText)
                        
                        if let note = club.note {
                            Text("•")
                                .foregroundColor(.cambridgeBlue)
                            Text(note)
                                .font(.system(size: 11))
                                .foregroundColor(.cambridgeBlue)
                                .italic()
                        }
                    }
                    
                    Text(club.country)
                        .font(.system(size: 11))
                        .foregroundColor(.secondaryText)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.secondaryText)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.cardWhite)
                    .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ReciprocalClubsView_Previews: PreviewProvider {
    static var previews: some View {
        ReciprocalClubsView()
    }
}

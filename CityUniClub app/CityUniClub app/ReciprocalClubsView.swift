import SwiftUI

struct ReciprocalClubsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var selectedRegion = "All"
    @State private var selectedClub: ReciprocalClub?
    @State private var showLOISheet = false

    let regions = ["All", "United Kingdom", "Ireland", "Australia", "Canada", "USA", "Europe", "Asia", "Africa", "Americas", "Oceania", "Middle East", "South America"]

    let clubs: [ReciprocalClub] = [
        // ========== UNITED KINGDOM - LONDON ==========
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
        
        // ========== UNITED KINGDOM - ENGLAND ==========
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
        ReciprocalClub(name: "The Manchester Tennis & Racquet Club", location: "Manchester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Northern Counties Club", location: "Newcastle-upon-Tyne", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Northampton and County Club", location: "Northampton", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Norfolk Club", location: "Norwich", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Strangers Club", location: "Norwich", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Nottingham Club", location: "Nottingham", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Vincent's Club", location: "Oxford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Gridiron Club", location: "Oxford", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Royal Albert Yacht Club", location: "Portsmouth", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Castle Club", location: "Rochester", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Royal Air Force Yacht Club", location: "Southampton", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Potters Club", location: "Stoke-on-Trent", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Sheffield Club", location: "Sheffield", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Bury St Edmunds Farmers Club", location: "Suffolk", region: "United Kingdom", country: "England"),
        ReciprocalClub(name: "Ipswich and Suffolk Club", location: "Suffolk", region: "United Kingdom", country: "England"),
        
        // ========== NORTHERN IRELAND ==========
        ReciprocalClub(name: "Armagh Club", location: "Armagh", region: "United Kingdom", country: "Northern Ireland"),
        ReciprocalClub(name: "Ulster Reform Club", location: "Belfast", region: "United Kingdom", country: "Northern Ireland"),
        
        // ========== IRELAND ==========
        ReciprocalClub(name: "Royal Dublin Society", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "The Stephen's Green Hibernian Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "Royal Irish Automobile Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        ReciprocalClub(name: "The United Arts Club", location: "Dublin", region: "Ireland", country: "Ireland"),
        
        // ========== SCOTLAND ==========
        ReciprocalClub(name: "Royal Northern and University Club", location: "Aberdeen", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The New Club", location: "Edinburgh", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The Royal Scots Club", location: "Edinburgh", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The Scottish Arts Club", location: "Edinburgh", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "The Royal Perth Golfing Society", location: "Perth", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "Western Club", location: "Glasgow", region: "United Kingdom", country: "Scotland"),
        ReciprocalClub(name: "St. Rule Club", location: "St. Andrews", region: "United Kingdom", country: "Scotland"),
        
        // ========== WALES ==========
        ReciprocalClub(name: "Cardiff & County Club", location: "Cardiff", region: "United Kingdom", country: "Wales"),
        
        // ========== ARGENTINA ==========
        ReciprocalClub(name: "Club del Progreso", location: "Buenos Aires", region: "South America", country: "Argentina"),
        
        // ========== AUSTRALIA ==========
        ReciprocalClub(name: "The Adelaide Club", location: "Adelaide", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Public Schools Club", location: "Adelaide", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Queen Adelaide Club", location: "Adelaide", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Brisbane Club", location: "Brisbane", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Brisbane Polo Club", location: "Brisbane", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Moreton Club", location: "Brisbane", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Tattersall's Club", location: "Brisbane", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Echuca Club", location: "Echuca", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Hamilton Club", location: "Hamilton", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "RACV Healesville Country Club", location: "Healesville", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Athenaeum Club", location: "Hobart", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Tasmanian Club", location: "Hobart", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Queen Mary Club", location: "Hobart", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Launceston Club", location: "Launceston", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Alexandra Club", location: "Melbourne", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Australian Club", location: "Melbourne", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Melbourne Club", location: "Melbourne", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Melbourne Savage Club", location: "Melbourne", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "RACV Club", location: "Melbourne", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Newcastle Club", location: "Newcastle", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The United Services Club", location: "Queensland", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Royal Automobile Club", location: "Sydney", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Australasian Pioneer's Club", location: "Sydney", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Tattersalls", location: "Sydney", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Karrakatta Club", location: "Perth", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "Downs Club", location: "Toowoomba", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "North Queensland Club", location: "Townsville", region: "Australia", country: "Australia"),
        ReciprocalClub(name: "The Geelong Club", location: "Victoria", region: "Australia", country: "Australia"),
        
        // ========== AUSTRIA ==========
        ReciprocalClub(name: "St Johann's Club", location: "Vienna", region: "Europe", country: "Austria"),
        ReciprocalClub(name: "Wiener Rennverein", location: "Vienna", region: "Europe", country: "Austria"),
        ReciprocalClub(name: "The Jockey Club", location: "Vienna", region: "Europe", country: "Austria"),
        ReciprocalClub(name: "Country Club", location: "Kitzbuhel", region: "Europe", country: "Austria"),
        
        // ========== BELGIUM ==========
        ReciprocalClub(name: "Cercle de Lorraine", location: "Brussels", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "De Warande", location: "Brussels", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "Cercle Wallonie", location: "Brussels", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "International Club Château Sainte-Anne", location: "Brussels", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "International Club of Flanders", location: "Ghent", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "Société Royal Littéraire Club", location: "Ghent", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "Cercle Wallonie", location: "Namur", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "Société Littéraire", location: "Liege", region: "Europe", country: "Belgium"),
        ReciprocalClub(name: "Cercle du Lac", location: "Louvain-la-Neuve", region: "Europe", country: "Belgium"),
        
        // ========== BERMUDA ==========
        ReciprocalClub(name: "The Royal Hamilton Amateur Dinghy Club", location: "Hamilton", region: "Americas", country: "Bermuda"),
        
        // ========== BOLIVIA ==========
        ReciprocalClub(name: "Circulo de la Union", location: "La Paz", region: "South America", country: "Bolivia"),
        
        // ========== BULGARIA ==========
        ReciprocalClub(name: "Union Club 1884", location: "Sofia", region: "Europe", country: "Bulgaria"),
        ReciprocalClub(name: "The Residence Exclusive Club", location: "Sofia", region: "Europe", country: "Bulgaria"),
        
        // ========== CANADA - ALBERTA ==========
        ReciprocalClub(name: "Royal Glenora Club", location: "Edmonton", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Cypress Club", location: "Medicine Hat", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Bow Valley Club", location: "Calgary", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Calgary Winter Club", location: "Calgary", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Windsor Club", location: "Calgary", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Calgary Petroleum Club", location: "Calgary", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Glencoe Club", location: "Calgary", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Ranchmen's Club", location: "Calgary", region: "Canada", country: "Canada"),
        
        // ========== CANADA - ONTARIO ==========
        ReciprocalClub(name: "The Belleville Club", location: "Belleville", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Hamilton Club", location: "Hamilton", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "London Club", location: "London", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "St. Catharine's Club", location: "St. Catharines", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Adelaide Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Albany Club of Toronto", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Badminton and Racquet Club of Toronto", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Boulevard Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Arts and Letters Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Donalda Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Royal Canadian Yacht Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The National Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Toronto Hunt", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Faculty Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The University Club of Toronto", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Toronto Cricket, Skating and Curling Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Toronto Athletic Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Royal Canadian Military Institute", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Ladies Golf Club", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Verity", location: "Toronto", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Cambridge Club", location: "Toronto", region: "Canada", country: "Canada"),
        
        // ========== CANADA - QUEBEC ==========
        ReciprocalClub(name: "The Forest & Stream Club", location: "Dorval", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Garrison Club Inc.", location: "Montreal", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "St. James Club", location: "Montreal", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "University Club of Montreal", location: "Montreal", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Club Sportif MAA", location: "Montreal", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The McGill Faculty Club", location: "Montreal", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Ottawa Hunt & Golf Club", location: "Ottawa", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Rideau Club", location: "Ottawa", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Britannia Yacht Club", location: "Ottawa", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Pointe-Clare Yacht Club", location: "Pointe-Clare", region: "Canada", country: "Canada"),
        
        // ========== CANADA - OTHER ==========
        ReciprocalClub(name: "The Union Club", location: "Fredericton", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Manitoba Club", location: "Winnipeg", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Winnipeg Squash Racquet Club", location: "Winnipeg", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Vancouver Lawn Tennis and Badminton Club", location: "Vancouver", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Union Club of British Columbia", location: "Vancouver", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "Terminal City Club", location: "Vancouver", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The University Women's Club of Vancouver", location: "Vancouver", region: "Canada", country: "Canada"),
        ReciprocalClub(name: "The Saskatoon Club", location: "Saskatoon", region: "Canada", country: "Canada"),
        
        // ========== CHANNEL ISLANDS ==========
        ReciprocalClub(name: "United Club", location: "St. Helier", region: "Europe", country: "Channel Islands"),
        ReciprocalClub(name: "United Club", location: "St. Peter Port", region: "Europe", country: "Channel Islands"),
        
        // ========== CHILE ==========
        ReciprocalClub(name: "Club de la Union", location: "Punta Arenas", region: "South America", country: "Chile"),
        ReciprocalClub(name: "Club de la Union", location: "Santiago", region: "South America", country: "Chile"),
        ReciprocalClub(name: "Club Naval", location: "Valparaiso", region: "South America", country: "Chile"),
        ReciprocalClub(name: "Club Vina del Mar", location: "Vina del Mar", region: "South America", country: "Chile"),
        
        // ========== COLOMBIA ==========
        ReciprocalClub(name: "The Gun Club", location: "Bogota", region: "South America", country: "Colombia"),
        ReciprocalClub(name: "Club Colombia", location: "Cali", region: "South America", country: "Colombia"),
        ReciprocalClub(name: "Club de Ejecutivos", location: "Cali", region: "South America", country: "Colombia"),
        ReciprocalClub(name: "Club Cartagena", location: "Cartagena", region: "South America", country: "Colombia"),
        ReciprocalClub(name: "Serrezuela Country Club", location: "Mesa", region: "South America", country: "Colombia"),
        
        // ========== COSTA RICA ==========
        ReciprocalClub(name: "Club Union", location: "San Jose", region: "Americas", country: "Costa Rica"),
        
        // ========== CZECH REPUBLIC ==========
        ReciprocalClub(name: "Prague Business Club", location: "Prague", region: "Europe", country: "Czech Republic"),
        
        // ========== DENMARK ==========
        ReciprocalClub(name: "The Royal Danish Yacht Club", location: "Copenhagen", region: "Europe", country: "Denmark"),
        
        // ========== ECUADOR ==========
        ReciprocalClub(name: "Club Sociedad Union Quito", location: "Quito", region: "South America", country: "Ecuador"),
        ReciprocalClub(name: "Club de la Union de Guayaquil", location: "Guayaquil", region: "South America", country: "Ecuador"),
        
        // ========== EL SALVADOR ==========
        ReciprocalClub(name: "Club Campestre Cuscatlan", location: "San Salvador", region: "Americas", country: "El Salvador"),
        
        // ========== FRANCE ==========
        ReciprocalClub(name: "Saint James", location: "Paris", region: "Europe", country: "France"),
        ReciprocalClub(name: "Standard Athletic Club", location: "Paris", region: "Europe", country: "France"),
        
        // ========== GERMANY ==========
        ReciprocalClub(name: "International Club Berlin", location: "Berlin", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Industrie-Club Bremen", location: "Bremen", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Anglo-German Club", location: "Hamburg", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Business Club", location: "Hamburg", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Der Kieler Kaufman", location: "Kiel", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Club International", location: "Leipzig", region: "Europe", country: "Germany"),
        ReciprocalClub(name: "Wirtschaft Club", location: "Stuttgart", region: "Europe", country: "Germany"),
        
        // ========== GREECE ==========
        ReciprocalClub(name: "The Athens Club", location: "Athens", region: "Europe", country: "Greece"),
        ReciprocalClub(name: "Piraeus Marine Club", location: "Piraeus", region: "Europe", country: "Greece"),
        
        // ========== HONG KONG ==========
        ReciprocalClub(name: "Refinery", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "The Helena May", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Club Lusitano", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Kowloon Cricket Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Hong Kong Savage Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "Hong Kong Football Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        ReciprocalClub(name: "The Ladies Recreation Club", location: "Hong Kong", region: "Asia", country: "Hong Kong"),
        
        // ========== HUNGARY ==========
        ReciprocalClub(name: "Brody House", location: "Budapest", region: "Europe", country: "Hungary"),
        
        // ========== INDIA ==========
        ReciprocalClub(name: "Karnavati Club", location: "Ahmedabad", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Belvedere Golf and Country Club", location: "Ahmedabad", region: "Asia", country: "India"),
        ReciprocalClub(name: "Reforms Club", location: "Amravati", region: "Asia", country: "India"),
        ReciprocalClub(name: "Catholic Club", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "Ksha Hockey Club", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "Spoorti Resort Clubhouse", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "Century Club", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "BLVD Club", location: "Bangalore", region: "Asia", country: "India"),
        ReciprocalClub(name: "Madras Gymkhana Club", location: "Chennai", region: "Asia", country: "India"),
        ReciprocalClub(name: "International Club", location: "Cochin", region: "Asia", country: "India"),
        ReciprocalClub(name: "Reccaa Club", location: "Kochi", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Princeton Club", location: "Kolkata", region: "Asia", country: "India"),
        ReciprocalClub(name: "Calcutta Rowing Club", location: "Kolkata", region: "Asia", country: "India"),
        ReciprocalClub(name: "Calcutta Polo Club", location: "Kolkata", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Circle Club", location: "Kolkata", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Engineers Club", location: "Kerala", region: "Asia", country: "India"),
        ReciprocalClub(name: "Bekal Club", location: "Kerala", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Calicut Cosmopolitan Club", location: "Kerala", region: "Asia", country: "India"),
        ReciprocalClub(name: "Rama Varma Union Club", location: "Kottayam", region: "Asia", country: "India"),
        ReciprocalClub(name: "Oudh Gymkhana Club", location: "Lucknow", region: "Asia", country: "India"),
        ReciprocalClub(name: "Westind Country Club", location: "Manipal", region: "Asia", country: "India"),
        ReciprocalClub(name: "Royal Goldfieldd Club Resort", location: "Maharashtra", region: "Asia", country: "India"),
        ReciprocalClub(name: "Golden Swan Country Club", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "Club Emerald", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "Bombay Sailing Club", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "Wodehouse Gymkhana Club", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "Stellar Gymkhana", location: "Noida", region: "Asia", country: "India"),
        ReciprocalClub(name: "Juhu Vile Parle Gymkhana Club", location: "Mumbai", region: "Asia", country: "India"),
        ReciprocalClub(name: "Deccan Gymkhana", location: "Pune", region: "Asia", country: "India"),
        ReciprocalClub(name: "PYC Hindu Gymkhana", location: "Pune", region: "Asia", country: "India"),
        ReciprocalClub(name: "Residency Club", location: "Pune", region: "Asia", country: "India"),
        ReciprocalClub(name: "Royal Connaught Boat Club", location: "Pune", region: "Asia", country: "India"),
        ReciprocalClub(name: "Lodhi Club", location: "Punjab", region: "Asia", country: "India"),
        ReciprocalClub(name: "Ajmer Club", location: "Rajasthan", region: "Asia", country: "India"),
        ReciprocalClub(name: "The Jodhpur Presidency Club", location: "Rajasthan", region: "Asia", country: "India"),
        ReciprocalClub(name: "Shillong Club", location: "Shillong", region: "Asia", country: "India"),
        ReciprocalClub(name: "Suncity Club", location: "Vadodara", region: "Asia", country: "India"),
        
        // ========== INDONESIA ==========
        ReciprocalClub(name: "Financial Club", location: "Jakarta", region: "Asia", country: "Indonesia"),
        ReciprocalClub(name: "Mercantile Athletic Club", location: "Jakarta", region: "Asia", country: "Indonesia"),
        ReciprocalClub(name: "The American Club", location: "Jakarta", region: "Asia", country: "Indonesia"),
        
        // ========== ITALY ==========
        ReciprocalClub(name: "Circolo Bononia", location: "Bologna", region: "Europe", country: "Italy"),
        ReciprocalClub(name: "Circulo Ravennate e Dei Forestieri", location: "Ravenna", region: "Europe", country: "Italy"),
        ReciprocalClub(name: "Circolo Artistico Tunnel Club", location: "Genova", region: "Europe", country: "Italy"),
        ReciprocalClub(name: "Circolo Antico Tiro a Volo", location: "Rome", region: "Europe", country: "Italy"),
        
        // ========== JAPAN ==========
        ReciprocalClub(name: "Kobe Club", location: "Kobe", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Tokyo Club", location: "Tokyo", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "The Foreign Correspondents Club", location: "Tokyo", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Tokyo American Club", location: "Tokyo", region: "Asia", country: "Japan"),
        ReciprocalClub(name: "Yokohama Country & Athletic Club", location: "Yokohama", region: "Asia", country: "Japan"),
        
        // ========== KENYA ==========
        ReciprocalClub(name: "Eldoret Club", location: "Eldoret", region: "Africa", country: "Kenya"),
        ReciprocalClub(name: "Nanyuki Sports Club", location: "Nanyuki", region: "Africa", country: "Kenya"),
        ReciprocalClub(name: "Njoro Country Club", location: "Njoro", region: "Africa", country: "Kenya"),
        ReciprocalClub(name: "The Capital Club", location: "Nairobi", region: "Africa", country: "Kenya"),
        ReciprocalClub(name: "The Impala Club", location: "Nairobi", region: "Africa", country: "Kenya"),
        
        // ========== KOREA ==========
        ReciprocalClub(name: "Seoul Club", location: "Seoul", region: "Asia", country: "Korea"),
        
        // ========== LUXEMBOURG ==========
        ReciprocalClub(name: "Cercle Munster", location: "Luxembourg", region: "Europe", country: "Luxembourg"),
        
        // ========== MALAYSIA ==========
        ReciprocalClub(name: "Royal Ipoh Club", location: "Ipoh", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Johor Cultural and Sports Club", location: "Johor", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "The Kinabalu Club", location: "Kinabalu", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Kulim Club", location: "Kulim Kedah", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Royal Commonwealth Society", location: "Kulim Kedah", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Royal Selangor Club", location: "Kulim Kedah", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Penang Sports Club", location: "Kulim Kedah", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Sandakan Yacht Club", location: "Sabah", region: "Asia", country: "Malaysia"),
        ReciprocalClub(name: "Royal Sungei Ujong Club", location: "Seremban", region: "Asia", country: "Malaysia"),
        
        // ========== MALTA ==========
        ReciprocalClub(name: "Casino Maltese", location: "Valletta", region: "Europe", country: "Malta"),
        ReciprocalClub(name: "The Malta Union Club", location: "Sliema", region: "Europe", country: "Malta"),
        
        // ========== MAURITIUS ==========
        ReciprocalClub(name: "Mauritius Gymkhana Club", location: "Mauritius", region: "Africa", country: "Mauritius"),
        
        // ========== MEXICO ==========
        ReciprocalClub(name: "University Club de Guadalajara", location: "Guadalajara", region: "Americas", country: "Mexico"),
        ReciprocalClub(name: "The University Club of Mexico", location: "Mexico City", region: "Americas", country: "Mexico"),
        ReciprocalClub(name: "The Estrella del Mar Golf and Beach Resort", location: "Sinaloa", region: "Americas", country: "Mexico"),
        
        // ========== MONACO ==========
        ReciprocalClub(name: "Thirty Nine", location: "Monte Carlo", region: "Europe", country: "Monaco"),
        
        // ========== MONTENEGRO ==========
        ReciprocalClub(name: "Porto Montenegro Yacht Club", location: "Tivat", region: "Europe", country: "Montenegro"),
        
        // ========== NETHERLANDS ==========
        ReciprocalClub(name: "De Industreele Groote Club", location: "Amsterdam", region: "Europe", country: "Netherlands"),
        ReciprocalClub(name: "Nieuwe of Litteraire Societeit de Witte", location: "The Hague", region: "Europe", country: "Netherlands"),
        ReciprocalClub(name: "De Wittenburg", location: "Wassenaar", region: "Europe", country: "Netherlands"),
        ReciprocalClub(name: "The Herensocieteit Amicitia te Leiden", location: "Leiden", region: "Europe", country: "Netherlands"),
        
        // ========== NEW ZEALAND ==========
        ReciprocalClub(name: "The Christchurch Club", location: "Christchurch", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "Canterbury Club", location: "Christchurch", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "University of Canterbury Club", location: "Christchurch", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "The Dunedin Club", location: "Dunedin", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "The Invercargill Club", location: "Invercargill", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "Hawke's Bay Club", location: "Napier", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "Tauranga Club", location: "Tauranga", region: "Oceania", country: "New Zealand"),
        ReciprocalClub(name: "Wellesley Club", location: "Wellington", region: "Oceania", country: "New Zealand"),
        
        // ========== PAKISTAN ==========
        ReciprocalClub(name: "The Chenab Club", location: "Faisalabad", region: "Asia", country: "Pakistan"),
        ReciprocalClub(name: "Islamabad Club", location: "Islamabad", region: "Asia", country: "Pakistan"),
        ReciprocalClub(name: "Jacaranda Family Club", location: "Islamabad", region: "Asia", country: "Pakistan"),
        ReciprocalClub(name: "Gwadar Gymkhana", location: "Gwadar", region: "Asia", country: "Pakistan"),
        
        // ========== PERU ==========
        ReciprocalClub(name: "Club Empresarial", location: "Lima", region: "South America", country: "Peru"),
        
        // ========== PHILIPPINES ==========
        ReciprocalClub(name: "Manila Club", location: "Manila", region: "Asia", country: "Philippines"),
        ReciprocalClub(name: "Casino Espanol de Manila", location: "Manila", region: "Asia", country: "Philippines"),
        ReciprocalClub(name: "The Manila Boat Club", location: "Manila", region: "Asia", country: "Philippines"),
        
        // ========== POLAND ==========
        ReciprocalClub(name: "Business Centre Club", location: "Warsaw", region: "Europe", country: "Poland"),
        ReciprocalClub(name: "Polish Business Roundtable Club", location: "Warsaw", region: "Europe", country: "Poland"),
        
        // ========== PORTUGAL ==========
        ReciprocalClub(name: "Circolo Eca de Queiroz", location: "Lisbon", region: "Europe", country: "Portugal"),
        ReciprocalClub(name: "Grémio Literário", location: "Lisbon", region: "Europe", country: "Portugal"),
        ReciprocalClub(name: "Royal British Club", location: "Lisbon", region: "Europe", country: "Portugal"),
        ReciprocalClub(name: "Club Portuense", location: "Oporto", region: "Europe", country: "Portugal"),
        ReciprocalClub(name: "The Club de Viseu", location: "Viseu", region: "Europe", country: "Portugal"),
        
        // ========== RUSSIA ==========
        ReciprocalClub(name: "Capital Club", location: "Moscow", region: "Europe", country: "Russia"),
        ReciprocalClub(name: "The Kelia Club", location: "Moscow", region: "Europe", country: "Russia"),
        
        // ========== SINGAPORE ==========
        ReciprocalClub(name: "The British Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "Ceylon Sports Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "Raffles Marina", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "Singapore Cricket Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "Singapore Recreation Club", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "The National University of Singapore Society", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "The American Club Singapore", location: "Singapore", region: "Asia", country: "Singapore"),
        ReciprocalClub(name: "The Tower Club of Singapore", location: "Singapore", region: "Asia", country: "Singapore"),
        
        // ========== SOUTH AFRICA ==========
        ReciprocalClub(name: "The Owl Club", location: "Cape Town", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Ideas Cartel", location: "Cape Town", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Seven Seas Club", location: "Cape Town", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Durban Club", location: "Durban", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Durban Country Club", location: "Durban", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "East London Golf Club", location: "East London", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Country Club", location: "Johannesburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Rand Club", location: "Johannesburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Wanderers Club", location: "Johannesburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "The Kimberley Club", location: "Kimberley", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Victoria Country Club", location: "Pietermaritzburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Pietersburg Club", location: "Pietersburg", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Port Elizabeth St Georges Club", location: "Port Elizabeth", region: "Africa", country: "South Africa"),
        ReciprocalClub(name: "Inanda Club", location: "Sandton", region: "Africa", country: "South Africa"),
        
        // ========== SPAIN ==========
        ReciprocalClub(name: "Circulo Ecuestre", location: "Barcelona", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Circulo del Liceo", location: "Barcelona", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Sociedad Bilbaina", location: "Bilbao", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Real Circulo de la Amistad", location: "Cordoba", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Casino de Madrid", location: "Madrid", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Real Gran Pena", location: "Madrid", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "The Real Casino De Murcia", location: "Murcia", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Club de Mar", location: "Palma de Mallorca", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Nuevo Casino de Pamplona", location: "Pamplona", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Real Circulo de Labradores y Proprietarios de Sevilla", location: "Seville", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Real Sociedad de Valenciana de Agricultura y Deportes", location: "Valencia", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Club Financiero Vigo", location: "Vigo", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Real Club Nautico de Gran Canaria", location: "Las Palmas", region: "Europe", country: "Spain"),
        ReciprocalClub(name: "Gabinete Literario", location: "Las Palmas", region: "Europe", country: "Spain"),
        
        // ========== SRI LANKA ==========
        ReciprocalClub(name: "Colombo Club", location: "Colombo", region: "Asia", country: "Sri Lanka"),
        ReciprocalClub(name: "The Capri Club", location: "Colombo", region: "Asia", country: "Sri Lanka"),
        ReciprocalClub(name: "Colombo Swimming Club", location: "Colombo", region: "Asia", country: "Sri Lanka"),
        ReciprocalClub(name: "Singhalese Sports Club", location: "Colombo", region: "Asia", country: "Sri Lanka"),
        ReciprocalClub(name: "The Hill Club", location: "Nuwara Eliya", region: "Asia", country: "Sri Lanka"),
        
        // ========== SWEDEN ==========
        ReciprocalClub(name: "The Royal Bachelors' Club", location: "Gothenburg", region: "Europe", country: "Sweden"),
        ReciprocalClub(name: "Hansaklubben", location: "Malmo", region: "Europe", country: "Sweden"),
        ReciprocalClub(name: "Sallskapet", location: "Stockholm", region: "Europe", country: "Sweden"),
        ReciprocalClub(name: "Villa Pauli", location: "Stockholm", region: "Europe", country: "Sweden"),
        ReciprocalClub(name: "The Military Club of Stockholm", location: "Stockholm", region: "Europe", country: "Sweden"),
        
        // ========== SWITZERLAND ==========
        ReciprocalClub(name: "Club de Bale", location: "Basel", region: "Europe", country: "Switzerland"),
        
        // ========== THAILAND ==========
        ReciprocalClub(name: "The British Club", location: "Bangkok", region: "Asia", country: "Thailand"),
        ReciprocalClub(name: "The Foreign Correspondents Club", location: "Bangkok", region: "Asia", country: "Thailand"),
        
        // ========== UAE ==========
        ReciprocalClub(name: "The Club", location: "Abu Dhabi", region: "Middle East", country: "UAE"),
        ReciprocalClub(name: "The Capital Club", location: "Dubai", region: "Middle East", country: "UAE"),
        
        // ========== USA ==========
        ReciprocalClub(name: "The Club Inc", location: "Birmingham", region: "USA", country: "USA"),
        ReciprocalClub(name: "Athelstan Club", location: "Mobile", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club of Anchorage", location: "Anchorage", region: "USA", country: "USA"),
        ReciprocalClub(name: "The 1836 Club", location: "Little Rock", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club of Phoenix", location: "Phoenix", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club at Sundale", location: "Bakersfield", region: "USA", country: "USA"),
        ReciprocalClub(name: "Berkeley City Club", location: "Berkeley", region: "USA", country: "USA"),
        ReciprocalClub(name: "Ingomar Club", location: "Eureka", region: "USA", country: "USA"),
        ReciprocalClub(name: "Magic Castle", location: "Los Angeles", region: "USA", country: "USA"),
        ReciprocalClub(name: "Griffin Club", location: "Los Angeles", region: "USA", country: "USA"),
        ReciprocalClub(name: "Casa Abrego Club", location: "Monterey", region: "USA", country: "USA"),
        ReciprocalClub(name: "California Yacht Club", location: "Marina del Rey", region: "USA", country: "USA"),
        ReciprocalClub(name: "Balboa Bay Club", location: "Newport Beach", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Athletic Club", location: "Newport Beach", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Riviera Country Club", location: "Pacific Palisades", region: "USA", country: "USA"),
        ReciprocalClub(name: "The University Club of Pasadena", location: "Pasadena", region: "USA", country: "USA"),
        ReciprocalClub(name: "Town Club of Pasadena", location: "Pasadena", region: "USA", country: "USA"),
        ReciprocalClub(name: "Sutter Club", location: "Sacramento", region: "USA", country: "USA"),
        ReciprocalClub(name: "Marines Memorial Club", location: "San Francisco", region: "USA", country: "USA"),
        ReciprocalClub(name: "City Club of San Francisco", location: "San Francisco", region: "USA", country: "USA"),
        ReciprocalClub(name: "St Francis Yacht Club", location: "San Francisco", region: "USA", country: "USA"),
        ReciprocalClub(name: "Santa Barbara Club", location: "Santa Barbara", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club of San Francisco", location: "San Francisco", region: "USA", country: "USA"),
        ReciprocalClub(name: "El Paso Club", location: "Colorado Springs", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Denver Athletic Club", location: "Denver", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Denver Club", location: "Denver", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Denver Press Club", location: "Denver", region: "USA", country: "USA"),
        ReciprocalClub(name: "The University Club", location: "Denver", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Elm City Club", location: "New Haven", region: "USA", country: "USA"),
        ReciprocalClub(name: "New Haven Lawn Club", location: "New Haven", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Hartford Club", location: "Hartford", region: "USA", country: "USA"),
        ReciprocalClub(name: "Town & County Club", location: "Hartford", region: "USA", country: "USA"),
        ReciprocalClub(name: "University and Whist Club of Wilmington", location: "Wilmington", region: "USA", country: "USA"),
        ReciprocalClub(name: "Tampa Club", location: "Tampa", region: "USA", country: "USA"),
        ReciprocalClub(name: "Indian Hills Country Club", location: "Atlanta", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Pinnacle Club", location: "Augusta", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Chatham Club", location: "Savannah", region: "USA", country: "USA"),
        ReciprocalClub(name: "Outrigger Canoe Club", location: "Honolulu", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Pacific Club", location: "Honolulu", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Arid Club Inc", location: "Boise", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club", location: "Chicago", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Union League Club", location: "Chicago", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Cliff Dwellers", location: "Chicago", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Decatur Club", location: "Decatur", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club of Rockford", location: "Rockford", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Antelope Club", location: "Indianapolis", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Columbia Club", location: "Indianapolis", region: "USA", country: "USA"),
        ReciprocalClub(name: "The University Club of Indianapolis", location: "Indianapolis", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Outing Club", location: "Davenport", region: "USA", country: "USA"),
        ReciprocalClub(name: "Des Moines Embassy Club", location: "Des Moines", region: "USA", country: "USA"),
        ReciprocalClub(name: "The University Club", location: "Louisville", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Pendennis Club", location: "Louisville", region: "USA", country: "USA"),
        ReciprocalClub(name: "City Club of Baton Rouge", location: "Baton Rouge", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Shreveport Club", location: "Shreveport", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Petroleum Club of Lafayette", location: "Lafayette", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Center Club", location: "Baltimore", region: "USA", country: "USA"),
        ReciprocalClub(name: "John Hopkins Club", location: "Baltimore", region: "USA", country: "USA"),
        ReciprocalClub(name: "The College Club of Boston", location: "Boston", region: "USA", country: "USA"),
        ReciprocalClub(name: "St. Botolph Club", location: "Boston", region: "USA", country: "USA"),
        ReciprocalClub(name: "The University Club of Boston", location: "Boston", region: "USA", country: "USA"),
        ReciprocalClub(name: "Harvard Club of Boston", location: "Boston", region: "USA", country: "USA"),
        ReciprocalClub(name: "Tennis & Racquet Club", location: "Boston", region: "USA", country: "USA"),
        ReciprocalClub(name: "Wamsutta Club", location: "New Bedford", region: "USA", country: "USA"),
        ReciprocalClub(name: "Worcester Club", location: "Worcester", region: "USA", country: "USA"),
        ReciprocalClub(name: "Lanam Club", location: "Andover", region: "USA", country: "USA"),
        ReciprocalClub(name: "Detroit Athletic Club", location: "Detroit", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Bayview Yacht Club", location: "Detroit", region: "USA", country: "USA"),
        ReciprocalClub(name: "Michigan State University", location: "Lansing", region: "USA", country: "USA"),
        ReciprocalClub(name: "Kitchi Gammi Club", location: "Duluth", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Woman's Club of Minneapolis", location: "Minneapolis", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club of Saint Paul", location: "Saint Paul", region: "USA", country: "USA"),
        ReciprocalClub(name: "St. Louis Club", location: "St. Louis", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Racquet Club", location: "St. Louis", region: "USA", country: "USA"),
        ReciprocalClub(name: "Morristown Club", location: "Morristown", region: "USA", country: "USA"),
        ReciprocalClub(name: "Park Avenue Club", location: "Newark", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Montauk Club", location: "Brooklyn", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Penn Club", location: "Manhattan", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Explorers Club", location: "Manhattan", region: "USA", country: "USA"),
        ReciprocalClub(name: "Manhattan Yacht Club", location: "Manhattan", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Salmagundi Club", location: "Manhattan", region: "USA", country: "USA"),
        ReciprocalClub(name: "Charlotte City Club", location: "Charlotte", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club", location: "Durham", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club of Oklahoma City", location: "Oklahoma City", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club", location: "Portland", region: "USA", country: "USA"),
        ReciprocalClub(name: "Cincinnati Athletic Club", location: "Cincinnati", region: "USA", country: "USA"),
        ReciprocalClub(name: "Queen City Club", location: "Cincinnati", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Union Club", location: "Cleveland", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Toledo Club", location: "Toledo", region: "USA", country: "USA"),
        ReciprocalClub(name: "Racquet Club of Philadelphia", location: "Philadelphia", region: "USA", country: "USA"),
        ReciprocalClub(name: "Germantown Cricket Club", location: "Philadelphia", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Franklin Inn Club", location: "Philadelphia", region: "USA", country: "USA"),
        ReciprocalClub(name: "Allegheny HYP Club", location: "Pittsburgh", region: "USA", country: "USA"),
        ReciprocalClub(name: "Hope Club", location: "Providence", region: "USA", country: "USA"),
        ReciprocalClub(name: "Providence Art Club", location: "Providence", region: "USA", country: "USA"),
        ReciprocalClub(name: "University Club of Providence", location: "Providence", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Green Boundary Club", location: "Aiken", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Wanderer", location: "Charleston", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Palmetto Club", location: "Columbia", region: "USA", country: "USA"),
        ReciprocalClub(name: "Piedmont Club", location: "Greenville", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Walden Club", location: "Chattanooga", region: "USA", country: "USA"),
        ReciprocalClub(name: "Nashville City Club", location: "Nashville", region: "USA", country: "USA"),
        ReciprocalClub(name: "Austin Club", location: "Austin", region: "USA", country: "USA"),
        ReciprocalClub(name: "Headliners Club", location: "Austin", region: "USA", country: "USA"),
        ReciprocalClub(name: "Park City Club", location: "Dallas", region: "USA", country: "USA"),
        ReciprocalClub(name: "El Paso Club", location: "El Paso", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club of Fort Worth", location: "Fort Worth", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club of Houston", location: "Houston", region: "USA", country: "USA"),
        ReciprocalClub(name: "Petroleum Club of San Antonio", location: "San Antonio", region: "USA", country: "USA"),
        ReciprocalClub(name: "Alta Club", location: "Salt Lake City", region: "USA", country: "USA"),
        ReciprocalClub(name: "Farmington Country Club", location: "Charlottesville", region: "USA", country: "USA"),
        ReciprocalClub(name: "Norfolk Yacht & Country Club", location: "Norfolk", region: "USA", country: "USA"),
        ReciprocalClub(name: "Arts Club of Washington", location: "Washington D.C.", region: "USA", country: "USA"),
        ReciprocalClub(name: "The George Town Club", location: "Washington D.C.", region: "USA", country: "USA"),
        ReciprocalClub(name: "Bellevue Club", location: "Bellevue", region: "USA", country: "USA"),
        ReciprocalClub(name: "College Club of Seattle", location: "Seattle", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Spokane Club", location: "Spokane", region: "USA", country: "USA"),
        ReciprocalClub(name: "Milwaukee Athletic Club", location: "Milwaukee", region: "USA", country: "USA"),
        ReciprocalClub(name: "Milwaukee Club", location: "Milwaukee", region: "USA", country: "USA"),
        ReciprocalClub(name: "The Madison Club", location: "Madison", region: "USA", country: "USA"),
        
        // ========== URUGUAY ==========
        ReciprocalClub(name: "Club Uruguay", location: "Montevideo", region: "South America", country: "Uruguay"),
        
        // ========== VIETNAM ==========
        ReciprocalClub(name: "The Hanoi Club", location: "Hanoi", region: "Asia", country: "Vietnam"),
        
        // ========== ZIMBABWE ==========
        ReciprocalClub(name: "The Bulawayo Club", location: "Bulawayo", region: "Africa", country: "Zimbabwe"),
    ]

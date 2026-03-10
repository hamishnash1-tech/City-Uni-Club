// Complete reciprocal clubs list from Reciplist2024.docx - ALL 450+ CLUBS
export interface Club {
  name: string
  location: string
  region: string
  country: string
  note?: string
}

export const reciprocalClubs: Club[] = [
  // ========== UNITED KINGDOM - LONDON ==========
  { name: "Buck's Club", location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Bush Hill Park Golf Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Eccentric Club (Snail Club)', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Test Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Test Club - anand@cambridgembn.com' },
  { name: 'Gymkhana Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Lansdowne Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  { name: 'National Liberal Club', location: 'London', region: 'United Kingdom', country: 'England', note: 'Evenings only' },
  { name: 'Oxford and Cambridge Club', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Royal Over-Seas League', location: 'London', region: 'United Kingdom', country: 'England' },
  { name: "University Women's Club", location: 'London', region: 'United Kingdom', country: 'England' },
  { name: 'Winchester House Club', location: 'London', region: 'United Kingdom', country: 'England' },
  
  // ========== UNITED KINGDOM - ENGLAND ==========
  { name: 'Bath and Country Club', location: 'Bath', region: 'United Kingdom', country: 'England' },
  { name: 'The Bedford Club', location: 'Bedford', region: 'United Kingdom', country: 'England' },
  { name: 'The Sandhurst Club', location: 'Berkshire', region: 'United Kingdom', country: 'England' },
  { name: "St. Paul's Club", location: 'Birmingham', region: 'United Kingdom', country: 'England' },
  { name: 'The Bradford Club', location: 'Bradford', region: 'United Kingdom', country: 'England' },
  { name: 'The Clifton Club', location: 'Bristol', region: 'United Kingdom', country: 'England' },
  { name: 'Bristol Savages', location: 'Bristol', region: 'United Kingdom', country: 'England' },
  { name: "Hawks' Club", location: 'Cambridge', region: 'United Kingdom', country: 'England' },
  { name: 'University Pitt Club', location: 'Cambridge', region: 'United Kingdom', country: 'England' },
  { name: 'Kent and Canterbury Club', location: 'Canterbury', region: 'United Kingdom', country: 'England' },
  { name: 'The Chelmsford Club', location: 'Chelmsford', region: 'United Kingdom', country: 'England' },
  { name: 'The New Club', location: 'Cheltenham', region: 'United Kingdom', country: 'England' },
  { name: 'Chester City Club', location: 'Chester', region: 'United Kingdom', country: 'England' },
  { name: 'The Essex Golf & County Club', location: 'Colchester', region: 'United Kingdom', country: 'England' },
  { name: 'Devonshire Club', location: 'Eastbourne', region: 'United Kingdom', country: 'England' },
  { name: 'Harrogate Club', location: 'Harrogate', region: 'United Kingdom', country: 'England' },
  { name: 'Leander Club', location: 'Henley-on-Thames', region: 'United Kingdom', country: 'England' },
  { name: 'Phyllis Court Club', location: 'Henley-on-Thames', region: 'United Kingdom', country: 'England' },
  { name: 'Hove Club', location: 'Hove', region: 'United Kingdom', country: 'England' },
  { name: 'Unity Business Club', location: 'Leeds', region: 'United Kingdom', country: 'England' },
  { name: 'Artists Club', location: 'Liverpool', region: 'United Kingdom', country: 'England' },
  { name: 'Athenaeum Club', location: 'Liverpool', region: 'United Kingdom', country: 'England' },
  { name: "St. James's Club", location: 'Manchester', region: 'United Kingdom', country: 'England' },
  { name: 'The Manchester Tennis & Racquet Club', location: 'Manchester', region: 'United Kingdom', country: 'England' },
  { name: 'Northern Counties Club', location: 'Newcastle-upon-Tyne', region: 'United Kingdom', country: 'England' },
  { name: 'Northampton and County Club', location: 'Northampton', region: 'United Kingdom', country: 'England' },
  { name: 'Norfolk Club', location: 'Norwich', region: 'United Kingdom', country: 'England' },
  { name: 'Strangers Club', location: 'Norwich', region: 'United Kingdom', country: 'England' },
  { name: 'Nottingham Club', location: 'Nottingham', region: 'United Kingdom', country: 'England' },
  { name: "Vincent's Club", location: 'Oxford', region: 'United Kingdom', country: 'England' },
  { name: 'Gridiron Club', location: 'Oxford', region: 'United Kingdom', country: 'England' },
  { name: 'Royal Albert Yacht Club', location: 'Portsmouth', region: 'United Kingdom', country: 'England' },
  { name: 'Castle Club', location: 'Rochester', region: 'United Kingdom', country: 'England' },
  { name: 'Royal Air Force Yacht Club', location: 'Southampton', region: 'United Kingdom', country: 'England' },
  { name: 'Potters Club', location: 'Stoke-on-Trent', region: 'United Kingdom', country: 'England' },
  { name: 'Sheffield Club', location: 'Sheffield', region: 'United Kingdom', country: 'England' },
  { name: 'Bury St Edmunds Farmers Club', location: 'Suffolk', region: 'United Kingdom', country: 'England' },
  { name: 'Ipswich and Suffolk Club', location: 'Suffolk', region: 'United Kingdom', country: 'England' },
  
  // ========== NORTHERN IRELAND ==========
  { name: 'Armagh Club', location: 'Armagh', region: 'United Kingdom', country: 'Northern Ireland' },
  { name: 'Ulster Reform Club', location: 'Belfast', region: 'United Kingdom', country: 'Northern Ireland' },
  
  // ========== IRELAND ==========
  { name: 'Royal Dublin Society', location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  { name: "The Stephen's Green Hibernian Club", location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  { name: 'Royal Irish Automobile Club', location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  { name: 'The United Arts Club', location: 'Dublin', region: 'Ireland', country: 'Ireland' },
  
  // ========== SCOTLAND ==========
  { name: 'Royal Northern and University Club', location: 'Aberdeen', region: 'United Kingdom', country: 'Scotland' },
  { name: 'The New Club', location: 'Edinburgh', region: 'United Kingdom', country: 'Scotland' },
  { name: 'The Royal Scots Club', location: 'Edinburgh', region: 'United Kingdom', country: 'Scotland' },
  { name: 'The Scottish Arts Club', location: 'Edinburgh', region: 'United Kingdom', country: 'Scotland' },
  { name: 'The Royal Perth Golfing Society', location: 'Perth', region: 'United Kingdom', country: 'Scotland' },
  { name: 'Western Club', location: 'Glasgow', region: 'United Kingdom', country: 'Scotland' },
  { name: 'St. Rule Club', location: 'St. Andrews', region: 'United Kingdom', country: 'Scotland' },
  
  // ========== WALES ==========
  { name: 'Cardiff & County Club', location: 'Cardiff', region: 'United Kingdom', country: 'Wales' },
  
  // ========== ARGENTINA ==========
  { name: 'Club del Progreso', location: 'Buenos Aires', region: 'South America', country: 'Argentina' },
  
  // ========== AUSTRALIA ==========
  { name: 'The Adelaide Club', location: 'Adelaide', region: 'Australia', country: 'Australia' },
  { name: 'Public Schools Club', location: 'Adelaide', region: 'Australia', country: 'Australia' },
  { name: 'The Queen Adelaide Club', location: 'Adelaide', region: 'Australia', country: 'Australia' },
  { name: 'The Brisbane Club', location: 'Brisbane', region: 'Australia', country: 'Australia' },
  { name: 'Brisbane Polo Club', location: 'Brisbane', region: 'Australia', country: 'Australia' },
  { name: 'The Moreton Club', location: 'Brisbane', region: 'Australia', country: 'Australia' },
  { name: "Tattersall's Club", location: 'Brisbane', region: 'Australia', country: 'Australia' },
  { name: 'Echuca Club', location: 'Echuca', region: 'Australia', country: 'Australia' },
  { name: 'The Hamilton Club', location: 'Hamilton', region: 'Australia', country: 'Australia' },
  { name: 'RACV Healesville Country Club', location: 'Healesville', region: 'Australia', country: 'Australia' },
  { name: 'Athenaeum Club', location: 'Hobart', region: 'Australia', country: 'Australia' },
  { name: 'Tasmanian Club', location: 'Hobart', region: 'Australia', country: 'Australia' },
  { name: 'Queen Mary Club', location: 'Hobart', region: 'Australia', country: 'Australia' },
  { name: 'The Launceston Club', location: 'Launceston', region: 'Australia', country: 'Australia' },
  { name: 'Alexandra Club', location: 'Melbourne', region: 'Australia', country: 'Australia' },
  { name: 'The Australian Club', location: 'Melbourne', region: 'Australia', country: 'Australia' },
  { name: 'Melbourne Club', location: 'Melbourne', region: 'Australia', country: 'Australia' },
  { name: 'Melbourne Savage Club', location: 'Melbourne', region: 'Australia', country: 'Australia' },
  { name: 'RACV Club', location: 'Melbourne', region: 'Australia', country: 'Australia' },
  { name: 'The Newcastle Club', location: 'Newcastle', region: 'Australia', country: 'Australia' },
  { name: 'The United Services Club', location: 'Queensland', region: 'Australia', country: 'Australia' },
  { name: 'Royal Automobile Club', location: 'Sydney', region: 'Australia', country: 'Australia' },
  { name: "The Australasian Pioneer's Club", location: 'Sydney', region: 'Australia', country: 'Australia' },
  { name: 'Tattersalls', location: 'Sydney', region: 'Australia', country: 'Australia' },
  { name: 'The Karrakatta Club', location: 'Perth', region: 'Australia', country: 'Australia' },
  { name: 'Downs Club', location: 'Toowoomba', region: 'Australia', country: 'Australia' },
  { name: 'North Queensland Club', location: 'Townsville', region: 'Australia', country: 'Australia' },
  { name: 'The Geelong Club', location: 'Victoria', region: 'Australia', country: 'Australia' },
  
  // ========== AUSTRIA ==========
  { name: "St Johann's Club", location: 'Vienna', region: 'Europe', country: 'Austria' },
  { name: 'Wiener Rennverein', location: 'Vienna', region: 'Europe', country: 'Austria' },
  { name: 'The Jockey Club', location: 'Vienna', region: 'Europe', country: 'Austria' },
  { name: 'Country Club', location: 'Kitzbuhel', region: 'Europe', country: 'Austria' },
  
  // ========== BELGIUM ==========
  { name: 'Cercle de Lorraine', location: 'Brussels', region: 'Europe', country: 'Belgium' },
  { name: 'De Warande', location: 'Brussels', region: 'Europe', country: 'Belgium' },
  { name: 'Cercle Wallonie', location: 'Brussels', region: 'Europe', country: 'Belgium' },
  { name: 'International Club Château Sainte-Anne', location: 'Brussels', region: 'Europe', country: 'Belgium' },
  { name: 'International Club of Flanders', location: 'Ghent', region: 'Europe', country: 'Belgium' },
  { name: 'Société Royal Littéraire Club', location: 'Ghent', region: 'Europe', country: 'Belgium' },
  { name: 'Cercle Wallonie', location: 'Namur', region: 'Europe', country: 'Belgium' },
  { name: 'Société Littéraire', location: 'Liege', region: 'Europe', country: 'Belgium' },
  { name: 'Cercle du Lac', location: 'Louvain-la-Neuve', region: 'Europe', country: 'Belgium' },
  
  // ========== BERMUDA ==========
  { name: 'The Royal Hamilton Amateur Dinghy Club', location: 'Hamilton', region: 'Americas', country: 'Bermuda' },
  
  // ========== BOLIVIA ==========
  { name: 'Circulo de la Union', location: 'La Paz', region: 'South America', country: 'Bolivia' },
  
  // ========== BULGARIA ==========
  { name: 'Union Club 1884', location: 'Sofia', region: 'Europe', country: 'Bulgaria' },
  { name: 'The Residence Exclusive Club', location: 'Sofia', region: 'Europe', country: 'Bulgaria' },
  
  // ========== CANADA - ALBERTA ==========
  { name: 'Royal Glenora Club', location: 'Edmonton', region: 'Canada', country: 'Canada' },
  { name: 'Cypress Club', location: 'Medicine Hat', region: 'Canada', country: 'Canada' },
  { name: 'The Bow Valley Club', location: 'Calgary', region: 'Canada', country: 'Canada' },
  { name: 'Calgary Winter Club', location: 'Calgary', region: 'Canada', country: 'Canada' },
  { name: 'The Windsor Club', location: 'Calgary', region: 'Canada', country: 'Canada' },
  { name: 'Calgary Petroleum Club', location: 'Calgary', region: 'Canada', country: 'Canada' },
  { name: 'The Glencoe Club', location: 'Calgary', region: 'Canada', country: 'Canada' },
  { name: "The Ranchmen's Club", location: 'Calgary', region: 'Canada', country: 'Canada' },
  
  // ========== CANADA - ONTARIO ==========
  { name: 'The Belleville Club', location: 'Belleville', region: 'Canada', country: 'Canada' },
  { name: 'The Hamilton Club', location: 'Hamilton', region: 'Canada', country: 'Canada' },
  { name: 'London Club', location: 'London', region: 'Canada', country: 'Canada' },
  { name: "St. Catharine's Club", location: 'St. Catharines', region: 'Canada', country: 'Canada' },
  { name: 'Adelaide Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Albany Club of Toronto', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The Badminton and Racquet Club of Toronto', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Boulevard Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The Arts and Letters Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Donalda Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Royal Canadian Yacht Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The National Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The Toronto Hunt', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The Faculty Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'The University Club of Toronto', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Toronto Cricket, Skating and Curling Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Toronto Athletic Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Royal Canadian Military Institute', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Ladies Golf Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Verity', location: 'Toronto', region: 'Canada', country: 'Canada' },
  { name: 'Cambridge Club', location: 'Toronto', region: 'Canada', country: 'Canada' },
  
  // ========== CANADA - QUEBEC ==========
  { name: 'The Forest & Stream Club', location: 'Dorval', region: 'Canada', country: 'Canada' },
  { name: 'Garrison Club Inc.', location: 'Montreal', region: 'Canada', country: 'Canada' },
  { name: 'St. James Club', location: 'Montreal', region: 'Canada', country: 'Canada' },
  { name: 'University Club of Montreal', location: 'Montreal', region: 'Canada', country: 'Canada' },
  { name: 'Club Sportif MAA', location: 'Montreal', region: 'Canada', country: 'Canada' },
  { name: 'The McGill Faculty Club', location: 'Montreal', region: 'Canada', country: 'Canada' },
  { name: 'Ottawa Hunt & Golf Club', location: 'Ottawa', region: 'Canada', country: 'Canada' },
  { name: 'Rideau Club', location: 'Ottawa', region: 'Canada', country: 'Canada' },
  { name: 'Britannia Yacht Club', location: 'Ottawa', region: 'Canada', country: 'Canada' },
  { name: 'Pointe-Clare Yacht Club', location: 'Pointe-Clare', region: 'Canada', country: 'Canada' },
  
  // ========== CANADA - OTHER ==========
  { name: 'The Union Club', location: 'Fredericton', region: 'Canada', country: 'Canada' },
  { name: 'Manitoba Club', location: 'Winnipeg', region: 'Canada', country: 'Canada' },
  { name: 'Winnipeg Squash Racquet Club', location: 'Winnipeg', region: 'Canada', country: 'Canada' },
  { name: 'Vancouver Lawn Tennis and Badminton Club', location: 'Vancouver', region: 'Canada', country: 'Canada' },
  { name: 'Union Club of British Columbia', location: 'Vancouver', region: 'Canada', country: 'Canada' },
  { name: 'Terminal City Club', location: 'Vancouver', region: 'Canada', country: 'Canada' },
  { name: "The University Women's Club of Vancouver", location: 'Vancouver', region: 'Canada', country: 'Canada' },
  { name: 'The Saskatoon Club', location: 'Saskatoon', region: 'Canada', country: 'Canada' },
  
  // ========== CHANNEL ISLANDS ==========
  { name: 'United Club', location: 'St. Helier', region: 'Europe', country: 'Channel Islands' },
  { name: 'United Club', location: 'St. Peter Port', region: 'Europe', country: 'Channel Islands' },
  
  // ========== CHILE ==========
  { name: 'Club de la Union', location: 'Punta Arenas', region: 'South America', country: 'Chile' },
  { name: 'Club de la Union', location: 'Santiago', region: 'South America', country: 'Chile' },
  { name: 'Club Naval', location: 'Valparaiso', region: 'South America', country: 'Chile' },
  { name: 'Club Vina del Mar', location: 'Vina del Mar', region: 'South America', country: 'Chile' },
  
  // ========== COLOMBIA ==========
  { name: 'The Gun Club', location: 'Bogota', region: 'South America', country: 'Colombia' },
  { name: 'Club Colombia', location: 'Cali', region: 'South America', country: 'Colombia' },
  { name: 'Club de Ejecutivos', location: 'Cali', region: 'South America', country: 'Colombia' },
  { name: 'Club Cartagena', location: 'Cartagena', region: 'South America', country: 'Colombia' },
  { name: 'Serrezuela Country Club', location: 'Mesa', region: 'South America', country: 'Colombia' },
  
  // ========== COSTA RICA ==========
  { name: 'Club Union', location: 'San Jose', region: 'Americas', country: 'Costa Rica' },
  
  // ========== CZECH REPUBLIC ==========
  { name: 'Prague Business Club', location: 'Prague', region: 'Europe', country: 'Czech Republic' },
  
  // ========== DENMARK ==========
  { name: 'The Royal Danish Yacht Club', location: 'Copenhagen', region: 'Europe', country: 'Denmark' },
  
  // ========== ECUADOR ==========
  { name: 'Club Sociedad Union Quito', location: 'Quito', region: 'South America', country: 'Ecuador' },
  { name: 'Club de la Union de Guayaquil', location: 'Guayaquil', region: 'South America', country: 'Ecuador' },
  
  // ========== EL SALVADOR ==========
  { name: 'Club Campestre Cuscatlan', location: 'San Salvador', region: 'Americas', country: 'El Salvador' },
  
  // ========== FRANCE ==========
  { name: 'Saint James', location: 'Paris', region: 'Europe', country: 'France' },
  { name: 'Standard Athletic Club', location: 'Paris', region: 'Europe', country: 'France' },
  
  // ========== GERMANY ==========
  { name: 'International Club Berlin', location: 'Berlin', region: 'Europe', country: 'Germany' },
  { name: 'Industrie-Club Bremen', location: 'Bremen', region: 'Europe', country: 'Germany' },
  { name: 'Anglo-German Club', location: 'Hamburg', region: 'Europe', country: 'Germany' },
  { name: 'Business Club', location: 'Hamburg', region: 'Europe', country: 'Germany' },
  { name: 'Der Kieler Kaufman', location: 'Kiel', region: 'Europe', country: 'Germany' },
  { name: 'Club International', location: 'Leipzig', region: 'Europe', country: 'Germany' },
  { name: 'Wirtschaft Club', location: 'Stuttgart', region: 'Europe', country: 'Germany' },
  
  // ========== GREECE ==========
  { name: 'The Athens Club', location: 'Athens', region: 'Europe', country: 'Greece' },
  { name: 'Piraeus Marine Club', location: 'Piraeus', region: 'Europe', country: 'Greece' },
  
  // ========== HONG KONG ==========
  { name: 'Refinery', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'The Helena May', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'Club Lusitano', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'Kowloon Cricket Club', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'Hong Kong Savage Club', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'Hong Kong Football Club', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  { name: 'The Ladies Recreation Club', location: 'Hong Kong', region: 'Asia', country: 'Hong Kong' },
  
  // ========== HUNGARY ==========
  { name: 'Brody House', location: 'Budapest', region: 'Europe', country: 'Hungary' },
  
  // ========== INDIA ==========
  { name: 'Karnavati Club', location: 'Ahmedabad', region: 'Asia', country: 'India' },
  { name: 'The Belvedere Golf and Country Club', location: 'Ahmedabad', region: 'Asia', country: 'India' },
  { name: 'Reforms Club', location: 'Amravati', region: 'Asia', country: 'India' },
  { name: 'Catholic Club', location: 'Bangalore', region: 'Asia', country: 'India' },
  { name: 'Ksha Hockey Club', location: 'Bangalore', region: 'Asia', country: 'India' },
  { name: 'Spoorti Resort Clubhouse', location: 'Bangalore', region: 'Asia', country: 'India' },
  { name: 'Century Club', location: 'Bangalore', region: 'Asia', country: 'India' },
  { name: 'BLVD Club', location: 'Bangalore', region: 'Asia', country: 'India' },
  { name: 'Madras Gymkhana Club', location: 'Chennai', region: 'Asia', country: 'India' },
  { name: 'International Club', location: 'Cochin', region: 'Asia', country: 'India' },
  { name: 'Reccaa Club', location: 'Kochi', region: 'Asia', country: 'India' },
  { name: 'The Princeton Club', location: 'Kolkata', region: 'Asia', country: 'India' },
  { name: 'Calcutta Rowing Club', location: 'Kolkata', region: 'Asia', country: 'India' },
  { name: 'Calcutta Polo Club', location: 'Kolkata', region: 'Asia', country: 'India' },
  { name: 'The Circle Club', location: 'Kolkata', region: 'Asia', country: 'India' },
  { name: 'The Engineers Club', location: 'Kerala', region: 'Asia', country: 'India' },
  { name: 'Bekal Club', location: 'Kerala', region: 'Asia', country: 'India' },
  { name: 'The Calicut Cosmopolitan Club', location: 'Kerala', region: 'Asia', country: 'India' },
  { name: 'Rama Varma Union Club', location: 'Kottayam', region: 'Asia', country: 'India' },
  { name: 'Oudh Gymkhana Club', location: 'Lucknow', region: 'Asia', country: 'India' },
  { name: 'Westind Country Club', location: 'Manipal', region: 'Asia', country: 'India' },
  { name: 'Royal Goldfieldd Club Resort', location: 'Maharashtra', region: 'Asia', country: 'India' },
  { name: 'Golden Swan Country Club', location: 'Mumbai', region: 'Asia', country: 'India' },
  { name: 'Club Emerald', location: 'Mumbai', region: 'Asia', country: 'India' },
  { name: 'Bombay Sailing Club', location: 'Mumbai', region: 'Asia', country: 'India' },
  { name: 'Wodehouse Gymkhana Club', location: 'Mumbai', region: 'Asia', country: 'India' },
  { name: 'Stellar Gymkhana', location: 'Noida', region: 'Asia', country: 'India' },
  { name: 'Juhu Vile Parle Gymkhana Club', location: 'Mumbai', region: 'Asia', country: 'India' },
  { name: 'Deccan Gymkhana', location: 'Pune', region: 'Asia', country: 'India' },
  { name: 'PYC Hindu Gymkhana', location: 'Pune', region: 'Asia', country: 'India' },
  { name: 'Residency Club', location: 'Pune', region: 'Asia', country: 'India' },
  { name: 'Royal Connaught Boat Club', location: 'Pune', region: 'Asia', country: 'India' },
  { name: 'Lodhi Club', location: 'Punjab', region: 'Asia', country: 'India' },
  { name: 'Ajmer Club', location: 'Rajasthan', region: 'Asia', country: 'India' },
  { name: 'The Jodhpur Presidency Club', location: 'Rajasthan', region: 'Asia', country: 'India' },
  { name: 'Shillong Club', location: 'Shillong', region: 'Asia', country: 'India' },
  { name: 'Suncity Club', location: 'Vadodara', region: 'Asia', country: 'India' },
  
  // ========== INDONESIA ==========
  { name: 'Financial Club', location: 'Jakarta', region: 'Asia', country: 'Indonesia' },
  { name: 'Mercantile Athletic Club', location: 'Jakarta', region: 'Asia', country: 'Indonesia' },
  { name: 'The American Club', location: 'Jakarta', region: 'Asia', country: 'Indonesia' },
  
  // ========== ITALY ==========
  { name: 'Circolo Bononia', location: 'Bologna', region: 'Europe', country: 'Italy' },
  { name: 'Circulo Ravennate e Dei Forestieri', location: 'Ravenna', region: 'Europe', country: 'Italy' },
  { name: 'Circolo Artistico Tunnel Club', location: 'Genova', region: 'Europe', country: 'Italy' },
  { name: 'Circolo Antico Tiro a Volo', location: 'Rome', region: 'Europe', country: 'Italy' },
  
  // ========== JAPAN ==========
  { name: 'Kobe Club', location: 'Kobe', region: 'Asia', country: 'Japan' },
  { name: 'Tokyo Club', location: 'Tokyo', region: 'Asia', country: 'Japan' },
  { name: 'The Foreign Correspondents Club', location: 'Tokyo', region: 'Asia', country: 'Japan' },
  { name: 'Tokyo American Club', location: 'Tokyo', region: 'Asia', country: 'Japan' },
  { name: 'Yokohama Country & Athletic Club', location: 'Yokohama', region: 'Asia', country: 'Japan' },
  
  // ========== KENYA ==========
  { name: 'Eldoret Club', location: 'Eldoret', region: 'Africa', country: 'Kenya' },
  { name: 'Nanyuki Sports Club', location: 'Nanyuki', region: 'Africa', country: 'Kenya' },
  { name: 'Njoro Country Club', location: 'Njoro', region: 'Africa', country: 'Kenya' },
  { name: 'The Capital Club', location: 'Nairobi', region: 'Africa', country: 'Kenya' },
  { name: 'The Impala Club', location: 'Nairobi', region: 'Africa', country: 'Kenya' },
  
  // ========== KOREA ==========
  { name: 'Seoul Club', location: 'Seoul', region: 'Asia', country: 'Korea' },
  
  // ========== LUXEMBOURG ==========
  { name: 'Cercle Munster', location: 'Luxembourg', region: 'Europe', country: 'Luxembourg' },
  
  // ========== MALAYSIA ==========
  { name: 'Royal Ipoh Club', location: 'Ipoh', region: 'Asia', country: 'Malaysia' },
  { name: 'Johor Cultural and Sports Club', location: 'Johor', region: 'Asia', country: 'Malaysia' },
  { name: 'The Kinabalu Club', location: 'Kinabalu', region: 'Asia', country: 'Malaysia' },
  { name: 'Kulim Club', location: 'Kulim Kedah', region: 'Asia', country: 'Malaysia' },
  { name: 'Royal Commonwealth Society', location: 'Kulim Kedah', region: 'Asia', country: 'Malaysia' },
  { name: 'Royal Selangor Club', location: 'Kulim Kedah', region: 'Asia', country: 'Malaysia' },
  { name: 'Penang Sports Club', location: 'Kulim Kedah', region: 'Asia', country: 'Malaysia' },
  { name: 'Sandakan Yacht Club', location: 'Sabah', region: 'Asia', country: 'Malaysia' },
  { name: 'Royal Sungei Ujong Club', location: 'Seremban', region: 'Asia', country: 'Malaysia' },
  
  // ========== MALTA ==========
  { name: 'Casino Maltese', location: 'Valletta', region: 'Europe', country: 'Malta' },
  { name: 'The Malta Union Club', location: 'Sliema', region: 'Europe', country: 'Malta' },
  
  // ========== MAURITIUS ==========
  { name: 'Mauritius Gymkhana Club', location: 'Mauritius', region: 'Africa', country: 'Mauritius' },
  
  // ========== MEXICO ==========
  { name: 'University Club de Guadalajara', location: 'Guadalajara', region: 'Americas', country: 'Mexico' },
  { name: 'The University Club of Mexico', location: 'Mexico City', region: 'Americas', country: 'Mexico' },
  { name: 'The Estrella del Mar Golf and Beach Resort', location: 'Sinaloa', region: 'Americas', country: 'Mexico' },
  
  // ========== MONACO ==========
  { name: 'Thirty Nine', location: 'Monte Carlo', region: 'Europe', country: 'Monaco' },
  
  // ========== MONTENEGRO ==========
  { name: 'Porto Montenegro Yacht Club', location: 'Tivat', region: 'Europe', country: 'Montenegro' },
  
  // ========== NETHERLANDS ==========
  { name: 'De Industreele Groote Club', location: 'Amsterdam', region: 'Europe', country: 'Netherlands' },
  { name: 'Nieuwe of Litteraire Societeit de Witte', location: 'The Hague', region: 'Europe', country: 'Netherlands' },
  { name: 'De Wittenburg', location: 'Wassenaar', region: 'Europe', country: 'Netherlands' },
  { name: 'The Herensocieteit Amicitia te Leiden', location: 'Leiden', region: 'Europe', country: 'Netherlands' },
  
  // ========== NEW ZEALAND ==========
  { name: 'The Christchurch Club', location: 'Christchurch', region: 'Oceania', country: 'New Zealand' },
  { name: 'Canterbury Club', location: 'Christchurch', region: 'Oceania', country: 'New Zealand' },
  { name: 'University of Canterbury Club', location: 'Christchurch', region: 'Oceania', country: 'New Zealand' },
  { name: 'The Dunedin Club', location: 'Dunedin', region: 'Oceania', country: 'New Zealand' },
  { name: 'The Invercargill Club', location: 'Invercargill', region: 'Oceania', country: 'New Zealand' },
  { name: "Hawke's Bay Club", location: 'Napier', region: 'Oceania', country: 'New Zealand' },
  { name: 'Tauranga Club', location: 'Tauranga', region: 'Oceania', country: 'New Zealand' },
  { name: 'Wellesley Club', location: 'Wellington', region: 'Oceania', country: 'New Zealand' },
  
  // ========== PAKISTAN ==========
  { name: 'The Chenab Club', location: 'Faisalabad', region: 'Asia', country: 'Pakistan' },
  { name: 'Islamabad Club', location: 'Islamabad', region: 'Asia', country: 'Pakistan' },
  { name: 'Jacaranda Family Club', location: 'Islamabad', region: 'Asia', country: 'Pakistan' },
  { name: 'Gwadar Gymkhana', location: 'Gwadar', region: 'Asia', country: 'Pakistan' },
  
  // ========== PERU ==========
  { name: 'Club Empresarial', location: 'Lima', region: 'South America', country: 'Peru' },
  
  // ========== PHILIPPINES ==========
  { name: 'Manila Club', location: 'Manila', region: 'Asia', country: 'Philippines' },
  { name: 'Casino Espanol de Manila', location: 'Manila', region: 'Asia', country: 'Philippines' },
  { name: 'The Manila Boat Club', location: 'Manila', region: 'Asia', country: 'Philippines' },
  
  // ========== POLAND ==========
  { name: 'Business Centre Club', location: 'Warsaw', region: 'Europe', country: 'Poland' },
  { name: 'Polish Business Roundtable Club', location: 'Warsaw', region: 'Europe', country: 'Poland' },
  
  // ========== PORTUGAL ==========
  { name: 'Circolo Eca de Queiroz', location: 'Lisbon', region: 'Europe', country: 'Portugal' },
  { name: 'Grémio Literário', location: 'Lisbon', region: 'Europe', country: 'Portugal' },
  { name: 'Royal British Club', location: 'Lisbon', region: 'Europe', country: 'Portugal' },
  { name: 'Club Portuense', location: 'Oporto', region: 'Europe', country: 'Portugal' },
  { name: 'The Club de Viseu', location: 'Viseu', region: 'Europe', country: 'Portugal' },
  
  // ========== RUSSIA ==========
  { name: 'Capital Club', location: 'Moscow', region: 'Europe', country: 'Russia' },
  { name: 'The Kelia Club', location: 'Moscow', region: 'Europe', country: 'Russia' },
  
  // ========== SINGAPORE ==========
  { name: 'The British Club', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'Ceylon Sports Club', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'Raffles Marina', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'Singapore Cricket Club', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'Singapore Recreation Club', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'The National University of Singapore Society', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'The American Club Singapore', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  { name: 'The Tower Club of Singapore', location: 'Singapore', region: 'Asia', country: 'Singapore' },
  
  // ========== SOUTH AFRICA ==========
  { name: 'The Owl Club', location: 'Cape Town', region: 'Africa', country: 'South Africa' },
  { name: 'The Ideas Cartel', location: 'Cape Town', region: 'Africa', country: 'South Africa' },
  { name: 'Seven Seas Club', location: 'Cape Town', region: 'Africa', country: 'South Africa' },
  { name: 'The Durban Club', location: 'Durban', region: 'Africa', country: 'South Africa' },
  { name: 'Durban Country Club', location: 'Durban', region: 'Africa', country: 'South Africa' },
  { name: 'East London Golf Club', location: 'East London', region: 'Africa', country: 'South Africa' },
  { name: 'The Country Club', location: 'Johannesburg', region: 'Africa', country: 'South Africa' },
  { name: 'Rand Club', location: 'Johannesburg', region: 'Africa', country: 'South Africa' },
  { name: 'The Wanderers Club', location: 'Johannesburg', region: 'Africa', country: 'South Africa' },
  { name: 'The Kimberley Club', location: 'Kimberley', region: 'Africa', country: 'South Africa' },
  { name: 'Victoria Country Club', location: 'Pietermaritzburg', region: 'Africa', country: 'South Africa' },
  { name: 'Pietersburg Club', location: 'Pietersburg', region: 'Africa', country: 'South Africa' },
  { name: 'Port Elizabeth St Georges Club', location: 'Port Elizabeth', region: 'Africa', country: 'South Africa' },
  { name: 'Inanda Club', location: 'Sandton', region: 'Africa', country: 'South Africa' },
  
  // ========== SPAIN ==========
  { name: 'Circulo Ecuestre', location: 'Barcelona', region: 'Europe', country: 'Spain' },
  { name: 'Circulo del Liceo', location: 'Barcelona', region: 'Europe', country: 'Spain' },
  { name: 'Sociedad Bilbaina', location: 'Bilbao', region: 'Europe', country: 'Spain' },
  { name: 'Real Circulo de la Amistad', location: 'Cordoba', region: 'Europe', country: 'Spain' },
  { name: 'Casino de Madrid', location: 'Madrid', region: 'Europe', country: 'Spain' },
  { name: 'Real Gran Pena', location: 'Madrid', region: 'Europe', country: 'Spain' },
  { name: 'The Real Casino De Murcia', location: 'Murcia', region: 'Europe', country: 'Spain' },
  { name: 'Club de Mar', location: 'Palma de Mallorca', region: 'Europe', country: 'Spain' },
  { name: 'Nuevo Casino de Pamplona', location: 'Pamplona', region: 'Europe', country: 'Spain' },
  { name: 'Real Circulo de Labradores y Proprietarios de Sevilla', location: 'Seville', region: 'Europe', country: 'Spain' },
  { name: 'Real Sociedad de Valenciana de Agricultura y Deportes', location: 'Valencia', region: 'Europe', country: 'Spain' },
  { name: 'Club Financiero Vigo', location: 'Vigo', region: 'Europe', country: 'Spain' },
  { name: 'Real Club Nautico de Gran Canaria', location: 'Las Palmas', region: 'Europe', country: 'Spain' },
  { name: 'Gabinete Literario', location: 'Las Palmas', region: 'Europe', country: 'Spain' },
  
  // ========== SRI LANKA ==========
  { name: 'Colombo Club', location: 'Colombo', region: 'Asia', country: 'Sri Lanka' },
  { name: 'The Capri Club', location: 'Colombo', region: 'Asia', country: 'Sri Lanka' },
  { name: 'Colombo Swimming Club', location: 'Colombo', region: 'Asia', country: 'Sri Lanka' },
  { name: 'Singhalese Sports Club', location: 'Colombo', region: 'Asia', country: 'Sri Lanka' },
  { name: 'The Hill Club', location: 'Nuwara Eliya', region: 'Asia', country: 'Sri Lanka' },
  
  // ========== SWEDEN ==========
  { name: "The Royal Bachelors' Club", location: 'Gothenburg', region: 'Europe', country: 'Sweden' },
  { name: 'Hansaklubben', location: 'Malmo', region: 'Europe', country: 'Sweden' },
  { name: 'Sallskapet', location: 'Stockholm', region: 'Europe', country: 'Sweden' },
  { name: 'Villa Pauli', location: 'Stockholm', region: 'Europe', country: 'Sweden' },
  { name: 'The Military Club of Stockholm', location: 'Stockholm', region: 'Europe', country: 'Sweden' },
  
  // ========== SWITZERLAND ==========
  { name: 'Club de Bale', location: 'Basel', region: 'Europe', country: 'Switzerland' },
  
  // ========== THAILAND ==========
  { name: 'The British Club', location: 'Bangkok', region: 'Asia', country: 'Thailand' },
  { name: 'The Foreign Correspondents Club', location: 'Bangkok', region: 'Asia', country: 'Thailand' },
  
  // ========== UAE ==========
  { name: 'The Club', location: 'Abu Dhabi', region: 'Middle East', country: 'UAE' },
  { name: 'The Capital Club', location: 'Dubai', region: 'Middle East', country: 'UAE' },
  
  // ========== USA ==========
  { name: 'The Club Inc', location: 'Birmingham', region: 'USA', country: 'USA' },
  { name: 'Athelstan Club', location: 'Mobile', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club of Anchorage', location: 'Anchorage', region: 'USA', country: 'USA' },
  { name: 'The 1836 Club', location: 'Little Rock', region: 'USA', country: 'USA' },
  { name: 'University Club of Phoenix', location: 'Phoenix', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club at Sundale', location: 'Bakersfield', region: 'USA', country: 'USA' },
  { name: 'Berkeley City Club', location: 'Berkeley', region: 'USA', country: 'USA' },
  { name: 'Ingomar Club', location: 'Eureka', region: 'USA', country: 'USA' },
  { name: 'Magic Castle', location: 'Los Angeles', region: 'USA', country: 'USA' },
  { name: 'Griffin Club', location: 'Los Angeles', region: 'USA', country: 'USA' },
  { name: 'Casa Abrego Club', location: 'Monterey', region: 'USA', country: 'USA' },
  { name: 'California Yacht Club', location: 'Marina del Rey', region: 'USA', country: 'USA' },
  { name: 'Balboa Bay Club', location: 'Newport Beach', region: 'USA', country: 'USA' },
  { name: 'University Athletic Club', location: 'Newport Beach', region: 'USA', country: 'USA' },
  { name: 'The Riviera Country Club', location: 'Pacific Palisades', region: 'USA', country: 'USA' },
  { name: 'The University Club of Pasadena', location: 'Pasadena', region: 'USA', country: 'USA' },
  { name: 'Town Club of Pasadena', location: 'Pasadena', region: 'USA', country: 'USA' },
  { name: 'Sutter Club', location: 'Sacramento', region: 'USA', country: 'USA' },
  { name: 'Marines Memorial Club', location: 'San Francisco', region: 'USA', country: 'USA' },
  { name: 'City Club of San Francisco', location: 'San Francisco', region: 'USA', country: 'USA' },
  { name: 'St Francis Yacht Club', location: 'San Francisco', region: 'USA', country: 'USA' },
  { name: 'Santa Barbara Club', location: 'Santa Barbara', region: 'USA', country: 'USA' },
  { name: 'University Club of San Francisco', location: 'San Francisco', region: 'USA', country: 'USA' },
  { name: 'El Paso Club', location: 'Colorado Springs', region: 'USA', country: 'USA' },
  { name: 'The Denver Athletic Club', location: 'Denver', region: 'USA', country: 'USA' },
  { name: 'The Denver Club', location: 'Denver', region: 'USA', country: 'USA' },
  { name: 'The Denver Press Club', location: 'Denver', region: 'USA', country: 'USA' },
  { name: 'The University Club', location: 'Denver', region: 'USA', country: 'USA' },
  { name: 'The Elm City Club', location: 'New Haven', region: 'USA', country: 'USA' },
  { name: 'New Haven Lawn Club', location: 'New Haven', region: 'USA', country: 'USA' },
  { name: 'The Hartford Club', location: 'Hartford', region: 'USA', country: 'USA' },
  { name: 'Town & County Club', location: 'Hartford', region: 'USA', country: 'USA' },
  { name: 'University and Whist Club of Wilmington', location: 'Wilmington', region: 'USA', country: 'USA' },
  { name: 'Tampa Club', location: 'Tampa', region: 'USA', country: 'USA' },
  { name: 'Indian Hills Country Club', location: 'Atlanta', region: 'USA', country: 'USA' },
  { name: 'The Pinnacle Club', location: 'Augusta', region: 'USA', country: 'USA' },
  { name: 'The Chatham Club', location: 'Savannah', region: 'USA', country: 'USA' },
  { name: 'Outrigger Canoe Club', location: 'Honolulu', region: 'USA', country: 'USA' },
  { name: 'The Pacific Club', location: 'Honolulu', region: 'USA', country: 'USA' },
  { name: 'The Arid Club Inc', location: 'Boise', region: 'USA', country: 'USA' },
  { name: 'University Club', location: 'Chicago', region: 'USA', country: 'USA' },
  { name: 'The Union League Club', location: 'Chicago', region: 'USA', country: 'USA' },
  { name: 'The Cliff Dwellers', location: 'Chicago', region: 'USA', country: 'USA' },
  { name: 'The Decatur Club', location: 'Decatur', region: 'USA', country: 'USA' },
  { name: 'University Club of Rockford', location: 'Rockford', region: 'USA', country: 'USA' },
  { name: 'The Antelope Club', location: 'Indianapolis', region: 'USA', country: 'USA' },
  { name: 'The Columbia Club', location: 'Indianapolis', region: 'USA', country: 'USA' },
  { name: 'The University Club of Indianapolis', location: 'Indianapolis', region: 'USA', country: 'USA' },
  { name: 'The Outing Club', location: 'Davenport', region: 'USA', country: 'USA' },
  { name: 'Des Moines Embassy Club', location: 'Des Moines', region: 'USA', country: 'USA' },
  { name: 'The University Club', location: 'Louisville', region: 'USA', country: 'USA' },
  { name: 'The Pendennis Club', location: 'Louisville', region: 'USA', country: 'USA' },
  { name: 'City Club of Baton Rouge', location: 'Baton Rouge', region: 'USA', country: 'USA' },
  { name: 'The Shreveport Club', location: 'Shreveport', region: 'USA', country: 'USA' },
  { name: 'The Petroleum Club of Lafayette', location: 'Lafayette', region: 'USA', country: 'USA' },
  { name: 'The Center Club', location: 'Baltimore', region: 'USA', country: 'USA' },
  { name: 'John Hopkins Club', location: 'Baltimore', region: 'USA', country: 'USA' },
  { name: 'The College Club of Boston', location: 'Boston', region: 'USA', country: 'USA' },
  { name: 'St. Botolph Club', location: 'Boston', region: 'USA', country: 'USA' },
  { name: 'The University Club of Boston', location: 'Boston', region: 'USA', country: 'USA' },
  { name: 'Harvard Club of Boston', location: 'Boston', region: 'USA', country: 'USA' },
  { name: 'Tennis & Racquet Club', location: 'Boston', region: 'USA', country: 'USA' },
  { name: 'Wamsutta Club', location: 'New Bedford', region: 'USA', country: 'USA' },
  { name: 'Worcester Club', location: 'Worcester', region: 'USA', country: 'USA' },
  { name: 'Lanam Club', location: 'Andover', region: 'USA', country: 'USA' },
  { name: 'Detroit Athletic Club', location: 'Detroit', region: 'USA', country: 'USA' },
  { name: 'The Bayview Yacht Club', location: 'Detroit', region: 'USA', country: 'USA' },
  { name: 'Michigan State University', location: 'Lansing', region: 'USA', country: 'USA' },
  { name: 'Kitchi Gammi Club', location: 'Duluth', region: 'USA', country: 'USA' },
  { name: "The Woman's Club of Minneapolis", location: 'Minneapolis', region: 'USA', country: 'USA' },
  { name: 'University Club of Saint Paul', location: 'Saint Paul', region: 'USA', country: 'USA' },
  { name: 'St. Louis Club', location: 'St. Louis', region: 'USA', country: 'USA' },
  { name: 'The Racquet Club', location: 'St. Louis', region: 'USA', country: 'USA' },
  { name: 'Morristown Club', location: 'Morristown', region: 'USA', country: 'USA' },
  { name: 'Park Avenue Club', location: 'Newark', region: 'USA', country: 'USA' },
  { name: 'The Montauk Club', location: 'Brooklyn', region: 'USA', country: 'USA' },
  { name: 'The Penn Club', location: 'Manhattan', region: 'USA', country: 'USA' },
  { name: 'The Explorers Club', location: 'Manhattan', region: 'USA', country: 'USA' },
  { name: 'Manhattan Yacht Club', location: 'Manhattan', region: 'USA', country: 'USA' },
  { name: 'The Salmagundi Club', location: 'Manhattan', region: 'USA', country: 'USA' },
  { name: 'Charlotte City Club', location: 'Charlotte', region: 'USA', country: 'USA' },
  { name: 'University Club', location: 'Durham', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club of Oklahoma City', location: 'Oklahoma City', region: 'USA', country: 'USA' },
  { name: 'University Club', location: 'Portland', region: 'USA', country: 'USA' },
  { name: 'Cincinnati Athletic Club', location: 'Cincinnati', region: 'USA', country: 'USA' },
  { name: 'Queen City Club', location: 'Cincinnati', region: 'USA', country: 'USA' },
  { name: 'The Union Club', location: 'Cleveland', region: 'USA', country: 'USA' },
  { name: 'The Toledo Club', location: 'Toledo', region: 'USA', country: 'USA' },
  { name: 'Racquet Club of Philadelphia', location: 'Philadelphia', region: 'USA', country: 'USA' },
  { name: 'Germantown Cricket Club', location: 'Philadelphia', region: 'USA', country: 'USA' },
  { name: 'The Franklin Inn Club', location: 'Philadelphia', region: 'USA', country: 'USA' },
  { name: 'Allegheny HYP Club', location: 'Pittsburgh', region: 'USA', country: 'USA' },
  { name: 'Hope Club', location: 'Providence', region: 'USA', country: 'USA' },
  { name: 'Providence Art Club', location: 'Providence', region: 'USA', country: 'USA' },
  { name: 'University Club of Providence', location: 'Providence', region: 'USA', country: 'USA' },
  { name: 'The Green Boundary Club', location: 'Aiken', region: 'USA', country: 'USA' },
  { name: 'The Wanderer', location: 'Charleston', region: 'USA', country: 'USA' },
  { name: 'The Palmetto Club', location: 'Columbia', region: 'USA', country: 'USA' },
  { name: 'Piedmont Club', location: 'Greenville', region: 'USA', country: 'USA' },
  { name: 'The Walden Club', location: 'Chattanooga', region: 'USA', country: 'USA' },
  { name: 'Nashville City Club', location: 'Nashville', region: 'USA', country: 'USA' },
  { name: 'Austin Club', location: 'Austin', region: 'USA', country: 'USA' },
  { name: 'Headliners Club', location: 'Austin', region: 'USA', country: 'USA' },
  { name: 'Park City Club', location: 'Dallas', region: 'USA', country: 'USA' },
  { name: 'El Paso Club', location: 'El Paso', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club of Fort Worth', location: 'Fort Worth', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club of Houston', location: 'Houston', region: 'USA', country: 'USA' },
  { name: 'Petroleum Club of San Antonio', location: 'San Antonio', region: 'USA', country: 'USA' },
  { name: 'Alta Club', location: 'Salt Lake City', region: 'USA', country: 'USA' },
  { name: 'Farmington Country Club', location: 'Charlottesville', region: 'USA', country: 'USA' },
  { name: 'Norfolk Yacht & Country Club', location: 'Norfolk', region: 'USA', country: 'USA' },
  { name: 'Arts Club of Washington', location: 'Washington D.C.', region: 'USA', country: 'USA' },
  { name: 'The George Town Club', location: 'Washington D.C.', region: 'USA', country: 'USA' },
  { name: 'Bellevue Club', location: 'Bellevue', region: 'USA', country: 'USA' },
  { name: 'College Club of Seattle', location: 'Seattle', region: 'USA', country: 'USA' },
  { name: 'The Spokane Club', location: 'Spokane', region: 'USA', country: 'USA' },
  { name: 'Milwaukee Athletic Club', location: 'Milwaukee', region: 'USA', country: 'USA' },
  { name: 'Milwaukee Club', location: 'Milwaukee', region: 'USA', country: 'USA' },
  { name: 'The Madison Club', location: 'Madison', region: 'USA', country: 'USA' },
  
  // ========== URUGUAY ==========
  { name: 'Club Uruguay', location: 'Montevideo', region: 'South America', country: 'Uruguay' },
  
  // ========== VIETNAM ==========
  { name: 'The Hanoi Club', location: 'Hanoi', region: 'Asia', country: 'Vietnam' },
  
  // ========== ZIMBABWE ==========
  { name: 'The Bulawayo Club', location: 'Bulawayo', region: 'Africa', country: 'Zimbabwe' },
]

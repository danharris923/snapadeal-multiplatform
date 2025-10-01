// Comprehensive list of Canadian cities, towns, and municipalities
// Organized by province for efficient searching

export const CANADIAN_CITIES = [
  // Ontario
  'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan',
  'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington', 'Greater Sudbury', 'Oshawa',
  'Barrie', 'St. Catharines', 'Cambridge', 'Kingston', 'Guelph', 'Whitby', 'Thunder Bay',
  'Waterloo', 'Chatham-Kent', 'Ajax', 'Pickering', 'Niagara Falls', 'Newmarket', 'Brantford',
  'Kawartha Lakes', 'Clarington', 'Sarnia', 'Belleville', 'Sault Ste. Marie', 'Welland',
  'North Bay', 'Cornwall', 'Peterborough', 'Timmins', 'Thorold', 'Bradford West Gwillimbury',
  'Milton', 'Orangeville', 'Aurora', 'Orillia', 'Fort Erie', 'Woodstock', 'Stratford',
  'Grimsby', 'St. Thomas', 'Collingwood', 'Cobourg', 'Port Colborne', 'Leamington',
  'Brockville', 'Kenora', 'Elliot Lake', 'Pembroke', 'Port Hope', 'Dryden', 'Owen Sound',

  // Quebec
  'Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay',
  'Lévis', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu', 'Repentigny', 'Brossard',
  'Drummondville', 'Saint-Jérôme', 'Granby', 'Blainville', 'Saint-Hyacinthe', 'Dollard-des-Ormeaux',
  'Châteauguay', 'Rimouski', 'Shawinigan', 'Victoriaville', 'Salaberry-de-Valleyfield', 'Joliette',
  'Tracy', 'Vaudreuil-Dorion', 'Val-d\'Or', 'Saint-Eustache', 'Rouyn-Noranda', 'Sept-Îles',
  'Mirabel', 'Saint-Georges', 'Baie-Comeau', 'Alma', 'Sainte-Julie', 'Mascouche', 'Beloeil',
  'Chambly', 'Magog', 'Saint-Constant', 'Boisbriand', 'Sainte-Thérèse', 'Varennes',
  'Côte-Saint-Luc', 'Boucherville', 'Matane', 'Thetford Mines', 'Rivière-du-Loup',

  // British Columbia
  'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Coquitlam', 'Kelowna',
  'Saanich', 'Delta', 'Langley', 'Victoria', 'Nanaimo', 'Kamloops', 'Chilliwack', 'Prince George',
  'Maple Ridge', 'New Westminster', 'Port Coquitlam', 'North Vancouver', 'West Vancouver',
  'Vernon', 'Penticton', 'Campbell River', 'Courtenay', 'Cranbrook', 'Fort St. John',
  'Parksville', 'Prince Rupert', 'Salmon Arm', 'Terrace', 'Trail', 'Quesnel', 'Castlegar',
  'Port Alberni', 'Duncan', 'Squamish', 'Williams Lake', 'Powell River', 'Colwood',
  'Port Moody', 'Dawson Creek', 'Kamloops', 'Mission', 'White Rock', 'Whistler',

  // Alberta
  'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie',
  'Airdrie', 'Spruce Grove', 'Okotoks', 'Leduc', 'Fort McMurray', 'Lloydminster', 'Cochrane',
  'Camrose', 'Beaumont', 'Brooks', 'Cold Lake', 'Wetaskiwin', 'Lacombe', 'Stony Plain',
  'Sylvan Lake', 'Chestermere', 'Strathmore', 'Canmore', 'Fort Saskatchewan', 'Hinton',
  'Banff', 'Jasper', 'High River', 'Athabasca', 'Drumheller', 'Bonnyville', 'Slave Lake',

  // Manitoba
  'Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Selkirk',
  'Morden', 'Dauphin', 'The Pas', 'Flin Flon', 'Neepawa', 'Swan River', 'Virden',
  'Beausejour', 'Gimli', 'Stonewall', 'Niverville', 'Minnedosa', 'Killarney',

  // Saskatchewan
  'Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton',
  'North Battleford', 'Estevan', 'Weyburn', 'Warman', 'Martensville', 'Lloydminster',
  'Melfort', 'Humboldt', 'Meadow Lake', 'Kindersley', 'Melville', 'Tisdale',

  // Nova Scotia
  'Halifax', 'Cape Breton', 'Dartmouth', 'Truro', 'New Glasgow', 'Glace Bay', 'Sydney',
  'Kentville', 'Amherst', 'Yarmouth', 'Bridgewater', 'Antigonish', 'Wolfville', 'Digby',
  'Port Hawkesbury', 'Lunenburg', 'Windsor', 'Pictou', 'Stellarton', 'New Minas',

  // New Brunswick
  'Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Miramichi', 'Bathurst', 'Edmundston',
  'Campbellton', 'Riverview', 'Quispamsis', 'Rothesay', 'Oromocto', 'Grand Falls',
  'Shediac', 'Woodstock', 'Caraquet', 'Sussex', 'Tracadie-Sheila', 'Dalhousie',

  // Newfoundland and Labrador
  'St. John\'s', 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Paradise', 'Grand Falls-Windsor',
  'Gander', 'Portugal Cove-St. Philip\'s', 'Torbay', 'Labrador City', 'Happy Valley-Goose Bay',
  'Stephenville', 'Bay Roberts', 'Marystown', 'Clarenville', 'Carbonear', 'Channel-Port aux Basques',

  // Prince Edward Island
  'Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague', 'Kensington',
  'Souris', 'Alberton', 'Tignish', 'Georgetown', 'Wellington', 'O\'Leary',

  // Yukon
  'Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction', 'Carmacks', 'Mayo',
  'Faro', 'Ross River', 'Pelly Crossing', 'Teslin',

  // Northwest Territories
  'Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchokǫ̀', 'Fort Simpson',
  'Norman Wells', 'Tuktoyaktuk', 'Fort Resolution', 'Fort Providence',

  // Nunavut
  'Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Cambridge Bay', 'Pond Inlet',
  'Igloolik', 'Pangnirtung', 'Cape Dorset', 'Gjoa Haven', 'Kugluktuk',
];

// Function to search cities with autocomplete
export const searchCanadianCities = (query: string, limit: number = 10): string[] => {
  if (!query || query.length === 0) return [];

  const lowerQuery = query.toLowerCase();

  // First, find cities that start with the query
  const startsWithMatches = CANADIAN_CITIES.filter(city =>
    city.toLowerCase().startsWith(lowerQuery)
  );

  // Then, find cities that contain the query but don't start with it
  const containsMatches = CANADIAN_CITIES.filter(city =>
    city.toLowerCase().includes(lowerQuery) &&
    !city.toLowerCase().startsWith(lowerQuery)
  );

  // Combine and limit results
  return [...startsWithMatches, ...containsMatches].slice(0, limit);
};

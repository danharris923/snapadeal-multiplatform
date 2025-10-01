export const CANADIAN_REGIONS: { [key: string]: string } = {
  'bc': 'British Columbia',
  'ab': 'Alberta',
  'sk': 'Saskatchewan',
  'mb': 'Manitoba',
  'on': 'Ontario',
  'qc': 'Quebec',
  'nb': 'New Brunswick',
  'ns': 'Nova Scotia',
  'pe': 'Prince Edward Island',
  'nl': 'Newfoundland',
  'nt': 'Northwest Territories',
  'yt': 'Yukon',
  'nu': 'Nunavut'
};

export const STORES_BY_REGION: { [key: string]: string[] } = {
  'bc': [
    'Save-On-Foods', 'Safeway', 'Superstore', 'Walmart', 'Costco',
    'London Drugs', 'IGA', 'Whole Foods', 'T&T Supermarket', 'No Frills'
  ],
  'ab': [
    'Safeway', 'Sobeys', 'Superstore', 'Walmart', 'Costco',
    'Save-On-Foods', 'Co-op', 'No Frills', 'IGA', 'Freson Bros'
  ],
  'sk': [
    'Sobeys', 'Safeway', 'Superstore', 'Walmart', 'Costco',
    'Co-op', 'Giant Tiger', 'No Frills', 'Extra Foods', 'FreshCo'
  ],
  'mb': [
    'Safeway', 'Sobeys', 'Superstore', 'Walmart', 'Costco',
    'Giant Tiger', 'No Frills', 'Extra Foods', 'FreshCo', 'Co-op'
  ],
  'on': [
    'Loblaws', 'Metro', 'Sobeys', 'Walmart', 'Costco',
    'No Frills', 'Food Basics', 'FreshCo', 'Whole Foods', 'Farm Boy',
    'Fortinos', 'Zehrs', 'Superstore', 'Longos', 'T&T Supermarket'
  ],
  'qc': [
    'IGA', 'Metro', 'Super C', 'Maxi', 'Provigo',
    'Walmart', 'Costco', 'Adonis', 'Marché Richelieu', 'Avril'
  ],
  'nb': [
    'Sobeys', 'Atlantic Superstore', 'Walmart', 'Costco',
    'Co-op', 'Giant Tiger', 'No Frills', 'Foodland', 'Save Easy'
  ],
  'ns': [
    'Sobeys', 'Atlantic Superstore', 'Walmart', 'Costco',
    'No Frills', 'Giant Tiger', 'Pete\'s Frootique', 'Gateway', 'Your Independent Grocer'
  ],
  'pe': [
    'Sobeys', 'Atlantic Superstore', 'Walmart', 'Foodland',
    'Co-op', 'Giant Tiger', 'Your Independent Grocer', 'Murphy\'s Pharmacies'
  ],
  'nl': [
    'Dominion', 'Sobeys', 'Walmart', 'Costco',
    'Coleman\'s', 'No Frills', 'Foodland', 'Powell\'s', 'Bidgood\'s'
  ],
  'nt': [
    'Northern Store', 'Co-op', 'Arctic Buying Company',
    'Stanton Group', 'Range Lake Store'
  ],
  'yt': [
    'Super A', 'Your Independent Grocer', 'Wykes\' Independent',
    'Riverside Grocery', 'Tags Food Store'
  ],
  'nu': [
    'Northern Store', 'Arctic Co-op', 'DJ Specialties',
    'Ventures Marketplace'
  ]
};

export const CATEGORIES = [
  'Grocery',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Books & Media',
  'Pet Supplies',
  'Office Supplies',
  'Tools & Hardware'
];
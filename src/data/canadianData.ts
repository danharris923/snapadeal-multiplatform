// Canadian provinces and territories
export const CANADIAN_PROVINCES = [
  { value: 'ab', label: 'Alberta' },
  { value: 'bc', label: 'British Columbia' },
  { value: 'mb', label: 'Manitoba' },
  { value: 'nb', label: 'New Brunswick' },
  { value: 'nl', label: 'Newfoundland and Labrador' },
  { value: 'nt', label: 'Northwest Territories' },
  { value: 'ns', label: 'Nova Scotia' },
  { value: 'nu', label: 'Nunavut' },
  { value: 'on', label: 'Ontario' },
  { value: 'pe', label: 'Prince Edward Island' },
  { value: 'qc', label: 'Quebec' },
  { value: 'sk', label: 'Saskatchewan' },
  { value: 'yt', label: 'Yukon' },
];

// Major Canadian cities by province
export const CANADIAN_CITIES = {
  ab: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat'],
  bc: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna'],
  mb: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie'],
  nb: ['Saint John', 'Moncton', 'Fredericton', 'Bathurst', 'Miramichi'],
  nl: ['St. John\'s', 'Corner Brook', 'Mount Pearl', 'Conception Bay South'],
  nt: ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith'],
  ns: ['Halifax', 'Cape Breton', 'New Glasgow', 'Yarmouth', 'Kentville'],
  nu: ['Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake'],
  on: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor', 'Kitchener', 'Mississauga', 'Brampton'],
  pe: ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall'],
  qc: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'],
  sk: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current'],
  yt: ['Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction'],
};

// Canadian retail stores and chains
export const CANADIAN_STORES = [
  // Grocery Stores
  { name: 'Loblaws', category: 'Grocery' },
  { name: 'Metro', category: 'Grocery' },
  { name: 'Sobeys', category: 'Grocery' },
  { name: 'Save-on-Foods', category: 'Grocery' },
  { name: 'Safeway', category: 'Grocery' },
  { name: 'No Frills', category: 'Grocery' },
  { name: 'Food Basics', category: 'Grocery' },
  { name: 'FreshCo', category: 'Grocery' },
  { name: 'Independent Grocer', category: 'Grocery' },
  { name: 'Thrifty Foods', category: 'Grocery' },

  // Pharmacies
  { name: 'Shoppers Drug Mart', category: 'Pharmacy' },
  { name: 'London Drugs', category: 'Pharmacy' },
  { name: 'Rexall', category: 'Pharmacy' },
  { name: 'Jean Coutu', category: 'Pharmacy' },
  { name: 'Guardian Pharmacy', category: 'Pharmacy' },

  // Department Stores
  { name: 'Walmart', category: 'Department' },
  { name: 'Costco', category: 'Department' },
  { name: 'Canadian Tire', category: 'Department' },
  { name: 'The Hudson\'s Bay', category: 'Department' },
  { name: 'Giant Tiger', category: 'Department' },
  { name: 'Dollarama', category: 'Department' },

  // Electronics
  { name: 'Best Buy', category: 'Electronics' },
  { name: 'The Source', category: 'Electronics' },
  { name: 'Visions Electronics', category: 'Electronics' },
  { name: 'Memory Express', category: 'Electronics' },

  // Home Improvement
  { name: 'Home Depot', category: 'Home' },
  { name: 'Lowe\'s', category: 'Home' },
  { name: 'Rona', category: 'Home' },
  { name: 'IKEA', category: 'Home' },
  { name: 'Leon\'s', category: 'Home' },
  { name: 'The Brick', category: 'Home' },

  // Fashion
  { name: 'Winners', category: 'Fashion' },
  { name: 'Marshalls', category: 'Fashion' },
  { name: 'Reitmans', category: 'Fashion' },
  { name: 'H&M', category: 'Fashion' },
  { name: 'Zara', category: 'Fashion' },
  { name: 'Uniqlo', category: 'Fashion' },
  { name: 'Mark\'s', category: 'Fashion' },
  { name: 'Roots', category: 'Fashion' },
  { name: 'Aritzia', category: 'Fashion' },

  // Sports
  { name: 'Sport Chek', category: 'Sports' },
  { name: 'Atmosphere', category: 'Sports' },
  { name: 'Sportium', category: 'Sports' },
  { name: 'Decathlon', category: 'Sports' },

  // Automotive
  { name: 'Crappy Tire Auto', category: 'Automotive' },
  { name: 'Mr. Lube', category: 'Automotive' },
  { name: 'Jiffy Lube', category: 'Automotive' },
  { name: 'Princess Auto', category: 'Automotive' },

  // Specialty
  { name: 'Staples', category: 'Office' },
  { name: 'Chapters Indigo', category: 'Books' },
  { name: 'Toys"R"Us', category: 'Toys' },
  { name: 'PetSmart', category: 'Pets' },
  { name: 'Michael\'s', category: 'Crafts' },
  { name: 'Home Sense', category: 'Home' },
];

// Deal categories
export const DEAL_CATEGORIES = [
  'Electronics',
  'Groceries',
  'Clothing & Fashion',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Automotive',
  'Books & Media',
  'Toys & Games',
  'Office Supplies',
  'Pet Supplies',
  'Baby & Kids',
  'Tools & Hardware',
  'Travel & Vacation',
  'Restaurants & Food',
  'Services',
];

// Notification keywords suggestions
export const POPULAR_KEYWORDS = [
  'iPhone', 'Samsung', 'laptop', 'TV', 'headphones', 'gaming',
  'Nike', 'Adidas', 'jeans', 'shoes', 'jacket', 'dress',
  'protein', 'vitamins', 'skincare', 'makeup', 'shampoo',
  'coffee', 'chocolate', 'snacks', 'frozen', 'organic',
  'furniture', 'bedding', 'kitchen', 'cleaning', 'garden',
  'baby formula', 'diapers', 'toys', 'stroller', 'car seat',
  'camping', 'bicycle', 'yoga', 'running', 'gym',
];

// Helper functions
export const getStoresByCategory = (category: string) => {
  return CANADIAN_STORES.filter(store => store.category === category);
};

export const getAllStoreNames = () => {
  return CANADIAN_STORES.map(store => store.name).sort();
};

export const getStoreCategories = () => {
  const categories = [...new Set(CANADIAN_STORES.map(store => store.category))];
  return categories.sort();
};
import { Deal } from '../types';
import { affiliateLinks, getRandomAdCopy } from '../config/affiliateLinks';

// Mock affiliate deals that look like regular deals but link to affiliate sites
export const affiliateDeals: Deal[] = [
  // Amazon Electronics
  {
    id: 'aff-amazon-electronics-1',
    title: 'Apple AirPods Pro (2nd Gen)',
    description: 'Wireless earbuds with active noise cancellation',
    price: 329.99,
    original_price: 379.99,
    discount_percentage: 13,
    store: 'Amazon',
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500', // AirPods
    deal_url: affiliateLinks.amazon.electronics,
    source: 'community', // Disguised as community deal
    upvotes: 45,
    score: 45,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },

  // Amazon Fashion
  {
    id: 'aff-amazon-fashion-1',
    title: 'Champion Powercore Sports Bra',
    description: 'Medium support sports bra for active lifestyle',
    price: 24.99,
    original_price: 34.99,
    discount_percentage: 29,
    store: 'Amazon',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1506629905607-cc4ac48b7e50?w=500', // Sports bra
    deal_url: affiliateLinks.amazon.fashion,
    source: 'community',
    upvotes: 23,
    score: 23,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },

  // Walmart General
  {
    id: 'aff-walmart-home-1',
    title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: 'Multi-use programmable pressure cooker, 6 Qt',
    price: 79.99,
    original_price: 119.99,
    discount_percentage: 33,
    store: 'Walmart',
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', // Instant Pot
    deal_url: affiliateLinks.shopstyle.walmart,
    source: 'community',
    upvotes: 67,
    score: 67,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },

  // Lululemon Fashion
  {
    id: 'aff-lulu-fashion-1',
    title: 'Align™ High-Rise Pant 28"',
    description: 'Buttery-soft yoga pants in Nulu fabric',
    price: 88.00,
    original_price: 128.00,
    discount_percentage: 31,
    store: 'Lululemon',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1506629905607-cc4ac48b7e50?w=500', // Yoga pants
    deal_url: affiliateLinks.shopstyle.lululemon,
    source: 'community',
    upvotes: 89,
    score: 89,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },

  // Gap Fashion
  {
    id: 'aff-gap-fashion-1',
    title: 'Vintage Soft Crewneck Sweatshirt',
    description: 'Classic fit cotton blend sweatshirt',
    price: 34.99,
    original_price: 59.99,
    discount_percentage: 42,
    store: 'Gap',
    category: 'Fashion',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', // Sweatshirt
    deal_url: affiliateLinks.shopstyle.gap,
    source: 'community',
    upvotes: 31,
    score: 31,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },

  // Cabela's Outdoor
  {
    id: 'aff-cabelas-outdoor-1',
    title: 'Columbia Flash Forward Windbreaker',
    description: 'Lightweight packable windbreaker jacket',
    price: 39.99,
    original_price: 65.99,
    discount_percentage: 39,
    store: 'Cabela\'s',
    category: 'Outdoor & Sports',
    image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', // Outdoor jacket
    deal_url: affiliateLinks.rakuten.cabelas,
    source: 'community',
    upvotes: 28,
    score: 28,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },

  // Amazon Lightning Deal
  {
    id: 'aff-amazon-lightning-1',
    title: 'Ninja Foodi Personal Blender',
    description: 'Single-serve blender with travel cup',
    price: 49.99,
    original_price: 79.99,
    discount_percentage: 38,
    store: 'Amazon',
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500', // Blender
    deal_url: affiliateLinks.amazon.lightningDeals,
    source: 'community',
    upvotes: 52,
    score: 52,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },

  // Amazon Beauty/Health
  {
    id: 'aff-amazon-beauty-1',
    title: 'CeraVe Moisturizing Cream',
    description: 'Daily face and body moisturizer for dry skin',
    price: 16.99,
    original_price: 22.99,
    discount_percentage: 26,
    store: 'Amazon',
    category: 'Beauty & Health',
    image_url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500', // Skincare
    deal_url: affiliateLinks.amazon.todaysDeals,
    source: 'community',
    upvotes: 34,
    score: 34,
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
  },
];

// Function to get random affiliate deals (mix into regular feed)
export const getRandomAffiliateDeals = (count: number = 2): Deal[] => {
  const shuffled = [...affiliateDeals].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get affiliate deals by category
export const getAffiliateDealsByCategory = (category: string): Deal[] => {
  return affiliateDeals.filter(deal =>
    deal.category?.toLowerCase().includes(category.toLowerCase())
  );
};

// Function to update deal titles with dynamic ad copy
export const getDynamicAffiliateDeals = (): Deal[] => {
  return affiliateDeals.map(deal => {
    // Use dynamic ad copy for some stores
    if (deal.store === 'Amazon' && Math.random() > 0.7) {
      return {
        ...deal,
        description: getRandomAdCopy('amazon'),
      };
    }
    if (deal.store === 'Lululemon' && Math.random() > 0.7) {
      return {
        ...deal,
        description: getRandomAdCopy('lululemon'),
      };
    }
    if (deal.store === 'Walmart' && Math.random() > 0.7) {
      return {
        ...deal,
        description: getRandomAdCopy('walmart'),
      };
    }
    return deal;
  });
};
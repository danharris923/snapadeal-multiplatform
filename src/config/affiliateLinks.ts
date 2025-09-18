/**
 * Affiliate Links Configuration
 * Replace these with your actual affiliate tracking URLs
 *
 * Most affiliate programs provide links like:
 * - Amazon: https://www.amazon.ca/dp/PRODUCT?tag=YOUR-TAG-20
 * - Rakuten: https://click.linksynergy.com/YOURLINK
 * - ShareASale: https://www.shareasale.com/r.cfm?b=XXXXX&u=YOURID
 */

export const affiliateLinks = {
  // Amazon - with your promopenguin-20 tag
  amazon: {
    dailyDeals: 'https://amzn.to/3Krnk9D', // Your deals page link
    lightningDeals: 'https://www.amazon.ca/gp/goldbox?tag=promopenguin-20',
    warehouse: 'https://www.amazon.ca/Warehouse-Deals/b?node=8929975011&tag=promopenguin-20',
    todaysDeals: 'https://www.amazon.ca/deals?tag=promopenguin-20',
    electronics: 'https://www.amazon.ca/b?node=667823011&tag=promopenguin-20',
    fashion: 'https://www.amazon.ca/b?node=8604903011&tag=promopenguin-20',
  },

  // ShopStyle Links (Lululemon, Gap, Walmart, Roxy)
  shopstyle: {
    lululemon: 'https://shopstyle.it/l/cuM9e',
    gap: 'https://shopstyle.it/l/cuNbc',
    walmart: 'https://shopstyle.it/l/cuM9l',
    roxy: 'https://shopstyle.it/l/cug5r',
  },

  // Rakuten/LinkSynergy (Cabelas)
  rakuten: {
    cabelas: 'https://click.linksynergy.com/fs-bin/click?id=sUVpAjRtGL4&offerid=1552516.5&type=3&subid=0',
  },

  // Canadian Retailers - Add your affiliate links as you get them
  canadian: {
    canadianTire: '#', // Add when you have it
    bestBuy: '#', // Add when you have it
    sportChek: '#', // Add when you have it
    hudsonsBay: '#', // Add when you have it
    winners: '#', // Add when you have it
  },

  // Fashion - Add more as you get affiliate approvals
  fashion: {
    aritzia: '#', // Add when you have it
    nordstrom: '#', // Add when you have it
    sephora: '#', // Add when you have it
    zara: '#', // Add when you have it
  },
};

// Fun, high-CTR ad copy variations
export const adCopyVariations = {
  amazon: [
    '🔥 Amazon deals so good, Jeff is nervous',
    '⚡ Lightning Deals: Faster than your ex moving on',
    '📦 Today\'s deals are actually worth clicking',
    '🎯 Daily Deals: Because full price is for suckers',
    '💸 Amazon finds that don\'t require selling a kidney',
  ],

  lululemon: [
    '"We Made Too Much" - Lululemon\'s fancy way of saying SALE',
    'Lululemon markdowns: Yoga pants at couch potato prices',
    'WMTM: Where athletic wear meets Netflix wear prices',
    'Lululemon sale: Namaste in bed with these prices',
    '🧘‍♀️ Align pants aligned with your budget (finally)',
  ],

  walmart: [
    '👀 Walmart rollbacks rolling deeper than your excuses',
    'Walmart prices dropping faster than my standards',
    'Rollback Alert: Walmart getting aggressive with it',
    'Great Value™ prices on name brand stuff',
    '🛒 Walmart deals hitting different today',
  ],

  gap: [
    'Gap sale: Dress like you have your life together',
    '40% off at Gap (your ex shops full price)',
    'Gap Factory: Where basics become affordable',
    'Gap deals: Adulting wardrobe on a teen budget',
  ],

  cabelas: [
    '🏕️ Cabela\'s: Gear up before nature humbles you',
    'Outdoor deals for indoor people with dreams',
    'Cabela\'s sale: Be prepared (to save money)',
    '🎣 Fishing for compliments? Start with deals',
  ],

  roxy: [
    '🏄‍♀️ Roxy: Where beach vibes meet street style',
    'Surf-inspired fashion for landlocked dreamers',
    'Roxy sale: Catch the wave of savings',
    '🌊 Board shorts and good vibes at great prices',
    'Beach girl aesthetic without the beach girl budget',
  ],

  general: [
    'Deals so good, your wallet might forgive you',
    'Found deals that slap harder than inflation',
    'Savings that hit different (in a good way)',
    'Prices lower than your expectations',
    'Sales that make Black Friday jealous',
  ],
};

// Track clicks for analytics
export const trackAffiliateClick = (store: string, campaign: string = 'ad_bar') => {
  // Implement your analytics tracking here
  console.log(`Affiliate click: ${store} from ${campaign}`);

  // You can integrate with:
  // - Google Analytics
  // - Firebase Analytics
  // - Mixpanel
  // - Custom backend
};

// Helper to get random copy for engagement
export const getRandomAdCopy = (store: keyof typeof adCopyVariations): string => {
  const variations = adCopyVariations[store] || adCopyVariations.general;
  return variations[Math.floor(Math.random() * variations.length)];
};
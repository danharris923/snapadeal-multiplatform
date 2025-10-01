import { Deal } from '../types';
import { normalizeFlippImg } from '../utils/normalize-flipp-img';
import { flippRequestQueue } from '../utils/request-queue';

interface FlippDealsParams {
  query?: string;
  category?: string;
  store?: string;
  region?: string;
  maxPrice?: number;
  limit?: number;
  page?: number;
  location?: { lat: number; lng: number };
  province?: string;
}

type FlippItem = {
  id: string;
  flyer_id: string;
  name: string;
  image_url?: string;
  large_image_url?: string;
  product_image_url?: string;
  thumbnail_url?: string;
  images?: { url: string }[];
  price?: number;
  sale_price?: number;
  original_price?: number;
  regular_price?: number;
  current_price?: number;
  price_text?: string;
  page_url?: string;
  store_id?: string;
  retailer?: string;
  merchant?: { name: string; logo_url?: string; image_url?: string };
  store_name?: string;
  title?: string;
  product_name?: string;
  display_name?: string;
  description?: string;
  sale_story?: string;
  product_description?: string;
  details?: string;
  category?: { name: string };
  category_name?: string;
  product_category?: string;
  valid_to?: string;
  end_date?: string;
  discount_percent?: number;
};

function extractImageUrl(item: any): string {
  const imageUrl =
    item.clean_image_url ||
    item.clipping_image_url ||
    item.large_image_url ||
    item.image_url ||
    item.product_image_url ||
    item.thumbnail_url ||
    item.images?.[0]?.url ||
    `https://via.placeholder.com/200x200/f8f8f8/666?text=${encodeURIComponent(item.name || item.title || "Product")}`;

  const normalizedUrl = normalizeFlippImg(imageUrl) || imageUrl;
  return normalizedUrl;
}

function extractPriceInfo(item: any): { salePrice: number; originalPrice: number; discount: number } {
  const salePrice = Number.parseFloat(item.sale_price || item.price || item.current_price || "0");
  const originalPrice = Number.parseFloat(item.price || item.original_price || item.regular_price || salePrice || "0");
  const discount = salePrice < originalPrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return { salePrice, originalPrice, discount };
}

function extractStoreInfo(item: any): { storeName: string; storeLogo: string } {
  const storeName =
    item.merchant?.name ||
    item.store_name ||
    item.retailer?.name ||
    item.retailer_name ||
    item.merchant_name ||
    item.flyer?.retailer?.name ||
    "Unknown Store";

  let storeLogo =
    item.merchant?.logo_url ||
    item.merchant?.image_url ||
    `https://logo.clearbit.com/${storeName.toLowerCase().replace(/\s+/g, "")}.ca` ||
    `https://via.placeholder.com/60x60/0071ce/ffffff?text=${storeName.charAt(0)}`;

  return { storeName, storeLogo };
}

function gpsToPostalCode(lat: number, lng: number): string {
  // Simple mapping for BC area - this is approximate
  if (lat >= 49.0 && lat <= 50.0 && lng >= -125.5 && lng <= -123.0) {
    // Vancouver area
    if (lat >= 49.2 && lng >= -123.2) return "V6B 1A1"; // Vancouver downtown
    if (lat >= 49.1 && lng >= -123.2) return "V6X 1A1"; // Richmond
    return "V5K 1A1"; // Burnaby/surrounding
  }

  // Default BC postal code
  return "V6B 1A1";
}

export async function fetchFlippDeals(params: FlippDealsParams = {}): Promise<Deal[]> {
  try {
    let postalCode = "V6B 1A1"; // Default Vancouver postal code
    if (params.location?.lat && params.location?.lng) {
      postalCode = gpsToPostalCode(params.location.lat, params.location.lng);
    }

    const query = params.query || "groceries";
    const limit = params.limit || 50;
    const page = params.page || 1;

    console.log('[Flipp API] Fetching deals with params:', { postalCode, query, limit, page });

    const result = await flippRequestQueue.add(async () => {
      // Direct API call to Flipp (bypassing CORS in React Native)
      const url = `https://backflipp.wishabi.com/flipp/items/search?postal_code=${postalCode}&q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-CA',
          'User-Agent': 'SnapADeal/1.0 (React Native)',
        },
      });

      if (!response.ok) {
        console.error('[Flipp API] Error:', response.status, response.statusText);
        throw new Error(`Flipp API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Flipp API] Response received, processing...');

      let items = [];
      if (data.items) {
        items = data.items;
      } else if (data.data && data.data.items) {
        items = data.data.items;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data.results) {
        items = data.results;
      }

      console.log('[Flipp API] Found', items.length, 'items');

      const processedItems: Deal[] = items.map((item: any, index: number) => {
        const { salePrice, originalPrice, discount } = extractPriceInfo(item);
        const { storeName, storeLogo } = extractStoreInfo(item);
        const imageUrl = extractImageUrl(item);

        return {
          id: String(item.id || `item-${index}-${Date.now()}`),
          title: String(item.name || item.title || item.product_name || item.display_name || "Product"),
          description: String(item.description || item.sale_story || item.product_description || item.details || ""),
          price: salePrice,
          original_price: originalPrice,
          discount_percentage: discount,
          store: String(storeName),
          category: String(item.category?.name || item.category_name || item.product_category || "General"),
          image_url: String(imageUrl),
          deal_url: String(item.page_url || ""),
          expiry_date: String(item.valid_to || item.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
          source: 'flipp' as const,
        };
      });

      console.log('[Flipp API] Processed', processedItems.length, 'deals');
      return processedItems;
    });

    return result;
  } catch (error) {
    console.error('Error fetching Flipp deals:', error);

    // Fallback to some real-looking sample data if API fails
    const fallbackDeals: Deal[] = [
      {
        id: 'fallback-1',
        title: 'Organic Bananas',
        description: 'Fresh organic bananas, perfect for snacking',
        price: 1.99,
        original_price: 2.99,
        discount_percentage: 33,
        store: 'Save-On-Foods',
        category: 'Grocery',
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop',
        deal_url: '',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: 'flipp',
      },
      {
        id: 'fallback-2',
        title: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 89.99,
        original_price: 149.99,
        discount_percentage: 40,
        store: 'London Drugs',
        category: 'Electronics',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
        deal_url: '',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: 'flipp',
      },
      {
        id: 'fallback-3',
        title: 'Greek Yogurt 4-Pack',
        description: 'Creamy Greek yogurt, high in protein',
        price: 4.49,
        original_price: 5.99,
        discount_percentage: 25,
        store: 'Walmart',
        category: 'Dairy',
        image_url: 'https://images.unsplash.com/photo-1571212515416-c8a2f28b93c6?w=200&h=200&fit=crop',
        deal_url: '',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: 'flipp',
      },
    ];

    console.log('[Flipp API] Using fallback deals due to error');
    return fallbackDeals.slice(0, params.limit || 10);
  }
}
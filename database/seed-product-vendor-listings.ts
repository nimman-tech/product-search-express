/// <reference types="node" />

import dotenv from 'dotenv';
import { executeQuery } from '../src/config/database.js';

dotenv.config({ path: ['.env.local', '.env'] });

/**
 * Derive a per-vendor price from the product's base price by applying a
 * small random variance, so different vendors don't all show an identical
 * price. Returns null when the base price is missing/invalid.
 */
function vendorPrice(basePrice: unknown, varianceRatio: number): number | null {
  const parsed = Number(basePrice);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  const variance = 1 + (Math.random() * 2 - 1) * varianceRatio;
  return Math.round((parsed * variance) / 10) * 10;
}

async function seedVendorListings() {
  console.log('Seeding product_vendor_listings...');

  try {
    // Clear existing listings first for a clean seed
    await executeQuery('DELETE FROM product_vendor_listings', []);

    // Seed mobiles
    const mobiles = await executeQuery<{
      id: number | string;
      official_buy_url: string;
      price: number | string | null;
    }>('SELECT id, official_buy_url, price FROM mobiles', []);
    for (const mobile of mobiles) {
      const listings = [];
      const mobileIdStr = String(mobile.id);

      // Keep official url if it exists
      if (mobile.official_buy_url && mobile.official_buy_url.trim() !== '') {
        listings.push({
          id: `listing-mob-official-${mobileIdStr}`,
          product_id: mobileIdStr,
          product_type: 'mobile',
          vendor_name: 'Official Store',
          url: mobile.official_buy_url,
          price: vendorPrice(mobile.price, 0),
        });
      }

      // Add dummy listings
      listings.push({
        id: `listing-mob-flipkart-${mobileIdStr}`,
        product_id: mobileIdStr,
        product_type: 'mobile',
        vendor_name: 'Flipkart',
        url: `https://flipkart.com/search?q=${mobileIdStr}`,
        price: null,
      });
      listings.push({
        id: `listing-mob-amazon-${mobileIdStr}`,
        product_id: mobileIdStr,
        product_type: 'mobile',
        vendor_name: 'Amazon',
        url: `https://amazon.in/s?k=${mobileIdStr}`,
        price: vendorPrice(mobile.price, 0.05),
      });

      for (const listing of listings) {
        await executeQuery(
          'INSERT INTO product_vendor_listings (id, product_id, product_type, vendor_name, url, price) VALUES (?, ?, ?, ?, ?, ?)',
          [
            listing.id,
            listing.product_id,
            listing.product_type,
            listing.vendor_name,
            listing.url,
            listing.price,
          ]
        );
      }
    }

    // Seed cars
    const cars = await executeQuery<{
      id: number | string;
      url: string;
      price: number | string | null;
    }>('SELECT id, url, price FROM cars', []);
    for (const car of cars) {
      const listings = [];
      const carIdStr = String(car.id);

      // Keep official url if it exists
      if (car.url && car.url.trim() !== '') {
        listings.push({
          id: `listing-car-official-${carIdStr}`,
          product_id: carIdStr,
          product_type: 'car',
          vendor_name: 'Official Website',
          url: car.url,
          price: vendorPrice(car.price, 0),
        });
      }

      // Add dummy dealer listing
      listings.push({
        id: `listing-car-dealer-${carIdStr}`,
        product_id: carIdStr,
        product_type: 'car',
        vendor_name: 'CarWale',
        url: `https://carwale.com/search?q=${carIdStr}`,
        price: vendorPrice(car.price, 0.05),
      });

      for (const listing of listings) {
        await executeQuery(
          'INSERT INTO product_vendor_listings (id, product_id, product_type, vendor_name, url, price) VALUES (?, ?, ?, ?, ?, ?)',
          [
            listing.id,
            listing.product_id,
            listing.product_type,
            listing.vendor_name,
            listing.url,
            listing.price,
          ]
        );
      }
    }

    console.log('Successfully seeded product_vendor_listings!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedVendorListings().then(() => process.exit(0));

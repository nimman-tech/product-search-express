import { executeQuery } from '../src/config/database.js';

async function seedPurchaseUrls() {
  console.log('Seeding product_purchase_urls...');

  try {
    // We will clear existing URLs first for a clean seed
    await executeQuery('DELETE FROM product_purchase_urls', []);

    // Seed mobiles
    const mobiles = await executeQuery<{ id: number | string; official_buy_url: string }>(
      'SELECT id, official_buy_url FROM mobiles',
      []
    );
    for (const mobile of mobiles) {
      const urls = [];
      const mobileIdStr = String(mobile.id);

      // Keep official url if it exists
      if (mobile.official_buy_url && mobile.official_buy_url.trim() !== '') {
        urls.push({
          id: `url-mob-official-${mobileIdStr}`,
          product_id: mobileIdStr,
          product_type: 'mobile',
          vendor_name: 'Official Store',
          url: mobile.official_buy_url,
        });
      }

      // Add dummy urls
      urls.push({
        id: `url-mob-flipkart-${mobileIdStr}`,
        product_id: mobileIdStr,
        product_type: 'mobile',
        vendor_name: 'Flipkart',
        url: `https://flipkart.com/search?q=${mobileIdStr}`,
      });
      urls.push({
        id: `url-mob-amazon-${mobileIdStr}`,
        product_id: mobileIdStr,
        product_type: 'mobile',
        vendor_name: 'Amazon',
        url: `https://amazon.in/s?k=${mobileIdStr}`,
      });

      for (const url of urls) {
        await executeQuery(
          'INSERT INTO product_purchase_urls (id, product_id, product_type, vendor_name, url) VALUES (?, ?, ?, ?, ?)',
          [url.id, url.product_id, url.product_type, url.vendor_name, url.url]
        );
      }
    }

    // Seed cars
    const cars = await executeQuery<{ id: number | string; url: string }>(
      'SELECT id, url FROM cars',
      []
    );
    for (const car of cars) {
      const urls = [];
      const carIdStr = String(car.id);

      // Keep official url if it exists
      if (car.url && car.url.trim() !== '') {
        urls.push({
          id: `url-car-official-${carIdStr}`,
          product_id: carIdStr,
          product_type: 'car',
          vendor_name: 'Official Website',
          url: car.url,
        });
      }

      // Add dummy dealer url
      urls.push({
        id: `url-car-dealer-${carIdStr}`,
        product_id: carIdStr,
        product_type: 'car',
        vendor_name: 'CarWale',
        url: `https://carwale.com/search?q=${carIdStr}`,
      });

      for (const url of urls) {
        await executeQuery(
          'INSERT INTO product_purchase_urls (id, product_id, product_type, vendor_name, url) VALUES (?, ?, ?, ?, ?)',
          [url.id, url.product_id, url.product_type, url.vendor_name, url.url]
        );
      }
    }

    console.log('Successfully seeded product_purchase_urls!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedPurchaseUrls().then(() => process.exit(0));

const { Client } = require('pg');
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:vRFREnfEkDvCoIds@db.wbhhhtmuznhcfpujqvwu.supabase.co:5432/postgres';

async function sync() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const { INITIAL_PRODUCTS } = await import('../js/data/products.js');
  console.log(`Syncing ${INITIAL_PRODUCTS.length} products to public.products & dim_products...`);

  for (const p of INITIAL_PRODUCTS) {
    await client.query(`
      INSERT INTO public.products (
        id, name, category, price, description, stock_count, image_urls, youtube_url,
        brand, rating, reviews_count, contractor_location, specs, features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        image_urls = EXCLUDED.image_urls,
        price = EXCLUDED.price,
        stock_count = EXCLUDED.stock_count,
        specs = EXCLUDED.specs,
        features = EXCLUDED.features;
    `, [
      p.id, p.name, p.category, p.price, p.description, p.stock_count,
      JSON.stringify(Array.isArray(p.image_urls) ? p.image_urls : [p.image_urls]),
      p.youtube_url || 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
      p.brand || 'TouchPower', p.rating || 4.9, p.reviews_count || 50,
      p.contractor_location || 'Navi Mumbai Metro Corridor, MH',
      JSON.stringify(p.specs || {}), JSON.stringify(p.features || [])
    ]);

    const unitCost = Math.round(parseFloat(p.price) * 0.62 * 100) / 100;
    await client.query(`
      INSERT INTO public.dim_products (product_id, sku_code, name, category, brand, unit_cost_inr, retail_price_inr, commercial_tier)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (product_id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        retail_price_inr = EXCLUDED.retail_price_inr,
        unit_cost_inr = EXCLUDED.unit_cost_inr;
    `, [
      p.id, 'TP-SKU-' + p.id.slice(-6).toUpperCase(), p.name, p.category,
      p.brand || 'TouchPower', unitCost, p.price, p.price > 8000 ? 'Heavy Industrial' : 'Contractor Pro'
    ]);
  }

  const countRes = await client.query('SELECT count(*) FROM public.products;');
  const dimCountRes = await client.query('SELECT count(*) FROM public.dim_products;');
  console.log(`✅ Products synchronized! Products in public.products: ${countRes.rows[0].count}, in dim_products: ${dimCountRes.rows[0].count}`);
  await client.end();
}

sync().catch(e => {
  console.error('Sync failed:', e);
  process.exit(1);
});

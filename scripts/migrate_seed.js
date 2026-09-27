const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:vRFREnfEkDvCoIds@db.wbhhhtmuznhcfpujqvwu.supabase.co:5432/postgres';

async function run() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const { INITIAL_PRODUCTS, INITIAL_ORDERS } = await import('../js/data/products.js');

    await client.connect();
    console.log('Connected to Supabase PostgreSQL at wbhhhtmuznhcfpujqvwu.');

    // 1. Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 2. Drop existing
    console.log('Dropping old tables if any...');
    await client.query('DROP TABLE IF EXISTS public.orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.products CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.profiles CASCADE;');

    // 3. Profiles table
    console.log('Creating public.profiles...');
    await client.query(`
      CREATE TABLE public.profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
      CREATE POLICY "Users can insert profile" ON public.profiles FOR INSERT WITH CHECK (true);
      CREATE POLICY "Users can update profile" ON public.profiles FOR UPDATE USING (true);
    `);

    // Insert admin profile
    await client.query(`
      INSERT INTO public.profiles (email, full_name, company, phone, role)
      VALUES 
        ('admin@touchpower.com', 'Operations Console Admin', 'TouchPower Industrial HQ', '+91 98000 00000', 'admin'),
        ('contractor@jobsite.in', 'Marcus Vance (Foreman)', 'Vance Framing & Construction', '+91 98111 22334', 'customer');
    `);

    // 4. Products table
    console.log('Creating public.products...');
    await client.query(`
      CREATE TABLE public.products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('Machines', 'Blades', 'Bits', 'Safety Guards')),
        price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
        description TEXT NOT NULL,
        stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
        image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        youtube_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        brand TEXT NOT NULL DEFAULT 'TouchPower',
        rating NUMERIC(2, 1) NOT NULL DEFAULT 4.9,
        reviews_count INTEGER NOT NULL DEFAULT 24,
        contractor_location TEXT,
        specs JSONB DEFAULT '{}'::jsonb,
        features JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
      CREATE POLICY "Allow public insert to products" ON public.products FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow public update to products" ON public.products FOR UPDATE USING (true);
      CREATE POLICY "Allow public delete to products" ON public.products FOR DELETE USING (true);
    `);

    // Enable realtime publication if available
    try {
      await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE public.products, public.orders;');
      console.log('Realtime publication enabled for products and orders.');
    } catch (e) {
      console.log('Realtime publication notice:', e.message);
    }

    // 5. Orders table
    console.log('Creating public.orders...');
    await client.query(`
      CREATE TABLE public.orders (
        id TEXT PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        product_details JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
        shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
        delivery_status TEXT NOT NULL DEFAULT 'Pending' 
          CHECK (delivery_status IN ('Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered')),
        carrier TEXT DEFAULT 'TouchPower BlueDart Jobsite Direct',
        tracking_number TEXT,
        estimated_delivery TEXT,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Allow public read for orders" ON public.orders FOR SELECT USING (true);
      CREATE POLICY "Allow order creation" ON public.orders FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow order updates" ON public.orders FOR UPDATE USING (true);
    `);

    // 6. Seed Products from unified catalog
    console.log(`Seeding ${INITIAL_PRODUCTS.length} products...`);
    for (const p of INITIAL_PRODUCTS) {
      await client.query(`
        INSERT INTO public.products (
          id, name, category, price, description, stock_count, image_urls, youtube_url,
          brand, rating, reviews_count, contractor_location, specs, features
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13::jsonb, $14::jsonb
        );
      `, [
        p.id, 
        p.name, 
        p.category, 
        p.price, 
        p.description, 
        p.stock_count, 
        JSON.stringify(Array.isArray(p.image_urls) ? p.image_urls : [p.image_urls]),
        p.youtube_url || 'https://www.youtube.com/watch?v=rW_kX4d4x_0', 
        p.brand || 'TouchPower', 
        p.rating || 4.9, 
        p.reviews_count || 50, 
        p.contractor_location || 'Mumbai Industrial Corridor, MH', 
        JSON.stringify(p.specs || {}), 
        JSON.stringify(p.features || [])
      ]);
    }

    // 7. Seed Orders
    console.log(`Seeding ${INITIAL_ORDERS.length} orders...`);
    for (const o of INITIAL_ORDERS) {
      await client.query(`
        INSERT INTO public.orders (
          id, product_details, total_amount, shipping_address, delivery_status,
          carrier, tracking_number, estimated_delivery, customer_name, customer_email, customer_phone, notes
        ) VALUES (
          $1, $2::jsonb, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12
        );
      `, [
        o.id, 
        JSON.stringify(o.product_details || []), 
        o.total_amount, 
        JSON.stringify(o.shipping_address || {}), 
        o.delivery_status || 'Processing',
        o.carrier || 'TouchPower BlueDart Jobsite Direct', 
        o.tracking_number, 
        o.estimated_delivery || 'In 2-3 Days', 
        o.customer_name || 'Rajesh Sharma', 
        o.customer_email || 'rajesh@sharmaconstruction.in', 
        o.customer_phone || '+91 98200 55199', 
        o.notes || 'Deliver to site office'
      ]);
    }

    // 8. Verification query
    const prodCount = await client.query('SELECT count(*) FROM public.products;');
    const orderCount = await client.query('SELECT count(*) FROM public.orders;');
    const profileCount = await client.query('SELECT count(*) FROM public.profiles;');

    console.log('==============================================');
    console.log('MIGRATION & SEED SUCCESSFUL!');
    console.log('Project: TouchPower (wbhhhtmuznhcfpujqvwu)');
    console.log(`Products in Supabase: ${prodCount.rows[0].count}`);
    console.log(`Orders in Supabase: ${orderCount.rows[0].count}`);
    console.log(`Profiles in Supabase: ${profileCount.rows[0].count}`);
    console.log('==============================================');

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

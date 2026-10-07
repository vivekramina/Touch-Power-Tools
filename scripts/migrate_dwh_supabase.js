// ============================================================================
// TouchPower™ - Data Warehouse (DWM) Supabase Migration & Seeding Engine
// Connects to live PostgreSQL 17 at wbhhhtmuznhcfpujqvwu.supabase.co
// Creates Star/Snowflake Schema:
// Dimensions: dim_date, dim_products, dim_customers, dim_carriers, dim_locations
// Facts: fact_sales, fact_order_deliveries
// OLAP Views: vw_olap_sales_cube, vw_olap_delivery_performance, vw_olap_monthly_category_rollup
// OLAP Functions: fn_olap_slice_dice, fn_get_naive_bayes_training_data
// ============================================================================

const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:vRFREnfEkDvCoIds@db.wbhhhtmuznhcfpujqvwu.supabase.co:5432/postgres';

async function runDwhMigration() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('⚡ Connected to Supabase Cloud Database at wbhhhtmuznhcfpujqvwu.');

    // 1. Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    console.log('--- Creating DWM Dimension Tables ---');

    // 2. DIM_DATE
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.dim_date (
        date_key INT PRIMARY KEY,
        full_date DATE NOT NULL,
        day_of_week INT NOT NULL,
        day_name TEXT NOT NULL,
        day_of_month INT NOT NULL,
        month_num INT NOT NULL,
        month_name TEXT NOT NULL,
        quarter TEXT NOT NULL,
        year INT NOT NULL,
        is_weekend BOOLEAN NOT NULL,
        fiscal_quarter TEXT NOT NULL
      );
    `);

    // 3. DIM_PRODUCTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.dim_products (
        product_key SERIAL PRIMARY KEY,
        product_id UUID UNIQUE,
        sku_code TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        unit_cost_inr NUMERIC(10, 2) NOT NULL,
        retail_price_inr NUMERIC(10, 2) NOT NULL,
        commercial_tier TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );
    `);

    // 4. DIM_CUSTOMERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.dim_customers (
        customer_key SERIAL PRIMARY KEY,
        customer_id TEXT UNIQUE,
        customer_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        contractor_type TEXT NOT NULL,
        customer_tier TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        region TEXT NOT NULL,
        credit_limit_inr NUMERIC(12, 2) NOT NULL
      );
    `);

    // 5. DIM_CARRIERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.dim_carriers (
        carrier_key SERIAL PRIMARY KEY,
        carrier_name TEXT UNIQUE NOT NULL,
        service_tier TEXT NOT NULL,
        sla_transit_hours INT NOT NULL,
        fleet_type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // 6. DIM_LOCATIONS
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.dim_locations (
        location_key SERIAL PRIMARY KEY,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zone TEXT NOT NULL,
        distance_hub_km INT NOT NULL,
        region TEXT NOT NULL
      );
    `);

    console.log('--- Creating DWM Fact Tables ---');

    // 7. FACT_SALES
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.fact_sales (
        sale_id BIGSERIAL PRIMARY KEY,
        order_id TEXT NOT NULL,
        date_key INT REFERENCES public.dim_date(date_key),
        product_key INT REFERENCES public.dim_products(product_key),
        customer_key INT REFERENCES public.dim_customers(customer_key),
        carrier_key INT REFERENCES public.dim_carriers(carrier_key),
        quantity_sold INT NOT NULL CHECK (quantity_sold > 0),
        unit_price NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        gross_revenue NUMERIC(12, 2) NOT NULL,
        cogs_cost NUMERIC(12, 2) NOT NULL,
        net_profit NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );
    `);

    // 8. FACT_ORDER_DELIVERIES (Ground truth for Naïve Bayes Classification)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.fact_order_deliveries (
        delivery_id BIGSERIAL PRIMARY KEY,
        order_id TEXT NOT NULL,
        date_key INT REFERENCES public.dim_date(date_key),
        carrier_key INT REFERENCES public.dim_carriers(carrier_key),
        customer_key INT REFERENCES public.dim_customers(customer_key),
        cargo_weight_kg NUMERIC(8, 2) NOT NULL,
        item_count INT NOT NULL,
        destination_zone TEXT NOT NULL,
        distance_km INT NOT NULL,
        promised_hours INT NOT NULL,
        actual_hours INT NOT NULL,
        priority_tier TEXT NOT NULL,
        delivery_status TEXT NOT NULL,
        on_time_flag INT NOT NULL CHECK (on_time_flag IN (0, 1)),
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );
    `);

    console.log('--- Creating OLAP Views & Functions ---');

    // 9. OLAP View: Multi-Dimensional Sales Cube
    await client.query(`
      CREATE OR REPLACE VIEW public.vw_olap_sales_cube AS
      SELECT 
        dp.category,
        dc.region,
        dd.quarter,
        dd.year,
        COUNT(fs.sale_id) AS transactions_count,
        SUM(fs.quantity_sold) AS total_units_sold,
        ROUND(SUM(fs.gross_revenue), 2) AS total_gross_revenue,
        ROUND(SUM(fs.net_profit), 2) AS total_net_profit,
        ROUND(AVG(fs.gross_revenue), 2) AS avg_transaction_value
      FROM public.fact_sales fs
      JOIN public.dim_products dp ON fs.product_key = dp.product_key
      JOIN public.dim_customers dc ON fs.customer_key = dc.customer_key
      JOIN public.dim_date dd ON fs.date_key = dd.date_key
      GROUP BY dp.category, dc.region, dd.quarter, dd.year;
    `);

    // 10. OLAP View: Delivery Performance SLA by Carrier
    await client.query(`
      CREATE OR REPLACE VIEW public.vw_olap_delivery_performance AS
      SELECT 
        dca.carrier_name,
        dca.service_tier,
        COUNT(*) AS total_dispatches,
        SUM(fod.on_time_flag) AS on_time_count,
        COUNT(*) - SUM(fod.on_time_flag) AS delayed_count,
        ROUND(AVG(fod.actual_hours)::numeric, 1) AS avg_transit_hours,
        ROUND((SUM(fod.on_time_flag)::numeric / COUNT(*) * 100), 1) AS on_time_rate_pct
      FROM public.fact_order_deliveries fod
      JOIN public.dim_carriers dca ON fod.carrier_key = dca.carrier_key
      GROUP BY dca.carrier_name, dca.service_tier;
    `);

    // 11. OLAP View: Monthly Category Rollup with Analytical Window Functions
    await client.query(`
      CREATE OR REPLACE VIEW public.vw_olap_monthly_category_rollup AS
      SELECT 
        dp.category,
        dd.month_name,
        dd.year,
        SUM(fs.gross_revenue) AS monthly_revenue,
        SUM(fs.quantity_sold) AS monthly_units,
        SUM(SUM(fs.gross_revenue)) OVER (
          PARTITION BY dp.category, dd.year 
          ORDER BY dd.month_num
        ) AS cumulative_ytd_revenue,
        RANK() OVER (
          PARTITION BY dd.month_num, dd.year 
          ORDER BY SUM(fs.gross_revenue) DESC
        ) AS category_revenue_rank
      FROM public.fact_sales fs
      JOIN public.dim_products dp ON fs.product_key = dp.product_key
      JOIN public.dim_date dd ON fs.date_key = dd.date_key
      GROUP BY dp.category, dd.month_num, dd.month_name, dd.year;
    `);

    // 12. OLAP Stored Function: Slice & Dice Query
    await client.query(`
      CREATE OR REPLACE FUNCTION public.fn_olap_slice_dice(
        p_category TEXT DEFAULT NULL,
        p_region TEXT DEFAULT NULL,
        p_quarter TEXT DEFAULT NULL
      )
      RETURNS TABLE (
        category TEXT,
        region TEXT,
        quarter TEXT,
        total_units BIGINT,
        total_revenue NUMERIC,
        total_profit NUMERIC
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          dp.category,
          dc.region,
          dd.quarter,
          SUM(fs.quantity_sold)::BIGINT,
          ROUND(SUM(fs.gross_revenue), 2),
          ROUND(SUM(fs.net_profit), 2)
        FROM public.fact_sales fs
        JOIN public.dim_products dp ON fs.product_key = dp.product_key
        JOIN public.dim_customers dc ON fs.customer_key = dc.customer_key
        JOIN public.dim_date dd ON fs.date_key = dd.date_key
        WHERE (p_category IS NULL OR dp.category ILIKE p_category)
          AND (p_region IS NULL OR dc.region ILIKE p_region)
          AND (p_quarter IS NULL OR dd.quarter ILIKE p_quarter)
        GROUP BY dp.category, dc.region, dd.quarter
        ORDER BY total_revenue DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 13. OLAP Stored Function: Export Naïve Bayes Pre-Processed Dataset
    await client.query(`
      CREATE OR REPLACE FUNCTION public.fn_get_naive_bayes_training_data()
      RETURNS TABLE (
        carrier TEXT,
        zone TEXT,
        weight_kg NUMERIC,
        items INT,
        distance_km INT,
        priority TEXT,
        on_time INT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          dca.carrier_name,
          fod.destination_zone,
          fod.cargo_weight_kg,
          fod.item_count,
          fod.distance_km,
          fod.priority_tier,
          fod.on_time_flag
        FROM public.fact_order_deliveries fod
        JOIN public.dim_carriers dca ON fod.carrier_key = dca.carrier_key;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('--- Seeding DWM Dimension Data ---');

    // Seed DIM_DATE (Historical dates covering Q1, Q2, Q3, Q4)
    await client.query(`
      INSERT INTO public.dim_date (date_key, full_date, day_of_week, day_name, day_of_month, month_num, month_name, quarter, year, is_weekend, fiscal_quarter)
      VALUES 
        (20260115, '2026-01-15', 4, 'Thursday', 15, 1, 'January', 'Q1', 2026, false, 'FY26-Q1'),
        (20260210, '2026-02-10', 2, 'Tuesday', 10, 2, 'February', 'Q1', 2026, false, 'FY26-Q1'),
        (20260320, '2026-03-20', 5, 'Friday', 20, 3, 'March', 'Q1', 2026, false, 'FY26-Q1'),
        (20260412, '2026-04-12', 7, 'Sunday', 12, 4, 'April', 'Q2', 2026, true, 'FY26-Q2'),
        (20260518, '2026-05-18', 1, 'Monday', 18, 5, 'May', 'Q2', 2026, false, 'FY26-Q2'),
        (20260625, '2026-06-25', 4, 'Thursday', 25, 6, 'June', 'Q2', 2026, false, 'FY26-Q2'),
        (20260714, '2026-07-14', 2, 'Tuesday', 14, 7, 'July', 'Q3', 2026, false, 'FY26-Q3'),
        (20260822, '2026-08-22', 6, 'Saturday', 22, 8, 'August', 'Q3', 2026, true, 'FY26-Q3'),
        (20260910, '2026-09-10', 4, 'Thursday', 10, 9, 'September', 'Q3', 2026, false, 'FY26-Q3'),
        (20260928, '2026-09-28', 1, 'Monday', 28, 9, 'September', 'Q3', 2026, false, 'FY26-Q3')
      ON CONFLICT (date_key) DO NOTHING;
    `);

    // Seed DIM_CARRIERS
    await client.query(`
      INSERT INTO public.dim_carriers (carrier_name, service_tier, sla_transit_hours, fleet_type)
      VALUES 
        ('TouchPower BlueDart Direct', 'Express Air & Dedicated Van', 48, 'Sprinter High-Roof Fleet'),
        ('FedEx Heavy Cargo', 'Heavy Commercial Freight', 72, 'Trailer Flatbed Fleet'),
        ('ProFreight Express', 'Same-Day Regional Dispatch', 24, 'Metro Direct Courier'),
        ('UPS Jobsite Direct', 'Standard Regional Freight', 48, 'Commercial Box Trucks')
      ON CONFLICT (carrier_name) DO UPDATE SET service_tier = EXCLUDED.service_tier;
    `);

    // Seed DIM_CUSTOMERS
    await client.query(`
      INSERT INTO public.dim_customers (customer_id, customer_name, company_name, contractor_type, customer_tier, city, state, region, credit_limit_inr)
      VALUES 
        ('CUST-1001', 'Marcus Vance', 'Vance Framing & Civil Infrastructure', 'Civil Infrastructure', 'Tier 1 Enterprise', 'Mumbai', 'Maharashtra', 'West India', 2500000.00),
        ('CUST-1002', 'Sarah Jenkins', 'Apex Concrete & Coring Solutions', 'Concrete & Coring', 'Tier 1 Enterprise', 'Bengaluru', 'Karnataka', 'South India', 1800000.00),
        ('CUST-1003', 'Rajesh Sharma', 'Sharma High-Rise Structural Steel', 'Structural Steel', 'Tier 2 Commercial', 'Delhi', 'Delhi-NCR', 'North India', 1200000.00),
        ('CUST-1004', 'David Miller', 'Miller Heavy Industrial Fabrication', 'Metal Fabrication', 'Tier 2 Commercial', 'Chennai', 'Tamil Nadu', 'South India', 1500000.00),
        ('CUST-1005', 'Vikram Patel', 'Gujarat Port Maritime Logistics', 'General Contracting', 'Tier 3 Subcontractor', 'Ahmedabad', 'Gujarat', 'West India', 800000.00),
        ('CUST-1006', 'Ananya Roy', 'Eastern Rail Metro Demolition', 'Demolition', 'Tier 1 Enterprise', 'Kolkata', 'West Bengal', 'East India', 2000000.00)
      ON CONFLICT (customer_id) DO NOTHING;
    `);

    // Seed DIM_LOCATIONS
    await client.query(`
      INSERT INTO public.dim_locations (city, state, zone, distance_hub_km, region)
      VALUES 
        ('Mumbai', 'Maharashtra', 'Metro Corridor', 25, 'West India'),
        ('Pune', 'Maharashtra', 'Industrial Complex', 140, 'West India'),
        ('Gurugram', 'Haryana', 'Metro Corridor', 35, 'North India'),
        ('Bengaluru', 'Karnataka', 'Metro Corridor', 40, 'South India'),
        ('Chennai', 'Tamil Nadu', 'Industrial Complex', 65, 'South India'),
        ('Jamshedpur', 'Jharkhand', 'Industrial Complex', 280, 'East India'),
        ('Mundra', 'Gujarat', 'Remote Jobsite', 420, 'West India'),
        ('Shimla', 'Himachal Pradesh', 'Remote Jobsite', 390, 'North India')
      ON CONFLICT DO NOTHING;
    `);

    // Seed DIM_PRODUCTS from live public.products
    const prodRes = await client.query('SELECT id, name, category, brand, price FROM public.products;');
    for (const p of prodRes.rows) {
      const unitCost = Math.round(parseFloat(p.price) * 0.62 * 100) / 100;
      await client.query(`
        INSERT INTO public.dim_products (product_id, sku_code, name, category, brand, unit_cost_inr, retail_price_inr, commercial_tier)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (product_id) DO UPDATE SET 
          retail_price_inr = EXCLUDED.retail_price_inr,
          name = EXCLUDED.name,
          category = EXCLUDED.category;
      `, [
        p.id,
        'TP-SKU-' + p.id.slice(-6).toUpperCase(),
        p.name,
        p.category,
        p.brand || 'TouchPower',
        unitCost,
        p.price,
        p.price > 8000 ? 'Heavy Industrial' : 'Contractor Pro'
      ]);
    }

    console.log('--- Seeding DWM Fact Records (Sales & Deliveries) ---');

    // Fetch dimension keys
    const dimProds = (await client.query('SELECT product_key, retail_price_inr, unit_cost_inr FROM public.dim_products;')).rows;
    const dimCusts = (await client.query('SELECT customer_key FROM public.dim_customers;')).rows;
    const dimDates = (await client.query('SELECT date_key FROM public.dim_date;')).rows;
    const dimCarrs = (await client.query('SELECT carrier_key, carrier_name FROM public.dim_carriers;')).rows;

    // Check if fact_sales already has records
    const salesCountRes = await client.query('SELECT COUNT(*)::int as count FROM public.fact_sales;');
    if (salesCountRes.rows[0].count === 0 && dimProds.length > 0) {
      console.log('Generating 80+ historical DWH Sales Transactions...');
      for (let i = 1; i <= 80; i++) {
        const prod = dimProds[i % dimProds.length];
        const cust = dimCusts[i % dimCusts.length];
        const dt = dimDates[i % dimDates.length];
        const carr = dimCarrs[i % dimCarrs.length];
        const qty = (i % 5) + 1;
        const gross = Math.round(prod.retail_price_inr * qty);
        const cogs = Math.round(prod.unit_cost_inr * qty);
        const net = gross - cogs;
        const ordId = `ORD-2026-${1000 + i}`;

        await client.query(`
          INSERT INTO public.fact_sales (order_id, date_key, product_key, customer_key, carrier_key, quantity_sold, unit_price, discount_amount, gross_revenue, cogs_cost, net_profit)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10);
        `, [ordId, dt.date_key, prod.product_key, cust.customer_key, carr.carrier_key, qty, prod.retail_price_inr, gross, cogs, net]);
      }
    }

    // Check if fact_order_deliveries has records (for Naïve Bayes training/validation)
    const delCountRes = await client.query('SELECT COUNT(*)::int as count FROM public.fact_order_deliveries;');
    if (delCountRes.rows[0].count === 0) {
      console.log('Seeding 60+ historical DWH Delivery Records for Naïve Bayes Classification...');
      const zones = ['Metro Corridor', 'Expressway Transit', 'Industrial Complex', 'Remote Jobsite'];
      const priorities = ['Standard', 'High', 'Emergency'];

      for (let i = 1; i <= 60; i++) {
        const carr = dimCarrs[i % dimCarrs.length];
        const cust = dimCusts[i % dimCusts.length];
        const dt = dimDates[i % dimDates.length];
        const zone = zones[i % zones.length];
        const weight = Math.round((2.5 + (i * 1.4) % 45) * 10) / 10;
        const items = (i % 6) + 1;
        const distance = (i % 4) === 3 ? 380 : (i % 2 === 0 ? 45 : 160);
        const promised = (i % 4) === 3 ? 96 : 48;
        const priority = priorities[i % priorities.length];

        // Realistic logistics probability for on-time delivery
        let onTime = 1;
        // Heavy remote packages with standard priority have higher delay likelihood
        if (zone === 'Remote Jobsite' && weight > 25 && priority === 'Standard') {
          onTime = 0;
        } else if (zone === 'Expressway Transit' && weight > 50 && (i % 3 === 0)) {
          onTime = 0;
        } else if (carr.carrier_name === 'UPS Jobsite Direct' && zone === 'Remote Jobsite' && (i % 2 === 0)) {
          onTime = 0;
        }

        const actual = onTime === 1 ? Math.round(promised * 0.85) : Math.round(promised * 1.35);
        const status = onTime === 1 ? 'Delivered' : 'Delivered';

        await client.query(`
          INSERT INTO public.fact_order_deliveries (
            order_id, date_key, carrier_key, customer_key, cargo_weight_kg, item_count,
            destination_zone, distance_km, promised_hours, actual_hours, priority_tier, delivery_status, on_time_flag
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `, [`DEL-2026-${2000 + i}`, dt.date_key, carr.carrier_key, cust.customer_key, weight, items, zone, distance, promised, actual, priority, status, onTime]);
      }
    }

    // Verify DWH Row Counts
    const dimDatesCount = (await client.query('SELECT COUNT(*) FROM public.dim_date;')).rows[0].count;
    const dimProdsCount = (await client.query('SELECT COUNT(*) FROM public.dim_products;')).rows[0].count;
    const dimCustsCount = (await client.query('SELECT COUNT(*) FROM public.dim_customers;')).rows[0].count;
    const factSalesCount = (await client.query('SELECT COUNT(*) FROM public.fact_sales;')).rows[0].count;
    const factDelivCount = (await client.query('SELECT COUNT(*) FROM public.fact_order_deliveries;')).rows[0].count;

    console.log('====================================================');
    console.log('✅ DWM STAR SCHEMA & OLAP VIEWS CREATED SUCCESSFULLY');
    console.log(` - dim_date: ${dimDatesCount} rows`);
    console.log(` - dim_products: ${dimProdsCount} rows`);
    console.log(` - dim_customers: ${dimCustsCount} rows`);
    console.log(` - fact_sales: ${factSalesCount} rows`);
    console.log(` - fact_order_deliveries: ${factDelivCount} rows`);
    console.log('====================================================');

  } catch (err) {
    console.error('DWH Migration Error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runDwhMigration();

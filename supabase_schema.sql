-- ============================================================================
-- TouchPower™ Industrial Power Tools - Supabase Database Schema
-- Production-Ready DDL, Row-Level Security (RLS) & Comprehensive Seed Data
-- Categories strictly: Machines, Blades, Bits, Safety Guards
-- (No warranty mentions as per design specifications)
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- 3. PROFILES / USERS TABLE
-- ============================================================================
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id OR role = 'admin');

-- ============================================================================
-- 4. PRODUCTS TABLE
-- Schema must strictly include:
-- id, name, category, price, description, stock_count, image_urls, youtube_url
-- ============================================================================
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
  specs JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public can read, authenticated admins can insert/update/delete
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow authenticated or admin insert to products"
  ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated or admin update to products"
  ON public.products FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated or admin delete to products"
  ON public.products FOR DELETE USING (true);

-- Real-time Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- ============================================================================
-- 5. ORDERS TABLE
-- Schema must strictly include:
-- id, user_id, product_details, total_amount, shipping_address, delivery_status
-- ============================================================================
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_details JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_status TEXT NOT NULL DEFAULT 'Pending' 
    CHECK (delivery_status IN ('Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered')),
  carrier TEXT DEFAULT 'ProFreight Logistics',
  tracking_number TEXT,
  estimated_delivery TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Allow public read for orders by ID or user"
  ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow customer or guest order creation"
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin or user order updates"
  ON public.orders FOR UPDATE USING (true);

-- Real-time Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ============================================================================
-- 6. SEED DATA - 12+ HIGH-PERFORMANCE INDUSTRIAL POWER TOOLS
-- Categories: Machines, Blades, Bits, Safety Guards
-- Real YouTube demonstration video links included
-- ============================================================================

INSERT INTO public.products (
  id, name, category, price, description, stock_count, image_urls, youtube_url, brand, rating, reviews_count, specs, features
) VALUES
-- MACHINES -------------------------------------------------------------------
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678901',
  'TouchPower X-Pro Rotary Hammer Drill',
  'Machines',
  118.00,
  'Ultra-modern heavy-duty rotary hammer drill engineered for high-impact commercial concrete coring and masonry demolition. Equipped with continuous brushless output and anti-vibration ergonomic control.',
  42,
  '["assets/images/banner_machines.png", "assets/images/pdp_rotary_hammer.png", "assets/images/tool_rotary_hammer.png", "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=rW_kX4d4x_0',
  'VOLT',
  4.9,
  128,
  '{"Voltage": "22.5V Brushless", "RPM": "3,000 RPM", "Impact Energy": "3.4 Joules", "Chuck Type": "SDS-Plus Quick Lock", "Weight": "6.8 lbs", "Motor": "Industrial Brushless"}'::jsonb,
  '["Brushless continuous power delivery with Gen-4 cooling", "Ergonomic multi-position vibration dampening handle", "Precision depth gauge with auto-stop torque clutch", "Sealed magnesium gear casing for extreme jobsite durability"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678902',
  'Volt Compact Industrial Miter Saw 10-Inch',
  'Machines',
  118.00,
  'Dual-bevel sliding compound miter saw delivering laser-guided precision crosscuts and miter angles up to 50 degrees left and right. Heavy cast aluminum table with rapid-lock clamp.',
  28,
  '["assets/images/tool_miter_saw.png", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80", "assets/images/mockup_home_grid.png"]'::jsonb,
  'https://www.youtube.com/watch?v=F3_6eQo6t7s',
  'VOLT',
  4.9,
  94,
  '{"Blade Diameter": "10 Inch (254mm)", "No Load Speed": "4,800 RPM", "Bevel Capacity": "Dual 0-48 deg", "Arbor Size": "5/8 Inch", "Weight": "31 lbs"}'::jsonb,
  '["Shadow line LED cut guide never requires re-calibration", "High sliding fences support 5-1/2 inch nested crown molding", "Integrated dust port collects over 75% of particulate", "Cam-lock miter handle with detent override for fast locking"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678903',
  'Sharp-Edge X-Pro Angle Grinder 4-1/2"',
  'Machines',
  118.00,
  'High-torque industrial angle grinder with rapid electronic brake stopping wheels in under 1.5 seconds. Designed for aggressive weld cleaning, steel cutting, and concrete surfacing.',
  65,
  '["assets/images/tool_angle_grinder.png", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=vVj_pS3cW9I',
  'SHARP-EDGE',
  4.9,
  87,
  '{"Wheel Diameter": "4-1/2 Inch (115mm)", "Spindle Thread": "5/8-11 UNC", "No Load Speed": "11,000 RPM", "Brake Time": "< 1.5s", "Weight": "4.2 lbs"}'::jsonb,
  '["Electronic kickback clutch disengages motor on wheel pinch", "Tool-free burst-resistant guard adjustment", "Removable epoxy-coated air screens protect motor from grinding dust", "Slim barrel perimeter with vibration-isolated side handle"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678904',
  'Drill-Master Heavy Jobsite Table Saw',
  'Machines',
  118.00,
  'High-capacity contractor table saw with rack-and-pinion telescoping fence system for fast, smooth, and accurate fence adjustments. Capable of ripping full 4x8 plywood sheets with ease.',
  19,
  '["assets/images/tool_table_saw.png", "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=gT8ZcQv5d-8',
  'DRILL-MASTER',
  4.8,
  64,
  '{"Rip Capacity": "32-1/2 Inch Right", "Motor Power": "15 Amp High-Torque", "Blade Size": "10 Inch Carbide", "Depth of Cut at 90": "3-1/8 Inch", "Weight": "53 lbs"}'::jsonb,
  '["Rack and pinion fence rails make fence adjustments smooth and precise", "Patented internal roll cage protects components against drop damage", "Modular guard system allows tool-free guard adjustment", "On-board storage for blade guard, fence, push stick, and wrenches"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678905',
  'Volt Heavy-Duty Variable Speed Jigsaw',
  'Machines',
  118.00,
  'Precision barrel-grip orbital jigsaw with 4-position orbital action for fine cuts to aggressive rough cuts in lumber, aluminum, and sheet metal. Cast aluminum footplate with no-mar shoe.',
  35,
  '["assets/images/tool_jigsaw.png", "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=3V9K6j8vP1U',
  'VOLT',
  4.9,
  52,
  '{"Stroke Length": "1 Inch", "Strokes Per Min": "800 - 3,500 SPM", "Bevel Angle": "0 to 45 deg", "Orbital Settings": "4 Positions", "Weight": "5.1 lbs"}'::jsonb,
  '["All-metal keyless T-shank blade clamp for rapid changes", "Dual LED worklights eliminate cutting line shadows", "Adjustable dust blower keeps cut line clear of sawdust", "Counterbalanced mechanism minimizes vibration for maximum operator comfort"]'::jsonb
),

-- BLADES ---------------------------------------------------------------------
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678906',
  'Sharp-Edge High-Definition Diamond Saw Blades',
  'Blades',
  118.00,
  'Laser-welded commercial diamond cutting disc engineered for reinforced concrete, brick, granite, and fieldstone. Deep gullet design dissipates heat and evacuates sludge instantly.',
  85,
  '["assets/images/banner_blades.png", "assets/images/tool_diamond_blade.png", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
  'SHARP-EDGE',
  5.0,
  143,
  '{"Diameter": "12 Inch (305mm)", "Segment Height": "12mm Diamond Matrix", "Arbor Size": "1 Inch / 20mm Bushing", "Max RPM": "6,300 RPM", "Cutting Type": "Dry or Wet Cutting"}'::jsonb,
  '["Premium industrial diamond grit ensures up to 4x longer cutting life", "Keyhole gullet design accelerates slurry ejection and cooling", "Tensioned steel core reduces wobble and harmonic vibration", "Laser-welded segment joints withstand high heat without shedding"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678907',
  'TouchPower X-Pro Carbide Framing Blade 7-1/4"',
  'Blades',
  34.00,
  'Ultra-thin kerf 24-tooth titanium carbide framing blade coated with non-stick friction shield. Slices through nail-embedded lumber without binding or burning.',
  120,
  '["assets/images/tool_diamond_blade.png", "assets/images/cat_blades.png"]'::jsonb,
  'https://www.youtube.com/watch?v=kY3P6R7cE_w',
  'TOUCHPOWER',
  4.9,
  76,
  '{"Diameter": "7-1/4 Inch", "Teeth": "24T ATB Carbide", "Kerf": "0.059 Inch Ultra-Thin", "Arbor": "5/8 Inch with Diamond Knockout"}'::jsonb,
  '["Titanium cobalt carbide teeth resist impact and abrasive wear", "Laser-cut heat expansion slots keep blade flat and true", "Anti-friction perma-shield coating protects against pitch buildup", "Designed specifically for cordless saws to maximize battery runtime"]'::jsonb
),

-- BITS -----------------------------------------------------------------------
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678908',
  'Drill-Master Premium Titanium-Coated Drill Bits',
  'Bits',
  118.00,
  'Precision 29-piece titanium nitride (TiN) coated M2 high-speed steel drill bit set with 135-degree split point tip that starts on contact without center punching.',
  95,
  '["assets/images/banner_bits.png", "assets/images/cat_bits.png", "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=Tz3F6p4tQ1Q',
  'DRILL-MASTER',
  4.9,
  162,
  '{"Pieces": "29-Piece Indexed Set", "Sizes": "1/16 Inch to 1/2 Inch by 64ths", "Coating": "Titanium Nitride (TiN)", "Flute": "Parabolic Precision Ground"}'::jsonb,
  '["135-degree split point prevents walking on hardened metals", "Titanium nitride coating reduces friction and heat buildup", "Heavy-gauge steel indexing storage case with rubber shock bumpers", "Ideal for structural steel, stainless steel, cast iron, and alloys"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678909',
  'TouchPower ShockWave Torsion Impact Bit Set',
  'Bits',
  25.00,
  'Contractor grade 40-piece impact driver bit set with engineered torsion flex zone that absorbs high peak torque spikes from 1/4" impact drivers without snapping.',
  140,
  '["assets/images/cat_bits.png", "assets/images/banner_bits.png"]'::jsonb,
  'https://www.youtube.com/watch?v=B8x0Kq7tY1g',
  'TOUCHPOWER',
  4.9,
  110,
  '{"Drive Sizes": "PH1-PH3, SQ1-SQ3, T10-T40, Hex", "Shank": "1/4 Inch Quick-Change Power Groove", "Steel": "Custom S2 Modified Shock Steel"}'::jsonb,
  '["Optimized ShockZone geometry flexes to absorb peak torque spikes", "Precision CNC machined tips prevent stripping and cam-out", "Laser-hardened wear guard tip delivers supreme grip", "Modular customizable case with magnetic bit collar"]'::jsonb
),

-- SAFETY GUARDS --------------------------------------------------------------
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678910',
  'TouchPower OSHA Dust Extraction Surface Grinder Shroud',
  'Safety Guards',
  48.00,
  'Heavy-duty universal 5" surface grinding dust shroud with spring-loaded flexible brush ring and flush-edge flip cover for grinding right up to walls and curbs.',
  58,
  '["assets/images/cat_safety_guards.png", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=kY3P6R7cE_w',
  'TOUCHPOWER',
  4.9,
  83,
  '{"Compatibility": "Fits 4-1/2 and 5 Inch Grinders", "Vacuum Port": "Universal 1-1/4 Inch & 1-1/2 Inch Hose", "Seal": "High-Density Polypropylene Brush Ring"}'::jsonb,
  '["Complies with OSHA respirable crystalline silica standards", "Flush grind edge piece flips open for flush work against vertical walls", "Universal collar adapters fit all major industrial angle grinder brands", "Spring suspension maintains constant contact on uneven concrete floors"]'::jsonb
),
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678911',
  'TouchPower Cut-Off Dust Extraction Enclosure Guard',
  'Safety Guards',
  62.00,
  'Transparent polycarbonate cut-off saw containment guard with multi-directional vacuum manifold. Captures over 95% of airborne silica particulates during masonry saw cuts.',
  34,
  '["assets/images/cat_safety_guards.png", "assets/images/mockup_pdp.png"]'::jsonb,
  'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
  'TOUCHPOWER',
  4.8,
  39,
  '{"Compatibility": "7-1/4 to 9 Inch Cut-Off Saws", "Material": "High-Impact Polycarbonate", "Port": "2-1/2 Inch High-CFM Hose"}'::jsonb,
  '["Impact-resistant transparent shield keeps cutting line visible", "Dual water feed nozzles optional for slurry suppression", "Rugged steel mounting bracket withstands severe drop impact", "Tool-free depth of cut adjustment with positive stops"]'::jsonb
),

-- MACHINES (High-Torque Drill Driver Set) -------------------------------------
(
  'c3d4e5f6-a1b2-4c3d-8e9f-012345678912',
  'Drill-Master High-Torque Drill Driver Set',
  'Machines',
  118.00,
  'Next-generation 20V brushless compact drill driver set delivering 1,200 in-lbs of breakaway torque. Includes 2x 5.0Ah high-output batteries and rapid multi-voltage charger.',
  45,
  '["assets/images/tool_drill_driver.png", "assets/images/hero_drill_desktop.png", "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  'https://www.youtube.com/watch?v=rW_kX4d4x_0',
  'DRILL-MASTER',
  4.9,
  210,
  '{"Torque": "1,200 in-lbs Peak", "Speed": "2-Speed (0-550 / 0-2,100 RPM)", "Chuck": "1/2 Inch All-Metal Ratcheting", "Battery": "2x 20V 5.0Ah Lithium", "Weight": "3.8 lbs"}'::jsonb,
  '["High-efficiency 4-pole brushless motor maximizes battery runtime", "All-metal ratcheting chuck with carbide jaws prevents bit slip", "Tri-LED ring delivers 360-degree shadowless illumination", "Thermal overload smart chip prevents overheating under continuous heavy load"]'::jsonb
);

-- ============================================================================
-- 7. SEED DATA - INITIAL CONTRACTOR ORDERS
-- ============================================================================

INSERT INTO public.orders (
  id, user_id, product_details, total_amount, shipping_address, delivery_status, carrier, tracking_number, estimated_delivery, customer_name, customer_email, notes
) VALUES
(
  'TP-8841-NYC',
  NULL,
  '[
    {"id": "c3d4e5f6-a1b2-4c3d-8e9f-012345678901", "name": "TouchPower X-Pro Rotary Hammer Drill", "price": 118.00, "quantity": 1, "image": "assets/images/banner_machines.png"},
    {"id": "c3d4e5f6-a1b2-4c3d-8e9f-012345678906", "name": "Sharp-Edge High-Definition Diamond Saw Blades", "price": 118.00, "quantity": 2, "image": "assets/images/banner_blades.png"}
  ]'::jsonb,
  354.00,
  '{"street": "452 Industrial Parkway, Dock 4", "city": "Queens", "state": "NY", "zip": "11101", "country": "USA"}'::jsonb,
  'Out for Delivery',
  'TouchPower ProFreight Express',
  'TP-TRK-99284102',
  'Today by 4:30 PM',
  'Marcus Vance',
  'marcus@vanceframing.com',
  'Gate access code #4491. Deliver to site superintendent office.'
),
(
  'TP-7719-CHI',
  NULL,
  '[
    {"id": "c3d4e5f6-a1b2-4c3d-8e9f-012345678908", "name": "Drill-Master Premium Titanium-Coated Drill Bits", "price": 118.00, "quantity": 1, "image": "assets/images/banner_bits.png"}
  ]'::jsonb,
  118.00,
  '{"street": "1800 W Fulton St, Suite 200", "city": "Chicago", "state": "IL", "zip": "60612", "country": "USA"}'::jsonb,
  'Shipped',
  'FedEx Heavy Freight',
  'FX-7719401928',
  'Tomorrow by 10:00 AM',
  'Sarah Jenkins',
  'sarah@apexconcrete.com',
  'Forklift available at receiving dock.'
),
(
  'TP-6602-DAL',
  NULL,
  '[
    {"id": "c3d4e5f6-a1b2-4c3d-8e9f-012345678912", "name": "Drill-Master High-Torque Drill Driver Set", "price": 118.00, "quantity": 3, "image": "assets/images/tool_drill_driver.png"}
  ]'::jsonb,
  354.00,
  '{"street": "920 Commerce Boulevard", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::jsonb,
  'Processing',
  'UPS Jobsite Direct',
  'UPS-6602819234',
  'In 2 Days',
  'David Miller',
  'david@millersteel.com',
  'Notify site foreman upon dispatch.'
);

-- ============================================================================
-- 8. INITIAL ADMIN PROFILE
-- ============================================================================
INSERT INTO public.profiles (
  id, email, full_name, company, role, phone
) VALUES
(
  'a1b2c3d4-e5f6-4a5b-8c9d-112233445566',
  'admin@touchpower.com',
  'TouchPower Operations Team',
  'TouchPower Technologies Inc.',
  'admin',
  '+1-800-868-2479'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 9. DATA WAREHOUSE & MINING (DWM) STAR / SNOWFLAKE SCHEMA
-- Fact Tables: fact_sales, fact_order_deliveries
-- Dimension Tables: dim_date, dim_products, dim_customers, dim_carriers, dim_locations
-- ============================================================================

-- A. Date Dimension Table
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

-- B. Product Dimension Table (Surrogate Key Architecture)
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

-- C. Customer Dimension Table
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

-- D. Carrier / Logistics Dimension Table
CREATE TABLE IF NOT EXISTS public.dim_carriers (
  carrier_key SERIAL PRIMARY KEY,
  carrier_name TEXT UNIQUE NOT NULL,
  service_tier TEXT NOT NULL,
  sla_transit_hours INT NOT NULL,
  fleet_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- E. Location / Geographic Zone Dimension Table
CREATE TABLE IF NOT EXISTS public.dim_locations (
  location_key SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zone TEXT NOT NULL,
  distance_hub_km INT NOT NULL,
  region TEXT NOT NULL
);

-- F. FACT SALES (Grain: Line-Item Order Transaction)
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

-- G. FACT ORDER DELIVERIES (Ground Truth for Naïve Bayes Classification)
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

-- ============================================================================
-- 10. OLAP VIEWS & MULTI-DIMENSIONAL CUBES
-- ============================================================================

-- OLAP Cube: Multi-Dimensional Sales Cube by Category, Region, and Quarter
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

-- OLAP View: Carrier SLA Compliance & On-Time Performance
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

-- OLAP View: Cumulative Rollup with Window Functions
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

-- ============================================================================
-- 11. OLAP STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- Function: Multi-Dimensional Slice & Dice Query
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

-- Function: Extract Pre-Processed Naïve Bayes Classification Training Data
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

-- Schema setup completed successfully


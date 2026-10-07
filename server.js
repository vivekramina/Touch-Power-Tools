// ============================================================================
// TouchPower™ - Production Server with Live Supabase PostgreSQL Connection
// Project Name: TouchPower
// Project ID: wbhhhtmuznhcfpujqvwu
// Host: db.wbhhhtmuznhcfpujqvwu.supabase.co:5432
// Database: PostgreSQL 17
// ZERO warranty mentions.


const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

// Load .env configuration if present
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      console.log('⚡ Loaded environment variables from .env');
    } catch (e) {
      console.warn('Could not parse .env file:', e.message);
    }
  }
}
loadEnv();

let GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const SUPABASE_DB_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:vRFREnfEkDvCoIds@db.wbhhhtmuznhcfpujqvwu.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 6000
});

pool.on('error', (err) => {
  console.error('Unexpected Supabase Postgres Pool error:', err.message);
});

// Verify connection on startup
pool.query('SELECT current_database(), version();')
  .then((res) => {
    console.log(`⚡ Connected to Supabase Database: [${res.rows[0].current_database}] at db.wbhhhtmuznhcfpujqvwu.supabase.co`);
  })
  .catch((err) => {
    console.warn('⚠️ Could not connect to Supabase database pool on startup:', err.message);
  });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2e6) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
    });
    res.end();
    return;
  }

  // ==========================================================================
  // SUPABASE DIRECT DATABASE API ROUTES
  // ==========================================================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Database Health / Status
      if (pathname === '/api/db-status' && req.method === 'GET') {
        const client = await pool.connect();
        try {
          const prodRes = await client.query('SELECT count(*)::int as count FROM public.products;');
          const orderRes = await client.query('SELECT count(*)::int as count FROM public.orders;');
          const profRes = await client.query('SELECT count(*)::int as count FROM public.profiles;');
          const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");

          return sendJson(res, 200, {
            connected: true,
            provider: 'Enterprise Cloud PostgreSQL 17',
            projectName: 'TouchPower',
            projectId: 'wbhhhtmuznhcfpujqvwu',
            host: 'db.wbhhhtmuznhcfpujqvwu.supabase.co:5432',
            database: 'postgres',
            productCount: prodRes.rows[0].count,
            orderCount: orderRes.rows[0].count,
            profileCount: profRes.rows[0].count,
            tables: tablesRes.rows.map(r => r.table_name)
          });
        } finally {
          client.release();
        }
      }

      // 2. Products - GET (all or filtered)
      if (pathname === '/api/products' && req.method === 'GET') {
        const queryParams = parsedUrl.query;
        let sql = 'SELECT * FROM public.products';
        const params = [];
        const conditions = [];

        if (queryParams.category && queryParams.category !== 'All' && queryParams.category !== 'All Tools') {
          const rawCat = queryParams.category.trim();
          const spacedCat = rawCat.replace(/-/g, ' ');
          params.push(rawCat);
          const p1 = params.length;
          params.push(spacedCat);
          const p2 = params.length;
          conditions.push(`(category ILIKE $${p1} OR category ILIKE $${p2} OR REPLACE(category, ' ', '-') ILIKE $${p1} OR category ILIKE $${p2} || '%')`);
        }
        if (queryParams.query || queryParams.q) {
          const qVal = queryParams.query || queryParams.q;
          params.push(`%${qVal}%`);
          conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length} OR brand ILIKE $${params.length})`);
        }
        if (queryParams.brand) {
          params.push(`%${queryParams.brand}%`);
          conditions.push(`brand ILIKE $${params.length}`);
        }
        if (queryParams.inStockOnly === 'true') {
          conditions.push('stock_count > 0');
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        if (queryParams.sort === 'price-low') {
          sql += ' ORDER BY price ASC';
        } else if (queryParams.sort === 'price-high') {
          sql += ' ORDER BY price DESC';
        } else if (queryParams.sort === 'rating') {
          sql += ' ORDER BY rating DESC';
        } else {
          sql += ' ORDER BY created_at DESC';
        }

        const result = await pool.query(sql, params);
        return sendJson(res, 200, result.rows);
      }

      // 3. Products - GET by ID
      if (pathname.startsWith('/api/products/') && req.method === 'GET') {
        const id = pathname.replace('/api/products/', '').trim();
        const result = await pool.query('SELECT * FROM public.products WHERE id::text = $1', [id]);
        if (result.rows.length === 0) {
          return sendJson(res, 404, { error: 'Product not found' });
        }
        return sendJson(res, 200, result.rows[0]);
      }

      // 4. Products - POST (Create product)
      if (pathname === '/api/products' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const result = await pool.query(`
          INSERT INTO public.products (
            name, category, price, description, stock_count, image_urls,
            youtube_url, brand, rating, reviews_count, contractor_location, specs, features
          ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb)
          RETURNING *;
        `, [
          data.name,
          data.category || 'Machines',
          parseFloat(data.price) || 0,
          data.description || '',
          parseInt(data.stock_count, 10) || 0,
          JSON.stringify(Array.isArray(data.image_urls) ? data.image_urls : [data.image_urls || 'assets/images/banner_machines.png']),
          data.youtube_url || 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
          data.brand || 'TouchPower',
          parseFloat(data.rating) || 4.9,
          parseInt(data.reviews_count, 10) || 1,
          data.contractor_location || 'Mumbai Industrial Corridor, MH',
          JSON.stringify(data.specs || {}),
          JSON.stringify(data.features || [])
        ]);
        return sendJson(res, 201, result.rows[0]);
      }

      // 5. Products - PUT (Update product)
      if (pathname.startsWith('/api/products/') && req.method === 'PUT') {
        const id = pathname.replace('/api/products/', '').trim();
        const data = await readJsonBody(req);
        const result = await pool.query(`
          UPDATE public.products SET
            name = COALESCE($1, name),
            category = COALESCE($2, category),
            price = COALESCE($3, price),
            description = COALESCE($4, description),
            stock_count = COALESCE($5, stock_count),
            image_urls = COALESCE($6::jsonb, image_urls),
            youtube_url = COALESCE($7, youtube_url),
            brand = COALESCE($8, brand),
            specs = COALESCE($9::jsonb, specs),
            features = COALESCE($10::jsonb, features),
            contractor_location = COALESCE($11, contractor_location),
            updated_at = timezone('utc'::text, now())
          WHERE id::text = $12
          RETURNING *;
        `, [
          data.name || null,
          data.category || null,
          data.price !== undefined ? parseFloat(data.price) : null,
          data.description || null,
          data.stock_count !== undefined ? parseInt(data.stock_count, 10) : null,
          data.image_urls ? JSON.stringify(data.image_urls) : null,
          data.youtube_url || null,
          data.brand || null,
          data.specs ? JSON.stringify(data.specs) : null,
          data.features ? JSON.stringify(data.features) : null,
          data.contractor_location || null,
          id
        ]);

        if (result.rows.length === 0) {
          return sendJson(res, 404, { error: 'Product not found to update' });
        }
        return sendJson(res, 200, result.rows[0]);
      }

      // 6. Products - DELETE
      if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
        const id = pathname.replace('/api/products/', '').trim();
        await pool.query('DELETE FROM public.products WHERE id::text = $1', [id]);
        return sendJson(res, 200, { success: true, deletedId: id });
      }

      // 7. Orders - GET all
      if (pathname === '/api/orders' && req.method === 'GET') {
        const result = await pool.query('SELECT * FROM public.orders ORDER BY created_at DESC;');
        return sendJson(res, 200, result.rows);
      }

      // 8. Orders - GET by ID or tracking
      if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
        const id = pathname.replace('/api/orders/', '').trim().toUpperCase();
        const result = await pool.query(
          'SELECT * FROM public.orders WHERE UPPER(id) = $1 OR UPPER(tracking_number) = $1 LIMIT 1;',
          [id]
        );
        if (result.rows.length === 0) {
          return sendJson(res, 404, { error: 'Order not found' });
        }
        return sendJson(res, 200, result.rows[0]);
      }

      // 9. Orders - POST (Create order)
      if (pathname === '/api/orders' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const orderId = data.id || ('TP-' + Math.floor(1000 + Math.random() * 9000) + '-' + (data.shipping_address?.city?.slice(0, 3).toUpperCase() || 'IND'));
        const trackingNum = data.tracking_number || ('TP-TRK-' + Math.floor(10000000 + Math.random() * 90000000));

        const result = await pool.query(`
          INSERT INTO public.orders (
            id, product_details, total_amount, shipping_address, delivery_status,
            carrier, tracking_number, estimated_delivery, customer_name, customer_email, customer_phone, notes
          ) VALUES ($1, $2::jsonb, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;
        `, [
          orderId,
          JSON.stringify(data.product_details || []),
          parseFloat(data.total_amount) || 0,
          JSON.stringify(data.shipping_address || {}),
          data.delivery_status || 'Processing',
          data.carrier || 'TouchPower BlueDart Jobsite Direct',
          trackingNum,
          data.estimated_delivery || 'In 2-3 Business Days',
          data.customer_name || 'Valued Contractor',
          data.customer_email || 'contractor@jobsite.in',
          data.customer_phone || '+91 98000 00000',
          data.notes || 'Direct site delivery'
        ]);
        return sendJson(res, 201, result.rows[0]);
      }

      // 10. Orders - PATCH (Update status)
      if (pathname.startsWith('/api/orders/') && req.method === 'PATCH') {
        const id = pathname.replace('/api/orders/', '').trim();
        const data = await readJsonBody(req);
        const result = await pool.query(`
          UPDATE public.orders SET
            delivery_status = COALESCE($1, delivery_status),
            tracking_number = COALESCE($2, tracking_number),
            carrier = COALESCE($3, carrier),
            updated_at = timezone('utc'::text, now())
          WHERE id = $4
          RETURNING *;
        `, [data.delivery_status || null, data.tracking_number || null, data.carrier || null, id]);

        if (result.rows.length === 0) {
          return sendJson(res, 404, { error: 'Order not found to update' });
        }
        return sendJson(res, 200, result.rows[0]);
      }

      // 11. Admin - Reseed Supabase Database
      if (pathname === '/api/admin/reseed' && req.method === 'POST') {
        const { exec } = require('child_process');
        exec('node scripts/migrate_seed.js', (err, stdout, stderr) => {
          if (err) {
            return sendJson(res, 500, { error: err.message, stderr });
          }
          return sendJson(res, 200, { success: true, message: 'Database reseeded successfully!', stdout });
        });
        return;
      }

      // 12. Admin - Execute Raw SQL Query
      if (pathname === '/api/admin/sql' && req.method === 'POST') {
        const data = await readJsonBody(req);
        if (!data.query) {
          return sendJson(res, 400, { error: 'No query provided' });
        }
        const result = await pool.query(data.query);
        return sendJson(res, 200, {
          command: result.command,
          rowCount: result.rowCount,
          rows: result.rows || []
        });
      }

      // ======================================================================
      // DWH (DATA WAREHOUSE) & NAÏVE BAYES MACHINE LEARNING ROUTES
      // ======================================================================

      // Lazy-load ML engine module
      const getMlEngine = async () => {
        return await import('./js/ml/naiveBayes.js');
      };

      // DWH-1: Overview & Schema Telemetry
      if (pathname === '/api/dwh/overview' && req.method === 'GET') {
        const client = await pool.connect();
        try {
          const dimProds = await client.query('SELECT count(*)::int as count FROM public.dim_products;');
          const dimCusts = await client.query('SELECT count(*)::int as count FROM public.dim_customers;');
          const dimDates = await client.query('SELECT count(*)::int as count FROM public.dim_date;');
          const dimCarrs = await client.query('SELECT count(*)::int as count FROM public.dim_carriers;');
          const factSales = await client.query(`
            SELECT 
              count(*)::int as total_sales,
              coalesce(sum(gross_revenue), 0)::numeric as total_revenue,
              coalesce(sum(net_profit), 0)::numeric as total_profit,
              coalesce(sum(quantity_sold), 0)::int as total_units
            FROM public.fact_sales;
          `);
          const factDeliv = await client.query(`
            SELECT 
              count(*)::int as total_deliveries,
              coalesce(sum(on_time_flag), 0)::int as on_time_count,
              (count(*) - coalesce(sum(on_time_flag), 0))::int as delayed_count,
              round(avg(actual_hours)::numeric, 1) as avg_transit_hours,
              case when count(*) > 0 then round((sum(on_time_flag)::numeric / count(*) * 100), 1) else 0 end as on_time_pct
            FROM public.fact_order_deliveries;
          `);

          // OLAP Cube Sample Records
          const cubeRes = await client.query(`
            SELECT * FROM public.vw_olap_sales_cube 
            ORDER BY total_gross_revenue DESC 
            LIMIT 10;
          `);

          // Carrier SLA Performance
          const carrierPerf = await client.query(`
            SELECT * FROM public.vw_olap_delivery_performance;
          `);

          // Monthly Category Rollup
          const rollupRes = await client.query(`
            SELECT * FROM public.vw_olap_monthly_category_rollup 
            ORDER BY year DESC, category;
          `);

          return sendJson(res, 200, {
            success: true,
            schemaType: 'Star / Snowflake Data Warehouse',
            dimensions: {
              dim_products: dimProds.rows[0].count,
              dim_customers: dimCusts.rows[0].count,
              dim_date: dimDates.rows[0].count,
              dim_carriers: dimCarrs.rows[0].count
            },
            facts: {
              sales: factSales.rows[0],
              deliveries: factDeliv.rows[0]
            },
            olapCube: cubeRes.rows,
            carrierPerformance: carrierPerf.rows,
            monthlyRollup: rollupRes.rows
          });
        } finally {
          client.release();
        }
      }

      // DWH-2: Naïve Bayes Model Training & Evaluation (Accuracy, Precision, Recall, F1, Confusion Matrix)
      if (pathname === '/api/ml/naive-bayes-eval' && req.method === 'GET') {
        const ml = await getMlEngine();
        const classifier = new ml.NaiveBayesDeliveryClassifier();

        // Train using verified DWH delivery historical dataset
        const trainingSet = ml.DWH_DELIVERY_TRAINING_DATASET;
        classifier.train(trainingSet);
        const evalReport = classifier.evaluate(ml.DWH_DELIVERY_TEST_DATASET);

        return sendJson(res, 200, {
          success: true,
          ...evalReport
        });
      }

      // DWH-3: Classify Single Order Fulfillment Risk with Naïve Bayes
      if (pathname === '/api/ml/classify-order' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const ml = await getMlEngine();
        const classifier = new ml.NaiveBayesDeliveryClassifier();
        classifier.train();
        const prediction = classifier.predict(data);

        return sendJson(res, 200, {
          success: true,
          ...prediction
        });
      }

      // DWH-4: Predict Future Product Sales (30-Day Forecast & Category Multi-Dimensional Projection)
      if (pathname === '/api/ml/predict-sales' && req.method === 'GET') {
        const prodsRes = await pool.query('SELECT * FROM public.products ORDER BY category ASC, price DESC;');
        const ml = await getMlEngine();
        const predictions = ml.SalesPredictionEngine.predictProductSales(prodsRes.rows || []);
        const categorySummary = ml.SalesPredictionEngine.aggregateByCategory(predictions);
        const businessFlow = ml.BusinessFlowEngine.getBusinessFlow();
        const productAccuracy = ml.ProductRealUserAccuracyEngine.getRealUserAccuracy(prodsRes.rows || []);

        const totalRevenue = predictions.reduce((sum, p) => sum + p.predicted30dRevenue, 0);
        const totalUnits = predictions.reduce((sum, p) => sum + p.predicted30dUnits, 0);

        return sendJson(res, 200, {
          success: true,
          totalProducts: predictions.length,
          totalPredictedRevenue: totalRevenue,
          totalPredictedUnits: totalUnits,
          categorySummary,
          businessFlow,
          productAccuracy,
          products: predictions
        });
      }

      // DWH-4b: Predict Business Flow (Revenue & Orders Trajectory over 12 Months)
      if (pathname === '/api/ml/business-flow' && req.method === 'GET') {
        const ml = await getMlEngine();
        return sendJson(res, 200, {
          success: true,
          businessFlow: ml.BusinessFlowEngine.getBusinessFlow()
        });
      }

      // DWH-4c: Real-User Product Working Accuracy & Contractor Jobsite Ratings
      if (pathname === '/api/ml/product-accuracy' && req.method === 'GET') {
        const prodsRes = await pool.query('SELECT * FROM public.products ORDER BY category ASC, price DESC;');
        const ml = await getMlEngine();
        const productAccuracy = ml.ProductRealUserAccuracyEngine.getRealUserAccuracy(prodsRes.rows || []);
        return sendJson(res, 200, {
          success: true,
          total: productAccuracy.length,
          products: productAccuracy
        });
      }

      // DWH-4d: Calculate Orders Delivered vs Return by Month & Year
      if (pathname === '/api/ml/calculate-month-year' && req.method === 'GET') {
        const ml = await getMlEngine();
        const month = parsedUrl.query?.month || 'March';
        const year = parsedUrl.query?.year || '2026';
        const result = ml.BusinessFlowEngine.calculateMonthYearOrders(month, year);
        return sendJson(res, 200, {
          success: true,
          ...result
        });
      }

      // DWH-4e: Regression Analysis Evaluation (SLR & MLR)
      if (pathname === '/api/ml/regression-eval' && req.method === 'GET') {
        const regModule = await import('./js/ml/dwmRegression.js');
        const slr = regModule.DwmRegressionEngine.fitSimpleLinearRegression();
        const mlr = regModule.DwmRegressionEngine.getMultipleRegressionModel();
        return sendJson(res, 200, {
          success: true,
          slr,
          mlr
        });
      }

      // DWH-4f: Predict Numerical Output using Linear Regression
      if (pathname === '/api/ml/predict-regression' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const regModule = await import('./js/ml/dwmRegression.js');
        if (data.type === 'slr') {
          const result = regModule.DwmRegressionEngine.predictSLR(data.orders);
          return sendJson(res, 200, { success: true, ...result });
        } else {
          const result = regModule.DwmRegressionEngine.predictDemandMLR(data);
          return sendJson(res, 200, { success: true, ...result });
        }
      }

      // DWH-4g: Attribute Relevance Analysis & Decision Tree Structure
      if (pathname === '/api/ml/decision-tree-eval' && req.method === 'GET') {
        const dtModule = await import('./js/ml/decisionTree.js');
        const relevance = dtModule.DecisionTreeEngine.getAttributeRelevance();
        const rules = dtModule.DecisionTreeEngine.getDecisionRules();
        return sendJson(res, 200, {
          success: true,
          attributeRelevance: relevance,
          decisionRules: rules
        });
      }

      // DWH-4h: Classify Product Reorder Urgency using Decision Tree
      if (pathname === '/api/ml/classify-decision-tree' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const dtModule = await import('./js/ml/decisionTree.js');
        const result = dtModule.DecisionTreeEngine.classifyProduct(data);
        return sendJson(res, 200, {
          success: true,
          ...result
        });
      }

      // DWH-4i: Run Python DWM Machine Learning Pipeline
      if (pathname === '/api/ml/run-python-pipeline' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const { exec } = require('child_process');
        const scriptName = (data && data.script) ? data.script : 'run_all_dwm_models.py';
        const allowedScripts = [
          '1_linear_regression.py',
          '2_attribute_relevance_decision_tree.py',
          '3_naive_bayes_classification.py',
          'run_all_dwm_models.py'
        ];
        const safeScript = allowedScripts.includes(scriptName) ? scriptName : 'run_all_dwm_models.py';
        const pyScript = path.join(__dirname, 'scripts', 'dwm_analysis', safeScript);

        exec(`python "${pyScript}"`, { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }, (err, stdout, stderr) => {
          const resultsJsonPath = path.join(__dirname, 'scripts', 'dwm_analysis', 'dwm_model_results.json');
          let modelResults = null;
          if (fs.existsSync(resultsJsonPath)) {
            try {
              modelResults = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
            } catch (e) {}
          }
          if (err) {
            return sendJson(res, 500, { success: false, error: err.message, stderr, stdout });
          }
          return sendJson(res, 200, {
            success: true,
            script: safeScript,
            message: `Python script ${safeScript} executed successfully!`,
            output: stdout,
            stdout,
            modelResults
          });
        });
        return;
      }

      // DWH-5: OLAP Slice & Dice Stored Procedure Execution
      if (pathname === '/api/dwh/slice-dice' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const cat = data.category || null;
        const reg = data.region || null;
        const qtr = data.quarter || null;

        const result = await pool.query('SELECT * FROM public.fn_olap_slice_dice($1, $2, $3);', [cat, reg, qtr]);
        return sendJson(res, 200, {
          success: true,
          filters: { category: cat, region: reg, quarter: qtr },
          rows: result.rows
        });
      }

      // DWH-6: Inspect Table Data in Real-Time
      if (pathname === '/api/dwh/table-data' && req.method === 'GET') {
        const queryParams = parsedUrl.query;
        const allowedTables = [
          'fact_sales', 'fact_order_deliveries', 'dim_products', 'dim_customers',
          'dim_date', 'dim_carriers', 'dim_locations', 'products', 'orders', 'profiles'
        ];
        const targetTable = queryParams.table || 'fact_sales';

        if (!allowedTables.includes(targetTable)) {
          return sendJson(res, 400, { error: 'Invalid or unauthorized DWH table' });
        }

        const limit = Math.min(100, parseInt(queryParams.limit, 10) || 50);
        const result = await pool.query(`SELECT * FROM public.${targetTable} LIMIT $1;`, [limit]);
        return sendJson(res, 200, {
          table: targetTable,
          rowCount: result.rows.length,
          columns: result.fields.map(f => f.name),
          rows: result.rows
        });
      }

      // ======================================================================
      // 13. AI COMMERCIAL SPECIALIST ROUTES
      // ======================================================================

      // AI Status
      if (pathname === '/api/ai/status' && req.method === 'GET') {
        const prodCountRes = await pool.query('SELECT count(*)::int as count FROM public.products;');
        return sendJson(res, 200, {
          hasKey: !!(GEMINI_API_KEY && GEMINI_API_KEY.trim()),
          model: 'gemini-1.5-flash',
          catalogCount: prodCountRes.rows[0]?.count || 0
        });
      }

      // AI Test Key
      if (pathname === '/api/ai/test-key' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const testKey = (data.apiKey || '').trim() || GEMINI_API_KEY;
        if (!testKey) {
          return sendJson(res, 400, { valid: false, error: 'No API key provided' });
        }
        try {
          const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(testKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
              generationConfig: { maxOutputTokens: 5 }
            })
          });
          const testData = await testRes.json();
          if (testRes.ok && testData.candidates && testData.candidates.length > 0) {
            return sendJson(res, 200, { valid: true, model: 'gemini-1.5-flash' });
          } else {
            const errMsg = testData.error?.message || 'Invalid Gemini API key or quota exceeded';
            return sendJson(res, 400, { valid: false, error: errMsg });
          }
        } catch (testErr) {
          return sendJson(res, 500, { valid: false, error: testErr.message });
        }
      }

      // AI Save Key (to server .env)
      if (pathname === '/api/ai/save-key' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const newKey = (data.apiKey || '').trim();
        GEMINI_API_KEY = newKey;
        process.env.GEMINI_API_KEY = newKey;
        try {
          const envPath = path.join(__dirname, '.env');
          let currentContent = '';
          if (fs.existsSync(envPath)) {
            currentContent = fs.readFileSync(envPath, 'utf8');
          }
          if (currentContent.includes('GEMINI_API_KEY=')) {
            currentContent = currentContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/g, `GEMINI_API_KEY=${newKey}$1`);
          } else {
            currentContent = currentContent.trim() + `\nGEMINI_API_KEY=${newKey}\n`;
          }
          fs.writeFileSync(envPath, currentContent, 'utf8');
          return sendJson(res, 200, { success: true, message: 'Gemini API key saved to server .env successfully!' });
        } catch (saveErr) {
          return sendJson(res, 200, { success: true, message: 'Key saved in server memory (file write skipped).' });
        }
      }

      // AI Chat Endpoint (Gemini + Live Catalog Grounding + Smart Local Fallback)
      if (pathname === '/api/ai/chat' && req.method === 'POST') {
        const data = await readJsonBody(req);
        const message = (data.message || '').trim();
        const history = Array.isArray(data.history) ? data.history : [];
        const clientKey = (data.apiKey || '').trim();
        const effectiveKey = clientKey || GEMINI_API_KEY;
        const requestedModel = data.model || 'gemini-1.5-flash';

        if (!message) {
          return sendJson(res, 400, { error: 'Message cannot be empty' });
        }

        // Fetch live catalog from database for grounding
        const prodsResult = await pool.query('SELECT * FROM public.products ORDER BY category ASC, price ASC;');
        const allProducts = prodsResult.rows || [];

        // If Gemini API Key is available, attempt Generative AI call
        if (effectiveKey) {
          try {
            const geminiResponse = await callGeminiWithCatalog({
              apiKey: effectiveKey,
              model: requestedModel,
              message,
              history,
              products: allProducts
            });

            if (geminiResponse && geminiResponse.success) {
              return sendJson(res, 200, geminiResponse);
            }
          } catch (geminiErr) {
            console.warn('⚠️ Gemini API call failed, falling back to Smart Catalog Engine:', geminiErr.message);
          }
        }

        // Seamless Fallback: Smart Local Catalog Intelligence Engine
        const fallbackResponse = generateSmartCatalogResponse(message, allProducts, history);
        return sendJson(res, 200, {
          success: true,
          provider: 'catalog-intelligence',
          ...fallbackResponse
        });
      }

      // Fallthrough for unknown API route
      return sendJson(res, 404, { error: 'API endpoint not found' });

    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: apiErr.message || 'Internal Database Server Error' });
    }
  }

  // ==========================================================================
  // STATIC ASSET AND SPA SERVING
  // ==========================================================================
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routing if no extension
      if (!path.extname(reqPath)) {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(indexPath, (readErr, content) => {
          if (readErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

// ============================================================================
// AI COMMERCIAL SPECIALIST HELPERS
// ============================================================================

/**
 * Call Google Gemini API with complete live catalog grounding
 */
async function callGeminiWithCatalog({ apiKey, model, message, history, products }) {
  const modelName = model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Condense catalog into highly structured reference for Gemini
  const catalogLines = products.map(p => {
    const specsStr = Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join(', ');
    const featsStr = Array.isArray(p.features) ? p.features.slice(0, 3).join('; ') : '';
    return `- [ID: ${p.id}] ${p.brand || 'TouchPower'} ${p.name} | Category: ${p.category} | Price: ₹${p.price} | Stock: ${p.stock_count} units | Rating: ${p.rating}★ | Specs: (${specsStr}) | Features: (${featsStr}) | Desc: ${p.description || ''}`;
  }).join('\n');

  const systemInstructionText = `You are the Senior TouchPower AI Commercial Tool Specialist and Industrial Applications Consultant.
You speak like a seasoned, articulate, human commercial equipment specialist on a jobsite or showroom floor.
You are professional, technical, clear, helpful, and concise.

TOUCHPOWER LIVE PRODUCT CATALOG (${products.length} Products):
${catalogLines}

CORE RULES:
1. Ground your answers strictly in the real products above. Cite exact prices in Indian Rupees (₹), exact specs (power, RPM, torque, impact energy in Joules, chuck size, blade dimensions, weight), and live stock.
2. ZERO WARRANTY MENTIONS: Under company policy, never mention "warranty", "guarantee", or "warranty terms". Instead, highlight commercial heavy-duty engineering, brushless continuous output, sealed magnesium casings, and field-tested durability.
3. LOGISTICS POLICY:
   - Same-day dispatch for orders placed before 2:00 PM IST from regional commercial logistics hubs.
   - Free 2-day jobsite freight dispatch on all orders over ₹4,999.
   - Real-time shipment milestone tracking available in the #tracking tab.
4. INTERACTIVE PRODUCT RECOMMENDATIONS:
   When recommending 1 to 3 specific products from the catalog, place their exact IDs at the very end of your response inside this tag:
   [RECOMMEND: id1, id2]
5. SUGGESTED FOLLOW-UP QUESTIONS:
   Always end your response with exactly 3 relevant, brief suggested follow-up questions formatted as:
   [FOLLOWUPS: "Question 1?", "Question 2?", "Question 3?"]

FORMATTING:
Use crisp markdown with **bolding**, clean bullet points (-), and concise paragraphs. Never sound robotic or generic.`;

  // Build Gemini contents array from conversation history
  const contents = [];
  const cleanHistory = (history || []).slice(-10); // Last 10 turns

  for (const h of cleanHistory) {
    if (!h.text || typeof h.text !== 'string') continue;
    const role = h.sender === 'user' ? 'user' : 'model';

    // Gemini requires alternating roles starting with 'user'
    if (contents.length === 0 && role === 'model') {
      continue; // Skip initial greeting from assistant
    }

    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      // Merge consecutive same-role messages
      contents[contents.length - 1].parts[0].text += '\n' + h.text;
    } else {
      contents.push({
        role: role,
        parts: [{ text: h.text }]
      });
    }
  }

  // Ensure current message is added
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += '\n' + message;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });
  }

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 1024,
      topP: 0.95
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await response.json();

  if (!response.ok || !resJson.candidates || resJson.candidates.length === 0) {
    const errorDetails = resJson.error?.message || response.statusText || 'Gemini API generation failed';
    throw new Error(errorDetails);
  }

  const rawReply = resJson.candidates[0]?.content?.parts?.[0]?.text || '';
  let cleanText = rawReply;
  let recommendedProducts = [];
  let followUps = [];

  // 1. Extract [RECOMMEND: id1, id2]
  const recMatch = cleanText.match(/\[RECOMMEND:\s*([^\]]+)\]/i);
  if (recMatch) {
    const rawIds = recMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
    recommendedProducts = rawIds
      .map(id => products.find(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase().includes(id.toLowerCase())))
      .filter(Boolean);
    cleanText = cleanText.replace(/\[RECOMMEND:\s*[^\]]+\]/gi, '').trim();
  }

  // 2. Extract [FOLLOWUPS: "...", "..."]
  const fuMatch = cleanText.match(/\[FOLLOWUPS:\s*([^\]]+)\]/i);
  if (fuMatch) {
    const rawList = fuMatch[1];
    const quotesMatch = rawList.match(/"([^"]+)"|'([^']+)'/g);
    if (quotesMatch && quotesMatch.length > 0) {
      followUps = quotesMatch.map(q => q.replace(/^["']|["']$/g, '').trim());
    } else {
      followUps = rawList.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    cleanText = cleanText.replace(/\[FOLLOWUPS:\s*[^\]]+\]/gi, '').trim();
  }

  // 3. Auto-fallback for product card rendering: If no products were explicitly tagged, detect products mentioned in reply
  if (recommendedProducts.length === 0) {
    for (const p of products) {
      if (cleanText.toLowerCase().includes(p.name.toLowerCase()) || 
         (p.brand && cleanText.toLowerCase().includes(p.brand.toLowerCase()) && cleanText.toLowerCase().includes(p.category.toLowerCase().slice(0, 4)))) {
        if (!recommendedProducts.some(rp => rp.id === p.id)) {
          recommendedProducts.push(p);
          if (recommendedProducts.length >= 3) break;
        }
      }
    }
  }

  return {
    success: true,
    text: cleanText,
    products: recommendedProducts.slice(0, 3),
    followUps: followUps.slice(0, 4),
    provider: modelName
  };
}

/**
 * High-Intelligence Local Catalog Reasoning Engine
 * Operates autonomously when no API key is present or on fallback.
 * Strictly adheres to ZERO warranty mentions.
 */
function generateSmartCatalogResponse(userQuery, products, history) {
  const q = userQuery.toLowerCase().trim();
  let replyText = '';
  let matchedProducts = [];
  let followUps = [];
  let comparisonTable = null;
  let diagnosticStep = null;

  // Helper search functions
  const findByName = (term) => products.find(p => p.name.toLowerCase().includes(term.toLowerCase()));
  const filterByTerm = (term) => products.filter(p => 
    p.name.toLowerCase().includes(term.toLowerCase()) || 
    (p.brand && p.brand.toLowerCase().includes(term.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(term.toLowerCase()))
  );

  // 1. GREETINGS & INTRODUCTIONS
  if (/^(hi|hello|hey|greetings|namaste|good morning|good afternoon|good evening|who are you|help)/i.test(q) && q.split(' ').length <= 4) {
    replyText = `Hello! I am your **TouchPower AI Assistant**. I compute **machine mechanical accuracy percentages (up to 99.4%)**, evaluate dynamic runout tolerances (±0.015mm), and benchmark competing hardware fleets (TouchPower, Bosch, Makita, DeWalt, DongCheng).

I can also guide you through our **3-Step Diagnostic Assessment** to collect your application data and predict the highest-performing tool within your exact budget envelope.

**Choose a quick starting path below:**`;
    matchedProducts = [
      findByName('Rotary Hammer'),
      findByName('Angle Grinder'),
      findByName('14" Laser-Welded')
    ].filter(Boolean);
    diagnosticStep = {
      step: 'init',
      prompt: 'Select an AI action or launch the precision diagnostic:',
      options: [
        { label: '🎯 Start 3-Step Tool Diagnostic', prompt: 'start tool diagnostic' },
        { label: '⚖️ Compare Commercial Machines', prompt: 'compare commercial rotary hammers' },
        { label: '💰 Find Best Tool Under ₹10,000', prompt: 'recommend commercial tool under 10000' }
      ]
    };
    followUps = [
      '🎯 Start 3-step tool diagnostic',
      '⚡ Bosch GBH 220 vs TouchPower X-Pro?',
      '🪚 Diamond blades for reinforced concrete',
      '🛡️ OSHA Table 1 silica dust shrouds'
    ];
  }

  // 2. COMPARISONS (VS, COMPARE, DIFFERENCE)
  else if (q.includes('vs') || q.includes('compare') || q.includes('difference')) {
    if (q.includes('drill') || q.includes('hammer') || q.includes('rotary') || q.includes('coring')) {
      const p1 = findByName('TouchPower X-Pro Rotary Hammer') || findByName('Rotary Hammer');
      const p2 = findByName('Bosch GBH 220') || findByName('GBH 220');
      const p3 = findByName('Makita HR2470') || findByName('HR2470');
      matchedProducts = [p1, p2, p3].filter(Boolean);
      replyText = `### ⚖️ Commercial Rotary Hammer Machine Benchmark

Our Super AI computed mechanical accuracy, impact energy, and thermal endurance metrics across all three commercial drilling platforms:

1. **TouchPower X-Pro (₹9,999) — 98.6% Accuracy Rating**
   - **3.4 Joules** brushless impact energy at 3,000 RPM. Engineered with sealed magnesium gear casing, multi-stage vibration dampening, and **±0.015mm chuck concentricity**.
2. **Bosch GBH 220 (₹7,899) — 94.2% Accuracy Rating**
   - 720W corded motor, **2.0 Joules**, 2.3 kg. Proven reliability for everyday overhead anchor holes with **±0.025mm concentricity**.
3. **Makita HR2470 (₹9,299) — 96.1% Accuracy Rating**
   - 780W corded motor, **2.4 Joules** with mechanical torque-limiter clutch to prevent bit-binding kickback.

**Super AI Verdict:** TouchPower X-Pro delivers **+41% higher impact penetration** through high-grade reinforced concrete, while Bosch GBH 220 offers lighter weight for continuous ceiling mounting.`;
      comparisonTable = {
        title: 'Rotary Hammer Mechanical Accuracy & Spec Matrix',
        items: [
          { name: p1?.name || 'TouchPower X-Pro', brand: 'TouchPower', price: p1?.price || 9999, accuracy: 98.6, primarySpec: '3.4J Brushless (3,000 RPM)', tolerance: '±0.015mm' },
          { name: p2?.name || 'Bosch GBH 220', brand: 'Bosch', price: p2?.price || 7899, accuracy: 94.2, primarySpec: '2.0J 720W Corded', tolerance: '±0.025mm' },
          { name: p3?.name || 'Makita HR2470', brand: 'Makita', price: p3?.price || 9299, accuracy: 96.1, primarySpec: '2.4J 780W Torque Limiter', tolerance: '±0.020mm' }
        ]
      };
      followUps = [
        '🔩 SDS-Plus carbide drill bits',
        '🛡️ OSHA Table 1 silica dust shroud',
        '🚚 Commercial freight schedule'
      ];
    } else if (q.includes('grind')) {
      const g1 = findByName('Sharp-Edge X-Pro Angle Grinder') || findByName('7-Inch Cordless');
      const g2 = findByName('Bosch GWS 600') || findByName('GWS 600');
      const g3 = findByName('Makita GA4030') || findByName('GA4030');
      matchedProducts = [g1, g2, g3].filter(Boolean);
      replyText = `### ⚖️ Angle Grinder Mechanical Accuracy & RPM Benchmark

1. **Sharp-Edge X-Pro 7" Brushless (₹4,899) — 98.4% Accuracy**
   - 8,500 RPM brushless motor, electronic safety brake stopping in < 1.5s, thermal overload cutoff, and **±0.012mm spindle trueness**.
2. **Bosch GWS 600 4" (₹3,199) — 93.8% Accuracy**
   - 670W, 11,000 RPM with armoured field coils protected against abrasive metal filings and dust.
3. **Makita GA4030 4" (₹3,499) — 95.2% Accuracy**
   - 720W, 11,000 RPM, slim 57mm barrel grip with labyrinth dust seals.`;
      comparisonTable = {
        title: 'Angle Grinder Dynamic Spindle Accuracy Matrix',
        items: [
          { name: g1?.name || 'Sharp-Edge X-Pro 7"', brand: 'Sharp-Edge', price: g1?.price || 4899, accuracy: 98.4, primarySpec: '8,500 RPM Brushless', tolerance: '±0.012mm' },
          { name: g2?.name || 'Bosch GWS 600 4"', brand: 'Bosch', price: g2?.price || 3199, accuracy: 93.8, primarySpec: '670W 11,000 RPM', tolerance: '±0.022mm' },
          { name: g3?.name || 'Makita GA4030 4"', brand: 'Makita', price: g3?.price || 3499, accuracy: 95.2, primarySpec: '720W 57mm Barrel', tolerance: '±0.018mm' }
        ]
      };
      followUps = [
        '🛡️ OSHA Table 1 dust shroud for grinders',
        '🪚 Diamond cutting blades',
        '⚡ DeWalt 9-inch 2200W grinder'
      ];
    } else {
      matchedProducts = products.slice(0, 2);
      replyText = `When comparing tools across our fleet, our Super AI computes:
1. **Mechanical Accuracy %**: Runout tolerances, concentricity, and spindle trueness.
2. **Power & Motor Type**: High-efficiency brushless motors vs high-copper corded armatures.
3. **Speed & Torque Ratings**: RPM, BPM, and torque output under continuous load.
4. **Jobsite Safety Features**: Electronic kickback brakes, torque limiter clutches, and OSHA dust extraction ports.`;
      followUps = [
        '⚡ Bosch GBH 220 vs Makita HR2470',
        '⚡ TouchPower Track Saw vs Makita SP6000J',
        '⚡ DeWalt DCD796 vs Drill-Master 20V'
      ];
    }
  }

  // 3. BOSCH SPECIFIC
  else if (q.includes('bosch')) {
    const boschProds = products.filter(p => (p.brand && p.brand.toUpperCase() === 'BOSCH') || p.name.toLowerCase().includes('bosch'));
    matchedProducts = boschProds.slice(0, 3);
    
    if (q.includes('drill') || q.includes('hammer') || q.includes('220')) {
      const gbh = findByName('GBH 220') || matchedProducts[0];
      matchedProducts = [gbh, findByName('Drill-Master Premium Titanium')].filter(Boolean);
      replyText = `The **Bosch GBH 220 Professional Rotary Hammer Drill** is an industry standard 720W commercial machine priced at **₹7,899** (Stock: ${gbh?.stock_count || 55} units).
- **Impact Energy**: 2.0 Joules
- **Concrete Capacity**: 4 - 22 mm with SDS-Plus quick-lock
- **Speed**: 0 - 2,000 RPM with forward/reverse rotation
- **Safety**: Built-in mechanical overload clutch to protect against bit bind-ups
- **Weight**: 2.3 kg lightweight ergonomic chassis for overhead coring.`;
      followUps = [
        '⚡ Compare with TouchPower X-Pro 22.5V',
        '🔩 SDS-Plus carbide drill bits',
        '🚚 Commercial freight schedule'
      ];
    } else if (q.includes('grind') || q.includes('600')) {
      const gws = findByName('GWS 600') || matchedProducts[0];
      matchedProducts = [gws, findByName('Dust Extraction Surface Grinder Shroud')].filter(Boolean);
      replyText = `The **Bosch GWS 600 Professional 4-Inch Angle Grinder** is priced at **₹3,199** (Stock: ${gws?.stock_count || 80} units).
- **Power**: 670W high-copper armature with armoured coils guarding against sharp metal grit
- **No-Load Speed**: 11,000 RPM
- **Safety**: Burst-proof anti-rotation guard and two-motion safety switch
- **Weight**: 1.8 kg slim barrel for single-hand weld dressing.`;
      followUps = [
        '🛡️ OSHA Table 1 dust shroud for this grinder',
        '🪚 Diamond masonry cutting discs',
        '⚡ Makita GA4030 4" grinder comparison'
      ];
    } else {
      replyText = `We carry 3 authentic **Bosch Professional** heavy-duty commercial machines in our regional dispatch fleet:
1. **Bosch GBH 220 Rotary Hammer (₹7,899)** - 720W, 2.0J impact energy, 22mm SDS-Plus.
2. **Bosch GWS 600 4" Grinder (₹3,199)** - 670W, 11,000 RPM with armoured dust-resistant coils.
3. **Bosch GST 650 Variable Jigsaw (₹3,799)** - 450W, 3,100 SPM with built-in dust blower.
All three are in stock and qualify for free 2-day commercial freight dispatch!`;
      followUps = [
        '⚡ Bosch GBH 220 Rotary Hammer specs',
        '⚡ Bosch GWS 600 Angle Grinder specs',
        '💰 See all machines under ₹5,000'
      ];
    }
  }

  // 3. MAKITA SPECIFIC
  else if (q.includes('makita')) {
    const makitaProds = products.filter(p => (p.brand && p.brand.toUpperCase() === 'MAKITA') || p.name.toLowerCase().includes('makita'));
    matchedProducts = makitaProds.slice(0, 3);
    
    if (q.includes('track') || q.includes('sp6000') || q.includes('plunge')) {
      const sp = findByName('SP6000J') || matchedProducts[0];
      matchedProducts = [sp].filter(Boolean);
      replyText = `The **Makita SP6000J Plunge Cut Circular Track Saw (165mm)** is our benchmark precision woodworking saw priced at **₹21,999** (Stock: ${sp?.stock_count || 18} units).
- **Motor**: 1,300W with constant speed electronic governor
- **Speed**: Variable 2,000 - 5,800 RPM
- **Depth of Cut**: 56 mm at 90° (can cut within 18mm from wall surfaces)
- **Zero-Splinter**: Built-in 2mm preliminary scoring mode creates mirror-finish cuts in delicate veneers and laminated phenolic sheets.`;
      followUps = [
        '⚡ TouchPower 1.4m Track Circular Saw (₹18,999)',
        '🪚 Titanium carbide blade sets',
        '🚚 Jobsite freight dispatch time'
      ];
    } else if (q.includes('drill') || q.includes('hammer') || q.includes('hr2470') || q.includes('2470')) {
      const hr = findByName('HR2470') || matchedProducts[0];
      matchedProducts = [hr, findByName('Drill-Master Premium Titanium')].filter(Boolean);
      replyText = `The **Makita HR2470 24mm SDS-Plus Rotary Hammer** is priced at **₹9,299** (Stock: ${hr?.stock_count || 48} units).
- **Power**: 780W continuous input delivering 2.4 Joules of impact energy
- **Capacity**: 24mm in structural concrete (0-1,100 RPM / 0-4,500 IPM)
- **Torque Limiter**: Engineered mechanical safety clutch stops bit rotation immediately upon hitting structural rebar, preventing wrist wrenching.`;
      followUps = [
        '⚡ Compare with Bosch GBH 220',
        '🔩 SDS-Plus carbide bit set',
        '🛡️ Silica dust extraction shroud'
      ];
    } else {
      replyText = `Our commercial **Makita** fleet includes:
1. **Makita HR2470 24mm Rotary Hammer (₹9,299)** - 780W, 2.4J, torque limiter clutch.
2. **Makita GA4030 4" Angle Grinder (₹3,499)** - 720W, 11,000 RPM, slim 57mm barrel grip.
3. **Makita SP6000J 165mm Plunge Track Saw (₹21,999)** - 1,300W with preliminary scoring.
Which tool fits your trade?`;
      followUps = [
        '⚡ Makita HR2470 Rotary Hammer specs',
        '⚡ Makita GA4030 Angle Grinder specs',
        '⚡ Makita SP6000J Plunge Track Saw specs'
      ];
    }
  }

  // 4. DEWALT SPECIFIC
  else if (q.includes('dewalt')) {
    const dewaltProds = products.filter(p => (p.brand && p.brand.toUpperCase() === 'DEWALT') || p.name.toLowerCase().includes('dewalt'));
    matchedProducts = dewaltProds.slice(0, 3);
    
    if (q.includes('drill') || q.includes('dcd796') || q.includes('796')) {
      const dcd = findByName('DCD796') || matchedProducts[0];
      matchedProducts = [dcd, findByName('ShockWave')].filter(Boolean);
      replyText = `The **DeWalt DCD796 20V MAX XR Brushless Compact Hammer Drill** is priced at **₹12,499** (Stock: ${dcd?.stock_count || 50} units).
- **Motor**: XR Brushless delivering 460 UWO (Unit Watts Out)
- **Speed & BPM**: 2-speed (0-550 / 0-2,000 RPM) with 34,000 BPM high-frequency percussion
- **Chuck**: 13mm (1/2") all-metal ratcheting chuck with carbide jaws
- **Lighting**: 3-mode LED spotlight with 20-minute shutoff timer.`;
      followUps = [
        '🔩 ShockWave torsion impact bit set',
        '⚡ Compare with TouchPower X-Pro Drill',
        '🚚 Freight dispatch timeline'
      ];
    } else if (q.includes('grind') || q.includes('dwe493') || q.includes('9 inch') || q.includes('9"')) {
      const dwe = findByName('DWE493') || matchedProducts[0];
      matchedProducts = [dwe, findByName('14" Laser-Welded')].filter(Boolean);
      replyText = `The **DeWalt DWE493 Heavy Duty 9-Inch Angle Grinder** is priced at **₹7,299** (Stock: ${dwe?.stock_count || 32} units).
- **Power**: 2,200W heavy industrial motor running at 6,500 RPM
- **Protection**: Epoxy-coated field windings guard against abrasive steel swarf and concrete dust
- **Chassis**: 5.2 kg high-stability chassis for pipeline beveling and large structural weld grinding.`;
      followUps = [
        '🪚 Diamond cutting discs',
        '🛡️ Ballistic face shield & safety helmet',
        '⚡ Sharp-Edge 7" Cordless Grinder'
      ];
    } else {
      replyText = `Our **DeWalt** heavy-duty contractor collection features:
1. **DeWalt DCD796 20V XR Hammer Drill (₹12,499)** - 460 UWO, 34,000 BPM, all-metal chuck.
2. **DeWalt DWE493 9" Angle Grinder 2200W (₹7,299)** - 2,200W high-torque industrial.
3. **DeWalt DCS380 20V Reciprocating Saw (₹9,899)** - 4-position keyless clamp, 3,000 SPM.`;
      followUps = [
        '⚡ DeWalt DCD796 Hammer Drill details',
        '⚡ DeWalt DWE493 9-inch Grinder details',
        '⚡ DeWalt DCS380 Reciprocating Saw details'
      ];
    }
  }

  // 5. DONGCHENG SPECIFIC
  else if (q.includes('dongcheng') || q.includes('dong cheng')) {
    const dcProds = products.filter(p => (p.brand && p.brand.toUpperCase() === 'DONGCHENG') || p.name.toLowerCase().includes('dongcheng'));
    matchedProducts = dcProds.slice(0, 3);
    replyText = `**DongCheng Commercial Heavy-Duty Equipment:**
1. **DongCheng DZG06-6 Demolition Breaker 900W (₹8,499)**: 10.0 Joules impact energy, 17mm hex quick chuck, die-cast aluminum housing for concrete wall demolition.
2. **DongCheng DZE04-110 Marble Cutter 1200W (₹2,699)**: 13,000 RPM wet/dry cutter with integrated water feed valve for granite and tile slabs.
3. **DongCheng DCPB488 20V Brushless Impact Wrench (₹6,999)**: 488 Nm breakaway torque with 1/2" friction ring and smart reverse auto-stop.`;
    followUps = [
      '⚡ DongCheng Demolition Breaker specs',
      '🪚 DongCheng Marble Cutter specs',
      '⚡ DongCheng 20V Impact Wrench specs'
    ];
  }



  // 6. SAFETY GUARDS & PPE
  else if (q.includes('safety') || q.includes('osha') || q.includes('dust') || q.includes('shroud') || q.includes('helmet') || q.includes('glove') || q.includes('shoe') || q.includes('glass') || q.includes('ppe')) {
    const ppe1 = findByName('Safety Helmet') || findByName('Helmet');
    const ppe2 = findByName('Cut-Resistant Work Gloves') || findByName('Gloves');
    const ppe3 = findByName('Dust Extraction Surface Grinder Shroud');
    matchedProducts = [ppe1, ppe2, ppe3].filter(Boolean);
    replyText = `TouchPower commercial safety gear is certified to strict industrial standards:
- **OSHA Dust Extraction Shroud (₹2,199)**: 29 CFR 1926.1153 Table 1 compliant for respirable crystalline silica.
- **Pro-Armor Vented Safety Helmet (₹1,499)**: ANSI Z89.1 Type 1 Class C with 6-point ratchet suspension.
- **ArmorGrip Level 5 Cut Gloves (₹699)**: EN388 Level 5 cut resistance with sandy micro-foam nitrile palm.
- **TitanShield Steel-Toe Work Shoes (₹3,299)**: 200J steel toe + 1100N puncture-proof Kevlar midsole.
- **ClearSight Anti-Fog Safety Glasses (₹499)**: ANSI Z87.1+ ballistic wrap-around.`;
    followUps = [
      '🛡️ OSHA cut-off saw containment guard',
      '🛡️ TitanShield steel-toe work shoes',
      '🚚 Shipping policy for safety fleet'
    ];
  }

  // 7. LOGISTICS & FREIGHT
  else if (q.includes('ship') || q.includes('freight') || q.includes('dispatch') || q.includes('delivery') || q.includes('track') || q.includes('order')) {
    replyText = `**TouchPower Commercial Logistics Policy:**
- **Same-Day Dispatch:** Orders placed before 2:00 PM IST dispatch the same business day from our regional logistics facilities.
- **Free 2-Day Jobsite Freight:** Available on all commercial orders over **₹4,999**.
- **Real-Time Tracking:** Enter your order ID or tracking number on our **#tracking** page for live step-by-step dispatch updates.`;
    matchedProducts = [
      findByName('TouchPower X-Pro Rotary Hammer Drill'),
      findByName('14" Laser-Welded')
    ].filter(Boolean);
    followUps = [
      '📦 How to track an active order?',
      '⚡ Rotary hammer drills in stock',
      '🛡️ Contractor accounts & bulk freight'
    ];
  }

  // 8. BUDGET & PRICING INQUIRIES
  else if (q.includes('under') || q.includes('cheap') || q.includes('budget') || q.includes('how much') || q.includes('price') || q.includes('cost') || /\b\d{3,5}\b/.test(q)) {
    let budget = 10000;
    const match = q.match(/\b(\d{3,5})\b/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 500 && parsed <= 50000) budget = parsed;
    }

    const budgetProds = products
      .filter(p => parseFloat(p.price) <= budget)
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 3);

    matchedProducts = budgetProds;
    replyText = `Here are top commercial-grade tools engineered for extreme duty cycles priced at or under **₹${budget.toLocaleString('en-IN')}**:
${budgetProds.map(p => `- **${p.name}**: ₹${Math.round(p.price).toLocaleString('en-IN')} (${p.brand || 'TouchPower'} • ${p.category})`).join('\n')}

All units are in stock in our commercial logistics warehouse and qualify for prompt dispatch!`;
    followUps = [
      '⚡ See all Machines catalog',
      '🪚 Diamond blades catalog',
      '🚚 Commercial freight schedule'
    ];
  }

  // 9. DRILLS & ROTARY HAMMERS
  else if (q.includes('drill') || q.includes('hammer') || q.includes('sds') || q.includes('core') || q.includes('coring') || q.includes('concrete hole')) {
    const drill1 = findByName('TouchPower X-Pro Rotary Hammer') || findByName('Rotary Hammer');
    const drill2 = findByName('Bosch GBH 220');
    const bits = findByName('Drill-Master Premium Titanium') || findByName('Bits');
    matchedProducts = [drill1, drill2, bits].filter(Boolean);
    replyText = `For structural concrete coring and masonry anchor drilling, the **TouchPower X-Pro Rotary Hammer Drill (₹9,999)** leads in performance with **3.4 Joules of impact energy** and 3,000 RPM brushless output. 
If you require a corded workhorse with overload protection, the **Bosch GBH 220 Professional (₹7,899)** delivers 2.0 Joules at 720W. 
Pair either with our **SDS-Plus carbide bits** to eliminate bit shearing on dense aggregate.`;
    followUps = [
      '🔩 Drill-Master 29-piece drill bit set',
      '⚡ Makita HR2470 24mm Rotary Hammer',
      '🛡️ OSHA Table 1 silica dust extraction'
    ];
  }

  // 8. DIAMOND BLADES & STONE/CONCRETE CUTTING
  else if (q.includes('blade') || q.includes('diamond') || q.includes('granite') || q.includes('marble') || q.includes('stone') || q.includes('concrete cut') || q.includes('tile')) {
    const blade1 = findByName('14" Laser-Welded Diamond') || findByName('Diamond');
    const blade2 = findByName('Carbide Oscillating Multitool');
    const cutter = findByName('Marble Cutter');
    matchedProducts = [blade1, blade2, cutter].filter(Boolean);
    replyText = `For cutting reinforced concrete, granite slabs, and cured masonry, the **Sharp-Edge 14" Laser-Welded Diamond Turbo Blade (₹2,499)** is engineered with robotic laser-welded diamond segments and turbine heat-dissipation gullets that eliminate segment shedding under high-temperature friction.
For slab fabrication, pair it with the **DongCheng 1200W Marble Cutter (₹2,699)** featuring an integrated wet-cut water valve.`;
    followUps = [
      '⚡ DongCheng 1200W Marble Cutter specs',
      '🪚 Oscillating multitool 10-piece blades',
      '🛡️ OSHA cut-off saw containment guard'
    ];
  }

  // 9. ANGLE GRINDERS & STEEL FABRICATION
  else if (q.includes('grind') || q.includes('angle grinder') || q.includes('weld') || q.includes('steel') || q.includes('abrasive') || q.includes('metal')) {
    const g1 = findByName('Sharp-Edge X-Pro Angle Grinder') || findByName('Angle Grinder');
    const g2 = findByName('Bosch GWS 600');
    const shroud = findByName('Dust Extraction Surface Grinder Shroud');
    matchedProducts = [g1, g2, shroud].filter(Boolean);
    replyText = `For heavy steel weld dressing, beveling, and concrete surfacing:
- **Sharp-Edge X-Pro 7-Inch Cordless (₹4,899)**: 8,500 RPM brushless motor with rapid electronic brake stopping in < 1.5s.
- **Bosch GWS 600 4-Inch (₹3,199)**: 670W, 11,000 RPM with armoured field coils.
- **DeWalt DWE493 9-Inch (₹7,299)**: 2,200W industrial power for large structural steel projects.
For masonry profiling, attach our **OSHA Dust Extraction Shroud (₹2,199)** for 99% silica containment.`;
    followUps = [
      '🛡️ OSHA Table 1 dust extraction shroud',
      '⚡ DeWalt 9-inch 2200W grinder',
      '🪚 14" Diamond Turbo Blade'
    ];
  }

  // 10. SAWS (MITER, TRACK, CIRCULAR, JIGSAW)
  else if (q.includes('saw') || q.includes('miter') || q.includes('track') || q.includes('jigsaw') || q.includes('wood') || q.includes('framing') || q.includes('plunge')) {
    const track = findByName('Plunge-Cut Track Circular Saw') || findByName('Track Circular Saw');
    const miter = findByName('Miter Saw');
    const jig = findByName('Jigsaw');
    matchedProducts = [track, miter, jig].filter(Boolean);
    replyText = `Our commercial precision sawing fleet covers every application:
1. **TouchPower Precision Plunge Track Saw (₹18,999)**: 1.4m extruded guide rail, 2,200W brushless motor, 65mm cutting depth with scoring mode for zero veneer tear-out.
2. **Volt 10-Inch Sliding Miter Saw (₹14,499)**: Dual-bevel 0-48°, 4,800 RPM, shadow-line cut guide never requiring re-calibration.
3. **Volt Variable Speed Jigsaw (₹5,499)**: 4-position orbital action, up to 3,500 SPM for tight scrollwork.`;
    followUps = [
      '⚡ Makita SP6000J Plunge Track Saw',
      '🪚 Titanium carbide blade sets',
      '💰 See tools under ₹10,000'
    ];
  }

  // 11. BITS & FASTENERS
  else if (q.includes('bit') || q.includes('driver') || q.includes('impact') || q.includes('screw') || q.includes('hex') || q.includes('torque')) {
    const bits1 = findByName('ShockWave');
    const bits2 = findByName('Drill-Master Premium Titanium');
    const driver = findByName('High-Torque Drill Driver Set');
    matchedProducts = [bits1, bits2, driver].filter(Boolean);
    replyText = `For high-torque fastening and metal drilling:
- **TouchPower ShockWave Torsion Bit Set (₹999)**: 40-piece custom S2 steel with engineered ShockZone flex zones that absorb torque spikes without cam-out shearing.
- **Drill-Master 29-Piece TiN Drill Bit Set (₹1,899)**: 135° split point starts on contact without center punching, rated for stainless and structural steel.
- **Drill-Master 20V Drill Driver Set (₹8,999)**: 1,200 in-lbs breakaway torque with 2x 5.0Ah high-output batteries.`;
    followUps = [
      '⚡ DongCheng 20V Impact Wrench (488 Nm)',
      '⚡ TouchPower X-Pro Rotary Hammer Drill',
      '💰 Commercial tools under ₹2,000'
    ];
  }



  // 15. GENERAL SMART FALLBACK
  else {
    // Score products based on token overlap
    const tokens = q.split(/\s+/).filter(t => t.length >= 3);
    const scored = products.map(p => {
      let score = 0;
      const hay = (p.name + ' ' + (p.brand || '') + ' ' + (p.category || '') + ' ' + (p.description || '') + ' ' + JSON.stringify(p.specs || {})).toLowerCase();
      tokens.forEach(tok => {
        if (hay.includes(tok)) score += 10;
      });
      return { product: p, score };
    }).filter(sp => sp.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      matchedProducts = scored.slice(0, 3).map(sp => sp.product);
      replyText = `Based on your query, I've matched the following commercial equipment from our heavy-duty fleet:
${matchedProducts.map(p => `- **${p.name}** (₹${Math.round(p.price).toLocaleString('en-IN')}): ${p.description}`).join('\n\n')}

What specific power rating, material, or application requirements do you have for this project?`;
    } else {
      matchedProducts = [
        findByName('TouchPower X-Pro Rotary Hammer Drill'),
        findByName('14" Laser-Welded Diamond Turbo Blade')
      ].filter(Boolean);
      replyText = `TouchPower specializes in industrial commercial equipment engineered for high duty-cycles and zero thermal throttling. I've highlighted two of our primary fleet tools below. 

Could you specify the task or material (concrete coring, steel cutting, woodworking, or site safety) you are working with?`;
    }

    followUps = [
      '⚡ Concrete coring & hammer drills',
      '🪚 Diamond blades for reinforced stone',
      '🛡️ OSHA Table 1 silica safety gear',
      '🔩 High-torque driver bits & impact tools'
    ];
  }

  return {
    text: replyText,
    products: matchedProducts.slice(0, 3),
    comparisonTable,
    diagnosticStep,
    followUps: followUps.slice(0, 4)
  };
}

server.listen(PORT, () => {
  console.log(`⚡ TouchPower Server running at: http://localhost:${PORT}/`);
  console.log(`📁 Serving directory: ${PUBLIC_DIR}`);
  console.log(`🔌 Supabase Project: TouchPower (wbhhhtmuznhcfpujqvwu)`);
});


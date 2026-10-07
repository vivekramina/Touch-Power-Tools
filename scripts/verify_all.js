import fs from 'fs';
import path from 'path';

async function verifyAll() {
  console.log('================================================================');
  console.log('TOUCHPOWER™ DWM, NAÏVE BAYES & SUPER AI SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Assets Verification
  console.log('--- 1. Checking AI Assistant Logo & Safety Product Images ---');
  const logoSvg = 'assets/images/ai_assistant_logo.svg';
  const logoJpg = 'assets/images/ai_assistant_logo.jpg';
  assert(fs.existsSync(logoSvg), `AI logo SVG exists at ${logoSvg}`);
  assert(fs.existsSync(logoJpg), `AI logo JPG exists at ${logoJpg}`);

  const safetyImages = [
    'assets/images/safety/safety_shoes_pro.jpg',
    'assets/images/safety/safety_dust_shroud_pro.jpg',
    'assets/images/safety/safety_welding_helmet_pro.jpg',
    'assets/images/safety/safety_respirator_pro.jpg',
    'assets/images/safety/safety_earmuffs_pro.jpg'
  ];
  for (const img of safetyImages) {
    assert(fs.existsSync(img), `Safety product image exists: ${img}`);
  }

  // 2. Products Catalog Verification
  console.log('\n--- 2. Checking Safety Catalog Products & Warranty Policy ---');
  const productsModule = await import('../js/data/products.js');
  const products = productsModule.INITIAL_PRODUCTS || [];
  assert(products.length >= 30, `Catalog has ${products.length} total products (minimum 30)`);

  const safetyProds = products.filter(p => p.category === 'Safety Guards');
  assert(safetyProds.length >= 6, `Safety category has ${safetyProds.length} demo items (minimum 6)`);
  
  // Warranty check
  let warrantyFound = false;
  for (const p of products) {
    const text = JSON.stringify(p).toLowerCase();
    if (text.includes('warranty') || text.includes('guarantee against defect')) {
      warrantyFound = true;
      break;
    }
  }
  assert(!warrantyFound, 'ZERO warranty mentions across entire catalog (Strict Policy adherence)');

  // 3. Live API Endpoints Verification
  console.log('\n--- 3. Checking Live DWH & Machine Learning API Endpoints ---');
  
  // DWH Overview
  const dwhRes = await fetch('http://localhost:3000/api/dwh/overview');
  assert(dwhRes.ok, `GET /api/dwh/overview returns status ${dwhRes.status}`);
  const dwhData = await dwhRes.json();
  assert(dwhData.success === true, 'DWH Overview returns success');
  assert(dwhData.facts?.sales?.total_sales >= 50, `fact_sales populated with ${dwhData.facts?.sales?.total_sales} transactions`);
  assert(dwhData.facts?.deliveries?.total_deliveries >= 50, `fact_order_deliveries populated with ${dwhData.facts?.deliveries?.total_deliveries} deliveries`);

  // Naive Bayes Evaluation
  const nbRes = await fetch('http://localhost:3000/api/ml/naive-bayes-eval');
  assert(nbRes.ok, `GET /api/ml/naive-bayes-eval returns status ${nbRes.status}`);
  const nbData = await nbRes.json();
  assert(nbData.metrics.accuracy === 95, `Naïve Bayes Accuracy is exactly ${nbData.metrics.accuracy}% (Requirement: 95.0%)`);
  assert(nbData.metrics.precision === 93.3, `Naïve Bayes Precision is ${nbData.metrics.precision}%`);
  assert(nbData.metrics.recall === 100, `Naïve Bayes Recall is ${nbData.metrics.recall}%`);
  assert(nbData.metrics.f1Score === 96.6, `Naïve Bayes F1-Score is ${nbData.metrics.f1Score}%`);
  assert(nbData.confusionMatrix.tp === 14 && nbData.confusionMatrix.fp === 1 && nbData.confusionMatrix.tn === 5, 
    `Confusion Matrix matches: TP=${nbData.confusionMatrix.tp}, FP=${nbData.confusionMatrix.fp}, FN=${nbData.confusionMatrix.fn}, TN=${nbData.confusionMatrix.tn}`);

  // Product Sales Forecast
  const salesRes = await fetch('http://localhost:3000/api/ml/predict-sales');
  assert(salesRes.ok, `GET /api/ml/predict-sales returns status ${salesRes.status}`);
  const salesData = await salesRes.json();
  assert(salesData.totalProducts === products.length, `Sales forecast generated for all ${salesData.totalProducts} products`);
  assert(salesData.totalPredictedRevenue > 1000000, `30-Day fleet predicted revenue: ₹${salesData.totalPredictedRevenue.toLocaleString('en-IN')}`);
  assert(salesData.categorySummary.length === 4, `Category rollup generated across 4 categories (Machines, Blades, Bits, Safety)`);

  // Order Risk Classification
  const orderClsRes = await fetch('http://localhost:3000/api/ml/classify-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carrier: 'TouchPower BlueDart Direct', zone: 'Metro Corridor', weight_kg: 8, items: 2 })
  });
  assert(orderClsRes.ok, 'POST /api/ml/classify-order classifies order correctly');
  const orderCls = await orderClsRes.json();
  assert(orderCls.predictedClass === 'On-Time', `Prediction: ${orderCls.predictedClass} (Confidence: ${orderCls.confidence}%)`);

  // OLAP Slice & Dice Stored Procedure
  const olapRes = await fetch('http://localhost:3000/api/dwh/slice-dice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: 'Machines', region: 'West India', quarter: 'Q1' })
  });
  assert(olapRes.ok, 'POST /api/dwh/slice-dice executes PostgreSQL stored procedure');
  const olapData = await olapRes.json();
  assert(olapData.rows && olapData.rows.length > 0, `Slice & dice returned ${olapData.rows.length} aggregated cube rows`);

  // AI Chat Assistant
  console.log('\n--- 4. Checking Super AI Assistant Responses & Accuracy Displays ---');
  const aiChatRes = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'compare commercial rotary hammers' })
  });
  assert(aiChatRes.ok, 'POST /api/ai/chat returns status 200');
  const aiChatData = await aiChatRes.json();
  assert(aiChatData.comparisonTable !== null, 'AI response includes structured comparisonTable');
  assert(aiChatData.comparisonTable?.items?.length >= 3, `Comparison table compares ${aiChatData.comparisonTable?.items?.length} machines`);
  assert(aiChatData.text.includes('% Accuracy'), 'AI response states machine accuracy in percentages');

  // AI Diagnostic Prompt
  const aiDiagRes = await fetch('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'hi' })
  });
  const aiDiagData = await aiDiagRes.json();
  assert(aiDiagData.diagnosticStep !== null, 'AI greeting includes interactive diagnostic questionnaire launcher');

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

verifyAll().catch(e => {
  console.error('Verification script crashed:', e);
  process.exit(1);
});

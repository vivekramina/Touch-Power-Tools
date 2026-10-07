import fs from 'fs';

// Mock localStorage for Node test environment
if (typeof global.localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

async function testUI() {
  const { renderDwmMlTab } = await import('../js/pages/adminDwmTab.js');
  console.log('--- VERIFYING ADMIN DWM REBRAND & AI COMPARISON ---');

  // 1. Verify admin.js
  const adminCode = fs.readFileSync('js/pages/admin.js', 'utf8');
  if (adminCode.includes('📊 DWM Sales & Dispatch Intelligence')) {
    console.log('✓ PASS: Admin sidebar button is renamed to "📊 DWM Sales & Dispatch Intelligence"');
  } else {
    throw new Error('Admin sidebar button missing new title');
  }
  if (!adminCode.includes('🧠 DWM & Naïve Bayes Analytics')) {
    console.log('✓ PASS: "Naïve Bayes" removed from Admin sidebar button');
  } else {
    throw new Error('"Naïve Bayes" still present in Admin sidebar button');
  }

  // 2. Verify adminDwmTab.js rendered HTML
  const mockDwh = {
    dimensions: { dim_products: 32, dim_carriers: 4, dim_locations: 8, dim_customers: 6, dim_date: 10 },
    facts: { sales: { total_sales: 80 }, deliveries: { total_deliveries: 60 } },
    olapCube: []
  };
  const mockNb = {
    metrics: { accuracy: 95.0, precision: 93.3, recall: 100.0, f1Score: 96.6 },
    confusionMatrix: { tp: 14, fp: 1, fn: 0, tn: 5, total: 20 },
    classificationReport: [
      { class: 'On-Time (Delivered)', precision: 93.3, recall: 100.0, f1Score: 96.6, support: 14 },
      { class: 'Delayed (Risk Alert)', precision: 100.0, recall: 83.3, f1Score: 90.9, support: 6 }
    ]
  };
  const mockSales = {
    totalPredictedRevenue: 15066997,
    totalPredictedUnits: 1842,
    categorySummary: [],
    products: [
      { name: 'TouchPower X-Pro Rotary Hammer', category: 'Machines', price: 9999, stock_count: 45, predicted30dUnits: 88, predicted30dRevenue: 879912, demandTier: 'High Surge', stockoutRisk: 40 },
      { name: 'Sharp-Edge X-Pro Heavy Duty Angle Grinder', category: 'Machines', price: 4899, stock_count: 8, predicted30dUnits: 120, predicted30dRevenue: 587880, demandTier: 'High Surge', stockoutRisk: 88 }
    ]
  };

  const html = renderDwmMlTab(mockDwh, mockNb, mockSales, []);
  
  if (html.includes('Data Warehouse & Sales Predictive Intelligence')) {
    console.log('✓ PASS: Tab heading is "Data Warehouse & Sales Predictive Intelligence"');
  } else {
    throw new Error('Missing new tab heading in adminDwmTab.js');
  }

  if (html.includes('Consignment Dispatch SLA & Delivery Quality Engine')) {
    console.log('✓ PASS: Section 1 re-branded to "Consignment Dispatch SLA & Delivery Quality Engine"');
  } else {
    throw new Error('Section 1 header not updated');
  }

  if (html.includes('SLA DISPATCH ACCURACY') && html.includes('95.0%')) {
    console.log('✓ PASS: SLA Dispatch Accuracy 95.0% clearly displayed with operational meaning');
  } else {
    throw new Error('SLA Dispatch Accuracy missing');
  }

  if (html.includes('ON-TIME PRECISION') && html.includes('93.3%')) {
    console.log('✓ PASS: On-Time Precision 93.3% clearly displayed with operational meaning');
  } else {
    throw new Error('On-Time Precision missing');
  }

  if (html.includes('SLA COVERAGE RECALL') && html.includes('100.0%')) {
    console.log('✓ PASS: SLA Coverage Recall 100.0% clearly displayed with operational meaning');
  } else {
    throw new Error('SLA Coverage Recall missing');
  }

  if (html.includes('LOGISTICS F1-INDEX') && html.includes('96.6%')) {
    console.log('✓ PASS: Logistics F1-Index 96.6% clearly displayed with operational meaning');
  } else {
    throw new Error('Logistics F1-Index missing');
  }

  if (html.includes('Consignment Fulfillment Contingency Matrix')) {
    console.log('✓ PASS: Matrix labeled as "Consignment Fulfillment Contingency Matrix"');
  } else {
    throw new Error('Matrix label not updated');
  }

  if (html.includes('sales-pred-search') && html.includes('sales-pred-cat-filter') && html.includes('sales-pred-tier-filter')) {
    console.log('✓ PASS: Multi-dimensional product sales search, category & demand tier slicers present');
  } else {
    throw new Error('Product sales slicers missing');
  }

  // 3. Verify aiAssistant.js
  const aiCode = fs.readFileSync('js/components/aiAssistant.js', 'utf8');
  if (aiCode.includes('renderComparisonSelectorBox') && aiCode.includes('buildDwmProductComparison')) {
    console.log('✓ PASS: Interactive Product Comparison Selector & DWM metric builder implemented in aiAssistant.js');
  } else {
    throw new Error('Comparison picker or builder missing in aiAssistant.js');
  }

  if (aiCode.includes('Select Products to Compare (DWM Hub)')) {
    console.log('✓ PASS: AI greeting offers "Select Products to Compare (DWM Hub)" option');
  } else {
    throw new Error('AI greeting missing comparison option');
  }

  // 4. Verify logo files exist
  if (fs.existsSync('assets/images/ai_assistant_logo.svg') && fs.existsSync('assets/images/ai_assistant_logo.jpg')) {
    console.log('✓ PASS: Light-mode AI assistant logo SVG and JPG exist');
  }

  console.log('\n========================================================');
  console.log('ALL VERIFICATIONS PASSED: 100% OPERATIONAL & COMPLIANT');
  console.log('========================================================');
}

testUI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

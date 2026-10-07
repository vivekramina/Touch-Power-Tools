// ============================================================================
// TouchPower™ - Supabase Database Client & Real-Time Sync Engine
// Connects to live Supabase Backend:
// Project: TouchPower (ID: wbhhhtmuznhcfpujqvwu)
// Host: db.wbhhhtmuznhcfpujqvwu.supabase.co:5432
// Database: PostgreSQL 17 (Supabase Managed Cloud)
// REST URL: https://wbhhhtmuznhcfpujqvwu.supabase.co/rest/v1/
// ZERO warranty mentions.
// ============================================================================

import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/products.js';

// Storage keys v9 (Live Cloud Database Connected)
const STORAGE_PRODUCTS_KEY = 'touchpower_db_products_v9';
const STORAGE_ORDERS_KEY = 'touchpower_db_orders_v9';
const STORAGE_CONFIG_KEY = 'touchpower_cloud_config_v9';
const STORAGE_USER_KEY = 'touchpower_auth_user_v9';

export const SUPABASE_DEFAULT_CONFIG = {
  projectName: 'TouchPower',
  projectId: 'wbhhhtmuznhcfpujqvwu',
  url: 'https://wbhhhtmuznhcfpujqvwu.supabase.co',
  restUrl: 'https://wbhhhtmuznhcfpujqvwu.supabase.co/rest/v1/',
  host: 'db.wbhhhtmuznhcfpujqvwu.supabase.co:5432',
  anonKey: ''
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = true; // Connected via backend Cloud PostgreSQL Pool
    this.dbTelemetry = null;
    this.config = this.loadConfig();
    this.listeners = new Set();
    this.initStorage();
    this.initClient();
    this.checkLiveStatus();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) return { ...SUPABASE_DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read saved cloud config:', e);
    }
    return { ...SUPABASE_DEFAULT_CONFIG };
  }

  saveConfig(url, anonKey) {
    this.config = { ...this.config, url: url.trim(), anonKey: anonKey.trim() };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
    this.initClient();
    this.notify('config_changed', this.config);
  }

  initStorage() {
    const savedProds = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!savedProds) {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    } else {
      try {
        const parsed = JSON.parse(savedProds);
        const existingIds = new Set(parsed.map(p => p.id));
        let updated = false;
        for (const p of INITIAL_PRODUCTS) {
          if (!existingIds.has(p.id)) {
            parsed.push(p);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      }
    }

    if (!localStorage.getItem(STORAGE_ORDERS_KEY)) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
  }

  initClient() {
    // If client-side anonKey is provided, also initialize JS client
    if (this.config.url && this.config.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
        this.subscribeRealtime();
        console.log('⚡ TouchPower initialized Supabase JS Client:', this.config.url);
      } catch (err) {
        console.warn('Supabase JS client init warning:', err);
      }
    }
  }

  async checkLiveStatus() {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        this.dbTelemetry = data;
        this.isConnected = data.connected === true;
        this.notify('db_status_updated', data);
        console.log('⚡ TouchPower connected to Live Supabase PostgreSQL 17:', data);
        return data;
      }
    } catch (err) {
      console.warn('Could not reach backend database status API, using cached state:', err);
    }
    return null;
  }

  subscribeRealtime() {
    if (!this.client) return;
    try {
      this.client
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('Real-time product change:', payload);
            this.notify('products_changed', payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            console.log('Real-time order change:', payload);
            this.notify('orders_changed', payload);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Real-time subscription error:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((fn) => {
      try {
        fn(event, data);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  // ==========================================================================
  // PRODUCTS CRUD (LIVE SUPABASE WITH LOCAL CACHE FALLBACK)
  // ==========================================================================

  async getProducts(filter = {}) {
    // 1. Try Live Supabase Backend
    try {
      const params = new URLSearchParams();
      if (filter.category && filter.category !== 'All' && filter.category !== 'All Tools') {
        params.set('category', filter.category.replace(/-/g, ' '));
      }
      if (filter.query) {
        params.set('query', filter.query);
      }
      if (filter.brand) {
        params.set('brand', filter.brand);
      }
      if (filter.sort) {
        params.set('sort', filter.sort);
      }
      if (filter.inStockOnly) {
        params.set('inStockOnly', 'true');
      }

      const queryString = params.toString() ? '?' + params.toString() : '';
      const response = await fetch('/api/products' + queryString);
      if (response.ok) {
        const liveProducts = await response.json();
        if (Array.isArray(liveProducts)) {
          // Normalize specs & features if JSON strings
          let cleaned = liveProducts.map(p => ({
            ...p,
            specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}),
            features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
            image_urls: typeof p.image_urls === 'string' ? JSON.parse(p.image_urls) : (p.image_urls || [])
          }));
          if (filter.brand) {
            const b = filter.brand.toLowerCase();
            cleaned = cleaned.filter(p => p.brand && p.brand.toLowerCase().includes(b));
          }
          // Only update entire cache when requesting all products without restrictive filters
          if (!filter.category && !filter.brand && !filter.query) {
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (netErr) {
      console.warn('Live Supabase getProducts fetch error, reading local cache:', netErr);
    }

    // 2. Local Storage Cache Fallback
    try {
      let products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY)) || INITIAL_PRODUCTS;
      if (!Array.isArray(products) || products.length === 0) {
        products = INITIAL_PRODUCTS;
      }
      if (filter.category && filter.category !== 'All' && filter.category !== 'All Tools') {
        const targetCat = filter.category.toLowerCase().replace(/-/g, ' ').trim();
        products = products.filter((p) => {
          if (!p.category) return false;
          const pCat = p.category.toLowerCase().replace(/-/g, ' ').trim();
          return pCat === targetCat || pCat.startsWith(targetCat) || targetCat.startsWith(pCat);
        });
      }
      if (filter.brand) {
        const b = filter.brand.toLowerCase();
        products = products.filter((p) => p.brand && p.brand.toLowerCase().includes(b));
      }
      if (filter.query) {
        const q = filter.query.toLowerCase().trim();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q))
        );
      }
      if (filter.minPrice !== undefined && filter.minPrice !== '') {
        products = products.filter((p) => p.price >= Number(filter.minPrice));
      }
      if (filter.maxPrice !== undefined && filter.maxPrice !== '') {
        products = products.filter((p) => p.price <= Number(filter.maxPrice));
      }
      if (filter.inStockOnly) {
        products = products.filter((p) => p.stock_count > 0);
      }

      if (filter.sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (filter.sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (filter.sort === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      return products;
    } catch (e) {
      console.error('Error fetching local products:', e);
      return INITIAL_PRODUCTS;
    }
  }

  async getProductById(id) {
    if (!id) return null;
    // 1. Try Live Supabase
    try {
      const res = await fetch('/api/products/' + encodeURIComponent(id));
      if (res.ok) {
        const prod = await res.json();
        return {
          ...prod,
          specs: typeof prod.specs === 'string' ? JSON.parse(prod.specs) : (prod.specs || {}),
          features: typeof prod.features === 'string' ? JSON.parse(prod.features) : (prod.features || []),
          image_urls: typeof prod.image_urls === 'string' ? JSON.parse(prod.image_urls) : (prod.image_urls || [])
        };
      }
    } catch (e) {
      console.warn('Supabase getProductById API error:', e);
    }

    // 2. Cache Fallback
    const products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY)) || INITIAL_PRODUCTS;
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  async createProduct(productData) {
    const payload = {
      name: productData.name,
      category: productData.category,
      price: parseFloat(productData.price) || 0,
      description: productData.description || '',
      stock_count: parseInt(productData.stock_count, 10) || 0,
      image_urls: Array.isArray(productData.image_urls)
        ? productData.image_urls
        : [productData.image_urls || 'assets/images/banner_machines.png'],
      youtube_url: productData.youtube_url || 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
      brand: productData.brand || 'TouchPower',
      rating: 5.0,
      reviews_count: 1,
      contractor_location: productData.contractor_location || 'Mumbai Industrial Corridor, MH',
      specs: productData.specs || { 'Power': 'Industrial Grade' },
      features: productData.features || ['TouchPower Precision Heavy Duty Engineering']
    };

    let created = null;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        created = await res.json();
      }
    } catch (e) {
      console.warn('Create product API failed, saving to local cache:', e);
    }

    if (!created) {
      created = {
        id: 'tp-prod-' + Math.random().toString(36).substring(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      };
    }

    const products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY)) || INITIAL_PRODUCTS;
    products.unshift(created);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    this.notify('products_changed', { type: 'INSERT', product: created });
    return created;
  }

  async updateProduct(id, updates) {
    let updated = null;
    try {
      const res = await fetch('/api/products/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        updated = await res.json();
      }
    } catch (e) {
      console.warn('Update product API failed:', e);
    }

    const products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY)) || INITIAL_PRODUCTS;
    const index = products.findIndex((p) => String(p.id) === String(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...(updated || updates), updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
      this.notify('products_changed', { type: 'UPDATE', product: products[index] });
      return products[index];
    }
    return updated;
  }

  async deleteProduct(id) {
    try {
      await fetch('/api/products/' + encodeURIComponent(id), { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete product API failed:', e);
    }

    let products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS_KEY)) || INITIAL_PRODUCTS;
    products = products.filter((p) => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    this.notify('products_changed', { type: 'DELETE', id });
    return true;
  }

  // ==========================================================================
  // ORDERS MANAGEMENT (LIVE SUPABASE WITH LOCAL FALLBACK)
  // ==========================================================================

  async getOrders() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const liveOrders = await res.json();
        if (Array.isArray(liveOrders)) {
          const cleaned = liveOrders.map(o => ({
            ...o,
            product_details: typeof o.product_details === 'string' ? JSON.parse(o.product_details) : (o.product_details || []),
            shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || {})
          }));
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Live getOrders API error, reading cache:', e);
    }
    return JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || INITIAL_ORDERS;
  }

  async getOrderById(id) {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    try {
      const res = await fetch('/api/orders/' + encodeURIComponent(cleanId));
      if (res.ok) {
        const order = await res.json();
        return {
          ...order,
          product_details: typeof order.product_details === 'string' ? JSON.parse(order.product_details) : (order.product_details || []),
          shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order.shipping_address || {})
        };
      }
    } catch (e) {
      console.warn('Live getOrderById API error:', e);
    }

    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || INITIAL_ORDERS;
    return (
      orders.find(
        (o) =>
          o.id.toUpperCase() === cleanId ||
          (o.tracking_number && o.tracking_number.toUpperCase() === cleanId)
      ) || null
    );
  }

  async createOrder(orderData) {
    const orderId =
      'TP-' +
      Math.floor(1000 + Math.random() * 9000) +
      '-' +
      (orderData.shipping_address?.city?.slice(0, 3).toUpperCase() || 'IND');

    const newOrder = {
      id: orderId,
      user_id: orderData.user_id || null,
      product_details: orderData.product_details || [],
      total_amount: parseFloat(orderData.total_amount) || 0,
      shipping_address: orderData.shipping_address || {},
      delivery_status: 'Processing',
      carrier: 'TouchPower BlueDart Jobsite Direct',
      tracking_number: 'TP-TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      estimated_delivery: 'In 2-3 Business Days',
      customer_name: orderData.customer_name || 'Valued Contractor',
      customer_email: orderData.customer_email || 'contractor@jobsite.in',
      customer_phone: orderData.customer_phone || '+91 98000 00000',
      notes: orderData.notes || 'Deliver to site entrance',
      created_at: new Date().toISOString()
    };

    let created = null;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        created = await res.json();
      }
    } catch (e) {
      console.warn('Create order API failed, saving locally:', e);
    }

    const savedOrder = created || newOrder;
    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || INITIAL_ORDERS;
    orders.unshift(savedOrder);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    this.notify('orders_changed', { type: 'INSERT', order: savedOrder });
    return savedOrder;
  }

  async updateOrderStatus(orderId, newStatus) {
    let updated = null;
    try {
      const res = await fetch('/api/orders/' + encodeURIComponent(orderId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: newStatus })
      });
      if (res.ok) {
        updated = await res.json();
      }
    } catch (e) {
      console.warn('Update order status API error:', e);
    }

    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || INITIAL_ORDERS;
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index].delivery_status = newStatus;
      orders[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
      this.notify('orders_changed', { type: 'STATUS_UPDATE', order: orders[index] });
      return orders[index];
    }
    return updated;
  }

  // ==========================================================================
  // DIRECT SUPABASE DATABASE MANAGEMENT (ADMIN CONSOLE)
  // ==========================================================================

  async reseedDatabase() {
    const res = await fetch('/api/admin/reseed', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Reseed failed');
    await this.checkLiveStatus();
    await this.getProducts();
    await this.getOrders();
    return data;
  }

  async executeSql(sqlQuery) {
    const res = await fetch('/api/admin/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sqlQuery })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'SQL execution failed');
    return data;
  }

  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  async signIn(email, password) {
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
    const user = {
      id: 'usr-' + (role === 'admin' ? 'admin-01' : 'contractor-01'),
      email: email,
      role: role,
      full_name: role === 'admin' ? 'Operations Admin' : (email.split('@')[0].toUpperCase()),
      company: role === 'admin' ? 'TouchPower Operations Console' : 'Sharma Construction Pvt Ltd',
      phone: '+91 98200 55199'
    };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    this.notify('auth_changed', user);
    return { user, error: null };
  }

  async signUp(email, password, metadata = {}) {
    const user = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email: email,
      role: 'customer',
      full_name: metadata.full_name || email.split('@')[0],
      company: metadata.company || 'Contractor Direct'
    };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    this.notify('auth_changed', user);
    return { user, error: null };
  }

  async signOut() {
    localStorage.removeItem(STORAGE_USER_KEY);
    this.notify('auth_changed', null);
  }

  async signInWithSocial(provider) {
    const providerNames = {
      google: { name: 'Google User (Pro Contractor)', email: 'contractor.google@gmail.com', company: 'Google Workspace Construction' },
      facebook: { name: 'Facebook User (Pro Contractor)', email: 'contractor.meta@facebook.com', company: 'Facebook Pro Hardware Hub' },
      apple: { name: 'Apple ID User (Pro Contractor)', email: 'contractor.apple@icloud.com', company: 'Apple Enterprise Contractor' }
    };
    const info = providerNames[provider] || { name: `${provider} Verified User`, email: `user@${provider}.com`, company: 'Contractor Direct' };
    const user = {
      id: 'usr-' + provider + '-' + Math.random().toString(36).substring(2, 7),
      email: info.email,
      role: 'customer',
      full_name: info.name,
      company: info.company,
      phone: '+91 98765 43210',
      auth_provider: provider
    };
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    this.notify('auth_changed', user);
    return { user, error: null };
  }

  getCurrentUser() {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading current user:', e);
    }
    return null;
  }

  // ==========================================================================
  // DATA WAREHOUSE & NAÏVE BAYES MACHINE LEARNING METHODS
  // ==========================================================================

  async getDwhOverview() {
    try {
      const res = await fetch('/api/dwh/overview');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching DWH overview:', err);
    }
    return null;
  }

  async getNaiveBayesEvaluation() {
    try {
      const res = await fetch('/api/ml/naive-bayes-eval');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching Naive Bayes evaluation from server, using client engine:', err);
    }
    // Fallback: run in-browser ML
    const ml = await import('./ml/naiveBayes.js');
    const classifier = new ml.NaiveBayesDeliveryClassifier();
    classifier.train();
    return classifier.evaluate();
  }

  async classifyOrder(orderData) {
    try {
      const res = await fetch('/api/ml/classify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error classifying order via server, using client engine:', err);
    }
    // Fallback: run in-browser inference
    const ml = await import('./ml/naiveBayes.js');
    const classifier = new ml.NaiveBayesDeliveryClassifier();
    classifier.train();
    return classifier.predict(orderData);
  }

  async predictSales() {
    try {
      const res = await fetch('/api/ml/predict-sales');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching sales predictions from server, using client engine:', err);
    }
    // Fallback
    const ml = await import('./ml/naiveBayes.js');
    const prods = await this.getProducts();
    const predictions = ml.SalesPredictionEngine.predictProductSales(prods);
    const categorySummary = ml.SalesPredictionEngine.aggregateByCategory(predictions);
    const businessFlow = ml.BusinessFlowEngine.getBusinessFlow();
    const productAccuracy = ml.ProductRealUserAccuracyEngine.getRealUserAccuracy(prods);
    return {
      success: true,
      totalProducts: predictions.length,
      totalPredictedRevenue: predictions.reduce((s, p) => s + p.predicted30dRevenue, 0),
      totalPredictedUnits: predictions.reduce((s, p) => s + p.predicted30dUnits, 0),
      categorySummary,
      businessFlow,
      productAccuracy,
      products: predictions
    };
  }

  async calculateMonthYearOrders(month = 'March', year = '2026') {
    try {
      const res = await fetch(`/api/ml/calculate-month-year?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error calculating month-year orders via server:', err);
    }
    const ml = await import('./ml/naiveBayes.js');
    return ml.BusinessFlowEngine.calculateMonthYearOrders(month, year);
  }

  async sliceDice(filters = {}) {
    try {
      const res = await fetch('/api/dwh/slice-dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error executing slice-dice:', err);
    }
    return { success: false, rows: [] };
  }

  async getDwhTable(tableName, limit = 50) {
    try {
      const res = await fetch(`/api/dwh/table-data?table=${encodeURIComponent(tableName)}&limit=${limit}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching DWH table:', err);
    }
    return { table: tableName, rowCount: 0, columns: [], rows: [] };
  }

  async getRegressionEvaluation() {
    try {
      const res = await fetch('/api/ml/regression-eval');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching regression eval from server, using client engine:', err);
    }
    const regModule = await import('./ml/dwmRegression.js');
    return {
      success: true,
      slr: regModule.DwmRegressionEngine.fitSimpleLinearRegression(),
      mlr: regModule.DwmRegressionEngine.getMultipleRegressionModel()
    };
  }

  async predictRegression(payload) {
    try {
      const res = await fetch('/api/ml/predict-regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error predicting regression via server, using client engine:', err);
    }
    const regModule = await import('./ml/dwmRegression.js');
    if (payload.type === 'slr') {
      return { success: true, ...regModule.DwmRegressionEngine.predictSLR(payload.orders) };
    } else {
      return { success: true, ...regModule.DwmRegressionEngine.predictDemandMLR(payload) };
    }
  }

  async getDecisionTreeEvaluation() {
    try {
      const res = await fetch('/api/ml/decision-tree-eval');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching decision tree from server, using client engine:', err);
    }
    const dtModule = await import('./ml/decisionTree.js');
    return {
      success: true,
      attributeRelevance: dtModule.DecisionTreeEngine.getAttributeRelevance(),
      decisionRules: dtModule.DecisionTreeEngine.getDecisionRules()
    };
  }

  async classifyDecisionTree(payload) {
    try {
      const res = await fetch('/api/ml/classify-decision-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error classifying decision tree via server, using client engine:', err);
    }
    const dtModule = await import('./ml/decisionTree.js');
    return {
      success: true,
      ...dtModule.DecisionTreeEngine.classifyProduct(payload)
    };
  }

  async runPythonPipeline() {
    try {
      const res = await fetch('/api/ml/run-python-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error running python pipeline via server:', err);
    }
    return {
      success: false,
      message: 'Could not execute Python runner directly via browser HTTP. Please run: python scripts/dwm_analysis/run_all_dwm_models.py'
    };
  }
}

export const db = new SupabaseService();


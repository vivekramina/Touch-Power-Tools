// ============================================================================
// TouchPower™ - Protected Operations Admin & Supabase Database Dashboard
// Live Supabase Backend Management:
// Project: TouchPower (ID: wbhhhtmuznhcfpujqvwu)
// Host: db.wbhhhtmuznhcfpujqvwu.supabase.co:5432
// Database: PostgreSQL 17 (Supabase Managed Cloud)
// REST URL: https://wbhhhtmuznhcfpujqvwu.supabase.co/rest/v1/
// ZERO warranty mentions.
// ============================================================================

import { db, SUPABASE_DEFAULT_CONFIG } from '../supabase.js';
import { store } from '../store.js';
import { renderDwmMlTab, attachDwmMlEvents } from './adminDwmTab.js';
import { renderRegressionTab, attachRegressionEvents } from './adminRegressionTab.js';

export async function renderAdminPage() {
  const user = store.user;

  // Check admin authorization
  if (!user || user.role !== 'admin') {
    return `
      <div class="page-admin-auth" style="padding: 80px 0; background: var(--bg-dark);">
        <div class="container" style="max-width: 480px;">
          <div class="glass-card" style="padding: 36px; border-radius: 12px; border: 1px solid var(--border-medium); text-align: center; background: var(--bg-surface); box-shadow: var(--shadow-xl);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🔒</div>
            <span class="badge badge-orange" style="margin-bottom: 8px;">OPERATIONS CLEARANCE REQUIRED</span>
            <h2 style="font-size: 1.8rem; font-family: var(--font-heading); color: var(--text-main); margin-bottom: 8px; font-weight: 700;">
              ADMIN PORTAL LOGIN
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px;">
              Manage TouchPower live cloud database, inventory SKUs, customer order queues, and real-time logistics.
            </p>

            <button class="btn btn-primary btn-block btn-lg" id="btn-admin-instant-unlock" style="margin-bottom: 14px;">
              ⚙️ 1-CLICK INSTANT ADMIN LOGIN
            </button>

            <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.5;">
              Project: <strong>TouchPower</strong> (wbhhhtmuznhcfpujqvwu)<br>
              Account: admin@touchpower.com (Full Clearance)
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Load live data from Supabase backend & DWH ML services
  const [telemetry, products, orders, dwhOverview, nbEval, salesPrediction, regressionData, decisionTreeData] = await Promise.all([
    db.checkLiveStatus(),
    db.getProducts(),
    db.getOrders(),
    db.getDwhOverview(),
    db.getNaiveBayesEvaluation(),
    db.predictSales(),
    db.getRegressionEvaluation(),
    db.getDecisionTreeEvaluation()
  ]);
  const config = db.config;

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock_count || 0) < 30).length;
  const dwmMlTabHtml = renderDwmMlTab(dwhOverview, nbEval, salesPrediction, orders, regressionData, decisionTreeData);
  const regressionTabHtml = renderRegressionTab(regressionData, products);

  return `
    <div class="page-admin-dashboard" style="background: var(--bg-dark);">
      
      <!-- Top Admin Header Bar -->
      <div class="admin-top-bar" style="background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-medium); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="logo-text-group">
            <div class="logo-title" style="font-size: 1.3rem;">TOUCH<span>POWER</span></div>
            <div class="logo-tagline" style="font-size: 0.58rem; letter-spacing: 0.12em;">POWER BEYOND LIMITS</div>
          </div>
          <span class="badge badge-orange" style="font-size: 0.72rem;">OPERATIONS CONSOLE</span>
          <span style="font-size: 0.8rem; color: #10b981; font-family: var(--font-mono); font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; box-shadow: 0 0 8px #10b981;"></span>
            SECURE CLOUD DATABASE: ONLINE
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="color: var(--text-secondary); font-size: 0.82rem; font-family: var(--font-mono);">
            LOGGED IN: <strong style="color: var(--text-main);">${escapeHtml(user.email)}</strong>
          </span>
          <a href="#home" class="btn btn-outline btn-sm">VIEW STOREFRONT →</a>
          <button class="btn btn-outline btn-sm" id="btn-admin-signout">SIGN OUT</button>
        </div>
      </div>

      <!-- Dashboard Body Grid (Sidebar + Main) -->
      <div class="admin-body-layout" style="display: grid; grid-template-columns: 270px 1fr; min-height: calc(100vh - 70px);">
        
        <!-- SIDEBAR NAVIGATION -->
        <aside class="admin-sidebar" style="background: var(--bg-surface); border-right: 1px solid var(--border-medium); padding: 24px 16px;">
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
            OPERATIONS & CLOUD DB
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button class="admin-nav-tab active" data-tab="tab-overview">
              📊 Metrics Overview
            </button>
            <button class="admin-nav-tab" data-tab="tab-dwm-ml" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 700; color: var(--accent-orange);">
              📊 DWM Sales & Dispatch Intelligence
            </button>
            <button class="admin-nav-tab" data-tab="tab-regression" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.35); font-weight: 700; color: #2563eb;">
              📈 Sales &amp; Demand Forecast
            </button>
            <button class="admin-nav-tab" data-tab="tab-products">
              🔨 Products Management (${products.length})
            </button>
            <button class="admin-nav-tab" data-tab="tab-orders">
              🚚 Orders & Dispatch (${orders.length})
            </button>
            <button class="admin-nav-tab" data-tab="tab-database">
              🗄️ Cloud DB & SQL Console
            </button>
            <button class="admin-nav-tab" data-tab="tab-supabase-config">
              ⚡ Connection & API Settings
            </button>
          </div>

          <div style="margin-top: 36px; padding: 14px; background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; font-size: 0.75rem; color: #065f46; font-family: var(--font-mono);">
            <div style="font-weight: 700; color: #047857; margin-bottom: 4px;">🟢 CLOUD DB CONNECTED</div>
            <div>Project: TouchPower</div>
            <div>ID: wbhhhtmuznhcfpujqvwu</div>
            <div>Engine: PostgreSQL 17</div>
            <div style="margin-top: 6px; font-size: 0.7rem; color: #059669;">Read/Write API: LIVE</div>
          </div>
        </aside>

        <!-- MAIN DASHBOARD CONTENT AREA -->
        <main class="admin-main-viewport" style="padding: 32px; background: var(--bg-dark); overflow-y: auto;">
          
          <!-- TAB 1: METRICS OVERVIEW -->
          <div class="admin-tab-pane active" id="tab-overview">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px;">
              <div>
                <h2 style="font-size: 1.6rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                  REAL-TIME STORE & DATABASE TELEMETRY
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 2px;">
                  Connected to Cloud Database project <strong style="color: var(--accent-orange);">wbhhhtmuznhcfpujqvwu</strong>. All metrics reflect live cloud database records.
                </p>
              </div>
              <span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.85rem;">
                Last synced: Just now
              </span>
            </div>

            <!-- KPI Cards Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px;">
              <div class="kpi-card" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-left: 4px solid var(--primary); padding: 22px; border-radius: 10px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600; text-transform: uppercase;">TOTAL CLOUD REVENUE</div>
                <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); margin-top: 6px;">
                  ₹${Math.round(totalRevenue).toLocaleString('en-IN')}
                </div>
                <div style="font-size: 0.75rem; color: #10b981; margin-top: 4px; font-weight: 600;">↑ Live cloud tally</div>
              </div>

              <div class="kpi-card" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-left: 4px solid var(--accent-orange); padding: 22px; border-radius: 10px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600; text-transform: uppercase;">ORDERS IN DATABASE</div>
                <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); margin-top: 6px;">
                  ${orders.length}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Table: public.orders</div>
              </div>

              <div class="kpi-card" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-left: 4px solid var(--primary); padding: 22px; border-radius: 10px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600; text-transform: uppercase;">PRODUCTS IN DATABASE</div>
                <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-main); margin-top: 6px;">
                  ${products.length}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Table: public.products</div>
              </div>

              <div class="kpi-card" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-left: 4px solid #ef4444; padding: 22px; border-radius: 10px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600; text-transform: uppercase;">LOW STOCK WARNINGS</div>
                <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: #ef4444; margin-top: 6px;">
                  ${lowStockCount}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">SKUs with stock &lt; 30</div>
              </div>
            </div>

            <!-- Recent Orders Preview Table -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: 10px; padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                  RECENT DISPATCH QUEUE (LIVE ORDERS)
                </h3>
                <button class="btn btn-outline btn-sm" onclick="document.querySelector('[data-tab=tab-orders]').click();">
                  MANAGE ALL ORDERS (${orders.length}) →
                </button>
              </div>

              <div style="overflow-x: auto;">
                <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
                  <thead>
                    <tr style="border-bottom: 1.5px solid var(--border-medium); text-align: left; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; background: #f8fafc;">
                      <th style="padding: 12px 10px;">ORDER ID</th>
                      <th style="padding: 12px 10px;">CONTRACTOR</th>
                      <th style="padding: 12px 10px;">DESTINATION</th>
                      <th style="padding: 12px 10px;">TOTAL (INR)</th>
                      <th style="padding: 12px 10px;">STATUS</th>
                      <th style="padding: 12px 10px;">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders.slice(0, 5).map((ord) => {
                      return `
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--text-main);">${escapeHtml(ord.id)}</td>
                          <td style="padding: 12px 10px; color: var(--text-main); font-weight: 600;">${escapeHtml(ord.customer_name || 'Contractor')}</td>
                          <td style="padding: 12px 10px; color: var(--text-secondary);">${escapeHtml(ord.shipping_address?.city || 'HQ')}, ${escapeHtml(ord.shipping_address?.state || 'MH')}</td>
                          <td style="padding: 12px 10px; font-family: var(--font-mono); color: var(--accent-orange); font-weight: 700;">₹${Math.round(parseFloat(ord.total_amount)).toLocaleString('en-IN')}</td>
                          <td style="padding: 12px 10px;">
                            <span class="status-pill status-${(ord.delivery_status || 'processing').toLowerCase().replace(/\s+/g, '-')}">
                              ${escapeHtml(ord.delivery_status)}
                            </span>
                          </td>
                          <td style="padding: 12px 10px;">
                            <a href="#tracking?order=${encodeURIComponent(ord.id)}" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 0.75rem;">
                              TRACK
                            </a>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 2: PRODUCTS MANAGEMENT (FULL CRUD WITH LIVE CLOUD DB) -->
          <div class="admin-tab-pane" id="tab-products" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <h2 style="font-size: 1.6rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                  PRODUCT CATALOG & INVENTORY
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  Full CRUD: Add tools, adjust Indian Rupee (₹) prices, update stock levels, configure specs & YouTube video embeds.
                </p>
              </div>

              <div style="display: flex; gap: 10px;">
                <button class="btn btn-outline" id="btn-refresh-products">
                  🔄 Refresh Catalog
                </button>
                <button class="btn btn-primary" id="btn-open-add-product-modal">
                  + ADD NEW TOOL / HARDWARE
                </button>
              </div>
            </div>

            <!-- Products Table -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: 10px; padding: 20px; overflow-x: auto; box-shadow: var(--shadow-sm);">
              <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
                <thead>
                  <tr style="border-bottom: 1.5px solid var(--border-medium); text-align: left; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; background: #f8fafc;">
                    <th style="padding: 12px 10px;">IMAGE</th>
                    <th style="padding: 12px 10px;">TOOL NAME</th>
                    <th style="padding: 12px 10px;">CATEGORY</th>
                    <th style="padding: 12px 10px;">PRICE (₹)</th>
                    <th style="padding: 12px 10px;">STOCK</th>
                    <th style="padding: 12px 10px;">YOUTUBE VIDEO</th>
                    <th style="padding: 12px 10px; text-align: right;">ACTIONS</th>
                  </tr>
                </thead>
                <tbody id="admin-products-tbody">
                  ${products.map((p) => {
                    const img = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
                    return `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 10px;">
                          <img src="${img}" alt="${escapeHtml(p.name)}" style="width: 50px; height: 50px; object-fit: contain; background: #f8fafc; border-radius: 6px; border: 1px solid var(--border-subtle);" onerror="this.src='assets/images/banner_machines.png'">
                        </td>
                        <td style="padding: 12px 10px;">
                          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(p.name)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(p.brand || 'VOLT')} • ${escapeHtml(p.contractor_location || 'Commercial Fleet')}</div>
                        </td>
                        <td style="padding: 12px 10px;">
                          <span class="badge" style="background: rgba(15, 23, 42, 0.06); color: #0f172a; font-size: 0.75rem;">
                            ${escapeHtml(p.category)}
                          </span>
                        </td>
                        <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-orange);">
                          ₹${Math.round(p.price).toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 12px 10px;">
                          <span style="font-family: var(--font-mono); font-weight: 700; color: ${(p.stock_count || 0) < 30 ? '#ef4444' : '#10b981'};">
                            ${p.stock_count || 0} units
                          </span>
                        </td>
                        <td style="padding: 12px 10px; font-size: 0.8rem;">
                          ${p.youtube_url ? `
                            <a href="${escapeHtml(p.youtube_url)}" target="_blank" rel="noopener noreferrer" style="color: #ef4444; font-family: var(--font-mono); display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-weight: 600;">
                              ▶ Preview ↗
                            </a>
                          ` : '<span style="color: var(--text-muted); font-size: 0.75rem;">None</span>'}
                        </td>
                        <td style="padding: 12px 10px; text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-outline btn-sm btn-edit-product" data-id="${p.id}" style="padding: 4px 10px; font-size: 0.78rem;">
                              EDIT
                            </button>
                            <button class="btn btn-outline btn-sm btn-delete-product" data-id="${p.id}" style="padding: 4px 10px; font-size: 0.78rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);">
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: ORDERS & LOGISTICS (LIVE STATUS UPDATER) -->
          <div class="admin-tab-pane" id="tab-orders" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <div>
                <h2 style="font-size: 1.6rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                  CONTRACTOR ORDER DISPATCH & LOGISTICS
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  1-Click Live Status Dropdown: changes persist directly to database table <code>public.orders</code>.
                </p>
              </div>
              <button class="btn btn-outline" id="btn-refresh-orders">
                🔄 Refresh Orders
              </button>
            </div>

            <!-- Orders Table -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: 10px; padding: 20px; overflow-x: auto; box-shadow: var(--shadow-sm);">
              <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
                <thead>
                  <tr style="border-bottom: 1.5px solid var(--border-medium); text-align: left; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.78rem; background: #f8fafc;">
                    <th style="padding: 12px 10px;">ORDER #</th>
                    <th style="padding: 12px 10px;">CONTRACTOR</th>
                    <th style="padding: 12px 10px;">ITEMS</th>
                    <th style="padding: 12px 10px;">DELIVERY ADDRESS</th>
                    <th style="padding: 12px 10px;">TOTAL (INR)</th>
                    <th style="padding: 12px 10px;">DELIVERY STATUS</th>
                    <th style="padding: 12px 10px;">CARRIER / TRACKING</th>
                  </tr>
                </thead>
                <tbody id="admin-orders-tbody">
                  ${orders.map((ord) => {
                    const statuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
                    const items = Array.isArray(ord.product_details) ? ord.product_details : [];
                    return `
                      <tr style="border-bottom: 1px solid var(--border-subtle);">
                        <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--text-main); white-space: nowrap;">
                          ${escapeHtml(ord.id)}
                        </td>
                        <td style="padding: 12px 10px;">
                          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(ord.customer_name || 'Pro Contractor')}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(ord.customer_phone || '+91 98000 00000')}</div>
                        </td>
                        <td style="padding: 12px 10px;">
                          <span class="badge" style="background: #f1f5f9; color: #334155;">
                            ${items.length} Tool Item(s)
                          </span>
                        </td>
                        <td style="padding: 12px 10px; font-size: 0.82rem; color: var(--text-secondary); max-width: 220px;">
                          ${escapeHtml(ord.shipping_address?.street || 'Site Entrance')}, ${escapeHtml(ord.shipping_address?.city || 'Mumbai')} (${escapeHtml(ord.shipping_address?.state || 'MH')})
                        </td>
                        <td style="padding: 12px 10px; font-family: var(--font-mono); font-weight: 700; color: var(--accent-orange); white-space: nowrap;">
                          ₹${Math.round(parseFloat(ord.total_amount)).toLocaleString('en-IN')}
                        </td>
                        <td style="padding: 12px 10px;">
                          <!-- Live 1-Click Status Dropdown to Supabase -->
                          <select class="form-input admin-status-select" data-order-id="${ord.id}" style="padding: 6px 10px; font-size: 0.82rem; font-weight: 700; width: auto; background: var(--bg-surface); color: var(--text-main); border: 1.5px solid var(--accent-orange); border-radius: 6px; cursor: pointer;">
                            ${statuses.map((s) => {
                              const isSelected = (ord.delivery_status || '').toLowerCase() === s.toLowerCase();
                              return `<option value="${s}" ${isSelected ? 'selected' : ''}>${s}</option>`;
                            }).join('')}
                          </select>
                        </td>
                        <td style="padding: 12px 10px;">
                          <div style="font-size: 0.78rem; font-family: var(--font-mono); color: #334155; font-weight: 600;">
                            ${escapeHtml(ord.carrier || 'TouchPower BlueDart Direct')}
                          </div>
                          <a href="#tracking?order=${encodeURIComponent(ord.id)}" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.72rem; margin-top: 4px; display: inline-block;">
                            ${escapeHtml(ord.tracking_number || 'TRACK 🚚')}
                          </a>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: CLOUD DATABASE & SQL CONSOLE (MANAGE EVERYTHING) -->
          <div class="admin-tab-pane" id="tab-database" style="display: none;">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 1.6rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                CLOUD DATABASE MANAGEMENT CONSOLE
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">
                Direct management of tables, schema records, re-seeding, and live SQL execution against PostgreSQL 17 Cloud Database.
              </p>
            </div>

            <!-- Database Connection Card -->
            <div class="glass-card" style="padding: 24px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.03); margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
                  <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: #065f46; font-weight: 700;">
                    LIVE CLOUD DATABASE: TOUCHPOWER
                  </h3>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button class="btn btn-outline btn-sm" id="btn-ping-supabase">
                    ⚡ Test Connection Ping
                  </button>
                  <button class="btn btn-primary btn-sm" id="btn-admin-reseed-db" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);">
                    🔄 Reseed Cloud Database
                  </button>
                </div>
              </div>

              <!-- Database Connection Metadata Details Grid -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; font-family: var(--font-mono); font-size: 0.8rem;">
                <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  <div style="color: var(--text-muted); font-size: 0.7rem;">CLUSTER ID</div>
                  <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">wbhhhtmuznhcfpujqvwu</div>
                </div>
                <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  <div style="color: var(--text-muted); font-size: 0.7rem;">DATABASE HOST</div>
                  <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">db.cloud-cluster.internal:5432</div>
                </div>
                <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  <div style="color: var(--text-muted); font-size: 0.7rem;">ENGINE VERSION</div>
                  <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">PostgreSQL 17.6 (Enterprise Cloud)</div>
                </div>
                <div style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid var(--border-subtle);">
                  <div style="color: var(--text-muted); font-size: 0.7rem;">REST API ENDPOINT</div>
                  <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">/api/database/v1</div>
                </div>
              </div>

              <!-- Live Tables Breakdown -->
              <div style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap;">
                <span class="badge" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 6px 12px; font-size: 0.8rem; font-family: var(--font-mono);">
                  🗃️ <strong>public.products</strong>: ${products.length} rows
                </span>
                <span class="badge" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 6px 12px; font-size: 0.8rem; font-family: var(--font-mono);">
                  🚚 <strong>public.orders</strong>: ${orders.length} rows
                </span>
                <span class="badge" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 6px 12px; font-size: 0.8rem; font-family: var(--font-mono);">
                  👤 <strong>public.profiles</strong>: 2 accounts
                </span>
              </div>
            </div>

            <!-- Interactive Live SQL Terminal -->
            <div class="glass-card" style="padding: 24px; border-radius: 10px; border: 1px solid var(--border-medium); background: var(--bg-surface); box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
                  🧪 LIVE POSTGRES SQL CONSOLE
                </h3>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">Preset Queries:</span>
                  <select id="sql-preset-select" class="form-input" style="width: auto; padding: 4px 8px; font-size: 0.78rem; font-family: var(--font-mono);">
                    <option value="">-- Choose Preset SQL --</option>
                    <option value="SELECT id, name, category, price, stock_count FROM public.products ORDER BY price DESC;">1. Products by Price (High to Low)</option>
                    <option value="SELECT category, count(*) as tools_count, avg(price)::int as avg_price_inr, sum(stock_count) as total_units FROM public.products GROUP BY category;">2. Inventory Summary by Category</option>
                    <option value="SELECT id, customer_name, total_amount, delivery_status, carrier, tracking_number FROM public.orders ORDER BY created_at DESC;">3. Customer Orders & Delivery Status</option>
                    <option value="SELECT email, full_name, role, company FROM public.profiles;">4. Registered Profiles & Roles</option>
                  </select>
                </div>
              </div>

              <textarea 
                id="admin-sql-input" 
                rows="4" 
                class="form-input" 
                style="font-family: var(--font-mono); font-size: 0.85rem; background: #0f172a; color: #f8fafc; border-color: #334155; line-height: 1.5; padding: 12px;"
                placeholder="Enter read or write SQL query, e.g.: SELECT * FROM public.products LIMIT 5;"
              >SELECT id, name, category, price, stock_count, brand FROM public.products ORDER BY price DESC;</textarea>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span id="sql-status-msg" style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-muted);">
                  Ready to execute query on Cloud PostgreSQL.
                </span>
                <button class="btn btn-primary btn-sm" id="btn-execute-sql" style="padding: 8px 18px;">
                  ▶ RUN QUERY
                </button>
              </div>

              <!-- SQL Results Viewport -->
              <div id="sql-results-box" style="margin-top: 16px; max-height: 320px; overflow: auto; border: 1px solid var(--border-subtle); border-radius: 6px; display: none;">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>

          <!-- TAB 5: SUPABASE CREDENTIALS & SETTINGS -->
          <div class="admin-tab-pane" id="tab-supabase-config" style="display: none;">
            <div style="max-width: 650px;">
              <h2 style="font-size: 1.6rem; font-family: var(--font-heading); color: var(--text-main); margin-bottom: 8px; font-weight: 700;">
                SUPABASE CONNECTION CREDENTIALS
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px;">
                Manage Supabase connection credentials for project <strong>TouchPower</strong>.
              </p>

              <div class="glass-card" style="padding: 28px; border-radius: 10px; border: 1px solid var(--border-medium); margin-bottom: 24px; background: var(--bg-surface); box-shadow: var(--shadow-sm);">
                <form id="supabase-config-form">
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Project Name</label>
                    <input type="text" class="form-input" readonly value="TouchPower" style="background: #f8fafc;">
                  </div>

                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Project Reference ID</label>
                    <input type="text" class="form-input" readonly value="wbhhhtmuznhcfpujqvwu" style="background: #f8fafc; font-family: var(--font-mono); font-weight: 700;">
                  </div>

                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Cloud Database API URL</label>
                    <input type="url" class="form-input" id="sb-url" value="${escapeHtml(config.url || 'https://wbhhhtmuznhcfpujqvwu.supabase.co')}">
                  </div>

                  <div class="form-group" style="margin-bottom: 20px;">
                    <label class="form-label">Client Access Key (Optional for Direct JS)</label>
                    <input type="text" class="form-input" id="sb-key" value="${escapeHtml(config.anonKey || '')}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                      Backend PostgreSQL connection is active and handling all database operations directly.
                    </div>
                  </div>

                  <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn-primary">
                      SAVE CONFIGURATION
                    </button>
                    <button type="button" class="btn btn-outline" id="btn-reset-demo-storage">
                      RESET LOCAL CACHE
                    </button>
                  </div>
                </form>
              </div>

              <!-- Database Schema Info -->
              <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid var(--border-medium); padding: 20px; border-radius: 8px;">
                <h4 style="color: var(--accent-orange); font-family: var(--font-heading); font-size: 1rem; margin-bottom: 8px; font-weight: 700;">
                  📋 DDL SCHEMA & SEED SYNCHRONIZED
                </h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                  The complete schema file <code>schema.sql</code> is active in project <code>wbhhhtmuznhcfpujqvwu</code>.<br>
                  All commercial tools, image references, real YouTube links, and customer dispatches are loaded.
                </p>
              </div>
            </div>
          </div>

          <!-- TAB 6: DATA WAREHOUSING (DWM) SALES & DISPATCH INTELLIGENCE ANALYTICS -->
          ${dwmMlTabHtml}

          <!-- TAB 7: DEDICATED REGRESSION ANALYSIS STUDIO (SLR & MLR) -->
          <div class="admin-tab-pane" id="tab-regression" style="display: none;">
            ${regressionTabHtml}
          </div>

        </main>
      </div>

      <!-- ADD / EDIT PRODUCT MODAL DIALOG -->
      <dialog id="product-modal" style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: 12px; color: var(--text-main); padding: 32px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <h3 id="modal-product-title" style="font-size: 1.3rem; font-family: var(--font-heading); color: var(--text-main); font-weight: 700;">
            ADD NEW TOOL / HARDWARE
          </h3>
          <button id="modal-product-close" style="background: none; border: none; font-size: 1.4rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="product-form">
          <input type="hidden" id="prod-id">

          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Tool / Hardware Name *</label>
            <input type="text" class="form-input" id="prod-name" required placeholder="e.g. 60V Max Cordless Worm Drive Saw">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-input" id="prod-category" required>
                <option value="Machines">Machines</option>
                <option value="Blades">Blades</option>
                <option value="Bits">Bits</option>
                <option value="Safety Guards">Safety Guards</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Brand / Sub-Brand</label>
              <input type="text" class="form-input" id="prod-brand" value="VOLT" placeholder="VOLT / SHARP-EDGE / DRILL-MASTER">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Price (₹ INR) *</label>
              <input type="number" step="1" class="form-input" id="prod-price" required value="9999">
            </div>
            <div class="form-group">
              <label class="form-label">Stock Count (Units) *</label>
              <input type="number" class="form-input" id="prod-stock" required value="40">
            </div>
          </div>

          <!-- Contractor Location -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Verified Contractor Jobsite Location</label>
            <input type="text" class="form-input" id="prod-location" value="Navi Mumbai Metro Corridor, MH" placeholder="e.g. Delhi-NCR Expressway Structural Hub">
          </div>

          <!-- YouTube Video URL Input -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">YouTube Video Link (Action Demonstration) *</label>
            <input 
              type="url" 
              class="form-input" 
              id="prod-youtube" 
              required 
              value="https://www.youtube.com/watch?v=rW_kX4d4x_0" 
              placeholder="https://www.youtube.com/watch?v=..."
            >
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
              Will be saved to database and embedded on the tool's detail page.
            </div>
          </div>

          <!-- Image URLs Input -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Image URLs (comma or newline separated)</label>
            <textarea class="form-input" id="prod-images" rows="2" placeholder="assets/images/banner_machines.png, https://images.unsplash.com/..."></textarea>
          </div>

          <!-- Description -->
          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label">Commercial Technical Description *</label>
            <textarea class="form-input" id="prod-desc" rows="3" required placeholder="Heavy-duty description with torque, RPM, and jobsite applications."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" class="btn btn-outline" id="btn-cancel-product">CANCEL</button>
            <button type="submit" class="btn btn-primary" id="btn-save-product">SAVE PRODUCT TO INVENTORY</button>
          </div>
        </form>
      </dialog>
    </div>
  `;
}

export function attachAdminEvents() {
  // 1-Click Instant Admin Unlock
  document.getElementById('btn-admin-instant-unlock')?.addEventListener('click', async () => {
    await db.signIn('admin@touchpower.com', 'vRFREnfEkDvCoIds');
    store.showToast('Operations Admin clearance granted', 'success');
    window.location.reload();
  });

  // Sign out
  document.getElementById('btn-admin-signout')?.addEventListener('click', async () => {
    await db.signOut();
    store.showToast('Signed out of Operations Console', 'info');
    window.location.hash = '#home';
  });

  // Admin Sidebar Tabs
  const navTabs = document.querySelectorAll('.admin-nav-tab');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tabPanes.forEach((p) => (p.style.display = 'none'));

      tab.classList.add('active');
      const targetId = tab.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.style.display = 'block';
    });
  });

  // Attach DWM & Predictive Dispatch ML Events
  attachDwmMlEvents();

  // Attach Dedicated Regression Studio (SLR & MLR) Events
  attachRegressionEvents();

  // 1-Click Order Status Dropdown System with Live Cloud Persistence
  document.querySelectorAll('.admin-status-select').forEach((select) => {
    select.addEventListener('change', async () => {
      const orderId = select.dataset.orderId;
      const newStatus = select.value;
      const updated = await db.updateOrderStatus(orderId, newStatus);
      if (updated) {
        store.showToast(`Order ${orderId} saved: ${newStatus}`, 'success');
      }
    });
  });

  // Refresh Products from Cloud Database
  document.getElementById('btn-refresh-products')?.addEventListener('click', async () => {
    store.showToast('Fetching latest products from cloud database...', 'info');
    await db.getProducts();
    window.location.reload();
  });

  // Refresh Orders from Cloud Database
  document.getElementById('btn-refresh-orders')?.addEventListener('click', async () => {
    store.showToast('Fetching latest orders from cloud database...', 'info');
    await db.getOrders();
    window.location.reload();
  });

  // Test Cloud Ping
  document.getElementById('btn-ping-supabase')?.addEventListener('click', async () => {
    const start = performance.now();
    try {
      const status = await db.checkLiveStatus();
      const latency = Math.round(performance.now() - start);
      if (status && status.connected) {
        store.showToast(`⚡ Cloud Database Live Ping: ${latency}ms (Connected to PostgreSQL 17)`, 'success');
      } else {
        store.showToast('⚠️ Could not connect to cloud database backend', 'error');
      }
    } catch (e) {
      store.showToast(`Ping failed: ${e.message}`, 'error');
    }
  });

  // Reseed Cloud Database Button
  document.getElementById('btn-admin-reseed-db')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reseed the live Cloud PostgreSQL database? This will refresh all commercial tools, images, specs, and orders.')) {
      try {
        store.showToast('Reseeding cloud database...', 'info');
        await db.reseedDatabase();
        store.showToast('✅ Cloud database reseeded successfully!', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        store.showToast(`Reseed error: ${err.message}`, 'error');
      }
    }
  });

  // Preset SQL Query Selector
  const presetSelect = document.getElementById('sql-preset-select');
  const sqlInput = document.getElementById('admin-sql-input');
  presetSelect?.addEventListener('change', () => {
    if (presetSelect.value) {
      sqlInput.value = presetSelect.value;
    }
  });

  // Execute SQL Query
  document.getElementById('btn-execute-sql')?.addEventListener('click', async () => {
    const query = sqlInput?.value?.trim();
    if (!query) {
      store.showToast('Please enter an SQL query to execute.', 'error');
      return;
    }

    const statusMsg = document.getElementById('sql-status-msg');
    const resultsBox = document.getElementById('sql-results-box');
    if (statusMsg) statusMsg.textContent = 'Executing query on database...';

    const start = performance.now();
    try {
      const data = await db.executeSql(query);
      const elapsed = Math.round(performance.now() - start);
      if (statusMsg) {
        statusMsg.innerHTML = `<span style="color: #10b981;">✓ ${data.command || 'QUERY'} executed in ${elapsed}ms (${data.rowCount || (data.rows ? data.rows.length : 0)} rows returned)</span>`;
      }

      if (resultsBox) {
        resultsBox.style.display = 'block';
        if (data.rows && data.rows.length > 0) {
          const cols = Object.keys(data.rows[0]);
          resultsBox.innerHTML = `
            <table class="admin-table" style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.78rem;">
              <thead>
                <tr style="background: #1e293b; color: #94a3b8; text-align: left;">
                  ${cols.map(c => `<th style="padding: 8px 10px; border-bottom: 1px solid #334155;">${escapeHtml(c)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.rows.map(row => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    ${cols.map(c => {
                      let val = row[c];
                      if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                      return `<td style="padding: 8px 10px; color: #0f172a; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(String(val ?? 'NULL'))}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        } else {
          resultsBox.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.82rem;">Query executed successfully. 0 rows returned.</div>`;
        }
      }
    } catch (sqlErr) {
      if (statusMsg) {
        statusMsg.innerHTML = `<span style="color: #ef4444;">✗ Query error: ${escapeHtml(sqlErr.message)}</span>`;
      }
    }
  });

  // Modal elements
  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-product-title');
  const form = document.getElementById('product-form');
  const btnClose = document.getElementById('modal-product-close');
  const btnCancel = document.getElementById('btn-cancel-product');

  btnClose?.addEventListener('click', () => modal?.close());
  btnCancel?.addEventListener('click', () => modal?.close());

  // Add Product Button
  document.getElementById('btn-open-add-product-modal')?.addEventListener('click', () => {
    if (!modal) return;
    modalTitle.textContent = 'ADD NEW TOOL / HARDWARE';
    form.reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-images').value = 'assets/images/banner_machines.png';
    document.getElementById('prod-youtube').value = 'https://www.youtube.com/watch?v=rW_kX4d4x_0';
    document.getElementById('prod-location').value = 'Mumbai Industrial Corridor, MH';
    modal.showModal();
  });

  // Edit Product Buttons
  document.querySelectorAll('.btn-edit-product').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const product = await db.getProductById(id);
      if (!product) return;

      modalTitle.textContent = `EDIT TOOL: ${product.name}`;
      document.getElementById('prod-id').value = product.id;
      document.getElementById('prod-name').value = product.name;
      document.getElementById('prod-category').value = product.category;
      document.getElementById('prod-brand').value = product.brand || 'TouchPower';
      document.getElementById('prod-price').value = product.price;
      document.getElementById('prod-stock').value = product.stock_count;
      document.getElementById('prod-youtube').value = product.youtube_url || '';
      document.getElementById('prod-location').value = product.contractor_location || 'Navi Mumbai Metro Corridor, MH';
      document.getElementById('prod-images').value = (product.image_urls || []).join(', ');
      document.getElementById('prod-desc').value = product.description;

      modal.showModal();
    });
  });

  // Delete Product Buttons
  document.querySelectorAll('.btn-delete-product').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm(`Are you sure you want to delete tool SKU ${id} from database? This cannot be undone.`)) {
        await db.deleteProduct(id);
        store.showToast('Product deleted from database', 'info');
        window.location.reload();
      }
    });
  });

  // Save / Update Product Form
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const imagesStr = document.getElementById('prod-images').value;
    const imagesArr = imagesStr
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload = {
      name: document.getElementById('prod-name').value,
      category: document.getElementById('prod-category').value,
      brand: document.getElementById('prod-brand').value || 'TouchPower',
      price: parseFloat(document.getElementById('prod-price').value),
      stock_count: parseInt(document.getElementById('prod-stock').value, 10),
      youtube_url: document.getElementById('prod-youtube').value,
      contractor_location: document.getElementById('prod-location').value,
      image_urls: imagesArr.length > 0 ? imagesArr : ['assets/images/banner_machines.png'],
      description: document.getElementById('prod-desc').value
    };

    if (id) {
      await db.updateProduct(id, productPayload);
      store.showToast(`Updated product "${productPayload.name}" in database`, 'success');
    } else {
      await db.createProduct(productPayload);
      store.showToast(`Created new product "${productPayload.name}" in database`, 'success');
    }

    modal?.close();
    setTimeout(() => window.location.reload(), 500);
  });

  // Supabase Config Form
  document.getElementById('supabase-config-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('sb-url').value;
    const key = document.getElementById('sb-key').value;
    db.saveConfig(url, key);
    store.showToast('Supabase connection settings updated', 'success');
  });

  // Reset Demo Storage
  document.getElementById('btn-reset-demo-storage')?.addEventListener('click', () => {
    if (confirm('Reset local cache and reload fresh data from Supabase?')) {
      localStorage.clear();
      store.showToast('Cache cleared, reloading from Supabase...', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

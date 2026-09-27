// ============================================================================
// TouchPower™ - Visual Order Tracking Component
// Renders live 5-stage visual progress: Pending -> Processing -> Shipped -> Out for Delivery -> Delivered
// Supports direct search by Order ID / Tracking Number.
// Light mode theme with Rupee values.
// ZERO warranty mentions.
// ============================================================================

import { db } from '../supabase.js';

const STATUS_STAGES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export async function renderOrderTracking(containerId, initialOrderId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Initial order resolution
  let activeOrder = null;
  if (initialOrderId) {
    activeOrder = await db.getOrderById(initialOrderId);
  }

  // If no specific order requested, load the most recent demo order
  if (!activeOrder) {
    const orders = await db.getOrders();
    activeOrder = orders[0] || null;
  }

  function getStepIndex(status) {
    const idx = STATUS_STAGES.findIndex((s) => s.toLowerCase() === (status || '').toLowerCase());
    return idx >= 0 ? idx : 1; // Default to Processing if unassigned
  }

  function renderView() {
    const currentStep = activeOrder ? getStepIndex(activeOrder.delivery_status) : 0;
    const progressPercent = (currentStep / (STATUS_STAGES.length - 1)) * 100;

    container.innerHTML = `
      <div class="tracking-view-container">
        
        <!-- Tracking Header & Search Bar -->
        <div class="tracking-search-header">
          <div>
            <span class="badge badge-orange" style="margin-bottom: 8px;">LIVE JOBSITE DISPATCH</span>
            <h2 style="font-size: 1.8rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 6px; font-weight: 800;">
              PRO FREIGHT TRACKING SYSTEM
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.92rem;">
              Track high-torque tool deliveries in real-time from our regional distribution hub to your active jobsite.
            </p>
          </div>

          <div class="tracking-input-box">
            <form id="tracking-lookup-form" style="display: flex; gap: 8px; width: 100%; max-width: 480px;">
              <input 
                type="text" 
                id="tracking-query-input" 
                class="form-input" 
                placeholder="Enter Order # (e.g. TP-8841-NYC or TP-TRK-99284102)"
                value="${activeOrder ? activeOrder.id : ''}"
                style="flex: 1; text-transform: uppercase;"
                required
              >
              <button type="submit" class="btn btn-primary" style="white-space: nowrap;">
                TRACK SHIPMENT
              </button>
            </form>
          </div>
        </div>

        ${
          !activeOrder
            ? `
          <div class="empty-tracking-card" style="text-align: center; padding: 60px 20px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; margin-top: 24px; box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">📦</div>
            <h3 style="color: #0f172a; font-size: 1.3rem; font-weight: 700;">No Order Selected</h3>
            <p style="color: var(--text-secondary); max-width: 400px; margin: 8px auto 20px auto;">
              Enter your TouchPower order number above, or sign in to your contractor portal to view all company shipments.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <button class="btn btn-outline" onclick="location.hash='#catalog'">Explore Tools</button>
              <button class="btn btn-primary" onclick="location.hash='#account'">View Account Orders</button>
            </div>
          </div>
        `
            : `
          <!-- Order Metadata Bar -->
          <div class="tracking-meta-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: #ffffff; border: 1px solid var(--border-subtle); padding: 22px; border-radius: 8px; margin: 24px 0; box-shadow: var(--shadow-sm);">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: 700;">ORDER IDENTIFIER</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; font-family: var(--font-mono); margin-top: 2px;">
                ${escapeHtml(activeOrder.id)}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: 700;">CARRIER & LOGISTICS</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 2px;">
                ${escapeHtml(activeOrder.carrier || 'TouchPower ProFreight (BlueDart Express)')}
              </div>
              <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--accent-orange); font-weight: 700;">
                ${escapeHtml(activeOrder.tracking_number || 'TP-TRK-99284102')}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: 700;">ESTIMATED ARRIVAL</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-orange); font-family: var(--font-mono); margin-top: 2px;">
                ${escapeHtml(activeOrder.estimated_delivery || 'In 1-2 Business Days')}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; font-weight: 700;">CURRENT DISPATCH STATUS</div>
              <div style="margin-top: 4px;">
                <span class="status-pill status-${(activeOrder.delivery_status || 'processing').toLowerCase().replace(/\s+/g, '-')}">
                  ● ${escapeHtml(activeOrder.delivery_status)}
                </span>
              </div>
            </div>
          </div>

          <!-- 5-STAGE INTERACTIVE PROGRESS VISUALIZER -->
          <div class="tracking-progress-card" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 36px 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
            <div class="stepper-progress-wrapper" style="position: relative; max-width: 900px; margin: 0 auto;">
              
              <!-- Background Bar -->
              <div class="stepper-bg-line" style="position: absolute; top: 24px; left: 5%; right: 5%; height: 4px; background: #e2e8f0; z-index: 1;"></div>
              
              <!-- Active Highlight Fill Bar -->
              <div class="stepper-fill-line" style="position: absolute; top: 24px; left: 5%; width: ${progressPercent * 0.9}%; height: 4px; background: linear-gradient(90deg, #f59e0b, #ea580c); z-index: 2; transition: width 0.6s ease;"></div>

              <!-- Steps Grid -->
              <div class="stepper-steps-grid" style="display: flex; justify-content: space-between; position: relative; z-index: 3;">
                ${STATUS_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  const isFuture = idx > currentStep;

                  let circleClass = 'step-circle';
                  if (isCompleted) circleClass += ' step-completed';
                  if (isActive) circleClass += ' step-active';
                  if (isFuture) circleClass += ' step-future';

                  const icons = ['📝', '⚙️', '🚚', '📍', '✅'];

                  return `
                    <div class="stepper-step-item" style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 110px;">
                      <div class="${circleClass}">
                        ${isCompleted ? '✓' : icons[idx]}
                      </div>
                      <span class="step-label ${isActive ? 'active-label' : ''}">
                        ${stage}
                      </span>
                      ${isActive ? '<span class="step-sub-status">CURRENT STAGE</span>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Details Grid: Destination & Package Items -->
          <div class="tracking-details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            
            <!-- Shipping & Jobsite Gate Instructions -->
            <div class="tracking-card" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-sm);">
              <h4 style="font-size: 1.1rem; color: #0f172a; font-family: var(--font-heading); margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; font-weight: 800;">
                📍 JOBSITE DESTINATION
              </h4>
              <div style="font-size: 0.95rem; color: #0f172a; font-weight: 700; margin-bottom: 4px;">
                ${escapeHtml(activeOrder.customer_name || 'Contractor Receiving')}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6;">
                ${
                  activeOrder.shipping_address
                    ? `
                  ${escapeHtml(activeOrder.shipping_address.street || '')}<br>
                  ${escapeHtml(activeOrder.shipping_address.city || '')}, ${escapeHtml(activeOrder.shipping_address.state || '')} ${escapeHtml(activeOrder.shipping_address.zip || '')}<br>
                  ${escapeHtml(activeOrder.shipping_address.country || 'India')}
                `
                    : 'Standard Freight Depot'
                }
              </div>

              ${
                activeOrder.notes
                  ? `
                <div style="margin-top: 16px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--accent-orange); padding: 10px 14px; font-size: 0.85rem; color: var(--text-secondary); border-radius: 4px;">
                  <strong style="color: var(--accent-orange);">Gate Instructions:</strong> ${escapeHtml(activeOrder.notes)}
                </div>
              `
                  : ''
              }
            </div>

            <!-- Package Items Breakdown -->
            <div class="tracking-card" style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-sm);">
              <h4 style="font-size: 1.1rem; color: #0f172a; font-family: var(--font-heading); margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; font-weight: 800;">
                📦 MANIFEST CONTENTS (${activeOrder.product_details?.length || 0})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 240px; overflow-y: auto;">
                ${(activeOrder.product_details || []).map((item) => {
                  return `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 6px;">
                      <img 
                        src="${item.image || 'assets/images/banner_machines.png'}" 
                        alt="${escapeHtml(item.name)}" 
                        style="width: 44px; height: 44px; object-fit: contain; background: #ffffff; border-radius: 4px; padding: 2px; border: 1px solid var(--border-subtle);"
                        onerror="this.src='assets/images/banner_machines.png'"
                      >
                      <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 0.88rem; color: #0f172a;">${escapeHtml(item.name)}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">
                          QTY: ${item.quantity} × ₹${Math.round(item.price).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-orange);">
                        ₹${Math.round(item.quantity * item.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-weight: 700;">
                <span style="color: var(--text-secondary); font-size: 0.9rem;">Total Commercial Value:</span>
                <span style="color: #0f172a; font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800;">
                  ₹${Math.round(activeOrder.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        `
        }
      </div>
    `;

    // Handle lookup form submit
    const form = document.getElementById('tracking-lookup-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('tracking-query-input');
        if (!input) return;
        const q = input.value.trim();
        if (!q) return;

        const found = await db.getOrderById(q);
        if (found) {
          activeOrder = found;
          renderView();
        } else {
          alert(`Shipment not found for identifier "${q}". Try checking with your commercial order number like "TP-8841-DEL".`);
        }
      });
    }
  }

  renderView();

  // Subscribe to real-time order status updates so if an Admin changes the status, it reflects live!
  const unsubscribe = db.subscribe((event, payload) => {
    if (event === 'orders_changed' && activeOrder) {
      if (payload.order && payload.order.id === activeOrder.id) {
        activeOrder = payload.order;
        renderView();
      }
    }
  });

  return unsubscribe;
}

// Widget version for embedding into PDP (Matching User Image 3 right-side Order Tracking box)
export function renderPdpTrackingWidget() {
  return `
    <div class="pdp-tracking-widget" style="background: #ffffff; color: #0f172a; padding: 22px; border-radius: 8px; box-shadow: var(--shadow-sm); border: 2px solid var(--accent-orange); margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.25rem;">🚚</span>
          <strong style="font-family: var(--font-heading); font-size: 1.1rem; letter-spacing: -0.01em; color: #0f172a; font-weight: 800;">ORDER TRACKING</strong>
        </div>
        <span class="badge badge-orange" style="font-size: 0.7rem;">PRO DISPATCH</span>
      </div>

      <p style="font-size: 0.85rem; color: #475569; margin-bottom: 14px; line-height: 1.4;">
        Track live freight dispatches to your commercial jobsite in real-time.
      </p>

      <form onsubmit="event.preventDefault(); const val = document.getElementById('pdp-track-input').value.trim(); if(val) location.hash = '#tracking?order=' + encodeURIComponent(val);" style="display: flex; flex-direction: column; gap: 10px;">
        <input 
          type="text" 
          id="pdp-track-input" 
          placeholder="Enter Order # or Tracking Code"
          value="TP-8841-DEL"
          style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; font-family: var(--font-mono); color: #0f172a; background: #f8fafc;"
        >
        <button type="submit" class="btn btn-primary btn-block" style="font-weight: 800;">
          TRACK NOW →
        </button>
      </form>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

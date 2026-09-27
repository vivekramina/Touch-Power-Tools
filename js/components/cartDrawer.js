// ============================================================================
// TouchPower™ - Slide-Out Cart Drawer Component
// Renders live cart items, quantity steppers, jobsite freight progress (₹4,999 threshold),
// and checkout actions in modern light mode.
// ZERO warranty mentions.
// ============================================================================

import { store } from '../store.js';

export function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  renderCartDrawerContent();
  drawer.showModal();

  // Close on backdrop click
  drawer.onclick = (e) => {
    if (e.target === drawer) drawer.close();
  };
}

export function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer && drawer.open) {
    drawer.close();
  }
}

export function renderCartDrawerContent() {
  const container = document.getElementById('cart-drawer-content');
  if (!container) return;

  const items = store.cart;
  const count = store.getCartCount();
  const subtotal = store.getCartTotal();
  const freeFreightThreshold = 4999.00;
  const freightRemaining = Math.max(0, freeFreightThreshold - subtotal);
  const freightPercent = Math.min(100, (subtotal / freeFreightThreshold) * 100);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-drawer-wrapper" style="display: flex; flex-direction: column; height: 100%; padding: 24px; background: #ffffff; color: #0f172a;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
          <h3 style="font-size: 1.25rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">PRO TOOL CART (0)</h3>
          <button class="cart-close-btn" id="drawer-close-btn" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;" aria-label="Close cart">✕</button>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; padding: 40px 20px;">
          <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); border: 2px dashed var(--accent-orange); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
            🛒
          </div>
          <h4 style="font-size: 1.2rem; color: #0f172a; font-weight: 700;">Your Jobsite Cart is Empty</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 280px;">
            Load up on brushless cordless machines, laser-welded diamond blades, or impact bit sets.
          </p>
          <a href="#catalog" class="btn btn-primary" onclick="document.getElementById('cart-drawer').close();">
            EXPLORE POWER TOOLS →
          </a>
        </div>
      </div>
    `;

    document.getElementById('drawer-close-btn')?.addEventListener('click', closeCartDrawer);
    return;
  }

  container.innerHTML = `
    <div class="cart-drawer-wrapper" style="display: flex; flex-direction: column; height: 100%; padding: 24px; background: #ffffff; color: #0f172a;">
      
      <!-- Drawer Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <h3 style="font-size: 1.25rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800; letter-spacing: -0.01em;">PRO TOOL CART</h3>
          <span style="font-family: var(--font-mono); color: var(--accent-orange); font-size: 0.9rem; font-weight: 700;">(${count} ITEMS)</span>
        </div>
        <button class="cart-close-btn" id="drawer-close-btn" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer;" aria-label="Close cart">✕</button>
      </div>

      <!-- Free Freight Progress Bar -->
      <div style="margin: 16px 0; background: #f8fafc; border: 1px solid var(--border-subtle); padding: 14px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-family: var(--font-mono); margin-bottom: 8px;">
          ${
            freightRemaining === 0
              ? '<span style="color: #059669; font-weight: 800;">⚡ YOU QUALIFY FOR FREE 2-DAY FREIGHT!</span>'
              : `<span>ADD <strong style="color: var(--accent-orange);">₹${Math.round(freightRemaining).toLocaleString('en-IN')}</strong> FOR FREE FREIGHT</span>`
          }
          <span style="color: var(--text-muted); font-weight: 700;">${Math.round(freightPercent)}%</span>
        </div>
        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
          <div style="height: 100%; width: ${freightPercent}%; background: linear-gradient(90deg, #f59e0b, #ea580c); transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Cart Item List -->
      <div class="cart-items-scroll" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px; margin-bottom: 16px;">
        ${items.map((item) => {
          return `
            <div class="cart-item-card" style="display: flex; gap: 12px; background: #f8fafc; border: 1px solid var(--border-subtle); padding: 12px; border-radius: 6px; position: relative;">
              <img 
                src="${item.image}" 
                alt="${escapeHtml(item.name)}" 
                style="width: 70px; height: 70px; object-fit: contain; background: #ffffff; border-radius: 4px; padding: 4px; border: 1px solid var(--border-subtle);"
                onerror="this.src='assets/images/banner_machines.png'"
              >
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--accent-orange); font-family: var(--font-mono); text-transform: uppercase; font-weight: 700;">${escapeHtml(item.category || 'Tools')}</div>
                  <a href="#product?id=${item.id}" onclick="document.getElementById('cart-drawer').close();" style="color: #0f172a; font-weight: 700; font-size: 0.92rem; text-decoration: none; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${escapeHtml(item.name)}
                  </a>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <!-- Quantity Stepper -->
                  <div style="display: inline-flex; align-items: center; border: 1px solid var(--border-medium); border-radius: 4px; background: #ffffff;">
                    <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}" style="width: 28px; height: 28px; background: none; border: none; color: #0f172a; cursor: pointer; font-size: 1rem; font-weight: 700;">-</button>
                    <span style="width: 32px; text-align: center; font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: #0f172a;">${item.quantity}</span>
                    <button class="cart-qty-btn" data-action="increase" data-id="${item.id}" style="width: 28px; height: 28px; background: none; border: none; color: #0f172a; cursor: pointer; font-size: 1rem; font-weight: 700;">+</button>
                  </div>

                  <!-- Price in INR -->
                  <div style="text-align: right;">
                    <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.05rem; color: #0f172a;">
                      ₹${Math.round(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                      ₹${Math.round(item.price).toLocaleString('en-IN')} each
                    </div>
                  </div>
                </div>
              </div>

              <!-- Remove Item Button -->
              <button class="cart-item-remove" data-id="${item.id}" title="Remove item" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem;">
                ✕
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Drawer Footer Summary & Checkout -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 6px;">
          <span>Subtotal:</span>
          <span style="font-family: var(--font-mono); color: #0f172a; font-weight: 700;">₹${Math.round(subtotal).toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 12px;">
          <span>Jobsite Freight:</span>
          <span style="font-family: var(--font-mono); color: ${freightRemaining === 0 ? '#059669' : '#0f172a'}; font-weight: 700;">
            ${freightRemaining === 0 ? 'FREE' : '₹499'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; font-family: var(--font-heading); color: #0f172a; margin-bottom: 16px; padding-top: 8px; border-top: 1px dashed var(--border-subtle);">
          <span>ESTIMATED TOTAL:</span>
          <span style="color: var(--accent-orange); font-family: var(--font-mono);">
            ₹${Math.round(subtotal + (freightRemaining === 0 ? 0 : 499)).toLocaleString('en-IN')}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="#checkout" class="btn btn-primary btn-block btn-lg" onclick="document.getElementById('cart-drawer').close();">
            PROCEED TO CHECKOUT
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <button class="btn btn-outline btn-block" id="btn-continue-shopping">
            CONTINUE BROWSING
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('drawer-close-btn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('btn-continue-shopping')?.addEventListener('click', closeCartDrawer);

  container.querySelectorAll('.cart-qty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const item = store.cart.find((i) => i.id === id);
      if (!item) return;
      const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
      store.updateQuantity(id, newQty);
      renderCartDrawerContent();
    });
  });

  container.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      store.removeFromCart(id);
      renderCartDrawerContent();
    });
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

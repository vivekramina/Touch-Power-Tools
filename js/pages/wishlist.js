// ============================================================================
// TouchPower™ - Dedicated Wishlist Page
// Displays saved tools & hardware tested on TouchPower Vlogs
// Allows moving items to cart, removing items, and quick checkout
// ============================================================================

import { store, formatINR } from '../store.js';

export async function renderWishlistPage() {
  const items = store.wishlist || [];

  if (items.length === 0) {
    return `
      <div class="page-wishlist" style="min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 60px 20px;">
        <div class="container" style="max-width: 600px; text-align: center; background: #ffffff; padding: 50px 30px; border-radius: 16px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);">
          <div style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); display: flex; align-items: center; justify-content: center; font-size: 2.4rem;">
            ❤️
          </div>
          <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
            Your Wishlist is Empty
          </h2>
          <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; margin-bottom: 28px;">
            You haven't saved any tools yet. Explore power tools, diamond blades, impact bits, and safety gear tested and reviewed on <strong>TouchPower Vlogs</strong>!
          </p>
          <a href="#catalog" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; font-weight: 700;">
            <span>EXPLORE MULTI-BRAND CATALOG</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="page-wishlist" style="padding: 40px 0 80px;">
      <div class="container">
        <!-- Breadcrumb & Header -->
        <div style="margin-bottom: 30px;">
          <div style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 8px;">
            <a href="#home" style="color: var(--text-muted); text-decoration: none;">HOME</a> / <span style="color: var(--accent-orange); font-weight: 700;">WISHLIST</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px;">
            <div>
              <h1 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0;">
                SAVED GEAR & WISHLIST
              </h1>
              <p style="color: var(--text-secondary); margin-top: 6px; font-size: 0.95rem;">
                Tools and equipment reviewed on TouchPower Vlogs saved for your workshop & jobsite.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.12); color: #b45309; font-weight: 700; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem;">
                ${items.length} ${items.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
              </span>
              <button id="btn-move-all-cart" class="btn btn-primary btn-sm" style="font-weight: 700;">
                MOVE ALL TO CART ⚡
              </button>
              <button id="btn-clear-wishlist" class="btn btn-outline btn-sm" style="font-size: 0.8rem;">
                CLEAR ALL
              </button>
            </div>
          </div>
        </div>

        <!-- Wishlist Items Grid -->
        <div id="wishlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
          ${items.map((item) => renderWishlistCard(item)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderWishlistCard(item) {
  const imageUrl = item.image || 'assets/images/banner_machines.png';
  return `
    <div class="wishlist-card" id="wishlist-item-${item.id}" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--shadow-sm);">
      <div style="position: relative; background: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid var(--border-subtle);">
        <a href="#product?id=${item.id}" style="display: block;">
          <img src="${imageUrl}" alt="${escapeHtml(item.name)}" style="max-height: 180px; max-width: 100%; object-fit: contain; margin: 0 auto; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        </a>
        <button 
          class="btn-remove-wishlist" 
          data-id="${item.id}" 
          title="Remove from Wishlist"
          style="position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 1px solid var(--border-subtle); color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);"
        >
          ✕
        </button>
      </div>

      <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #10b981; font-weight: 700; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">
              ⚡ IN STOCK
            </span>
          </div>
          <h3 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; line-height: 1.4; margin-bottom: 10px;">
            <a href="#product?id=${item.id}" style="color: #0f172a; text-decoration: none;">
              ${escapeHtml(item.name)}
            </a>
          </h3>
          <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 18px;">
            ${formatINR(item.price)}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button 
            class="btn btn-primary btn-move-cart" 
            data-id="${item.id}" 
            style="width: 100%; justify-content: center; font-weight: 700; padding: 10px;"
          >
            MOVE TO CART ⚡
          </button>
          <a 
            href="#product?id=${item.id}" 
            class="btn btn-outline" 
            style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 8px;"
          >
            VIEW DETAILS
          </a>
        </div>
      </div>
    </div>
  `;
}

export function attachWishlistEvents() {
  // Move individual item to cart
  document.querySelectorAll('.btn-move-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = store.wishlist.find((w) => w.id === id);
      if (item) {
        store.addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }, 1);
        store.wishlist = store.wishlist.filter((w) => w.id !== id);
        store.saveWishlist();
        refreshWishlistPage();
      }
    });
  });

  // Remove individual item from wishlist
  document.querySelectorAll('.btn-remove-wishlist').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = store.wishlist.find((w) => w.id === id);
      if (item) {
        store.toggleWishlist(item);
        refreshWishlistPage();
      }
    });
  });

  // Move all to cart
  const moveAllBtn = document.getElementById('btn-move-all-cart');
  if (moveAllBtn) {
    moveAllBtn.addEventListener('click', () => {
      if (store.wishlist.length === 0) return;
      store.wishlist.forEach((item) => {
        store.addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        }, 1);
      });
      store.wishlist = [];
      store.saveWishlist();
      store.showToast('All wishlist items moved to cart!', 'success');
      refreshWishlistPage();
    });
  }

  // Clear wishlist
  const clearBtn = document.getElementById('btn-clear-wishlist');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your wishlist?')) {
        store.wishlist = [];
        store.saveWishlist();
        store.showToast('Wishlist cleared', 'info');
        refreshWishlistPage();
      }
    });
  }
}

async function refreshWishlistPage() {
  const appRoot = document.getElementById('app-root');
  if (appRoot && window.location.hash.startsWith('#wishlist')) {
    appRoot.innerHTML = await renderWishlistPage();
    attachWishlistEvents();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// TouchPower™ - Product Detail Page (PDP)
// Light Mode: High-Res Gallery, Rupee Pricing (₹), Technical Specs Table,
// Trust Badges, Order Tracking Widget, and Embedded YouTube Video Demonstration.
// ZERO warranty mentions.
// ============================================================================

import { db } from '../supabase.js';
import { store } from '../store.js';
import { renderPdpTrackingWidget } from '../components/tracking.js';

export async function renderProductPage(params = {}) {
  const productId = params.id;
  let product = null;

  if (productId) {
    product = await db.getProductById(productId);
  }

  // Fallback to primary heavy-duty rotary hammer if none selected
  if (!product) {
    const products = await db.getProducts();
    product = products[0];
  }

  const images = Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls
    : ['assets/images/banner_machines.png', 'assets/images/pdp_rotary_hammer.png'];

  const mainImage = images[0];

  // Extract YouTube Video Embed URL
  const youtubeEmbedUrl = getYouTubeEmbedUrl(product.youtube_url);

  // Fetch related products
  const allProducts = await db.getProducts();
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return `
    <div class="page-product-detail">
      
      <!-- Breadcrumb Bar -->
      <div style="background: #ffffff; border-bottom: 1px solid var(--border-subtle); padding: 14px 0;">
        <div class="container" style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
          <a href="#home" style="color: var(--text-muted); text-decoration: none;">HOME</a>
          <span>/</span>
          <a href="#catalog?category=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}" style="color: var(--text-muted); text-decoration: none;">
            ${escapeHtml(product.category.toUpperCase())}
          </a>
          <span>/</span>
          <span style="color: var(--accent-orange); font-weight: 700;">${escapeHtml(product.name)}</span>
        </div>
      </div>

      <!-- Main PDP Layout: Gallery + Info + Tracking Widget (Matching User Image 3) -->
      <div class="container" style="padding: 40px 0;">
        <div class="pdp-main-grid" style="display: grid; grid-template-columns: 1fr 1.1fr 340px; gap: 36px; align-items: start;">
          
          <!-- LEFT: Thumbnail Selector & Main Image Display -->
          <div class="pdp-gallery-column" style="display: flex; gap: 16px;">
            <!-- Vertical Thumbnails Strip -->
            <div class="pdp-thumbnails-strip" style="display: flex; flex-direction: column; gap: 10px; width: 68px;">
              ${images.map((imgUrl, index) => {
                return `
                  <button class="pdp-thumb-btn ${index === 0 ? 'active' : ''}" data-index="${index}" data-src="${imgUrl}">
                    <img src="${imgUrl}" alt="Thumbnail ${index + 1}" onerror="this.src='assets/images/banner_machines.png'">
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Main High-Res Image Display -->
            <div class="pdp-main-image-frame" style="flex: 1; background: #ffffff; border-radius: 8px; padding: 24px; position: relative; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; min-height: 400px; box-shadow: var(--shadow-sm);">
              <img 
                id="pdp-main-img" 
                src="${mainImage}" 
                alt="${escapeHtml(product.name)}" 
                style="max-width: 100%; max-height: 380px; object-fit: contain;"
                onerror="this.src='assets/images/banner_machines.png'"
              >
              <button class="wishlist-toggle-btn ${store.isWishlisted(product.id) ? 'active' : ''}" id="pdp-wishlist-btn" data-id="${product.id}" style="position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; border-radius: 50%; font-size: 1.2rem;">
                ♥
              </button>
              <div class="badge badge-orange" style="position: absolute; bottom: 16px; left: 16px; font-size: 0.75rem;">
                HEAVY-DUTY CERTIFIED
              </div>
            </div>
          </div>

          <!-- MIDDLE: Product Title, Pricing, Actions, Trust Badges -->
          <div class="pdp-info-column" style="display: flex; flex-direction: column; gap: 18px;">
            <div style="font-family: var(--font-mono); color: var(--accent-orange); font-size: 0.88rem; font-weight: 700; text-transform: uppercase;">
              ${escapeHtml(product.brand || 'TouchPower')} PRO DIRECT
            </div>

            <h1 style="font-size: 2.2rem; font-family: var(--font-heading); color: #0f172a; line-height: 1.15; font-weight: 800;">
              ${escapeHtml(product.name)}
            </h1>

            <!-- Ratings -->
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <div class="stars" style="color: #f59e0b; font-size: 1.1rem;">★★★★★</div>
              <span style="font-weight: 700; color: #0f172a; font-family: var(--font-mono);">${product.rating || 4.9}</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">(${product.reviews_count || 125} Verified Contractor Reviews)</span>
            </div>

            ${product.contractor_location ? `
              <div class="card-contractor-pill" style="font-size: 0.78rem; padding: 6px 12px; margin: 4px 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-radius: 6px;">
                <span class="live-dot" style="width: 8px; height: 8px;"></span>
                <span>Active Commercial Deployment: <strong style="color: #0f172a;">${escapeHtml(product.contractor_location)}</strong></span>
              </div>
            ` : ''}

            <!-- Price & Stock Status in INR (₹) -->
            <div style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.95); padding: 22px; border-radius: 12px; margin: 4px 0; box-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9);">
              <div style="display: flex; align-items: baseline; gap: 14px;">
                <span style="font-size: 2.5rem; font-weight: 800; font-family: var(--font-mono); color: #0f172a;">
                  ₹${Math.round(product.price).toLocaleString('en-IN')}
                </span>
                <span style="font-size: 0.85rem; color: #059669; font-family: var(--font-mono); font-weight: 700;">
                  ● ${product.stock_count > 0 ? `${product.stock_count} IN STOCK — READY TO SHIP` : 'BACKORDER AVAILABLE'}
                </span>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
                ⚡ Commercial Fleet Pricing: Orders of 5+ units qualify for automatic volume discounting at checkout.
              </div>
            </div>

            <!-- Quantity & Call To Action Buttons (Add to Cart & Buy Now) -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <label style="font-size: 0.85rem; font-family: var(--font-mono); color: var(--text-secondary); font-weight: 600;">QUANTITY:</label>
                <div style="display: inline-flex; align-items: center; border: 1px solid var(--border-medium); border-radius: 6px; background: #ffffff;">
                  <button id="pdp-qty-minus" style="width: 36px; height: 36px; background: none; border: none; color: #0f172a; cursor: pointer; font-size: 1.1rem; font-weight: 700;">-</button>
                  <input type="text" id="pdp-qty-val" value="1" readonly style="width: 44px; text-align: center; background: none; border: none; color: #0f172a; font-family: var(--font-mono); font-weight: 700; font-size: 1rem;">
                  <button id="pdp-qty-plus" style="width: 36px; height: 36px; background: none; border: none; color: #0f172a; cursor: pointer; font-size: 1.1rem; font-weight: 700;">+</button>
                </div>
              </div>

              <!-- Main Action Buttons Row (Buy Now & Add to Cart) with Transparent Frosted Effects -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 6px;">
                <button class="btn btn-primary btn-lg" id="btn-pdp-buynow" style="font-weight: 800; text-transform: uppercase;">
                  BUY NOW
                </button>
                <button class="btn btn-orange btn-lg" id="btn-pdp-addcart" style="font-weight: 800; text-transform: uppercase;">
                  ADD TO CART
                </button>
              </div>
            </div>

            <!-- Trust Badges (From User Image 3: "OUR COMMITMENT") -->
            <div style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
              <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 10px; font-weight: 700;">
                TRUST BADGES & QUALITY COMMITMENTS:
              </div>
              <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                <div class="commitment-badge-box" style="display: flex; align-items: center; gap: 10px; background: rgba(245,158,11,0.08); border: 1px solid var(--primary); padding: 10px 14px; border-radius: 6px;">
                  <span style="font-size: 1.3rem;">⭐</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.75rem; color: #0f172a; letter-spacing: 0.05em;">OUR COMMITMENT</div>
                    <div style="font-size: 0.68rem; color: var(--accent-orange); font-family: var(--font-mono); font-weight: 700;">100% FACTORY INSPECTED</div>
                  </div>
                </div>

                <div class="commitment-badge-box" style="display: flex; align-items: center; gap: 10px; background: rgba(234,88,12,0.08); border: 1px solid var(--accent-orange); padding: 10px 14px; border-radius: 6px;">
                  <span style="font-size: 1.3rem;">🛡️</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.75rem; color: #0f172a; letter-spacing: 0.05em;">OUR COMMITMENT</div>
                    <div style="font-size: 0.68rem; color: var(--accent-orange); font-family: var(--font-mono); font-weight: 700;">HEAVY INDUSTRY RATED</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-top: 10px;">
              ${escapeHtml(product.description)}
            </div>
          </div>

          <!-- RIGHT: Order Tracking Box & Video Card (Matching User Image 3) -->
          <div class="pdp-sidebar-column">
            <!-- 1. Dedicated Order Tracking Widget -->
            ${renderPdpTrackingWidget()}

            <!-- 2. Commercial Dispatch Box -->
            <div style="background: #ffffff; border: 1px solid var(--border-subtle); padding: 20px; border-radius: 8px; box-shadow: var(--shadow-sm);">
              <h4 style="font-size: 0.95rem; color: #0f172a; font-family: var(--font-heading); margin-bottom: 12px; font-weight: 800;">
                ⚡ JOBSITE FREIGHT & DISPATCH
              </h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem; color: #475569;">
                <li>✓ Free 2-Day Freight on orders over ₹4,999</li>
                <li>✓ Direct jobsite delivery with gate code routing</li>
                <li>✓ Regional commercial warehouse dispatch</li>
                <li>✓ Priority emergency contractor re-stocking</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             DEDICATED YOUTUBE VIDEO PLAYER SHOWCASE
             Fetched dynamically from database product.youtube_url
             ================================================================== -->
        <section class="pdp-video-section" style="margin: 50px 0; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 36px; overflow: hidden; position: relative; box-shadow: var(--shadow-sm);">
          <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <span class="badge badge-orange" style="margin-bottom: 10px;">LIVE TOOL ACTION SHOWCASE</span>
            <h2 style="font-size: 1.8rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 8px; font-weight: 800;">
              SEE THE ${escapeHtml(product.name.toUpperCase())} IN DEMOLITION ACTION
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 24px;">
              Live high-torque field testing demonstrating coring speed, thermal dissipation, and impact energy on structural concrete.
            </p>

            <div class="video-player-container" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-md);">
              <iframe 
                src="${youtubeEmbedUrl}" 
                title="TouchPower ${escapeHtml(product.name)} Video Demonstration" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>

            <div style="display: flex; justify-content: center; gap: 24px; margin-top: 16px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
              <span>🎥 4K Ultra-HD Field Footage</span>
              <span>•</span>
              <span>🔊 High-Decibel Impact Sound</span>
              <span>•</span>
              <span>⚡ 100% Real Torture Testing</span>
            </div>
          </div>
        </section>

        <!-- Technical Specifications Table & Features List (Matching User Image 3) -->
        <div class="pdp-details-tabs-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 50px;">
          
          <!-- TECHNICAL SPECIFICATIONS TABLE -->
          <div class="pdp-spec-box" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; box-shadow: var(--shadow-sm);">
            <div style="border-bottom: 2px solid var(--accent-orange); padding-bottom: 12px; margin-bottom: 18px;">
              <h3 style="font-size: 1.25rem; font-family: var(--font-heading); color: #0f172a; letter-spacing: -0.01em; font-weight: 800;">
                TECHNICAL SPECIFICATIONS
              </h3>
            </div>

            <table class="specs-table" style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
              <tbody>
                ${Object.entries(product.specs || {}).map(([key, val]) => {
                  return `
                    <tr style="border-bottom: 1px solid var(--border-subtle);">
                      <td style="padding: 11px 0; color: var(--text-muted); font-family: var(--font-mono); font-weight: 600;">${escapeHtml(key)}</td>
                      <td style="padding: 11px 0; color: #0f172a; font-weight: 700; text-align: right;">${escapeHtml(String(val))}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- KEY FEATURES LIST -->
          <div class="pdp-features-box" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; box-shadow: var(--shadow-sm);">
            <div style="border-bottom: 2px solid var(--primary); padding-bottom: 12px; margin-bottom: 18px;">
              <h3 style="font-size: 1.25rem; font-family: var(--font-heading); color: #0f172a; letter-spacing: -0.01em; font-weight: 800;">
                COMMERCIAL FEATURES & HIGHLIGHTS
              </h3>
            </div>

            <ul style="list-style: none; display: flex; flex-direction: column; gap: 14px; color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5;">
              ${(product.features || []).map((feat) => {
                return `
                  <li style="display: flex; gap: 10px; align-items: flex-start;">
                    <span style="color: var(--accent-orange); font-size: 1rem; line-height: 1.2; font-weight: 800;">⚡</span>
                    <span>${escapeHtml(feat)}</span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        </div>

        <!-- RELATED PRODUCTS SECTION -->
        <section class="related-products-section" style="border-top: 1px solid var(--border-subtle); padding-top: 40px;">
          <div class="section-header" style="margin-bottom: 24px;">
            <div>
              <span class="section-tag">COMPATIBLE HARDWARE</span>
              <h2 class="section-title">RELATED COMMERCIAL TOOLS</h2>
            </div>
          </div>

          <div class="products-grid">
            ${relatedProducts.map((p) => {
              const img = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
              return `
                <div class="product-card" data-id="${p.id}">
                  <div class="card-brand">${escapeHtml(p.brand || 'TouchPower')}</div>
                  <div class="card-image-box">
                    <a href="#product?id=${p.id}">
                      <img src="${img}" alt="${escapeHtml(p.name)}" class="product-thumb-img" onerror="this.src='assets/images/banner_machines.png'">
                    </a>
                  </div>
                  <div class="card-body">
                    <div class="card-cat">${escapeHtml(p.category)}</div>
                    <h3 class="card-title"><a href="#product?id=${p.id}">${escapeHtml(p.name)}</a></h3>
                    <div class="card-price-row">
                      <div class="card-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
                    </div>
                    <div class="card-actions-row">
                      <a href="#product?id=${p.id}" class="btn btn-outline btn-sm btn-block">VIEW TOOL →</a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

export function attachProductEvents(params = {}) {
  const productId = params.id;
  if (!productId) return;

  // Thumbnail click switching
  document.querySelectorAll('.pdp-thumb-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdp-thumb-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const src = btn.dataset.src;
      const mainImg = document.getElementById('pdp-main-img');
      if (mainImg && src) {
        mainImg.src = src;
      }
    });
  });

  // Quantity stepper
  const qtyMinus = document.getElementById('pdp-qty-minus');
  const qtyPlus = document.getElementById('pdp-qty-plus');
  const qtyVal = document.getElementById('pdp-qty-val');

  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', () => {
      let current = parseInt(qtyVal.value, 10) || 1;
      if (current > 1) qtyVal.value = current - 1;
    });

    qtyPlus.addEventListener('click', () => {
      let current = parseInt(qtyVal.value, 10) || 1;
      qtyVal.value = current + 1;
    });
  }

  // Add to Cart button
  document.getElementById('btn-pdp-addcart')?.addEventListener('click', async () => {
    const product = await db.getProductById(productId);
    const qty = parseInt(qtyVal?.value || '1', 10);
    if (product) {
      store.addToCart(product, qty);
      import('../components/cartDrawer.js').then((m) => m.openCartDrawer());
    }
  });

  // Buy Now button (Direct to checkout)
  document.getElementById('btn-pdp-buynow')?.addEventListener('click', async () => {
    const product = await db.getProductById(productId);
    const qty = parseInt(qtyVal?.value || '1', 10);
    if (product) {
      store.addToCart(product, qty);
      window.location.hash = '#checkout';
    }
  });

  // Wishlist toggle
  document.getElementById('pdp-wishlist-btn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const product = await db.getProductById(productId);
    if (product) {
      store.toggleWishlist(product);
      btn.classList.toggle('active', store.isWishlisted(productId));
    }
  });
}

function getYouTubeEmbedUrl(url) {
  if (!url) return 'https://www.youtube.com/embed/rW_kX4d4x_0';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  return 'https://www.youtube.com/embed/rW_kX4d4x_0';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

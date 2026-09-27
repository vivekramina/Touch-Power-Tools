// ============================================================================
// TouchPower™ - Product Listing Page (PLP)
// Categories strictly: Machines, Blades, Bits, Safety Guards.
// Advanced filtering by category, price (in ₹), stock, and sorting.
// Light mode theme.
// ZERO warranty mentions.
// ============================================================================

import { db } from '../supabase.js';
import { store } from '../store.js';

const CATEGORIES = ['All Tools', 'Machines', 'Blades', 'Bits', 'Safety Guards'];

export async function renderCatalogPage(params = {}) {
  // Read category, brand or search query from params
  const currentCategory = params.category || 'All Tools';
  const currentBrand = params.brand || '';
  const searchQuery = params.q || '';
  const currentSort = params.sort || 'newest';

  // Normalize category key
  const filterCat = currentCategory === 'All Tools' ? 'All' : currentCategory;
  const products = await db.getProducts({
    category: filterCat,
    brand: currentBrand,
    query: searchQuery,
    sort: currentSort
  });

  const BRANDS = ['All Brands', 'Bosch', 'DongCheng', 'DeWalt', 'Makita'];

  const displayTitle = currentBrand 
    ? `${currentBrand.toUpperCase()} COMMERCIAL TOOLS` 
    : currentCategory.toUpperCase();

  return `
    <div class="page-catalog">
      <!-- Catalog Page Header Banner -->
      <section class="catalog-header-banner" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-bottom: 1px solid var(--border-subtle); padding: 40px 0;">
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <div>
              <div style="font-family: var(--font-mono); color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 6px; font-weight: 700;">
                TOUCHPOWER VLOGS • REVIEWED & TESTED GEAR
              </div>
              <h1 style="font-size: 2.2rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800; letter-spacing: -0.01em;">
                ${escapeHtml(displayTitle)}
              </h1>
              <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px;">
                Displaying <strong>${products.length}</strong> top-rated tools & hardware ${currentBrand ? `by ${escapeHtml(currentBrand)}` : 'from trusted multi-brand partners'}.
              </p>
            </div>

            <!-- Instant Search Input Inside Catalog -->
            <div style="width: 100%; max-width: 380px;">
              <form id="catalog-search-form" style="display: flex; gap: 8px;">
                <input 
                  type="text" 
                  id="catalog-search-input" 
                  class="form-input" 
                  placeholder="Filter catalog by tool, SKU..." 
                  value="${escapeHtml(searchQuery)}"
                >
                <button type="submit" class="btn btn-primary btn-sm">SEARCH</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Catalog Content Container -->
      <div class="container catalog-body-container" style="padding: 40px 0;">
        
        <!-- Category Filter Tabs -->
        <div class="category-tabs-bar" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 14px; margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle);">
          ${CATEGORIES.map((cat) => {
            const isActive =
              !currentBrand &&
              ((cat === 'All Tools' && (currentCategory === 'All Tools' || !currentCategory)) ||
              cat.toLowerCase() === currentCategory.toLowerCase() ||
              (cat === 'Safety Guards' && currentCategory.toLowerCase() === 'safety-guards'));

            const hrefCat = cat === 'All Tools' ? '#catalog' : `#catalog?category=${cat.toLowerCase().replace(/\s+/g, '-')}`;

            return `
              <a href="${hrefCat}" class="cat-tab-btn ${isActive ? 'active' : ''}">
                ${escapeHtml(cat)}
              </a>
            `;
          }).join('')}
        </div>

        <div class="catalog-layout" style="display: grid; grid-template-columns: 260px 1fr; gap: 32px;">
          
          <!-- Filters Sidebar -->
          <aside class="catalog-sidebar" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 22px; height: fit-content; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 18px;">
              <strong style="font-family: var(--font-heading); font-size: 1.05rem; color: #0f172a; font-weight: 800;">FILTERS</strong>
              <button id="btn-reset-filters" style="background: none; border: none; font-size: 0.8rem; color: var(--accent-orange); cursor: pointer; font-family: var(--font-mono); font-weight: 700;">
                RESET ALL
              </button>
            </div>

            <!-- Brand Filter List -->
            <div class="filter-group" style="margin-bottom: 24px;">
              <label class="form-label" style="color: #0f172a; margin-bottom: 10px; font-weight: 800;">
                Brand Partners:
              </label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${BRANDS.map((b) => {
                  const isBrandActive = (b === 'All Brands' && !currentBrand) || (currentBrand && currentBrand.toLowerCase() === b.toLowerCase());
                  const catParam = currentCategory && currentCategory !== 'All Tools' ? `&category=${encodeURIComponent(currentCategory)}` : '';
                  const brandHref = b === 'All Brands' ? `#catalog${catParam ? '?' + catParam.slice(1) : ''}` : `#catalog?brand=${b.toLowerCase()}${catParam}`;
                  return `
                    <a href="${brandHref}" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 0.88rem; font-weight: ${isBrandActive ? '800' : '500'}; background: ${isBrandActive ? '#fff7ed' : 'transparent'}; color: ${isBrandActive ? 'var(--accent-orange)' : '#334155'}; border: 1px solid ${isBrandActive ? 'var(--accent-orange)' : 'transparent'};">
                      <span>${escapeHtml(b)}</span>
                      ${isBrandActive ? '<span style="font-size: 0.75rem;">✓</span>' : ''}
                    </a>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Price Filter Slider (in Rupees ₹) -->
            <div class="filter-group" style="margin-bottom: 24px;">
              <label class="form-label" style="display: flex; justify-content: space-between; color: #0f172a;">
                <span>Max Price:</span>
                <strong id="price-val-display" style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: 800;">₹25,000</strong>
              </label>
              <input type="range" id="filter-price-range" min="500" max="25000" step="500" value="25000" style="width: 100%; accent-color: var(--accent-orange); cursor: pointer; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 4px;">
                <span>₹500</span>
                <span>₹25,000</span>
              </div>
            </div>

            <!-- In-Stock Filter -->
            <div class="filter-group" style="margin-bottom: 24px;">
              <label style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem;">
                <input type="checkbox" id="filter-stock-checkbox" checked style="accent-color: var(--accent-orange); width: 16px; height: 16px;">
                <span>In Stock & Ready for Delivery</span>
              </label>
            </div>
          </aside>

          <!-- Main Product Grid -->
          <main class="catalog-main-content">
            <!-- Sort & View Controls Bar -->
            <div class="catalog-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #ffffff; border: 1px solid var(--border-subtle); padding: 12px 18px; border-radius: 8px; box-shadow: var(--shadow-sm);">
              <div style="font-size: 0.88rem; color: var(--text-secondary); font-family: var(--font-mono); font-weight: 600;">
                SHOWING <strong>${products.length}</strong> TOOLS
              </div>

              <div style="display: flex; align-items: center; gap: 12px;">
                <label style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Sort By:</label>
                <select id="catalog-sort-select" class="form-input" style="padding: 6px 12px; font-size: 0.85rem; width: auto; background: #f8fafc;">
                  <option value="newest" ${currentSort === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
                  <option value="price-low" ${currentSort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-high" ${currentSort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="rating" ${currentSort === 'rating' ? 'selected' : ''}>Highest Rated</option>
                </select>
              </div>
            </div>

            ${
              products.length === 0
                ? `
              <div style="text-align: center; padding: 60px 20px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
                <h3 style="color: #0f172a; font-size: 1.3rem; font-weight: 700;">No Tools Found</h3>
                <p style="color: var(--text-secondary); max-width: 400px; margin: 8px auto 20px auto;">
                  We couldn't find any products matching your active filters. Try resetting the filters or searching with another keyword.
                </p>
                <a href="#catalog" class="btn btn-primary">VIEW ALL TOOLS</a>
              </div>
            `
                : `
              <div class="products-grid" id="catalog-products-grid">
                ${products.map((p) => {
                  const rawImg = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
                  const img = (rawImg && rawImg.endsWith('.jpg') && !rawImg.includes('_thumb.jpg'))
                    ? rawImg.replace('.jpg', '_thumb.jpg')
                    : rawImg;
                  return `
                    <div class="product-card" data-id="${p.id}" data-price="${p.price}" data-stock="${p.stock_count}">
                      <div class="card-brand">${escapeHtml(p.brand || 'VOLT')}</div>
                      <div class="card-image-box">
                        <a href="#product?id=${p.id}">
                          <img 
                            src="${img}" 
                            alt="${escapeHtml(p.name)}" 
                            class="product-thumb-img" 
                            decoding="async"
                            width="220"
                            height="164"
                            onerror="this.src='assets/images/banner_machines.png'"
                          >
                        </a>
                        <button class="wishlist-toggle-btn ${store.isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" title="Save tool">
                          ♥
                        </button>
                        <span class="stock-pill in-stock">
                          ${p.stock_count > 0 ? `${p.stock_count} IN STOCK` : 'OUT OF STOCK'}
                        </span>
                      </div>

                      <div class="card-body">
                        <div class="card-cat-row">
                          <span class="card-cat">${escapeHtml(p.category)}</span>
                          ${p.specs?.Voltage || p.specs?.RPM || p.specs?.['Blade Diameter'] ? `
                            <span class="card-spec-badge">${escapeHtml(p.specs.Voltage || p.specs.RPM || p.specs['Blade Diameter'])}</span>
                          ` : ''}
                        </div>
                        <h3 class="card-title">
                          <a href="#product?id=${p.id}">${escapeHtml(p.name)}</a>
                        </h3>
                        ${p.contractor_location ? `
                          <div class="card-contractor-pill" title="Verified Commercial Jobsite Deployment">
                            <span class="live-dot"></span>
                            <span class="loc-text">${escapeHtml(p.contractor_location)}</span>
                          </div>
                        ` : ''}

                        <div class="card-rating-row">
                          <div class="stars">★★★★★</div>
                          <span class="rating-text">${p.rating || 4.9} Stars (${p.reviews_count || 42})</span>
                        </div>

                        <div class="card-price-row">
                          <div class="card-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
                          <div class="free-freight-tag">⚡ FREE FREIGHT</div>
                        </div>

                        <div class="card-actions-row">
                          <a href="#product?id=${p.id}" class="btn btn-outline btn-sm btn-view-details">
                            VIEW DETAILS
                          </a>
                          <button class="btn btn-primary btn-sm btn-quick-add" data-id="${p.id}">
                            ADD TO CART
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `
            }
          </main>
        </div>
      </div>
    </div>
  `;
}

export function attachCatalogEvents(params = {}) {
  // Sort selector change
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const val = sortSelect.value;
      const cat = params.category ? `&category=${encodeURIComponent(params.category)}` : '';
      const q = params.q ? `&q=${encodeURIComponent(params.q)}` : '';
      window.location.hash = `#catalog?sort=${val}${cat}${q}`;
    });
  }

  // Catalog search form
  const searchForm = document.getElementById('catalog-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('catalog-search-input').value.trim();
      const cat = params.category ? `category=${encodeURIComponent(params.category)}&` : '';
      window.location.hash = `#catalog?${cat}q=${encodeURIComponent(val)}`;
    });
  }

  // Price range slider (in Rupees ₹)
  const priceSlider = document.getElementById('filter-price-range');
  const priceDisplay = document.getElementById('price-val-display');
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', () => {
      const max = parseFloat(priceSlider.value);
      priceDisplay.textContent = `₹${Math.round(max).toLocaleString('en-IN')}`;

      // Filter visually
      document.querySelectorAll('#catalog-products-grid .product-card').forEach((card) => {
        const p = parseFloat(card.dataset.price);
        card.style.display = p <= max ? 'flex' : 'none';
      });
    });
  }

  // Stock checkbox
  const stockCheckbox = document.getElementById('filter-stock-checkbox');
  if (stockCheckbox) {
    stockCheckbox.addEventListener('change', () => {
      const mustBeInStock = stockCheckbox.checked;
      document.querySelectorAll('#catalog-products-grid .product-card').forEach((card) => {
        const stock = parseInt(card.dataset.stock, 10);
        card.style.display = mustBeInStock && stock <= 0 ? 'none' : 'flex';
      });
    });
  }

  // Reset button
  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    window.location.hash = '#catalog';
  });

  // Quick Add to cart
  document.querySelectorAll('.btn-quick-add').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const product = await db.getProductById(id);
      if (product) {
        store.addToCart(product, 1);
        import('../components/cartDrawer.js').then((m) => m.openCartDrawer());
      }
    });
  });

  // Wishlist buttons
  document.querySelectorAll('.wishlist-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const product = await db.getProductById(id);
      if (product) {
        store.toggleWishlist(product);
        btn.classList.toggle('active', store.isWishlisted(id));
      }
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

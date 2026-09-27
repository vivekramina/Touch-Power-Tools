// ============================================================================
// TouchPower™ - Header & Search Component
// Zero warranty mentions. Manages sticky nav, cart/wishlist counters,
// live search dialog, and auth modal triggers.
// ============================================================================

import { store } from '../store.js';
import { db } from '../supabase.js';

export function initHeader() {
  const headerCartBtn = document.getElementById('header-cart-btn');
  const headerCartCount = document.getElementById('header-cart-count');
  const headerCartTotal = document.getElementById('header-cart-total');
  const mobileCartBadge = document.getElementById('mobile-cart-badge');
  const headerWishlistBtn = document.getElementById('header-wishlist-btn');
  const headerWishlistCount = document.getElementById('header-wishlist-count');
  const headerSearchBtn = document.getElementById('header-search-btn');
  const headerAccountBtn = document.getElementById('header-account-btn');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  // Search dialog elements
  const searchDialog = document.getElementById('search-dialog');
  const searchInputField = document.getElementById('search-input-field');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchResultsArea = document.getElementById('search-results-area');

  // Auth dialog elements
  const authDialog = document.getElementById('auth-dialog');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const authLoginForm = document.getElementById('auth-login-form');
  const btnDemoContractor = document.getElementById('btn-demo-contractor');
  const btnDemoAdmin = document.getElementById('btn-demo-admin');
  const registerFields = document.getElementById('register-fields');
  const authTabs = document.querySelectorAll('.auth-tab-btn');

  // Update Cart Counters
  function updateCounters() {
    const count = store.getCartCount();
    const total = store.getCartTotal();
    const wishlistCount = store.wishlist.length;

    if (headerCartCount) headerCartCount.textContent = count;
    if (mobileCartBadge) mobileCartBadge.textContent = count;
    if (headerCartTotal) headerCartTotal.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;

    if (headerWishlistCount) {
      headerWishlistCount.textContent = wishlistCount;
      headerWishlistCount.style.display = wishlistCount > 0 ? 'flex' : 'none';
    }
  }

  // Subscribe to store updates
  store.subscribe((event) => {
    if (event === 'cart_updated' || event === 'wishlist_updated') {
      updateCounters();
    }
  });

  updateCounters();

  // Cart Drawer open
  const cartDrawer = document.getElementById('cart-drawer');
  const cartWrapper = document.querySelector('.cart-btn-wrapper');
  if (cartDrawer) {
    if (headerCartBtn) {
      headerCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        import('./cartDrawer.js').then((m) => m.openCartDrawer());
      });
    }
    if (cartWrapper) {
      cartWrapper.addEventListener('click', () => {
        import('./cartDrawer.js').then((m) => m.openCartDrawer());
      });
    }
  }

  // Mobile menu toggle
  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isVisible = mobileNavDrawer.style.display === 'block';
      mobileNavDrawer.style.display = isVisible ? 'none' : 'block';
    });

    mobileNavDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavDrawer.style.display = 'none';
      });
    });
  }

  // ==========================================================================
  // Long Permanent Header Search Bar & Real-Time Dropdown
  // ==========================================================================
  const headerSearchForm = document.getElementById('header-search-form');
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchClear = document.getElementById('header-search-clear');
  const headerSearchDropdown = document.getElementById('header-search-dropdown');

  async function updateHeaderSearchDropdown(query) {
    if (!headerSearchDropdown) return;
    const q = (query || '').trim().toLowerCase();

    if (!q) {
      // Suggest top products by name when search is focused without query
      const allProds = await db.getProducts();
      const suggestedProds = allProds.slice(0, 5);
      headerSearchDropdown.innerHTML = `
        <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--text-muted); font-weight: 700; margin-bottom: 8px;">SUGGESTED TOOLS & GEAR:</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${suggestedProds.map((p) => {
            const img = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
            return `
              <a href="#product?id=${p.id}" class="search-drop-item" onclick="document.getElementById('header-search-dropdown').style.display='none';">
                <img src="${img}" alt="${escapeHtml(p.name)}" class="search-drop-thumb" onerror="this.src='assets/images/banner_machines.png'">
                <div class="search-drop-info">
                  <div class="search-drop-title">${escapeHtml(p.name)}</div>
                  <div class="search-drop-meta">
                    <span style="color: var(--accent-orange); font-weight: 700;">${escapeHtml(p.brand || 'TouchPower')}</span>
                  </div>
                </div>
                <div class="search-drop-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
              </a>
            `;
          }).join('')}
        </div>
      `;
      headerSearchDropdown.style.display = 'block';
      return;
    }

    const products = await db.getProducts({ query: q });

    if (products.length === 0) {
      headerSearchDropdown.innerHTML = `
        <div style="text-align: center; padding: 20px 12px; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 6px;">🔍</div>
          No power tools found matching "<strong>${escapeHtml(query)}</strong>".
          <div style="font-size: 0.78rem; margin-top: 8px; color: var(--accent-orange); font-family: var(--font-mono); font-weight: 700;">
            Press ENTER to search catalog
          </div>
        </div>
      `;
      headerSearchDropdown.style.display = 'block';
      return;
    }

    headerSearchDropdown.innerHTML = `
      <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); font-weight: 700; margin-bottom: 8px; letter-spacing: 0.05em;">
        SUGGESTED PRODUCTS (${products.length}):
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${products.slice(0, 6).map((p) => {
          const img = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
          return `
            <a href="#product?id=${p.id}" class="search-drop-item" onclick="document.getElementById('header-search-dropdown').style.display='none';">
              <img src="${img}" alt="${escapeHtml(p.name)}" class="search-drop-thumb" onerror="this.src='assets/images/banner_machines.png'">
              <div class="search-drop-info">
                <div class="search-drop-title">${escapeHtml(p.name)}</div>
                <div class="search-drop-meta">
                  <span style="color: var(--accent-orange); font-weight: 700;">${escapeHtml(p.brand || 'TouchPower')}</span>
                </div>
              </div>
              <div class="search-drop-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
            </a>
          `;
        }).join('')}
      </div>
      <div class="search-drop-footer">
        <a href="#catalog?q=${encodeURIComponent(query)}" onclick="document.getElementById('header-search-dropdown').style.display='none';">
          VIEW ALL ${products.length} SEARCH RESULTS →
        </a>
      </div>
    `;
    headerSearchDropdown.style.display = 'block';
  }

  if (headerSearchForm && headerSearchInput) {
    headerSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = headerSearchInput.value.trim();
      if (val) {
        if (headerSearchDropdown) headerSearchDropdown.style.display = 'none';
        window.location.hash = `#catalog?q=${encodeURIComponent(val)}`;
      }
    });

    headerSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (headerSearchClear) {
        headerSearchClear.style.display = val ? 'block' : 'none';
      }
      updateHeaderSearchDropdown(val);
    });

    headerSearchInput.addEventListener('focus', () => {
      updateHeaderSearchDropdown(headerSearchInput.value);
    });

    if (headerSearchClear) {
      headerSearchClear.addEventListener('click', () => {
        headerSearchInput.value = '';
        headerSearchClear.style.display = 'none';
        headerSearchInput.focus();
        updateHeaderSearchDropdown('');
      });
    }

    // Global keyboard shortcut '/' or 'Ctrl + K'
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k') || (e.metaKey && e.key.toLowerCase() === 'k')) &&
          document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        headerSearchInput.focus();
        headerSearchInput.select();
        updateHeaderSearchDropdown(headerSearchInput.value);
      }
      if (e.key === 'Escape' && headerSearchDropdown) {
        headerSearchDropdown.style.display = 'none';
        headerSearchInput.blur();
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!headerSearchForm.contains(e.target)) {
        if (headerSearchDropdown) headerSearchDropdown.style.display = 'none';
      }
    });
  }

  // Fallback Search Dialog (if present)
  if (headerSearchBtn && searchDialog) {
    headerSearchBtn.addEventListener('click', () => {
      searchDialog.showModal();
      if (searchInputField) {
        searchInputField.focus();
        renderSearchSuggestions('');
      }
    });

    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', () => searchDialog.close());
    }

    searchDialog.addEventListener('click', (e) => {
      if (e.target === searchDialog) searchDialog.close();
    });

    if (searchInputField) {
      searchInputField.addEventListener('input', (e) => {
        renderSearchSuggestions(e.target.value);
      });

      searchInputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = searchInputField.value.trim();
          if (val) {
            searchDialog.close();
            window.location.hash = `#catalog?q=${encodeURIComponent(val)}`;
          }
        }
      });
    }

    document.querySelectorAll('.search-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.category;
        searchDialog.close();
        window.location.hash = `#catalog?category=${cat}`;
      });
    });
  }

  async function renderSearchSuggestions(query) {
    if (!searchResultsArea) return;
    const q = query.trim().toLowerCase();
    const products = await db.getProducts({ query: q });

    if (!q) {
      const topProds = await db.getProducts();
      searchResultsArea.innerHTML = `
        <div style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--accent-orange); font-weight: 700; margin-bottom: 12px; text-transform: uppercase;">
          SUGGESTED TOOLS & HARDWARE:
        </div>
        <div class="search-results-list" style="display: flex; flex-direction: column; gap: 8px;">
          ${topProds.slice(0, 5).map((p) => {
            const img = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
            return `
              <a href="#product?id=${p.id}" class="search-result-item" onclick="document.getElementById('search-dialog').close();" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 6px; text-decoration: none; color: #0f172a; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${img}" alt="${escapeHtml(p.name)}" style="width: 32px; height: 32px; object-fit: contain;">
                  <span style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(p.name)}</span>
                </div>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-orange); font-size: 0.95rem;">
                  ₹${Math.round(p.price).toLocaleString('en-IN')}
                </span>
              </a>
            `;
          }).join('')}
        </div>
      `;
      return;
    }

    if (products.length === 0) {
      searchResultsArea.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted);">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">🔍</div>
          No power tools found matching "<strong>${escapeHtml(query)}</strong>".
        </div>
      `;
      return;
    }

    searchResultsArea.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">FOUND ${products.length} TOOLS:</div>
      <div class="search-results-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
        ${products.slice(0, 6).map((p) => {
          const img = Array.isArray(p.image_urls) ? p.image_urls[0] : 'assets/images/banner_machines.png';
          return `
            <a href="#product?id=${p.id}" class="search-result-item" onclick="document.getElementById('search-dialog').close();" style="display: flex; align-items: center; gap: 14px; padding: 10px; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 6px; text-decoration: none; color: #0f172a; transition: all 0.2s ease;">
              <img src="${img}" alt="${escapeHtml(p.name)}" style="width: 48px; height: 48px; object-fit: contain; background: #ffffff; padding: 4px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <div style="flex: 1;">
                <div style="font-size: 0.82rem; color: var(--accent-orange); font-family: var(--font-mono); font-weight: 700;">${escapeHtml(p.brand || 'TouchPower')} • ${escapeHtml(p.category)}</div>
                <div style="font-weight: 600; font-size: 0.95rem; color: #0f172a;">${escapeHtml(p.name)}</div>
              </div>
              <div style="font-family: var(--font-mono); font-weight: 800; color: var(--accent-orange); font-size: 1.05rem;">
                ₹${Math.round(p.price).toLocaleString('en-IN')}
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  // Auth Dialog Handlers
  if (headerAccountBtn && authDialog) {
    headerAccountBtn.addEventListener('click', () => {
      const user = store.user;
      if (user) {
        window.location.hash = '#account';
      } else {
        authDialog.showModal();
      }
    });

    if (authCloseBtn) {
      authCloseBtn.addEventListener('click', () => authDialog.close());
    }

    authDialog.addEventListener('click', (e) => {
      if (e.target === authDialog) authDialog.close();
    });

    authTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        authTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        if (registerFields) {
          registerFields.style.display = mode === 'register' ? 'block' : 'none';
        }
        const btn = document.getElementById('btn-auth-submit');
        if (btn) {
          btn.textContent = mode === 'register' ? 'CREATE ACCOUNT' : 'SIGN IN';
        }
      });
    });

    // Social Logins (Google, Facebook, Apple)
    document.getElementById('btn-login-google')?.addEventListener('click', async () => {
      await db.signInWithSocial('google');
      authDialog.close();
      store.showToast('Signed in with Google account', 'success');
      window.location.hash = '#account';
    });

    document.getElementById('btn-login-facebook')?.addEventListener('click', async () => {
      await db.signInWithSocial('facebook');
      authDialog.close();
      store.showToast('Signed in with Facebook account', 'success');
      window.location.hash = '#account';
    });

    document.getElementById('btn-login-apple')?.addEventListener('click', async () => {
      await db.signInWithSocial('apple');
      authDialog.close();
      store.showToast('Signed in with Apple ID', 'success');
      window.location.hash = '#account';
    });

    // Auth Form Submit
    if (authLoginForm) {
      authLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name')?.value || '';
        const company = document.getElementById('auth-company')?.value || '';
        const isRegister = registerFields && registerFields.style.display !== 'none';

        if (isRegister) {
          await db.signUp(email, password, { full_name: name, company: company });
          store.showToast('Contractor account registered successfully!', 'success');
        } else {
          await db.signIn(email, password);
          store.showToast('Signed in successfully!', 'success');
        }

        authDialog.close();
        window.location.hash = email.includes('admin') ? '#admin' : '#account';
      });
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

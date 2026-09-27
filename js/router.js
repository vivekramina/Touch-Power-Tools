// ============================================================================
// TouchPower™ - Client-Side Hash Router
// Routes between: #home, #catalog, #product, #cart, #checkout, #account, #tracking, #story, #admin
// Zero warranty mentions.
// ============================================================================

import { renderHomePage, attachHomeEvents } from './pages/home.js';
import { renderCatalogPage, attachCatalogEvents } from './pages/catalog.js';
import { renderProductPage, attachProductEvents } from './pages/product.js';
import { renderCheckoutPage, attachCheckoutEvents } from './pages/checkout.js';
import { renderAccountPage, attachAccountEvents } from './pages/account.js';
import { renderAdminPage, attachAdminEvents } from './pages/admin.js';
import { renderWishlistPage, attachWishlistEvents } from './pages/wishlist.js';
import { renderOrderTracking } from './components/tracking.js';
import { openCartDrawer } from './components/cartDrawer.js';

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

export async function handleRouteChange() {
  try {
    const rawHash = window.location.hash.slice(1) || 'home';
    const [pathPart, queryString] = rawHash.split('?');
    const path = (pathPart || 'home').replace(/^\/+/, '') || 'home';
    const params = parseQueryParams(queryString);

    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
      console.error('TouchPower Router: #app-root element not found!');
      return;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update Navigation Active Links
    updateNavLinks(path, params);

    // Router Switch
    switch (path) {
      case 'home':
      case '':
        document.title = 'TouchPower™ | Precision Heavy-Duty Industrial Power Tools';
        appRoot.innerHTML = await renderHomePage();
        attachHomeEvents();
        break;

      case 'catalog':
        document.title = 'Catalog | TouchPower™ Professional Power Tools & Blades';
        appRoot.innerHTML = await renderCatalogPage(params);
        attachCatalogEvents(params);
        break;

      case 'product':
        document.title = 'Tool Specification | TouchPower™ Precision Hardware';
        appRoot.innerHTML = await renderProductPage(params);
        attachProductEvents(params);
        break;

      case 'cart':
        // Open cart drawer and remain on current page or redirect to catalog
        openCartDrawer();
        if (!appRoot.innerHTML.trim()) {
          appRoot.innerHTML = await renderHomePage();
          attachHomeEvents();
        }
        break;

      case 'checkout':
        document.title = 'Jobsite Dispatch Checkout | TouchPower™ Direct';
        appRoot.innerHTML = await renderCheckoutPage();
        attachCheckoutEvents();
        break;

      case 'account':
        document.title = 'Contractor Portal | TouchPower™ Pro Direct';
        appRoot.innerHTML = await renderAccountPage();
        attachAccountEvents();
        break;

      case 'tracking':
        document.title = 'Live Freight Tracking | TouchPower™ Logistics';
        appRoot.innerHTML = `<div class="container" style="padding: 40px 0;"><div id="tracking-embed-root"></div></div>`;
        renderOrderTracking('tracking-embed-root', params.order);
        break;

      case 'story':
        // Brand story removed per user specification: redirect cleanly to home
        window.location.hash = '#home';
        break;

      case 'wishlist':
        document.title = 'Saved Gear & Wishlist | TouchPower Vlogs Multi-Brand Store';
        appRoot.innerHTML = await renderWishlistPage();
        attachWishlistEvents();
        break;

      case 'admin':
        document.title = '⚙️ Operations Console | TouchPower™ Store Management';
        appRoot.innerHTML = await renderAdminPage();
        attachAdminEvents();
        break;

      default:
        document.title = 'TouchPower™ | Precision Heavy-Duty Tools';
        appRoot.innerHTML = await renderHomePage();
        attachHomeEvents();
        break;
    }
  } catch (routeErr) {
    console.error('Error navigating route:', routeErr);
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div class="container" style="padding: 80px 20px; text-align: center;">
          <h2 style="font-family: var(--font-heading); color: #0f172a; margin-bottom: 12px;">Failed to load view</h2>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">${routeErr.message || 'An error occurred while loading this view.'}</p>
          <a href="#home" class="btn btn-primary">RETURN TO STOREFRONT</a>
        </div>
      `;
    }
  }
}

function parseQueryParams(queryString) {
  const params = {};
  if (!queryString) return params;
  const pairs = queryString.split('&');
  for (let pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return params;
}

function updateNavLinks(path, params) {
  document.querySelectorAll('.main-nav .nav-link, .mobile-bottom-bar .mobile-nav-item').forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href === `#${path}` || (path === 'home' && href === '#home')) {
      link.classList.add('active');
    }
    if (path === 'catalog' && params.category && href.includes(params.category)) {
      link.classList.add('active');
    }
  });
}

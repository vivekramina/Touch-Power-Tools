// ============================================================================
// TouchPower™ - Reactive Central State Store
// Indian Rupee (₹) Currency Formatting
// Manages Cart, Wishlist, User Authentication, Search, and Toast Alerts
// ZERO warranty mentions.
// ============================================================================

import { db } from './supabase.js';

const STORAGE_CART_KEY = 'touchpower_cart_v4_inr';
const STORAGE_WISHLIST_KEY = 'touchpower_wishlist_v4_inr';

export function formatINR(amount) {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2
  });
}

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.user = db.getCurrentUser();
    this.searchQuery = '';
    this.listeners = new Set();

    // Listen to db auth changes
    db.subscribe((event, data) => {
      if (event === 'auth_changed') {
        this.user = data;
        this.notify('user_updated', this.user);
      }
    });
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading cart from storage:', e);
    }
    // Initial demo cart item in Rupees
    return [
      {
        id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678901',
        name: 'TouchPower X-Pro Rotary Hammer Drill',
        price: 9999.00,
        quantity: 1,
        image: 'assets/images/banner_machines.png',
        category: 'Machines'
      }
    ];
  }

  saveCart() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(this.cart));
    this.notify('cart_updated', this.cart);
  }

  loadWishlist() {
    try {
      const saved = localStorage.getItem(STORAGE_WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading wishlist from storage:', e);
    }
    return [];
  }

  saveWishlist() {
    localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(this.wishlist));
    this.notify('wishlist_updated', this.wishlist);
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
        console.error('Store listener error:', err);
      }
    });
  }

  // ==========================================================================
  // CART OPERATIONS
  // ==========================================================================

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addToCart(product, quantity = 1) {
    const existingIndex = this.cart.findIndex((item) => item.id === product.id);
    const image = Array.isArray(product.image_urls) ? product.image_urls[0] : (product.image || 'assets/images/banner_machines.png');

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        quantity: quantity,
        image: image,
        category: product.category || 'Machines'
      });
    }

    this.saveCart();
    this.showToast(`Added ${quantity}x "${product.name}" to cart`, 'success');
  }

  updateQuantity(productId, newQty) {
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find((i) => i.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCart();
    }
  }

  removeFromCart(productId) {
    const index = this.cart.findIndex((i) => i.id === productId);
    if (index > -1) {
      const removed = this.cart.splice(index, 1)[0];
      this.saveCart();
      this.showToast(`Removed "${removed.name}" from cart`, 'info');
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // ==========================================================================
  // WISHLIST OPERATIONS
  // ==========================================================================

  toggleWishlist(product) {
    const exists = this.wishlist.some((item) => item.id === product.id);
    if (exists) {
      this.wishlist = this.wishlist.filter((item) => item.id !== product.id);
      this.showToast(`Removed "${product.name}" from saved list`, 'info');
    } else {
      this.wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image_urls) ? product.image_urls[0] : product.image
      });
      this.showToast(`Saved "${product.name}" to favorites`, 'success');
    }
    this.saveWishlist();
  }

  isWishlisted(productId) {
    return this.wishlist.some((item) => item.id === productId);
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS (Light Mode Optimized)
  // ==========================================================================

  showToast(message, type = 'info') {
    let container = document.getElementById('tp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tp-toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const borderColors = {
      success: '#f59e0b',
      error: '#ef4444',
      info: '#0f172a'
    };

    toast.style.cssText = `
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: #0f172a;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-left: 5px solid ${borderColors[type] || '#f59e0b'};
      padding: 12px 18px;
      border-radius: 8px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s ease-out;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const icon = type === 'success' ? '⚡' : type === 'error' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

export const store = new Store();

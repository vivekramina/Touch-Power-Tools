// ============================================================================
// TouchPower™ - Application Bootstrap Entrypoint
// Initializes Supabase client, reactive store, sticky header, and SPA router.
// Zero warranty mentions.
// ============================================================================

import { initHeader } from './components/header.js';
import { initRouter } from './router.js';
import { initAIAssistant } from './components/aiAssistant.js';
import { store } from './store.js';
import { db } from './supabase.js';

function bootstrap() {
  try {
    console.log('⚡ TouchPower™ Heavy-Duty Power Tools Platform initialized.');

    // Initialize Header components & search
    initHeader();

    // Initialize TouchPower AI Commercial Assistant
    initAIAssistant();

    // Initialize Router
    initRouter();

    // Log active state
    console.log('📦 Cart Items:', store.getCartCount(), '| User:', store.user?.email || 'Guest');
  } catch (err) {
    console.error('Fatal initialization error:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

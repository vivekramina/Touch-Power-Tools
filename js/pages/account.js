// ============================================================================
// TouchPower™ - Contractor Account Dashboard
// Manages profile info, saved jobsite addresses, and order history with direct tracking.
// Light mode theme with Indian Rupee (₹) pricing.
// ZERO warranty mentions.
// ============================================================================

import { store } from '../store.js';
import { db } from '../supabase.js';

export async function renderAccountPage() {
  const user = store.user;
  const orders = await db.getOrders();

  if (!user) {
    return `
      <div class="page-account-auth" style="padding: 60px 0;">
        <div class="container" style="max-width: 520px;">
          <div class="glass-card" style="padding: 36px; border-radius: 8px; background: #ffffff; box-shadow: var(--shadow-md);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="font-size: 1.8rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800; margin-bottom: 6px;">
                Sign In
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">
                Welcome back! Enter your email and password to access your account.
              </p>
            </div>

            <!-- Social Login Buttons (Google, Facebook, Apple) -->
            <div style="margin-bottom: 24px; padding: 14px; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 8px;">
              <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); font-weight: 700; text-align: center; margin-bottom: 10px; text-transform: uppercase;">
                — Instant Social Login —
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-account-login-google" style="display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; background: #ffffff;">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  <span>Continue with Google</span>
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="btn-account-login-facebook" style="display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; background: #1877f2; color: #ffffff; border-color: #1877f2;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Continue with Facebook</span>
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="btn-account-login-apple" style="display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; background: #0f172a; color: #ffffff; border-color: #0f172a;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.65-.79 1.1-1.9 1-3-.95.04-2.1.64-2.78 1.44-.61.71-1.14 1.83-1 2.93 1.06.08 2.13-.58 2.78-1.37z"/></svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
            </div>

            <form id="account-login-form">
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label">Contractor Work Email</label>
                <input type="email" class="form-input" id="page-auth-email" required value="marcus@vanceframing.com" placeholder="name@contractor.com">
              </div>

              <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="page-auth-password" required value="touchpower2026" placeholder="••••••••">
              </div>

              <button type="submit" class="btn btn-primary btn-block btn-lg" style="font-weight: 800;">
                SIGN IN TO CONTRACTOR PORTAL
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="page-account">
      <!-- Account Header Banner -->
      <section style="background: #ffffff; border-bottom: 1px solid var(--border-subtle); padding: 36px 0;">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <span class="badge badge-orange" style="margin-bottom: 6px;">
              ${user.role === 'admin' ? '⚙️ OPERATIONS ADMIN' : '🔨 VERIFIED CONTRACTOR FLEET'}
            </span>
            <h1 style="font-size: 2rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">
              WELCOME, ${escapeHtml(user.full_name.toUpperCase())}
            </h1>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">
              ${escapeHtml(user.company || 'Commercial Construction')} • Direct Account
            </p>
          </div>

          <div style="display: flex; gap: 12px;">
            <button class="btn btn-outline" id="btn-account-signout">SIGN OUT</button>
          </div>
        </div>
      </section>

      <!-- Account Dashboard Tabs & Content -->
      <div class="container" style="padding: 40px 0;">
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 36px; align-items: start;">
          
          <!-- Left Navigation Column -->
          <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 12px; text-transform: uppercase; font-weight: 700;">
              PORTAL NAVIGATION
            </div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px;">
              <li>
                <a href="#account" class="cat-tab-btn active" style="display: block; width: 100%; text-align: left;">
                  📦 Jobsite Orders (${orders.length})
                </a>
              </li>
              <li>
                <a href="#tracking" class="cat-tab-btn" style="display: block; width: 100%; text-align: left;">
                  🚚 Live Freight Tracking
                </a>
              </li>
              <li>
                <a href="#catalog" class="cat-tab-btn" style="display: block; width: 100%; text-align: left;">
                  ⚡ Order Tools & Hardware
                </a>
              </li>
            </ul>

            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-subtle);">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 6px;">
                24/7 PRO DISPATCH
              </div>
              <div style="font-size: 0.95rem; color: #0f172a; font-weight: 800; font-family: var(--font-mono);">
                1-800-868-2479
              </div>
            </div>
          </div>

          <!-- Main Orders Manifest & Details Column -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="font-size: 1.4rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">
                ACTIVE JOBSITE DISPATCHES & ORDERS
              </h2>
              <a href="#tracking" class="btn btn-outline btn-sm">TRACK ACTIVE SHIPMENT →</a>
            </div>

            ${
              orders.length === 0
                ? `
              <div style="text-align: center; padding: 60px 20px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 2.5rem; margin-bottom: 12px;">📦</div>
                <h3 style="color: #0f172a; font-size: 1.2rem; font-weight: 700;">No Past Orders Found</h3>
                <p style="color: var(--text-secondary); margin: 8px 0 20px 0;">You have not placed any commercial hardware orders yet.</p>
                <a href="#catalog" class="btn btn-primary">SHOP THE POWER →</a>
              </div>
            `
                : `
              <div style="display: flex; flex-direction: column; gap: 16px;">
                ${orders.map((ord) => {
                  return `
                    <div class="glass-card" style="padding: 22px; border-radius: 8px; border: 1px solid var(--border-subtle); background: #ffffff;">
                      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px; margin-bottom: 16px;">
                        <div>
                          <div style="font-family: var(--font-mono); font-weight: 800; color: #0f172a; font-size: 1.1rem;">
                            ${escapeHtml(ord.id)}
                          </div>
                          <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                            Dispatched: ${new Date(ord.created_at).toLocaleDateString()} • Carrier: ${escapeHtml(ord.carrier || 'ProFreight')}
                          </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 14px;">
                          <span class="status-pill status-${(ord.delivery_status || 'processing').toLowerCase().replace(/\s+/g, '-')}">
                            ● ${escapeHtml(ord.delivery_status)}
                          </span>
                          <a href="#tracking?order=${encodeURIComponent(ord.id)}" class="btn btn-primary btn-sm">
                            LIVE TRACK →
                          </a>
                        </div>
                      </div>

                      <!-- Items preview row -->
                      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                        <div style="display: flex; gap: 8px; flex: 1;">
                          ${(ord.product_details || []).map((item) => {
                            return `
                              <img src="${item.image || 'assets/images/banner_machines.png'}" alt="${escapeHtml(item.name)}" title="${escapeHtml(item.name)} (x${item.quantity})" style="width: 44px; height: 44px; object-fit: contain; background: #ffffff; padding: 2px; border-radius: 4px; border: 1px solid var(--border-subtle);">
                            `;
                          }).join('')}
                        </div>

                        <div style="text-align: right;">
                          <div style="font-size: 0.8rem; color: var(--text-muted);">Commercial Total:</div>
                          <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.25rem; color: #0f172a;">
                            ₹${Math.round(ord.total_amount).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachAccountEvents() {
  // Sign out button
  document.getElementById('btn-account-signout')?.addEventListener('click', async () => {
    await db.signOut();
    store.showToast('Signed out of contractor portal', 'info');
    window.location.hash = '#home';
  });

  // Social Logins (Google, Facebook, Apple)
  document.getElementById('btn-account-login-google')?.addEventListener('click', async () => {
    await db.signInWithSocial('google');
    store.showToast('Signed in with Google account', 'success');
    window.location.reload();
  });

  document.getElementById('btn-account-login-facebook')?.addEventListener('click', async () => {
    await db.signInWithSocial('facebook');
    store.showToast('Signed in with Facebook account', 'success');
    window.location.reload();
  });

  document.getElementById('btn-account-login-apple')?.addEventListener('click', async () => {
    await db.signInWithSocial('apple');
    store.showToast('Signed in with Apple ID', 'success');
    window.location.reload();
  });

  // Regular login form on account page
  document.getElementById('account-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('page-auth-email').value;
    const pass = document.getElementById('page-auth-password').value;
    await db.signIn(email, pass);
    store.showToast('Signed in successfully', 'success');
    window.location.reload();
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

// ============================================================================
// TouchPower™ - Streamlined Checkout Page
// Multi-step contractor checkout with simulated card payment / UPI,
// automatic order generation in Supabase, and live redirection to Order Tracking.
// Light mode theme with Indian Rupee (₹) pricing.
// ZERO warranty mentions.
// ============================================================================

import { store } from '../store.js';
import { db } from '../supabase.js';

export async function renderCheckoutPage() {
  const items = store.cart;
  const subtotal = store.getCartTotal();
  const freight = subtotal >= 4999 ? 0.00 : 499.00;
  const gst = subtotal * 0.18; // 18% GST for industrial tools
  const total = subtotal + freight + gst;
  const user = store.user;

  if (items.length === 0) {
    return `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
        <h2 style="font-size: 1.8rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 8px; font-weight: 800;">
          YOUR JOBSITE CART IS EMPTY
        </h2>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 24px auto;">
          Add professional power tools or diamond blades to proceed with commercial jobsite dispatch.
        </p>
        <a href="#catalog" class="btn btn-primary btn-lg">BROWSE CATALOG →</a>
      </div>
    `;
  }

  return `
    <div class="page-checkout">
      <!-- Checkout Header -->
      <section style="background: #ffffff; border-bottom: 1px solid var(--border-subtle); padding: 30px 0;">
        <div class="container">
          <span class="badge badge-orange" style="margin-bottom: 6px;">COMMERCIAL ORDER PROCESSING</span>
          <h1 style="font-size: 2rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">
            JOBSITE DISPATCH & CHECKOUT
          </h1>
        </div>
      </section>

      <div class="container" style="padding: 40px 0;">
        <form id="checkout-form">
          <div class="checkout-layout" style="display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start;">
            
            <!-- LEFT COLUMN: Forms -->
            <div style="display: flex; flex-direction: column; gap: 30px;">
              
              <!-- 1. Contractor Identification & Jobsite Shipping -->
              <div class="checkout-card" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 800;">
                  <span style="background: var(--accent-orange); color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800;">1</span>
                  CONTRACTOR & JOBSITE SHIPPING ADDRESS
                </h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" class="form-input" id="ship-name" required value="${escapeHtml(user?.full_name || 'Marcus Vance')}" placeholder="e.g. Marcus Vance">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Company / Contractor Name *</label>
                    <input type="text" class="form-input" id="ship-company" required value="${escapeHtml(user?.company || 'Vance Framing India')}" placeholder="e.g. Vance Construction Ltd">
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">Work Email (Dispatch Updates) *</label>
                    <input type="email" class="form-input" id="ship-email" required value="${escapeHtml(user?.email || 'marcus@vanceframing.com')}" placeholder="contractor@trade.com">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Site Contact Phone *</label>
                    <input type="tel" class="form-input" id="ship-phone" required value="+91 98765 43210" placeholder="+91 98765 00000">
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 16px;">
                  <label class="form-label">Jobsite Street Address *</label>
                  <input type="text" class="form-input" id="ship-street" required value="Plot 44, Sector 62, Industrial Area, Phase II" placeholder="Street address, building number, receiving dock">
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                  <div class="form-group">
                    <label class="form-label">City *</label>
                    <input type="text" class="form-input" id="ship-city" required value="Noida">
                  </div>
                  <div class="form-group">
                    <label class="form-label">State *</label>
                    <input type="text" class="form-input" id="ship-state" required value="UP">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Pincode *</label>
                    <input type="text" class="form-input" id="ship-zip" required value="201301">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Jobsite Gate Code / Receiving Instructions</label>
                  <input type="text" class="form-input" id="ship-notes" value="Gate access code #4491. Deliver to site superintendent office." placeholder="e.g. Gate code, forklift required, crane dropoff area">
                </div>
              </div>

              <!-- 2. Freight Shipping Method -->
              <div class="checkout-card" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 800;">
                  <span style="background: var(--accent-orange); color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800;">2</span>
                  SELECT DISPATCH METHOD
                </h3>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <label class="shipping-option" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #ffffff; border: 2px solid var(--accent-orange); border-radius: 6px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <input type="radio" name="shipping-method" value="standard" checked style="accent-color: var(--accent-orange); width: 18px; height: 18px;">
                      <div>
                        <div style="font-weight: 700; color: #0f172a;">TouchPower ProFreight 2-Day Ground (BlueDart)</div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary);">Direct jobsite delivery via heavy-duty carrier fleet</div>
                      </div>
                    </div>
                    <span style="font-family: var(--font-mono); font-weight: 800; color: ${freight === 0 ? '#059669' : 'var(--accent-orange)'};">
                      ${freight === 0 ? 'FREE' : '₹499'}
                    </span>
                  </label>

                  <label class="shipping-option" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 6px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <input type="radio" name="shipping-method" value="priority" style="accent-color: var(--accent-orange); width: 18px; height: 18px;">
                      <div>
                        <div style="font-weight: 700; color: #0f172a;">Emergency Priority Air Express</div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary);">Dispatched from nearest regional depot by 8:00 AM</div>
                      </div>
                    </div>
                    <span style="font-family: var(--font-mono); font-weight: 800; color: #0f172a;">₹999</span>
                  </label>
                </div>
              </div>

              <!-- 3. Payment Method (UPI, Debit/Credit Card, Net Banking) -->
              <div class="checkout-card" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 28px; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.2rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 800;">
                  <span style="background: var(--accent-orange); color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800;">3</span>
                  SELECT PAYMENT METHOD
                </h3>

                <!-- 3 Payment Option Tabs -->
                <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
                  <button type="button" class="btn btn-outline btn-sm pay-tab-btn active" data-method="upi" style="flex: 1; min-width: 120px; border-color: var(--accent-orange); background: rgba(234,88,12,0.08); color: var(--accent-orange); font-weight: 700;">
                    📱 UPI / QR
                  </button>
                  <button type="button" class="btn btn-outline btn-sm pay-tab-btn" data-method="card" style="flex: 1; min-width: 120px; color: var(--text-secondary); font-weight: 600;">
                    💳 Debit / Credit Card
                  </button>
                  <button type="button" class="btn btn-outline btn-sm pay-tab-btn" data-method="netbanking" style="flex: 1; min-width: 120px; color: var(--text-secondary); font-weight: 600;">
                    🏦 Net Banking
                  </button>
                </div>

                <!-- UPI Container -->
                <div id="payment-panel-upi" class="pay-method-panel" style="display: block;">
                  <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 18px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                      <span style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">Instant UPI Transfer</span>
                      <span style="font-size: 0.8rem; color: #10b981; font-weight: 700;">⚡ ZERO SURCHARGE</span>
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                      <label class="form-label">Enter UPI ID / VPA *</label>
                      <input type="text" class="form-input" id="upi-vpa-input" placeholder="e.g. mobile@okaxis, user@upi, user@paytm" value="contractor@okaxis">
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                      <span>Supported:</span>
                      <span style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-subtle); font-weight: 600;">Google Pay</span>
                      <span style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-subtle); font-weight: 600;">PhonePe</span>
                      <span style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-subtle); font-weight: 600;">Paytm</span>
                      <span style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-subtle); font-weight: 600;">BHIM UPI</span>
                    </div>
                  </div>
                </div>

                <!-- Card Container -->
                <div id="payment-panel-card" class="pay-method-panel" style="display: none;">
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Cardholder Name *</label>
                    <input type="text" class="form-input" id="card-name-input" value="Marcus Vance" placeholder="Name printed on card">
                  </div>

                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Debit / Credit Card Number *</label>
                    <input type="text" class="form-input" id="card-num-input" value="•••• •••• •••• 4242" placeholder="4242 •••• •••• ••••">
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px;">
                    <div class="form-group">
                      <label class="form-label">Expiry (MM/YY) *</label>
                      <input type="text" class="form-input" id="card-exp-input" value="08/28" placeholder="MM/YY">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Security CVV / CVC *</label>
                      <input type="password" class="form-input" id="card-cvv-input" value="999" placeholder="CVV">
                    </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    All Visa, MasterCard, and RuPay cards accepted.
                  </div>
                </div>

                <!-- Net Banking Container -->
                <div id="payment-panel-netbanking" class="pay-method-panel" style="display: none;">
                  <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label">Select Your Bank *</label>
                    <select class="form-input" id="netbanking-bank-select">
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="canara">Canara Bank</option>
                      <option value="other">Other Indian Scheduled Bank</option>
                    </select>
                  </div>
                  <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); padding: 14px; border-radius: 6px; font-size: 0.82rem; color: #475569;">
                    ℹ️ You will be redirected to your bank's secure payment gateway to verify and complete the transfer.
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Order Summary Sticky Card -->
            <div style="position: sticky; top: 90px;">
              <div class="checkout-card" style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.15rem; font-family: var(--font-heading); color: #0f172a; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; font-weight: 800;">
                  MANIFEST SUMMARY (${items.length} ITEMS)
                </h3>

                <!-- Items list -->
                <div style="display: flex; flex-direction: column; gap: 12px; max-height: 220px; overflow-y: auto; margin-bottom: 16px;">
                  ${items.map((it) => {
                    return `
                      <div style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem;">
                        <img src="${it.image}" alt="${escapeHtml(it.name)}" style="width: 36px; height: 36px; object-fit: contain; background: #f8fafc; border-radius: 4px; padding: 2px; border: 1px solid var(--border-subtle);">
                        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          <div style="color: #0f172a; font-weight: 600;">${escapeHtml(it.name)}</div>
                          <div style="color: var(--text-muted); font-size: 0.75rem;">Qty: ${it.quantity}</div>
                        </div>
                        <div style="font-family: var(--font-mono); font-weight: 700; color: #0f172a;">
                          ₹${Math.round(it.price * it.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Price Breakdown in INR -->
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>Tools Subtotal:</span>
                    <span style="font-family: var(--font-mono); color: #0f172a; font-weight: 700;">₹${Math.round(subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Jobsite Freight:</span>
                    <span id="checkout-freight-val" style="font-family: var(--font-mono); color: ${freight === 0 ? '#059669' : '#0f172a'}; font-weight: 700;">
                      ${freight === 0 ? 'FREE' : '₹499'}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>GST (18% Heavy Machinery):</span>
                    <span style="font-family: var(--font-mono); color: #0f172a;">₹${Math.round(gst).toLocaleString('en-IN')}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; font-family: var(--font-heading); color: #0f172a; border-top: 1px dashed var(--border-subtle); padding-top: 12px; margin-top: 4px;">
                    <span>TOTAL:</span>
                    <span id="checkout-total-val" style="color: var(--accent-orange); font-family: var(--font-mono);">
                      ₹${Math.round(total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-submit-order" style="font-weight: 800; text-transform: uppercase;">
                  DISPATCH ORDER TO JOBSITE →
                </button>

                <div style="margin-top: 14px; text-align: center; font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
                  🔒 Encrypted 256-Bit SSL Contractor Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function attachCheckoutEvents() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const subtotal = store.getCartTotal();
  const freightRadios = document.querySelectorAll('input[name="shipping-method"]');
  const freightValDisplay = document.getElementById('checkout-freight-val');
  const totalValDisplay = document.getElementById('checkout-total-val');

  // Payment tab switching (UPI, Card, Net Banking)
  const payTabs = document.querySelectorAll('.pay-tab-btn');
  payTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const method = tab.getAttribute('data-method');
      payTabs.forEach((t) => {
        t.classList.remove('active');
        t.style.borderColor = 'var(--border-subtle)';
        t.style.background = 'transparent';
        t.style.color = 'var(--text-secondary)';
      });
      tab.classList.add('active');
      tab.style.borderColor = 'var(--accent-orange)';
      tab.style.background = 'rgba(234,88,12,0.08)';
      tab.style.color = 'var(--accent-orange)';

      // Hide all panels, show selected
      document.querySelectorAll('.pay-method-panel').forEach((panel) => {
        panel.style.display = 'none';
      });
      const selectedPanel = document.getElementById(`payment-panel-${method}`);
      if (selectedPanel) selectedPanel.style.display = 'block';
    });
  });

  freightRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      let freight = 0;
      if (radio.value === 'priority') {
        freight = 999.00;
        if (freightValDisplay) {
          freightValDisplay.textContent = '₹999';
          freightValDisplay.style.color = '#0f172a';
        }
      } else {
        freight = subtotal >= 4999 ? 0.00 : 499.00;
        if (freightValDisplay) {
          freightValDisplay.textContent = freight === 0 ? 'FREE' : '₹499';
          freightValDisplay.style.color = freight === 0 ? '#059669' : '#0f172a';
        }
      }

      const gst = subtotal * 0.18;
      const total = subtotal + freight + gst;
      if (totalValDisplay) {
        totalValDisplay.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-submit-order');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'DISPATCHING ORDER TO FULFILLMENT...';
    }

    const shipName = document.getElementById('ship-name').value;
    const shipCompany = document.getElementById('ship-company').value;
    const shipEmail = document.getElementById('ship-email').value;
    const shipPhone = document.getElementById('ship-phone').value;
    const shipStreet = document.getElementById('ship-street').value;
    const shipCity = document.getElementById('ship-city').value;
    const shipState = document.getElementById('ship-state').value;
    const shipZip = document.getElementById('ship-zip').value;
    const shipNotes = document.getElementById('ship-notes').value;

    const shippingType = document.querySelector('input[name="shipping-method"]:checked')?.value || 'standard';
    let freightCost = 0;
    if (shippingType === 'priority') {
      freightCost = 999.00;
    } else {
      freightCost = subtotal >= 4999 ? 0.00 : 499.00;
    }

    const gst = subtotal * 0.18;
    const finalTotal = subtotal + freightCost + gst;

    const orderData = {
      user_id: store.user?.id || 'guest_contractor',
      customer_name: `${shipName} (${shipCompany})`,
      customer_email: shipEmail,
      delivery_status: 'Processing',
      carrier: shippingType === 'priority' ? 'TouchPower Priority Air (BlueDart)' : 'TouchPower ProFreight (Delhivery)',
      total_amount: Math.round(finalTotal),
      shipping_address: {
        street: shipStreet,
        city: shipCity,
        state: shipState,
        zip: shipZip,
        country: 'India',
        phone: shipPhone
      },
      product_details: store.cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      notes: shipNotes
    };

    const createdOrder = await db.createOrder(orderData);

    store.clearCart();
    store.showToast(`Order #${createdOrder.id} dispatched! Redirecting to Live Freight Tracking...`, 'success');

    // Direct redirection to Order Tracking View for this order
    setTimeout(() => {
      window.location.hash = `#tracking?order=${encodeURIComponent(createdOrder.id)}`;
    }, 800);
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

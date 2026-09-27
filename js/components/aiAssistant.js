// ============================================================================
// TouchPower™ - AI Commercial Tool Specialist
// Powered by Google Gemini GenAI with Real-Time Live Catalog Grounding &
// Autonomous On-Device Catalog Intelligence Engine.
// Strictly ZERO warranty mentions. All prices in Indian Rupees (₹).
// ============================================================================

import { store } from '../store.js';
import { db } from '../supabase.js';

const CHAT_STORAGE_KEY = 'touchpower_ai_chat_history_v2';
const GEMINI_STORAGE_KEY = 'touchpower_gemini_api_key';

// Curated starter suggestion prompts covering key brands, tools, and contractor applications
const STARTER_PROMPTS = [
  '⚡ Bosch GBH 220 vs TouchPower X-Pro?',
  '🪚 14" Diamond blades for concrete & granite',
  '🛡️ OSHA Table 1 silica dust extraction',
  '🔩 ShockWave torsion impact bit set',
  '💰 Commercial tools under ₹5,000',
  '🚚 Jobsite freight dispatch time?',
  '🧯 PPE safety shoes & cut-resistant gloves',
  '🪵 Makita vs TouchPower plunge track saws'
];

let chatMessages = [];
let allProductsCache = [];
let userGeminiApiKey = '';
try {
  userGeminiApiKey = (typeof localStorage !== 'undefined' ? localStorage.getItem(GEMINI_STORAGE_KEY) : '') || '';
} catch (e) {
  userGeminiApiKey = '';
}

export function openAIAssistant(prompt) {
  const chatWindow = document.getElementById('ai-chat-window');
  const inputField = document.getElementById('ai-input-field');
  if (!chatWindow) return;

  chatWindow.classList.add('open');
  scrollMessagesToBottom();

  if (prompt && typeof prompt === 'string' && prompt.trim()) {
    handleUserMessage(prompt.trim());
  } else if (inputField) {
    setTimeout(() => inputField.focus(), 150);
  }
}

if (typeof window !== 'undefined') {
  window.openAIAssistant = openAIAssistant;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-ai-assistant]');
    if (trigger) {
      e.preventDefault();
      const prompt = trigger.getAttribute('data-ai-prompt') || '';
      openAIAssistant(prompt);
    }
  });
}

export function initAIAssistant() {
  const root = document.getElementById('ai-assistant-root');
  if (!root) return;

  // Load chat history from sessionStorage
  loadHistory();

  // Render initial widget structure
  root.innerHTML = `
    <!-- Floating Launcher Button -->
    <button id="ai-launcher-btn" class="ai-launcher-btn" aria-label="Open TouchPower AI Assistant" title="Chat with TouchPower Commercial Tool Specialist">
      <div class="ai-icon-box">
        <img src="assets/images/ai_assistant_logo.jpg" alt="TouchPower AI" class="ai-launcher-logo-img">
      </div>
      <span>ASK AI TOOL SPECIALIST</span>
      <span class="ai-live-pulse" title="AI Specialist Online"></span>
    </button>

    <!-- Floating AI Chat Window -->
    <div id="ai-chat-window" class="ai-chat-window" role="dialog" aria-label="TouchPower AI Specialist Chat">
      <!-- Header -->
      <div class="ai-chat-header">
        <div class="ai-header-left">
          <div class="ai-avatar">
            <img src="assets/images/ai_assistant_logo.jpg" alt="TouchPower AI Specialist Logo" class="ai-avatar-img">
          </div>
          <div class="ai-header-info">
            <span class="ai-header-title">TouchPower AI Specialist</span>
            <div class="ai-header-sub">
              <span class="dot"></span> Online • Commercial Tool Specialist
            </div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button id="ai-clear-btn" class="ai-header-btn" title="Clear conversation history">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button id="ai-close-btn" class="ai-header-btn" title="Minimize chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div id="ai-messages-container" class="ai-messages-container"></div>

      <!-- Suggested Prompts Strip -->
      <div class="ai-suggestions-container">
        <div class="ai-suggestions-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          SUGGESTED QUESTIONS:
        </div>
        <div id="ai-suggestions-scroll" class="ai-suggestions-scroll"></div>
      </div>

      <!-- Chat Input Area -->
      <form id="ai-chat-form" class="ai-chat-input-bar">
        <input 
          type="text" 
          id="ai-input-field" 
          class="ai-input-field" 
          placeholder="Ask specs, coring, blades, or jobsite advice..." 
          autocomplete="off"
        >
        <button type="submit" id="ai-send-btn" class="ai-send-btn" aria-label="Send Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;

  // Attach event listeners
  const launcherBtn = document.getElementById('ai-launcher-btn');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-close-btn');
  const clearBtn = document.getElementById('ai-clear-btn');
  const chatForm = document.getElementById('ai-chat-form');
  const inputField = document.getElementById('ai-input-field');

  launcherBtn.addEventListener('click', () => {
    const isOpen = chatWindow.classList.contains('open');
    if (isOpen) {
      chatWindow.classList.remove('open');
    } else {
      chatWindow.classList.add('open');
      inputField.focus();
      scrollMessagesToBottom();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  clearBtn.addEventListener('click', () => {
    chatMessages = [];
    saveHistory();
    seedGreetingMessage();
    renderSuggestions(STARTER_PROMPTS);
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = inputField.value.trim();
    if (!query) return;

    inputField.value = '';
    await handleUserMessage(query);
  });

  // Seed greeting if empty
  if (chatMessages.length === 0) {
    seedGreetingMessage();
  } else {
    renderMessages();
  }

  // Render initial suggestions
  renderSuggestions(STARTER_PROMPTS);

  // Pre-cache products from live database
  db.getProducts().then(products => {
    allProductsCache = products || [];
  });
}

function seedGreetingMessage() {
  const greeting = {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    text: `Hello! I am your **TouchPower AI Commercial Tool Specialist**. 

I provide field-tested technical advice across our entire heavy-duty fleet—from **Bosch, DeWalt, Makita, DongCheng, Volt, and TouchPower** machines to laser-welded diamond blades, high-torque bits, and OSHA Table 1 silica guards.

Tap any quick question below or tell me what material, trade, or specs you need!`,
    time: formatTime(new Date())
  };
  chatMessages.push(greeting);
  renderMessages();
}

function renderSuggestions(prompts) {
  const container = document.getElementById('ai-suggestions-scroll');
  if (!container) return;

  container.innerHTML = prompts.map(p => `
    <button type="button" class="ai-suggestion-chip" data-prompt="${escapeHtml(p)}">
      ${escapeHtml(p)}
    </button>
  `).join('');

  container.querySelectorAll('.ai-suggestion-chip').forEach(btn => {
    btn.addEventListener('click', async () => {
      const prompt = btn.dataset.prompt;
      if (prompt) {
        await handleUserMessage(prompt);
      }
    });
  });
}

async function handleUserMessage(query) {
  // Add user message
  const userMsg = {
    id: 'msg-u-' + Date.now(),
    sender: 'user',
    text: query,
    time: formatTime(new Date())
  };
  chatMessages.push(userMsg);
  renderMessages();
  scrollMessagesToBottom();

  // Show typing indicator
  showTypingIndicator();

  // Generate response
  try {
    const response = await generateAIResponse(query);
    hideTypingIndicator();
    chatMessages.push(response);
    saveHistory();
    renderMessages();
    scrollMessagesToBottom();

    // Update suggestions based on context
    if (response.followUps && response.followUps.length > 0) {
      renderSuggestions(response.followUps);
    }
  } catch (err) {
    hideTypingIndicator();
    console.error('AI chat error:', err);
    chatMessages.push({
      id: 'msg-err-' + Date.now(),
      sender: 'assistant',
      text: `I ran into a temporary connection issue. However, our entire catalog is in stock and ready for same-day dispatch before 2 PM IST. Please feel free to ask about specific drill, blade, or safety specs!`,
      products: allProductsCache.slice(0, 2),
      time: formatTime(new Date())
    });
    renderMessages();
    scrollMessagesToBottom();
  }
}

function renderMessages() {
  const container = document.getElementById('ai-messages-container');
  if (!container) return;

  container.innerHTML = chatMessages.map(m => {
    const isUser = m.sender === 'user';
    return `
      <div class="ai-message ${isUser ? 'user' : 'assistant'}">
        <div class="ai-msg-bubble">
          ${formatMarkdown(m.text)}
          ${m.products && m.products.length > 0 ? renderProductRecommendations(m.products) : ''}
        </div>
        <span class="ai-msg-time">${m.time}</span>
      </div>
    `;
  }).join('');

  // Attach card action listeners (Add to Cart / View Details)
  container.querySelectorAll('.ai-product-btn.add').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const product = await db.getProductById(id);
      if (product) {
        store.addToCart(product, 1);
        store.showToast(`Added ${product.name} to cart!`, 'success');
        import('./cartDrawer.js').then(m => m.openCartDrawer());
      }
    });
  });

  scrollMessagesToBottom();
}

function renderProductRecommendations(products) {
  return `
    <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
      ${products.map(p => {
        const rawImg = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
        const img = (rawImg && rawImg.endsWith('.jpg') && !rawImg.includes('_thumb.jpg'))
          ? rawImg.replace('.jpg', '_thumb.jpg')
          : rawImg;
        return `
          <div class="ai-product-card" data-id="${p.id}">
            <div class="ai-product-top">
              <img src="${img}" alt="${escapeHtml(p.name)}" class="ai-product-thumb" onerror="this.src='assets/images/banner_machines.png'">
              <div class="ai-product-details">
                <div class="ai-product-brand">${escapeHtml(p.brand || 'TouchPower')} • ${escapeHtml(p.category)}</div>
                <div class="ai-product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                <div class="ai-product-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div class="ai-product-actions">
              <a href="#product?id=${p.id}" class="ai-product-btn view" onclick="document.getElementById('ai-chat-window').classList.remove('open');">
                VIEW DETAILS
              </a>
              <button class="ai-product-btn add" data-id="${p.id}">
                ADD TO CART ⚡
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showTypingIndicator() {
  const container = document.getElementById('ai-messages-container');
  if (!container) return;

  const existing = document.getElementById('ai-typing-indicator-box');
  if (existing) existing.remove();

  const typingDiv = document.createElement('div');
  typingDiv.id = 'ai-typing-indicator-box';
  typingDiv.className = 'ai-message assistant';
  typingDiv.innerHTML = `
    <div class="ai-typing-indicator">
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
      <span class="ai-typing-dot"></span>
    </div>
  `;
  container.appendChild(typingDiv);
  scrollMessagesToBottom();
}

function hideTypingIndicator() {
  const existing = document.getElementById('ai-typing-indicator-box');
  if (existing) existing.remove();
}

function scrollMessagesToBottom() {
  const container = document.getElementById('ai-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// ============================================================================
// AI Response Generator: Server / Gemini with Smart Catalog Client Fallback
// ============================================================================
async function generateAIResponse(userQuery) {
  // Ensure product cache is loaded
  if (allProductsCache.length === 0) {
    allProductsCache = await db.getProducts();
  }

  // 1. Try Backend AI Endpoint (connected to Gemini or server smart reasoner)
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        history: chatMessages.slice(-8),
        apiKey: userGeminiApiKey
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          id: 'msg-a-' + Date.now(),
          sender: 'assistant',
          text: data.text,
          products: data.products || [],
          followUps: data.followUps || [],
          time: formatTime(new Date())
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/ai/chat unreachable, using on-device catalog engine:', err);
  }

  // 2. Fallback: On-Device Catalog Reasoning Engine
  const localRes = generateSmartCatalogClient(userQuery, allProductsCache);
  return {
    id: 'msg-a-' + Date.now(),
    sender: 'assistant',
    text: localRes.text,
    products: localRes.products || [],
    followUps: localRes.followUps || [],
    time: formatTime(new Date())
  };
}

/**
 * Client-Side Smart Catalog Engine
 * Guarantees zero downtime and complete catalog knowledge even when offline.
 */
function generateSmartCatalogClient(userQuery, products) {
  const q = userQuery.toLowerCase().trim();
  const findByName = (term) => products.find(p => p.name.toLowerCase().includes(term.toLowerCase()));

  // 1. GREETINGS
  if (/^(hi|hello|hey|greetings|namaste|good morning|good afternoon|good evening|who are you|help)/i.test(q) && q.split(' ').length <= 4) {
    return {
      text: `Hello! I am your **TouchPower AI Commercial Specialist**. I provide field-tested technical advice on heavy-duty equipment, compare machine specs, calculate cutting capacities, and match the right diamond blades, bits, or OSHA silica guards for your specific jobsite.\n\nWhat material or task are you working with today?`,
      products: [
        findByName('Rotary Hammer'),
        findByName('Angle Grinder'),
        findByName('14" Laser-Welded')
      ].filter(Boolean),
      followUps: [
        '⚡ Bosch GBH 220 vs TouchPower X-Pro?',
        '🪚 Diamond blades for reinforced concrete',
        '🛡️ OSHA Table 1 silica dust shrouds',
        '💰 Commercial tools under ₹5,000'
      ]
    };
  }

  // 2. COMPARISONS
  if (q.includes('vs') || q.includes('compare') || q.includes('difference')) {
    if (q.includes('drill') || q.includes('hammer') || q.includes('rotary') || q.includes('coring')) {
      const p1 = findByName('TouchPower X-Pro Rotary Hammer') || findByName('Rotary Hammer');
      const p2 = findByName('Bosch GBH 220');
      const p3 = findByName('Makita HR2470');
      return {
        text: `**Commercial Rotary Hammer Comparison:**\n\n- **TouchPower X-Pro (₹9,999)**: 22.5V Brushless High Torque, **3.4 Joules**, 3,000 RPM. Peak impact energy for fast penetration through dense reinforced concrete.\n- **Bosch GBH 220 (₹7,899)**: 720W Corded, **2.0 Joules**, 0-2,000 RPM, 2.3 kg. Ultra-compact and reliable for everyday anchor holes and overhead drilling.\n- **Makita HR2470 (₹9,299)**: 780W Corded, **2.4 Joules**, 0-1,100 RPM with torque-limiter safety clutch for rebar strike protection.\n\nAll three utilize SDS-Plus tooling and feature sealed gear casings.`,
        products: [p1, p2, p3].filter(Boolean),
        followUps: [
          '🔩 SDS-Plus carbide drill bits',
          '🛡️ OSHA Table 1 silica dust shroud',
          '🚚 Commercial freight schedule'
        ]
      };
    } else if (q.includes('grind')) {
      const g1 = findByName('Sharp-Edge X-Pro Angle Grinder') || findByName('7-Inch Cordless');
      const g2 = findByName('Bosch GWS 600');
      const g3 = findByName('Makita GA4030');
      return {
        text: `**Commercial Angle Grinder Comparison:**\n\n- **Sharp-Edge X-Pro 7-Inch Cordless (₹4,899)**: 8,500 RPM brushless motor, electronic safety brake stopping in < 1.5s, 18A equivalent power.\n- **Bosch GWS 600 4-Inch (₹3,199)**: 670W, 11,000 RPM with armoured field coils against abrasive grit, 1.8 kg.\n- **Makita GA4030 4-Inch (₹3,499)**: 720W, 11,000 RPM with ultra-slim 57mm barrel grip and labyrinth dust seals.`,
        products: [g1, g2, g3].filter(Boolean),
        followUps: [
          '🛡️ OSHA Table 1 dust shroud for grinders',
          '🪚 Diamond cutting blades',
          '⚡ DeWalt 9-inch 2200W grinder'
        ]
      };
    }
  }

  // 3. BOSCH
  if (q.includes('bosch')) {
    const gbh = findByName('GBH 220');
    const gws = findByName('GWS 600');
    return {
      text: `We carry authentic **Bosch Professional** heavy-duty commercial machines in our regional dispatch fleet:\n\n1. **Bosch GBH 220 Rotary Hammer (₹7,899)** - 720W, 2.0J impact energy, 22mm SDS-Plus with overload clutch.\n2. **Bosch GWS 600 4" Grinder (₹3,199)** - 670W, 11,000 RPM with armoured dust-resistant coils.\n3. **Bosch GST 650 Variable Jigsaw (₹3,799)** - 450W, 3,100 SPM with built-in cutline dust blower.\n\nAll models are in stock and qualify for free 2-day commercial freight dispatch!`,
      products: [gbh, gws].filter(Boolean),
      followUps: [
        '⚡ Bosch GBH 220 Rotary Hammer specs',
        '⚡ Bosch GWS 600 Angle Grinder specs',
        '🔩 Drill bits for Bosch hammers'
      ]
    };
  }

  // 4. MAKITA
  if (q.includes('makita')) {
    const hr = findByName('HR2470');
    const sp = findByName('SP6000J');
    const ga = findByName('GA4030');
    return {
      text: `Our commercial **Makita** fleet includes:\n\n1. **Makita HR2470 24mm Rotary Hammer (₹9,299)**: 780W, 2.4J impact energy with mechanical torque limiter clutch.\n2. **Makita GA4030 4" Angle Grinder (₹3,499)**: 720W, 11,000 RPM, slim 57mm barrel grip with labyrinth seals.\n3. **Makita SP6000J 165mm Plunge Track Saw (₹21,999)**: 1,300W with 2mm preliminary scoring mode for zero veneer tear-out.`,
      products: [hr, sp, ga].filter(Boolean),
      followUps: [
        '⚡ Makita HR2470 Rotary Hammer specs',
        '⚡ Makita SP6000J Plunge Track Saw specs',
        '⚡ Makita GA4030 Angle Grinder specs'
      ]
    };
  }

  // 5. DEWALT
  if (q.includes('dewalt')) {
    const dcd = findByName('DCD796');
    const dwe = findByName('DWE493');
    const dcs = findByName('DCS380');
    return {
      text: `Our **DeWalt** heavy-duty contractor collection features:\n\n1. **DeWalt DCD796 20V XR Hammer Drill (₹12,499)**: 460 UWO, 34,000 BPM, all-metal ratcheting chuck.\n2. **DeWalt DWE493 9" Angle Grinder 2200W (₹7,299)**: 2,200W heavy industrial with epoxy-coated windings.\n3. **DeWalt DCS380 20V Reciprocating Saw (₹9,899)**: 4-position keyless blade clamp, 3,000 SPM.`,
      products: [dcd, dwe, dcs].filter(Boolean),
      followUps: [
        '⚡ DeWalt DCD796 Hammer Drill details',
        '⚡ DeWalt DWE493 9-inch Grinder details',
        '🔩 ShockWave torsion impact bit set'
      ]
    };
  }

  // 6. SAFETY & PPE
  if (q.includes('safety') || q.includes('osha') || q.includes('dust') || q.includes('shroud') || q.includes('helmet') || q.includes('glove') || q.includes('shoe') || q.includes('glass') || q.includes('ppe')) {
    const ppe1 = findByName('Safety Helmet') || findByName('Helmet');
    const ppe2 = findByName('Cut-Resistant Work Gloves') || findByName('Gloves');
    const ppe3 = findByName('Dust Extraction Surface Grinder Shroud');
    return {
      text: `TouchPower commercial safety gear is certified to strict industrial standards:\n\n- **OSHA Dust Extraction Shroud (₹2,199)**: 29 CFR 1926.1153 Table 1 compliant for respirable crystalline silica.\n- **Pro-Armor Vented Safety Helmet (₹1,499)**: ANSI Z89.1 Type 1 Class C with 6-point ratchet suspension.\n- **ArmorGrip Level 5 Cut Gloves (₹699)**: EN388 Level 5 cut protection with sandy micro-foam nitrile palm.\n- **TitanShield Steel-Toe Shoes (₹3,299)**: 200J steel toe + 1100N puncture-resistant Kevlar midsole.\n- **ClearSight Anti-Fog Safety Glasses (₹499)**: ANSI Z87.1+ ballistic wrap-around.`,
      products: [ppe1, ppe2, ppe3].filter(Boolean),
      followUps: [
        '🛡️ OSHA cut-off saw containment guard',
        '🧯 TitanShield steel-toe work shoes',
        '⚡ Angle grinders in stock'
      ]
    };
  }

  // 7. FREIGHT / SHIPPING
  if (q.includes('ship') || q.includes('freight') || q.includes('dispatch') || q.includes('delivery') || q.includes('track') || q.includes('order')) {
    return {
      text: `**TouchPower Commercial Logistics Policy:**\n\n- **Same-Day Dispatch:** Orders placed before 2:00 PM IST dispatch the same business day from our regional commercial logistics hubs.\n- **Free 2-Day Freight:** Guaranteed 2-day delivery to verified jobsite addresses on all orders over **₹4,999**.\n- **Live Dispatch Tracking:** Real-time milestone tracking (Pending → Processing → Shipped → Out for Delivery → Delivered) available in the #tracking tab.`,
      products: [
        findByName('TouchPower X-Pro Rotary Hammer Drill'),
        findByName('14" Laser-Welded')
      ].filter(Boolean),
      followUps: [
        '📦 Track an existing order',
        '⚡ View machines catalog',
        '🛡️ Contractor fleet accounts'
      ]
    };
  }

  // 8. BUDGET / PRICE
  if (q.includes('under') || q.includes('cheap') || q.includes('budget') || q.includes('how much') || q.includes('price') || q.includes('cost') || /\b\d{3,5}\b/.test(q)) {
    let budget = 10000;
    const match = q.match(/\b(\d{3,5})\b/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 500 && parsed <= 50000) budget = parsed;
    }
    const budgetProds = products.filter(p => parseFloat(p.price) <= budget).slice(0, 3);
    return {
      text: `Here are top-performing commercial tools engineered for heavy-duty jobsites priced under **₹${budget.toLocaleString('en-IN')}**:\n\nEach includes hardened steel components, brushless efficiency, and free 2-day commercial freight dispatch.`,
      products: budgetProds,
      followUps: [
        '⚡ Heavy-duty machines catalog',
        '🪚 Diamond blades catalog',
        '🚚 Commercial freight schedule'
      ]
    };
  }

  // 9. DRILLS / CORING / CONCRETE
  if (q.includes('drill') || q.includes('hammer') || q.includes('core') || q.includes('coring') || q.includes('concrete')) {
    const drill1 = findByName('TouchPower X-Pro Rotary Hammer') || findByName('Rotary Hammer');
    const bits = findByName('Drill-Master Premium Titanium') || findByName('Bits');
    return {
      text: `For structural concrete coring and masonry demolition, the **TouchPower X-Pro Rotary Hammer Drill (₹9,999)** delivers **1,200 in-lbs of peak torque** and **3.4 Joules of impact energy** at 3,000 RPM brushless output. It features an OSHA-rated sealed magnesium gear casing with multi-stage vibration dampening.\n\nPair it with our **SDS-Plus carbide bits** for rapid penetration without bit shearing.`,
      products: [drill1, bits].filter(Boolean),
      followUps: [
        '🪚 Diamond blades for reinforced concrete',
        '🛡️ OSHA Table 1 silica dust extraction',
        '🚚 Commercial freight schedule'
      ]
    };
  }

  // 10. BLADES & CUTTING
  if (q.includes('blade') || q.includes('diamond') || q.includes('granite') || q.includes('marble') || q.includes('stone') || q.includes('cut')) {
    const blade1 = findByName('14" Laser-Welded Diamond') || findByName('Diamond');
    const blade2 = findByName('Carbide Oscillating');
    return {
      text: `For reinforced concrete, granite slabs, and structural masonry, the **Sharp-Edge 14" Laser-Welded Diamond Turbo Blade (₹2,499)** is engineered with robotic laser-welded diamond segments and turbine air-cooling gullets that eliminate teeth shedding under prolonged high-temperature friction.\n\nFor tight plunge cuts in wood, nails, or copper pipes, check out our **Titanium Carbide 10-Piece Multitool Blades (₹1,299)**.`,
      products: [blade1, blade2].filter(Boolean),
      followUps: [
        '⚡ Angle grinder for diamond blades',
        '🛡️ OSHA cut-off containment guard',
        '💰 Blades under ₹3,000'
      ]
    };
  }

  // 11. GENERAL FALLBACK
  const topPicks = [
    findByName('TouchPower X-Pro Rotary Hammer Drill') || products[0],
    findByName('14" Laser-Welded') || products[1]
  ].filter(Boolean);

  return {
    text: `TouchPower specializes in industrial-grade commercial power equipment engineered for extreme duty cycles with zero thermal throttling. I've highlighted two of our primary fleet tools below.\n\nWhat specific application, material, or tool category are you working with today?`,
    products: topPicks,
    followUps: [
      '⚡ Concrete & masonry coring',
      '🪚 Steel & structural timber cutting',
      '🛡️ OSHA Table 1 silica safety',
      '🔩 High-torque fastener driving'
    ]
  };
}

/**
 * Enhanced Markdown Formatter
 * Formats bolding, italics, code/spec tags, bullet lists, and numbered lists.
 */
function formatMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Check for unordered bullet list (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    // Check for ordered list (1. 2.)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${formatInline(ulMatch[1])}</li>`;
      continue;
    }

    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${formatInline(olMatch[2])}</li>`;
      continue;
    }

    // Not a list item
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
      listType = '';
    }

    if (line === '') {
      html += '<div style="height: 6px;"></div>';
    } else {
      html += `<p style="margin: 4px 0;">${formatInline(line)}</p>`;
    }
  }

  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  return html;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function loadHistory() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      chatMessages = JSON.parse(raw);
    }
  } catch (e) {
    chatMessages = [];
  }
}

function saveHistory() {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages.slice(-20)));
  } catch (e) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

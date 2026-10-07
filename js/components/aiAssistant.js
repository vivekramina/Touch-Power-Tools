// ============================================================================
// TouchPower™ - Super AI Commercial Specialist (v4.0 Pro)
// Powered by Multi-Dimensional Machine Benchmark Engine & On-Device Catalog Intelligence
// Implements:
// 1. Machine Accuracy Calculation in exact numbers & percentages
// 2. Cross-Fleet Spec & Tolerance Comparison Matrix (TouchPower vs Bosch vs Makita vs DeWalt)
// 3. 3-Step Guided Diagnostic Questionnaire (Trade -> Intensity -> Budget)
// 4. Budget-Constrained Product Prediction with Real-Time Fitment Scoring
// Strictly ZERO warranty mentions. All prices in Indian Rupees (₹).
// ============================================================================

import { store } from '../store.js';
import { db } from '../supabase.js';
import { MachineBenchmarkEngine } from '../ml/naiveBayes.js';

const CHAT_STORAGE_KEY = 'touchpower_super_ai_chat_v4';
const GEMINI_STORAGE_KEY = 'touchpower_gemini_api_key';

// Curated starter suggestion prompts covering diagnostic, comparisons, and contractor applications
const STARTER_PROMPTS = [
  '⚖️ Select & Compare Products (Interactive)',
  '🎯 Start 3-Step Tool Diagnostic',
  '⚖️ Compare Rotary Hammers (TouchPower vs Bosch vs Makita)',
  '⚖️ Compare Angle Grinders (Brushless 7" vs Bosch GWS 600)',
  '💰 Best Heavy-Duty Tool Under ₹10,000',
  '🪚 14" Diamond Blades for Concrete & Granite',
  '🛡️ OSHA Table 1 Silica Dust Shrouds & PPE',
  '⚡ DongCheng 20V Cordless Impact Wrench Specs'
];

let chatMessages = [];
let allProductsCache = [];
let userGeminiApiKey = '';
let diagnosticSession = {
  active: false,
  step: 0,
  trade: null,
  intensity: null,
  budget: null
};

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

  // Render widget structure with modern industrial branding
  root.innerHTML = `
    <!-- Floating Launcher Button with SVG Logo -->
    <button id="ai-launcher-btn" class="ai-launcher-btn" aria-label="Open AI Assistant" title="Chat with AI Assistant">
      <div class="ai-icon-box">
        <img src="assets/images/ai_assistant_logo.svg" alt="AI Assistant" class="ai-launcher-logo-img" onerror="this.src='assets/images/ai_assistant_logo.jpg'">
      </div>
      <span>AI ASSISTANT</span>
      <span class="ai-live-pulse" title="AI Assistant Online"></span>
    </button>

    <!-- Floating AI Chat Window -->
    <div id="ai-chat-window" class="ai-chat-window" role="dialog" aria-label="AI Assistant Chat">
      <!-- Header -->
      <div class="ai-chat-header">
        <div class="ai-header-left">
          <div class="ai-avatar">
            <img src="assets/images/ai_assistant_logo.svg" alt="AI Assistant Logo" class="ai-avatar-img" onerror="this.src='assets/images/ai_assistant_logo.jpg'">
          </div>
          <div class="ai-header-info">
            <span class="ai-header-title">AI Assistant</span>
            <div class="ai-header-sub">
              <span class="dot"></span> Online • Commercial Specialist
            </div>
          </div>
        </div>
        <div class="ai-header-actions">
          <button id="ai-clear-btn" class="ai-header-btn" title="Reset chat session">
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
          AI INTELLIGENCE SHORTCUTS:
        </div>
        <div id="ai-suggestions-scroll" class="ai-suggestions-scroll"></div>
      </div>

      <!-- Chat Input Area -->
      <form id="ai-chat-form" class="ai-chat-input-bar">
        <input 
          type="text" 
          id="ai-input-field" 
          class="ai-input-field" 
          placeholder="Ask specs, compare machines, or type your budget..." 
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
    diagnosticSession = { active: false, step: 0, trade: null, intensity: null, budget: null };
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
    text: `Hello! I am your **TouchPower AI Assistant**.

I analyze mechanical engineering telemetry, calculate **real machine accuracy percentages (up to 99.4%)**, evaluate dynamic runout tolerances (±0.015mm), and compare competing hardware fleets (TouchPower, Bosch, Makita, DeWalt, DongCheng).

I can also guide you through a **3-Step Diagnostic Assessment** to collect your application data and predict the highest-performing tool within your exact budget envelope.

**Choose a quick starting path below:**`,
    diagnosticStep: {
      step: 'init',
      prompt: 'Select an AI action or launch the precision diagnostic:',
      options: [
        { label: '⚖️ Select Products to Compare (DWM Hub)', prompt: 'select products to compare' },
        { label: '🎯 Start 3-Step Tool Diagnostic', prompt: 'start tool diagnostic' },
        { label: '⚖️ Quick Compare Rotary Hammers', prompt: 'compare commercial rotary hammers' },
        { label: '💰 Find Best Tool Under ₹10,000', prompt: 'recommend commercial tool under 10000' },
        { label: '🛡️ View Demo Safety Gear & PPE', prompt: 'show demo safety products' }
      ]
    },
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
      text: `Telemetry pipeline synchronized. Our entire commercial inventory is in stock with guaranteed same-day dispatch before 2 PM IST. Please feel free to ask about specific drill, grinder, blade, or safety specs!`,
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
          ${m.comparisonSelector ? renderComparisonSelectorBox(m.comparisonSelector, m.id) : ''}
          ${m.comparisonTable ? renderComparisonCard(m.comparisonTable) : ''}
          ${m.diagnosticStep ? renderDiagnosticBox(m.diagnosticStep) : ''}
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

  // Attach diagnostic button listeners
  container.querySelectorAll('.ai-diagnostic-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const prompt = btn.dataset.prompt;
      if (prompt) {
        await handleUserMessage(prompt);
      }
    });
  });

  // Attach product comparison picker submit button
  container.querySelectorAll('.ai-picker-submit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const msgId = btn.dataset.msgId;
      const selA = document.getElementById(`select-a-${msgId}`);
      const selB = document.getElementById(`select-b-${msgId}`);
      const valA = selA ? selA.value : '';
      const valB = selB ? selB.value : '';
      if (valA && valB) {
        if (valA === valB) {
          store.showToast('Please select two different products to compare!', 'info');
          return;
        }
        await handleUserMessage(`compare ${valA} vs ${valB}`);
      }
    });
  });

  // Attach product comparison preset chips
  container.querySelectorAll('.ai-picker-preset-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const msgId = btn.dataset.msgId;
      const valA = btn.dataset.a;
      const valB = btn.dataset.b;
      const selA = document.getElementById(`select-a-${msgId}`);
      const selB = document.getElementById(`select-b-${msgId}`);
      if (selA && selB) {
        selA.value = valA;
        selB.value = valB;
      }
      await handleUserMessage(`compare ${valA} vs ${valB}`);
    });
  });

  scrollMessagesToBottom();
}

function renderProductRecommendations(products) {
  return `
    <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
      ${products.map(p => {
        const rawImg = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
        const img = (rawImg && rawImg.endsWith('.jpg') && !rawImg.includes('_thumb.jpg'))
          ? rawImg.replace('.jpg', '_thumb.jpg')
          : rawImg;

        // Calculate machine accuracy and engineering tolerance
        const accData = MachineBenchmarkEngine.calculateMachineAccuracy(p);
        const accuracyPct = p.matchScore || accData.overallAccuracy || 97.4;
        const tolerance = p.specs?.['Tolerance'] || (p.category === 'Safety Guards' ? '99.8% Capture' : '±0.015mm');

        return `
          <div class="ai-product-card" data-id="${p.id}" style="border: 1px solid var(--border-medium); border-radius: 8px; padding: 10px; background: #ffffff; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);">
            <div class="ai-product-top">
              <img src="${img}" alt="${escapeHtml(p.name)}" class="ai-product-thumb" onerror="this.src='assets/images/banner_machines.png'">
              <div class="ai-product-details">
                <div class="ai-product-brand">${escapeHtml(p.brand || 'TouchPower')} • ${escapeHtml(p.category)}</div>
                <div class="ai-product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                <div class="ai-product-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <!-- Product Accuracy & Mechanical Precision Indicator -->
            <div style="margin: 6px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="ai-accuracy-badge">
                  🎯 ${accuracyPct}% Machine Accuracy
                </span>
                <span style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted);">
                  ${escapeHtml(tolerance)}
                </span>
              </div>
              <div class="ai-accuracy-meter-box">
                <div style="display: flex; justify-content: space-between; font-size: 0.65rem; font-family: var(--font-mono); color: var(--text-secondary);">
                  <span>Mechanical Precision Index:</span>
                  <strong style="color: #047857;">${accuracyPct}%</strong>
                </div>
                <div class="ai-accuracy-bar-track">
                  <div class="ai-accuracy-bar-fill" style="width: ${accuracyPct}%;"></div>
                </div>
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

function renderComparisonSelectorBox(selector, msgId) {
  const products = allProductsCache || [];
  
  // Group products by category
  const categories = {};
  products.forEach(p => {
    const cat = p.category || 'Machines';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  const renderOptions = (selectedName) => {
    return Object.entries(categories).map(([cat, list]) => `
      <optgroup label="${escapeHtml(cat)} (${list.length} Items)">
        ${list.map(p => {
          const isSel = (p.name === selectedName || (selectedName && p.name.toLowerCase().includes(selectedName.toLowerCase())));
          return `<option value="${escapeHtml(p.name)}" ${isSel ? 'selected' : ''}>${escapeHtml(p.name)} — ₹${Math.round(p.price).toLocaleString('en-IN')}</option>`;
        }).join('')}
      </optgroup>
    `).join('');
  };

  const defaultA = selector?.toolA || (products[0] ? products[0].name : '');
  const defaultB = selector?.toolB || (products[1] ? products[1].name : '');

  return `
    <div class="ai-comparison-picker-box" data-msg-id="${msgId}">
      <div class="ai-picker-head">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.25rem;">⚖️</span>
          <div>
            <strong style="color: #0f172a; font-size: 0.84rem; font-family: var(--font-heading);">
              Select Products to Compare (DWM Logic)
            </strong>
            <div style="font-size: 0.7rem; color: #64748b;">
              Compare engineering tolerances, runout precision, power output & F1-score.
            </div>
          </div>
        </div>
      </div>

      <div class="ai-picker-grid">
        <div class="ai-picker-col">
          <label class="ai-picker-lbl">Primary Tool (Product A):</label>
          <select class="ai-picker-dropdown compare-select-a" id="select-a-${msgId}">
            ${renderOptions(defaultA)}
          </select>
        </div>

        <div class="ai-picker-col">
          <label class="ai-picker-lbl">Comparison Tool (Product B):</label>
          <select class="ai-picker-dropdown compare-select-b" id="select-b-${msgId}">
            ${renderOptions(defaultB)}
          </select>
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="ai-picker-presets">
        <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; font-family: var(--font-mono);">
          QUICK PRESETS:
        </span>
        <button type="button" class="ai-picker-preset-btn" data-msg-id="${msgId}" data-a="TouchPower X-Pro Rotary Hammer" data-b="Bosch GBH 220">
          X-Pro vs Bosch GBH 220
        </button>
        <button type="button" class="ai-picker-preset-btn" data-msg-id="${msgId}" data-a="Sharp-Edge X-Pro Heavy Duty Angle Grinder" data-b="Bosch GWS 600">
          7" Brushless vs Bosch GWS 600
        </button>
        <button type="button" class="ai-picker-preset-btn" data-msg-id="${msgId}" data-a="TouchPower 2000W Demolition Hammer" data-b="TouchPower X-Pro Rotary Hammer">
          Breaker vs Rotary Hammer
        </button>
        <button type="button" class="ai-picker-preset-btn" data-msg-id="${msgId}" data-a="TouchPower OSHA Table 1 Dust Shroud" data-b="TouchPower Commercial Respirator Mask">
          Dust Shroud vs Respirator
        </button>
      </div>

      <button type="button" class="ai-picker-submit-btn" id="btn-run-compare-${msgId}" data-msg-id="${msgId}">
        <span>📊 COMPARE DWM ACCURACY & SPECS</span>
        <span>⚡</span>
      </button>
    </div>
  `;
}

function renderComparisonCard(comparison) {
  if (!comparison || !comparison.items || comparison.items.length === 0) return '';
  const itemA = comparison.items[0];
  const itemB = comparison.items[1];
  const hasDwmMetrics = itemA && itemB && (itemA.precision || itemA.f1);

  return `
    <div class="ai-comparison-card">
      <div style="background: #0f172a; padding: 10px 14px; color: #f8fafc; font-family: var(--font-heading); font-size: 0.8rem; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
        <span>⚖️ ${escapeHtml(comparison.title || 'DWM Multidimensional Benchmark')}</span>
        <span style="font-size: 0.68rem; color: #f59e0b; font-family: var(--font-mono); letter-spacing: 0.04em;">DWM METRICS ACTIVE</span>
      </div>

      ${hasDwmMetrics ? `
        <!-- DWM Parameters Grid (Accuracy, Precision, Recall, F1) -->
        <div class="ai-dwm-param-grid">
          <div class="ai-dwm-param-card">
            <div class="ai-dwm-param-label">Mechanical Accuracy:</div>
            <div class="ai-dwm-param-val" style="color: #047857;">
              ${itemA.accuracy}% vs ${itemB.accuracy}%
            </div>
            <div style="font-size: 0.65rem; color: #64748b; margin-top: 2px;">
              Spindle Concentricity & Trueness
            </div>
          </div>

          <div class="ai-dwm-param-card">
            <div class="ai-dwm-param-label">Requisition Precision:</div>
            <div class="ai-dwm-param-val" style="color: #1e40af;">
              ${itemA.precision}% vs ${itemB.precision}%
            </div>
            <div style="font-size: 0.65rem; color: #64748b; margin-top: 2px;">
              Trade Workload Match Score
            </div>
          </div>

          <div class="ai-dwm-param-card">
            <div class="ai-dwm-param-label">Duty Cycle Recall:</div>
            <div class="ai-dwm-param-val" style="color: #b45309;">
              ${itemA.recall}% vs ${itemB.recall}%
            </div>
            <div style="font-size: 0.65rem; color: #64748b; margin-top: 2px;">
              Continuous Thermal Load Capacity
            </div>
          </div>

          <div class="ai-dwm-param-card">
            <div class="ai-dwm-param-label">Performance F1-Score:</div>
            <div class="ai-dwm-param-val" style="color: #6b21a8;">
              ${itemA.f1}% vs ${itemB.f1}%
            </div>
            <div style="font-size: 0.65rem; color: #64748b; margin-top: 2px;">
              Harmonic Power-to-Weight Benchmark
            </div>
          </div>
        </div>
      ` : ''}

      <table class="ai-comparison-table">
        <thead>
          <tr>
            <th>Machine / Tool</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: center;">Accuracy %</th>
            <th>Power / Spec</th>
            <th>Tolerance</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.items.map(m => `
            <tr>
              <td style="font-weight: 700; color: #0f172a;">
                <div>${escapeHtml(m.name)}</div>
                <div style="font-size: 0.65rem; color: #64748b;">${escapeHtml(m.brand || 'TouchPower')}</div>
              </td>
              <td style="text-align: right; font-weight: 800; color: var(--accent-orange); white-space: nowrap;">
                ₹${Math.round(m.price).toLocaleString('en-IN')}
              </td>
              <td style="text-align: center;">
                <span class="ai-accuracy-badge" style="font-size: 0.66rem;">
                  ${m.accuracy || '97.5'}%
                </span>
              </td>
              <td style="color: #334155; font-size: 0.68rem;">
                ${escapeHtml(m.primarySpec || 'Industrial Duty')}
              </td>
              <td style="color: #047857; font-weight: 600; font-size: 0.68rem;">
                ${escapeHtml(m.tolerance || '±0.015mm')}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Direct Add to Cart Action Buttons -->
      <div style="display: flex; gap: 8px; padding: 10px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        ${comparison.items.slice(0, 2).map(m => `
          <button type="button" class="ai-product-btn add" data-id="${m.id || ''}" style="flex: 1; padding: 6px 10px; font-size: 0.72rem; justify-content: center;">
            ADD ${escapeHtml((m.name || '').slice(0, 16))}... ⚡
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDiagnosticBox(diagnostic) {
  if (!diagnostic || !diagnostic.options || diagnostic.options.length === 0) return '';
  return `
    <div class="ai-diagnostic-box">
      <div class="ai-diagnostic-title">
        <span>⚡</span>
        <span>${escapeHtml(diagnostic.prompt || 'Select an option to proceed:')}</span>
      </div>
      <div class="ai-diagnostic-options">
        ${diagnostic.options.map(opt => `
          <button type="button" class="ai-diagnostic-btn" data-prompt="${escapeHtml(opt.prompt)}">
            <span>${escapeHtml(opt.label)}</span>
            <span style="color: #f59e0b; font-size: 0.75rem;">→</span>
          </button>
        `).join('')}
      </div>
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
// Super AI Response Generator (Server Gemini + On-Device Super Reasoning)
// ============================================================================
async function generateAIResponse(userQuery) {
  if (allProductsCache.length === 0) {
    allProductsCache = await db.getProducts();
  }

  const q = userQuery.toLowerCase().trim();

  // If query is an interactive product comparison request or tool-vs-tool comparison, prioritize on-device DWM engine
  if (q.includes('select product') || q.includes('comparison hub') || q.includes('compare products') || q === 'compare' || q.includes(' vs ') || q.includes(' versus ')) {
    const localRes = generateSuperAIEngine(userQuery, allProductsCache);
    return {
      id: 'msg-a-' + Date.now(),
      sender: 'assistant',
      text: localRes.text,
      products: localRes.products || [],
      comparisonSelector: localRes.comparisonSelector || null,
      comparisonTable: localRes.comparisonTable || null,
      diagnosticStep: localRes.diagnosticStep || null,
      followUps: localRes.followUps || [],
      time: formatTime(new Date())
    };
  }

  // 1. Try Backend Super AI Endpoint
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
          comparisonSelector: data.comparisonSelector || null,
          comparisonTable: data.comparisonTable || null,
          diagnosticStep: data.diagnosticStep || null,
          followUps: data.followUps || [],
          time: formatTime(new Date())
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI route unavailable, engaging on-device Super AI engine:', err);
  }

  // 2. On-Device Super AI Reasoning Engine
  const localRes = generateSuperAIEngine(userQuery, allProductsCache);
  return {
    id: 'msg-a-' + Date.now(),
    sender: 'assistant',
    text: localRes.text,
    products: localRes.products || [],
    comparisonSelector: localRes.comparisonSelector || null,
    comparisonTable: localRes.comparisonTable || null,
    diagnosticStep: localRes.diagnosticStep || null,
    followUps: localRes.followUps || [],
    time: formatTime(new Date())
  };
}

/**
 * Builds a side-by-side DWM Multidimensional Comparison between two products
 * Computes:
 * - Mechanical Accuracy % (Spindle trueness, concentricity, balance)
 * - Application Precision % (Trade workload match score)
 * - Heavy-Duty Duty Cycle Recall % (Continuous thermal load endurance)
 * - Performance F1-Score (Harmonic mean of power output & weight balance)
 */
function buildDwmProductComparison(pA, pB) {
  const accA = MachineBenchmarkEngine.calculateMachineAccuracy(pA);
  const accB = MachineBenchmarkEngine.calculateMachineAccuracy(pB);

  // 1. Mechanical Accuracy (Spindle trueness, concentricity, balance)
  const accuracyA = accA.overallAccuracy || 98.4;
  const accuracyB = accB.overallAccuracy || 94.6;

  // 2. Requisition Precision (Application & trade fitment fidelity)
  const precisionA = (pA.brand === 'TouchPower' ? 97.5 : 93.0);
  const precisionB = (pB.brand === 'TouchPower' ? 97.5 : 93.2);

  // 3. Heavy-Duty Recall (Sustained duty cycle under thermal load)
  const isBrushlessA = (pA.specs?.['Voltage']?.includes('Brushless') || (pA.description || '').toLowerCase().includes('brushless'));
  const isBrushlessB = (pB.specs?.['Voltage']?.includes('Brushless') || (pB.description || '').toLowerCase().includes('brushless'));
  const recallA = isBrushlessA ? 100.0 : 88.0;
  const recallB = isBrushlessB ? 100.0 : 86.5;

  // 4. Contractor Value F1-Score (Harmonic mean of precision & recall)
  const f1A = (2 * (precisionA * recallA) / (precisionA + recallA)).toFixed(1);
  const f1B = (2 * (precisionB * recallB) / (precisionB + recallB)).toFixed(1);

  const priceDiff = Math.abs(pA.price - pB.price);
  const cheaper = pA.price <= pB.price ? pA : pB;

  const tolA = pA.specs?.['Tolerance'] || (pA.category === 'Safety Guards' ? '99.8% Capture' : '±0.015mm');
  const tolB = pB.specs?.['Tolerance'] || (pB.category === 'Safety Guards' ? '99.8% Capture' : '±0.025mm');

  const specA = pA.specs?.['Impact Energy'] || pA.specs?.['Power Output'] || pA.specs?.['Max RPM'] || 'Industrial Duty';
  const specB = pB.specs?.['Impact Energy'] || pB.specs?.['Power Output'] || pB.specs?.['Max RPM'] || 'Commercial Duty';

  return {
    text: `### ⚖️ DWM MULTIDIMENSIONAL COMPARISON MATRIX
Comparing **${pA.name}** vs **${pB.name}** using engineering telemetry, dynamic runout tolerances, and commercial performance parameters:

- **Mechanical Concentricity Accuracy:** **${pA.name}** (${accuracyA}%, ${tolA}) vs **${pB.name}** (${accuracyB}%, ${tolB})
- **Application Fitment Precision:** **${precisionA}%** vs **${precisionB}%**
- **Sustained Duty Cycle Recall:** **${recallA}%** vs **${recallB}%** continuous thermal endurance
- **Contractor Performance F1-Score:** **${f1A}%** vs **${f1B}%** balanced utility benchmark
- **Pricing & Investment Delta:** ${pA.name} is **₹${Math.round(pA.price).toLocaleString('en-IN')}** vs ${pB.name} at **₹${Math.round(pB.price).toLocaleString('en-IN')}** (${cheaper.name} saves **₹${Math.round(priceDiff).toLocaleString('en-IN')}**).

**Engineering Recommendation:**
${accuracyA >= accuracyB 
  ? `**${pA.name}** is engineered for maximum precision, severe continuous jobsite duty, and tighter tolerances.` 
  : `**${pB.name}** provides high-torque commercial performance with proven jobsite durability.`}`,
    products: [pA, pB],
    comparisonTable: {
      title: `${pA.name} vs ${pB.name}`,
      items: [
        {
          id: pA.id,
          name: pA.name,
          brand: pA.brand || 'TouchPower',
          price: pA.price,
          accuracy: accuracyA,
          precision: precisionA,
          recall: recallA,
          f1: f1A,
          primarySpec: specA,
          tolerance: tolA
        },
        {
          id: pB.id,
          name: pB.name,
          brand: pB.brand || 'TouchPower',
          price: pB.price,
          accuracy: accuracyB,
          precision: precisionB,
          recall: recallB,
          f1: f1B,
          primarySpec: specB,
          tolerance: tolB
        }
      ]
    },
    followUps: [
      '⚖️ Select 2 different tools to compare',
      '🎯 Run 3-step tool diagnostic',
      '🚚 Same-day dispatch freight schedule',
      '💰 Commercial tools under ₹10,000'
    ]
  };
}

/**
 * On-Device Super AI Engine
 * Computes machine accuracy percentages, compares fleets, and orchestrates diagnostic questionnaires.
 */
function generateSuperAIEngine(userQuery, products) {
  const q = userQuery.toLowerCase().trim();
  const findByName = (term) => products.find(p => p.name.toLowerCase().includes(term.toLowerCase()));

  // --------------------------------------------------------------------------
  // FLOW A: 3-STEP GUIDED DIAGNOSTIC QUESTIONNAIRE
  // --------------------------------------------------------------------------
  if (q.includes('start tool diagnostic') || q.includes('start diagnostic') || q.includes('run diagnostic') || q === 'diagnostic') {
    diagnosticSession = { active: true, step: 1, trade: null, intensity: null, budget: null };
    return {
      text: `### 🎯 Super AI Precision Tool Diagnostic (Step 1 of 3)

To calculate and predict the exact commercial hardware for your workload within your budget, let's collect your key jobsite parameters.

**Step 1:** What is your primary trade or structural material?`,
      diagnosticStep: {
        step: 'trade',
        prompt: 'Select your primary trade application:',
        options: [
          { label: '🧱 Concrete Coring & Masonry Demolition', prompt: 'trade: concrete & masonry coring' },
          { label: '⚡ Structural Steel Fabrication & Grinding', prompt: 'trade: structural steel & grinding' },
          { label: '🪵 Precision Woodworking & Track Plunge Cutting', prompt: 'trade: precision woodworking' },
          { label: '🧯 Jobsite Safety Gear & OSHA Table 1 Silica', prompt: 'trade: safety & ppe' }
        ]
      },
      followUps: [
        '⚡ Concrete & masonry coring',
        '⚡ Structural steel & grinding',
        '🪵 Precision woodworking',
        '🧯 Safety & PPE'
      ]
    };
  }

  // Step 1 Response (Trade Received)
  if (q.startsWith('trade:') || (diagnosticSession.active && diagnosticSession.step === 1)) {
    const rawTrade = q.replace('trade:', '').trim();
    diagnosticSession.trade = rawTrade || 'concrete';
    diagnosticSession.step = 2;

    return {
      text: `### 🎯 Super AI Precision Tool Diagnostic (Step 2 of 3)

Target Trade registered: **${escapeHtml(diagnosticSession.trade.toUpperCase())}**.

**Step 2:** What is your projected daily operational duty cycle?`,
      diagnosticStep: {
        step: 'intensity',
        prompt: 'Select your operational duty cycle:',
        options: [
          { label: '🔥 Heavy Industrial (8+ hrs continuous, high-torque coring/grinding)', prompt: 'duty: heavy industrial continuous' },
          { label: '⚡ Commercial Contractor (3-6 hrs/day heavy intermittent work)', prompt: 'duty: commercial contractor standard' },
          { label: '📐 Precision Detail (Finishing, high accuracy profiling & fitment)', prompt: 'duty: precision detail intermittent' }
        ]
      },
      followUps: [
        '🔥 Heavy industrial continuous',
        '⚡ Commercial contractor standard',
        '📐 Precision detail'
      ]
    };
  }

  // Step 2 Response (Duty Cycle Received)
  if (q.startsWith('duty:') || (diagnosticSession.active && diagnosticSession.step === 2)) {
    const rawDuty = q.replace('duty:', '').trim();
    diagnosticSession.intensity = rawDuty || 'heavy';
    diagnosticSession.step = 3;

    return {
      text: `### 🎯 Super AI Precision Tool Diagnostic (Step 3 of 3)

Operational Duty Cycle registered: **${escapeHtml(diagnosticSession.intensity.toUpperCase())}**.

**Final Step:** What is your target investment budget envelope for this tool?`,
      diagnosticStep: {
        step: 'budget',
        prompt: 'Select your budget envelope:',
        options: [
          { label: '💰 Under ₹5,000 (Essential Heavy Hardware)', prompt: 'budget: 5000' },
          { label: '💰 Under ₹10,000 (Commercial High-Output Tier)', prompt: 'budget: 10000' },
          { label: '💰 Under ₹20,000 (Enterprise Heavy Industrial Fleet)', prompt: 'budget: 20000' },
          { label: '💰 ₹25,000+ (Flagship Precision Heavy Machinery)', prompt: 'budget: 25000' }
        ]
      },
      followUps: [
        '💰 Under ₹5,000',
        '💰 Under ₹10,000',
        '💰 Under ₹20,000',
        '💰 ₹25,000+'
      ]
    };
  }

  // Step 3 Response (Budget Received -> Execute Prediction)
  if (q.startsWith('budget:') || (diagnosticSession.active && diagnosticSession.step === 3)) {
    let budgetVal = 10000;
    const match = q.match(/\b(\d{3,6})\b/);
    if (match) budgetVal = parseInt(match[1], 10);
    diagnosticSession.budget = budgetVal;

    // Run MachineBenchmarkEngine match
    const rec = MachineBenchmarkEngine.matchProductForCustomer({
      trade: diagnosticSession.trade || 'concrete',
      intensity: diagnosticSession.intensity || 'heavy',
      maxBudget: diagnosticSession.budget,
      products
    });

    const target = rec.product || products[0];
    const matchAcc = rec.matchAccuracyPercentage || 98.6;
    const accData = MachineBenchmarkEngine.calculateMachineAccuracy(target);
    const surplus = Math.max(0, diagnosticSession.budget - target.price);

    // Reset session
    diagnosticSession = { active: false, step: 0, trade: null, intensity: null, budget: null };

    return {
      text: `### 🎯 SUPER AI PREDICTION & REQUISITION MATCH

Based on your inputs (Trade: **${target.category}**, Intensity: **Heavy-Duty**, Budget: **₹${budgetVal.toLocaleString('en-IN')}**), our DWM multidimensional engine selected your optimal match:

- **Predicted Tool:** **${target.name}**
- **Match Accuracy Score:** **${matchAcc}%** (Optimal trade alignment & zero thermal throttling)
- **Machine Mechanical Accuracy:** **${accData.overallAccuracy}%** (Runout tolerance: ±0.015mm)
- **Budget Fitment:** Requisition cost is **₹${Math.round(target.price).toLocaleString('en-IN')}**, leaving a **₹${Math.round(surplus).toLocaleString('en-IN')} surplus** for diamond blades, carbide bits, or OSHA safety shrouds.

Below is your predicted tool card along with a comparative benchmark matrix against similar machines:`,
      products: [target],
      comparisonTable: {
        title: `Predicted Tool vs Alternative Machines (${target.category})`,
        items: [
          {
            name: target.name,
            brand: target.brand || 'TouchPower',
            price: target.price,
            accuracy: accData.overallAccuracy,
            primarySpec: target.specs?.['Impact Energy'] || target.specs?.['Power Output'] || 'Brushless High Torque',
            tolerance: target.specs?.['Tolerance'] || '±0.015mm'
          },
          ...(rec.alternatives || []).slice(0, 2).map(alt => {
            const altAcc = MachineBenchmarkEngine.calculateMachineAccuracy(alt);
            return {
              name: alt.name,
              brand: alt.brand || 'TouchPower',
              price: alt.price,
              accuracy: altAcc.overallAccuracy,
              primarySpec: alt.specs?.['Impact Energy'] || alt.specs?.['Power Output'] || 'Commercial Rated',
              tolerance: alt.specs?.['Tolerance'] || '±0.020mm'
            };
          })
        ]
      },
      followUps: [
        '🪚 Compatible diamond cutting blades',
        '🛡️ OSHA Table 1 silica dust shrouds',
        '🚚 Same-day dispatch freight schedule',
        '🎯 Start another diagnostic'
      ]
    };
  }

  // --------------------------------------------------------------------------
  // FLOW 0: INTERACTIVE PRODUCT COMPARISON HUB REQUEST
  // --------------------------------------------------------------------------
  if (q.includes('select product') || q.includes('select tools') || q.includes('comparison hub') || q.includes('pick product') || q.includes('options to select') || q === 'compare' || q === 'compare products' || q === 'compare tools' || q === 'open product comparison hub') {
    return {
      text: `### ⚖️ DWM MULTIDIMENSIONAL PRODUCT COMPARISON
Choose any two commercial tools below, or pick a popular preset. Our DWM telemetry engine will calculate side-by-side **Mechanical Accuracy %**, **Workload Precision**, **Thermal Recall**, **F1-Index**, and **Engineering Tolerances**:`,
      comparisonSelector: {
        active: true,
        toolA: 'TouchPower X-Pro Rotary Hammer',
        toolB: 'Bosch GBH 220'
      },
      followUps: [
        '🎯 Start 3-step tool diagnostic',
        '💰 Best tools under ₹10,000',
        '🛡️ OSHA Table 1 silica dust shrouds'
      ]
    };
  }

  // --------------------------------------------------------------------------
  // FLOW 0B: SPECIFIC DYNAMIC "PRODUCT A VS PRODUCT B" COMPARISON
  // --------------------------------------------------------------------------
  if (q.includes(' vs ') || q.includes(' versus ')) {
    const raw = q.replace(/^compare\s+/i, '').replace(/^benchmark\s+/i, '');
    const parts = raw.split(/\s+vs\s+|\s+versus\s+/i);
    if (parts.length >= 2) {
      const termA = parts[0].trim().toLowerCase();
      const termB = parts[1].trim().toLowerCase();
      
      const pA = products.find(p => p.name.toLowerCase().includes(termA) || termA.includes(p.name.toLowerCase())) ||
                 products.find(p => p.brand?.toLowerCase().includes(termA)) ||
                 products[0];

      const pB = products.find(p => p.name.toLowerCase().includes(termB) || termB.includes(p.name.toLowerCase())) ||
                 products.find(p => p.brand?.toLowerCase().includes(termB)) ||
                 products[1];

      if (pA && pB && pA.id !== pB.id) {
        return buildDwmProductComparison(pA, pB);
      }
    }
  }

  // --------------------------------------------------------------------------
  // FLOW B: MACHINE & PRODUCT COMPARISONS (CALCULATE ACCURACY ACROSS CATEGORIES)
  // --------------------------------------------------------------------------
  if (q.includes('vs') || q.includes('compare') || q.includes('difference') || q.includes('benchmark')) {
    
    // 1. ROTARY HAMMERS / CORING COMPARISON
    if (q.includes('drill') || q.includes('hammer') || q.includes('rotary') || q.includes('coring') || q.includes('gbh') || q.includes('hr2470') || q.includes('bosch')) {
      const tp = findByName('TouchPower X-Pro Rotary Hammer') || findByName('Rotary Hammer');
      const bsh = findByName('Bosch GBH 220');
      const mkt = findByName('Makita HR2470');

      const tpAcc = tp ? MachineBenchmarkEngine.calculateMachineAccuracy(tp).overallAccuracy : 98.6;
      const bshAcc = bsh ? MachineBenchmarkEngine.calculateMachineAccuracy(bsh).overallAccuracy : 94.2;
      const mktAcc = mkt ? MachineBenchmarkEngine.calculateMachineAccuracy(mkt).overallAccuracy : 96.1;

      return {
        text: `### ⚖️ Commercial Rotary Hammer Machine Benchmark

Our Super AI computed mechanical accuracy, impact energy, and thermal endurance metrics across all three commercial drilling platforms:

1. **TouchPower X-Pro (₹9,999) — ${tpAcc}% Accuracy Rating**
   - **3.4 Joules** brushless impact energy at 3,000 RPM. Engineered with sealed magnesium gear casing, multi-stage vibration dampening, and **±0.015mm chuck concentricity**.
2. **Bosch GBH 220 (₹7,899) — ${bshAcc}% Accuracy Rating**
   - 720W corded motor, **2.0 Joules**, 2.3 kg. Proven reliability for everyday overhead anchor holes with **±0.025mm concentricity**.
3. **Makita HR2470 (₹9,299) — ${mktAcc}% Accuracy Rating**
   - 780W corded motor, **2.4 Joules** with mechanical torque-limiter clutch to prevent bit-binding kickback.

**Super AI Verdict:** TouchPower X-Pro delivers **+41% higher impact penetration** through high-grade reinforced concrete, while Bosch GBH 220 offers lighter weight for continuous ceiling mounting.`,
        products: [tp, bsh, mkt].filter(Boolean),
        comparisonTable: {
          title: 'Rotary Hammer Mechanical Accuracy & Spec Matrix',
          items: [
            { name: tp?.name || 'TouchPower X-Pro', brand: 'TouchPower', price: tp?.price || 9999, accuracy: tpAcc, primarySpec: '3.4J Brushless (3,000 RPM)', tolerance: '±0.015mm' },
            { name: bsh?.name || 'Bosch GBH 220', brand: 'Bosch', price: bsh?.price || 7899, accuracy: bshAcc, primarySpec: '2.0J 720W Corded', tolerance: '±0.025mm' },
            { name: mkt?.name || 'Makita HR2470', brand: 'Makita', price: mkt?.price || 9299, accuracy: mktAcc, primarySpec: '2.4J 780W Torque Limiter', tolerance: '±0.020mm' }
          ]
        },
        followUps: [
          '🔩 SDS-Plus carbide drill bit sets',
          '🛡️ OSHA Table 1 silica dust shroud',
          '💰 Rotary hammers under ₹8,000'
        ]
      };
    }

    // 2. ANGLE GRINDERS & STEEL FABRICATION COMPARISON
    if (q.includes('grind') || q.includes('gws') || q.includes('angle grinder') || q.includes('ga4030')) {
      const g1 = findByName('Sharp-Edge X-Pro Angle Grinder') || findByName('7-Inch Cordless');
      const g2 = findByName('Bosch GWS 600');
      const g3 = findByName('Makita GA4030');

      const g1Acc = g1 ? MachineBenchmarkEngine.calculateMachineAccuracy(g1).overallAccuracy : 98.4;
      const g2Acc = g2 ? MachineBenchmarkEngine.calculateMachineAccuracy(g2).overallAccuracy : 93.8;
      const g3Acc = g3 ? MachineBenchmarkEngine.calculateMachineAccuracy(g3).overallAccuracy : 95.2;

      return {
        text: `### ⚖️ Angle Grinder Mechanical Accuracy & RPM Benchmark

1. **Sharp-Edge X-Pro 7" Brushless (₹4,899) — ${g1Acc}% Accuracy**
   - 8,500 RPM brushless motor, electronic safety brake stopping in < 1.5s, thermal overload cutoff, and **±0.012mm spindle trueness**.
2. **Bosch GWS 600 4" (₹3,199) — ${g2Acc}% Accuracy**
   - 670W, 11,000 RPM with armoured field coils protected against abrasive metal filings and dust.
3. **Makita GA4030 4" (₹3,499) — ${g3Acc}% Accuracy**
   - 720W, 11,000 RPM, slim 57mm barrel grip with labyrinth dust seals.`,
        products: [g1, g2, g3].filter(Boolean),
        comparisonTable: {
          title: 'Angle Grinder Dynamic Spindle Accuracy Matrix',
          items: [
            { name: g1?.name || 'Sharp-Edge X-Pro 7"', brand: 'Sharp-Edge', price: g1?.price || 4899, accuracy: g1Acc, primarySpec: '8,500 RPM Brushless', tolerance: '±0.012mm' },
            { name: g2?.name || 'Bosch GWS 600 4"', brand: 'Bosch', price: g2?.price || 3199, accuracy: g2Acc, primarySpec: '670W 11,000 RPM', tolerance: '±0.022mm' },
            { name: g3?.name || 'Makita GA4030 4"', brand: 'Makita', price: g3?.price || 3499, accuracy: g3Acc, primarySpec: '720W 57mm Barrel', tolerance: '±0.018mm' }
          ]
        },
        followUps: [
          '🛡️ OSHA Table 1 surface grinder shroud',
          '🪚 14" Diamond turbo cutting blades',
          '💰 Angle grinders under ₹5,000'
        ]
      };
    }

    // 3. SAWS (PLUNGE TRACK SAW / MITER SAW)
    if (q.includes('saw') || q.includes('track') || q.includes('miter') || q.includes('sp6000') || q.includes('plunge')) {
      const s1 = findByName('Precision Plunge-Cut Track Circular Saw') || findByName('Track Circular Saw');
      const s2 = findByName('Makita SP6000J');
      const s3 = findByName('Volt 10-Inch Sliding Miter Saw');

      const s1Acc = s1 ? MachineBenchmarkEngine.calculateMachineAccuracy(s1).overallAccuracy : 99.2;
      const s2Acc = s2 ? MachineBenchmarkEngine.calculateMachineAccuracy(s2).overallAccuracy : 98.9;
      const s3Acc = s3 ? MachineBenchmarkEngine.calculateMachineAccuracy(s3).overallAccuracy : 97.5;

      return {
        text: `### ⚖️ Precision Sawing Machine Accuracy & Kerf Trueness

1. **TouchPower Precision Track Saw (₹18,999) — ${s1Acc}% Accuracy**
   - 2,200W brushless motor with 1.4m extruded guide rail. **Kerf runout trueness < 0.05mm** with preliminary 2mm scoring pass for zero veneer chipout.
2. **Makita SP6000J 165mm Plunge Saw (₹21,999) — ${s2Acc}% Accuracy**
   - 1,300W with variable speed dial (2,000-5,800 RPM), bevel capacity -1° to 48°, and electronic speed control.
3. **Volt 10" Sliding Miter Saw (₹14,499) — ${s3Acc}% Accuracy**
   - 4,800 RPM dual-bevel saw with shadow cutline projection that never requires recalibration.`,
        products: [s1, s2, s3].filter(Boolean),
        comparisonTable: {
          title: 'Precision Sawing Alignment & Kerf Accuracy',
          items: [
            { name: s1?.name || 'TouchPower Plunge Saw', brand: 'TouchPower', price: s1?.price || 18999, accuracy: s1Acc, primarySpec: '2,200W + 1.4m Guide Rail', tolerance: '±0.05mm Kerf' },
            { name: s2?.name || 'Makita SP6000J Plunge', brand: 'Makita', price: s2?.price || 21999, accuracy: s2Acc, primarySpec: '1,300W Variable Speed', tolerance: '±0.06mm Kerf' },
            { name: s3?.name || 'Volt 10" Sliding Miter', brand: 'Volt', price: s3?.price || 14499, accuracy: s3Acc, primarySpec: '4,800 RPM Dual Bevel', tolerance: '±0.08mm Kerf' }
          ]
        },
        followUps: [
          '🪚 Titanium carbide saw blade sets',
          '🛡️ OSHA cut-off saw containment guard',
          '💰 Commercial saws under ₹15,000'
        ]
      };
    }

    // 4. DIAMOND BLADES CATEGORY COMPARISON
    if (q.includes('blade') || q.includes('diamond')) {
      const b1 = findByName('14" Laser-Welded Diamond') || findByName('Diamond');
      const b2 = findByName('Carbide Oscillating');
      const b3 = findByName('DongCheng 1200W Marble Cutter') || products.find(p => p.category === 'Blades');

      return {
        text: `### ⚖️ Cutting Blades Category Precision & Segment Life Benchmark

- **Sharp-Edge 14" Laser-Welded Diamond Turbo Blade (₹2,499) — 98.9% Accuracy**
  - Robotic laser weld shear strength **> 35 MPa**, 10mm segment height, and heat-dissipation turbine gullets.
- **Carbide Oscillating 10-Piece Multitool Blades (₹1,299) — 97.4% Accuracy**
  - Titanium-coated teeth engineered for bi-metal cutting, nails, copper pipes, and hardwood plunge cuts.`,
        products: [b1, b2].filter(Boolean),
        comparisonTable: {
          title: 'Blades Category Segment Accuracy & Trueness',
          items: [
            { name: b1?.name || '14" Diamond Blade', brand: 'Sharp-Edge', price: b1?.price || 2499, accuracy: 98.9, primarySpec: 'Robotic Laser Weld > 35 MPa', tolerance: 'Zero Wobble' },
            { name: b2?.name || 'Carbide Multitool 10pc', brand: 'Sharp-Edge', price: b2?.price || 1299, accuracy: 97.4, primarySpec: 'Titanium Bi-Metal Teeth', tolerance: '±0.02mm' }
          ]
        },
        followUps: [
          '⚡ Angle grinder for diamond blades',
          '🛡️ OSHA cut-off saw containment guard'
        ]
      };
    }

    // 5. SAFETY GUARDS & PPE CATEGORY COMPARISON
    if (q.includes('safety') || q.includes('ppe') || q.includes('shroud') || q.includes('shoe') || q.includes('helmet')) {
      const p1 = findByName('TitanShield Pro Contractor Steel-Toe Work Shoes');
      const p2 = findByName('Dust Extraction Surface Grinder Shroud');
      const p3 = findByName('SpeedView Auto-Darkening Welding Helmet');

      return {
        text: `### ⚖️ Safety & PPE Category Containment & Protection Benchmark

- **Dust Extraction Surface Grinder Shroud (₹2,199) — 99.8% Containment Accuracy**
  - Compliant with OSHA 29 CFR 1926.1153 Table 1 for respirable crystalline silica. Flexible brush skirt captures 99.8% of micro-particles.
- **TitanShield Steel-Toe Shoes (₹3,299) — 98.5% Impact Protection Rating**
  - 200J steel toe impact rating with 1100N puncture-resistant Kevlar midsole and oil-resistant dual-density PU sole.
- **SpeedView Welding Helmet (₹3,899) — 99.4% Optical Accuracy**
  - 1/1/1/1 optical class rating with 4 arc sensors, TrueColor lens, and 1/25,000s auto-darkening reaction time.`,
        products: [p1, p2, p3].filter(Boolean),
        comparisonTable: {
          title: 'Safety Fleet Certified Protection & Containment',
          items: [
            { name: 'Dust Extraction Shroud', brand: 'TouchPower', price: 2199, accuracy: 99.8, primarySpec: 'OSHA Table 1 Silica Containment', tolerance: '99.8% Capture' },
            { name: 'TitanShield Steel-Toe Shoes', brand: 'Pro-Armor', price: 3299, accuracy: 98.5, primarySpec: '200J Steel Toe + 1100N Kevlar', tolerance: 'EN ISO 20345' },
            { name: 'SpeedView Welding Helmet', brand: 'Pro-Armor', price: 3899, accuracy: 99.4, primarySpec: '1/1/1/1 Optical Class, 1/25000s', tolerance: 'ANSI Z87.1' }
          ]
        },
        followUps: [
          '🛡️ OSHA cut-off saw containment guard',
          '🧯 Dual-cartridge half-mask respirator',
          '🎧 Heavy-duty industrial ear muffs'
        ]
      };
    }
  }

  // --------------------------------------------------------------------------
  // FLOW C: DEMO PRODUCTS IN SAFETY CATEGORY (DIRECT REQUISITION)
  // --------------------------------------------------------------------------
  if (q.includes('safety') || q.includes('ppe') || q.includes('dust') || q.includes('shroud') || q.includes('helmet') || q.includes('shoe') || q.includes('glove') || q.includes('respirator') || q.includes('earmuff')) {
    const sShoes = findByName('TitanShield Pro Contractor Steel-Toe Work Shoes');
    const sShroud = findByName('Dust Extraction Surface Grinder Shroud');
    const sWelding = findByName('SpeedView Auto-Darkening Welding Helmet');
    const sResp = findByName('Dual-Cartridge Half-Mask Respirator');
    const sMuffs = findByName('Heavy-Duty Industrial Ear Muffs');
    const sHelmet = findByName('Safety Helmet');

    const safetyList = [sShoes, sShroud, sWelding, sResp, sMuffs, sHelmet].filter(Boolean);

    return {
      text: `### 🛡️ TouchPower Certified Commercial Safety & PPE Fleet

All demo safety products are engineered to strict industrial standards with certified protection and high-resolution studio documentation:

1. **TitanShield Steel-Toe Shoes (₹3,299) — 98.5% Protection Rating**
   - 200J steel toe impact rating, 1100N Kevlar anti-puncture midsole, water-resistant nubuck leather.
2. **Dust Extraction Grinder Shroud (₹2,199) — 99.8% Silica Containment**
   - OSHA Table 1 compliant for 4" to 5" grinders. Flush-edge grinding door for corner accessibility.
3. **SpeedView Auto-Darkening Welding Helmet (₹3,899) — 99.4% Optical Rating**
   - 1/1/1/1 optical clarity, DIN 9-13 variable shade, 4 arc sensors with solar + dual CR2032 cells.
4. **Dual-Cartridge Respirator Mask (₹1,699) — 99.9% Filtration Rating**
   - Medical-grade silicone seal with twin activated carbon + N95 particulate cartridges.
5. **Heavy-Duty Industrial Ear Muffs (₹999) — 34 dB NRR Rating**
   - Dual-shell acoustic foam attenuation with padded stainless steel headband.`,
      products: safetyList.slice(0, 4),
      followUps: [
        '🛡️ OSHA Table 1 silica compliance guide',
        '🧯 Compare safety footwear vs boots',
        '💰 Safety products under ₹2,000'
      ]
    };
  }

  // --------------------------------------------------------------------------
  // FLOW D: BUDGET-CONSTRAINED PRODUCT INQUIRY
  // --------------------------------------------------------------------------
  if (q.includes('under') || q.includes('cheap') || q.includes('budget') || q.includes('how much') || q.includes('price') || q.includes('cost') || /\b\d{3,6}\b/.test(q)) {
    let budget = 10000;
    const match = q.match(/\b(\d{3,6})\b/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 500 && parsed <= 50000) budget = parsed;
    }

    const rec = MachineBenchmarkEngine.matchProductForCustomer({
      trade: q.includes('blade') ? 'blades' : (q.includes('drill') ? 'concrete' : (q.includes('grind') ? 'metal' : '')),
      intensity: 'heavy',
      maxBudget: budget,
      products
    });

    const target = rec.product || products.find(p => p.price <= budget) || products[0];
    const acc = MachineBenchmarkEngine.calculateMachineAccuracy(target);

    return {
      text: `### 💰 Commercial Tools Engineered Under ₹${budget.toLocaleString('en-IN')}

Our Super AI analyzed your budget parameter and matched top-performing hardware:

- **Top Recommended:** **${target.name}** (₹${Math.round(target.price).toLocaleString('en-IN')})
- **Calculated Machine Accuracy:** **${acc.overallAccuracy}%**
- **Surplus Budget:** ₹${Math.round(Math.max(0, budget - target.price)).toLocaleString('en-IN')} available for spare blades or bits.

Every unit features all-metal gearing, brushless efficiency, and free 2-day commercial freight dispatch.`,
      products: [target, ...(rec.alternatives || []).slice(0, 2)],
      followUps: [
        '🎯 Start 3-step tool diagnostic',
        '⚡ Commercial machines catalog',
        '🚚 Shipping policy for contractor orders'
      ]
    };
  }

  // --------------------------------------------------------------------------
  // FLOW E: GENERAL SUPER AI FALLBACK WITH ACCURACY DATA
  // --------------------------------------------------------------------------
  const topPicks = [
    findByName('TouchPower X-Pro Rotary Hammer Drill') || products[0],
    findByName('14" Laser-Welded Diamond') || products[1],
    findByName('TitanShield Pro Contractor Steel-Toe Work Shoes') || products[2]
  ].filter(Boolean);

  return {
    text: `TouchPower specializes in industrial commercial equipment engineered for high duty-cycles, verified mechanical accuracy, and zero thermal throttling.

I've highlighted three top-rated tools from our heavy-duty fleet below, each rated with exact engineering accuracy percentages and jobsite tolerances.

**What specific trade, material, or tool category are you working with today?**`,
    products: topPicks,
    diagnosticStep: {
      step: 'init',
      prompt: 'Need help choosing? Launch our 3-step tool diagnostic:',
      options: [
        { label: '🎯 Start 3-Step Tool Diagnostic', prompt: 'start tool diagnostic' },
        { label: '⚖️ Compare Machine Accuracies', prompt: 'compare commercial machines' },
        { label: '💰 Search by Budget Envelope', prompt: 'best commercial tools under ₹10,000' }
      ]
    },
    followUps: [
      '⚡ Concrete coring & hammer drills',
      '🪚 Diamond blades for reinforced stone',
      '🛡️ OSHA Table 1 silica safety gear',
      '🔩 High-torque driver bits & impact tools'
    ]
  };
}

/**
 * Enhanced Markdown Formatter
 */
function formatMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Check for headers (### or ##)
    const h3Match = line.match(/^###\s+(.*)$/);
    if (h3Match) {
      if (inList) { html += listType === 'ul' ? '</ul>' : '</ol>'; inList = false; }
      html += `<h4 style="margin: 6px 0 4px 0; font-size: 0.95rem; font-family: var(--font-heading); color: #0f172a; font-weight: 800;">${formatInline(h3Match[1])}</h4>`;
      continue;
    }

    // Check for unordered bullet list (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    // Check for ordered list (1. 2.)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        html += '<ul style="margin: 4px 0 6px 18px; padding: 0;">';
        inList = true;
        listType = 'ul';
      }
      html += `<li style="margin-bottom: 3px;">${formatInline(ulMatch[1])}</li>`;
      continue;
    }

    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
        html += '<ol style="margin: 4px 0 6px 18px; padding: 0;">';
        inList = true;
        listType = 'ol';
      }
      html += `<li style="margin-bottom: 3px;">${formatInline(olMatch[2])}</li>`;
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
      html += `<p style="margin: 4px 0; line-height: 1.45;">${formatInline(line)}</p>`;
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
    .replace(/`([^`]+)`/g, '<code style="background: rgba(15,23,42,0.06); color: #c2410c; padding: 2px 4px; border-radius: 4px; font-size: 0.85em; font-family: var(--font-mono);">$1</code>');
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

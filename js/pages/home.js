// ============================================================================
// TouchPower™ - Homepage View
// Light Mode Aesthetic: Hero Showcase, Top 3 Category Banners,
// 4-Category Explore Grid, Featured Products in Indian Rupees (₹), Customer Reviews,
// Certified Standards, and Jobsite Social Media Feed.
// ZERO warranty mentions.
// ============================================================================

import { renderHero } from '../components/hero.js';
import { db } from '../supabase.js';
import { store } from '../store.js';

export async function renderHomePage() {
  const products = await db.getProducts();

  // Featured tools matching mockups
  const featuredTools = products.slice(0, 8);

  const html = `
    <div class="page-home">
      <!-- 1. Hero & Category Showcase Component -->
      ${renderHero()}

      <!-- 2. Featured Products Grid (Light Mode) -->
      <section class="featured-products-section" aria-label="Featured Products">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="section-tag">YOUTUBE TESTED & CURATED GEAR</span>
              <h2 class="section-title">FEATURED PRODUCTS</h2>
            </div>
            <div class="section-actions">
              <a href="#catalog" class="btn btn-outline btn-sm">VIEW ALL TOOLS (${products.length}) →</a>
            </div>
          </div>

          <div class="products-grid">
            ${featuredTools.map((p) => {
              const rawImg = Array.isArray(p.image_urls) ? p.image_urls[0] : (p.image || 'assets/images/banner_machines.png');
              const img = (rawImg && rawImg.endsWith('.jpg') && !rawImg.includes('_thumb.jpg'))
                ? rawImg.replace('.jpg', '_thumb.jpg')
                : rawImg;
              return `
                <div class="product-card" data-id="${p.id}">
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
                    <span class="stock-pill in-stock">IN STOCK</span>
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
                      <span class="rating-text">${p.rating || 4.9} Stars (${p.reviews_count || 48})</span>
                    </div>

                    <div class="card-price-row">
                      <div class="card-price">₹${Math.round(p.price).toLocaleString('en-IN')}</div>
                      <div class="free-freight-tag">⚡ FREE FAST DELIVERY</div>
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
        </div>
      </section>

      <!-- 3. YouTube Product Test & Video Showcase Section -->
      <section class="youtube-showcase-section" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 70px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; margin-bottom: 36px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                <span style="background: #ef4444; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; font-family: var(--font-mono); letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 6px;">
                  <span style="font-size: 0.9rem;">▶</span> YOUTUBE FIELD REVIEWS
                </span>
                <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">@TOUCHPOWERVLOGS</span>
              </div>
              <h2 style="font-size: 2.2rem; font-family: var(--font-heading); color: #ffffff; font-weight: 800; letter-spacing: -0.01em; margin: 0;">
                WATCH REAL TOOL TORTURE TESTS
              </h2>
              <p style="color: #cbd5e1; font-size: 1rem; margin-top: 8px; max-width: 650px; line-height: 1.6;">
                Before any product is sold in our store, we torture-test it on camera. Watch non-stop concrete drilling, structural steel slicing, and drop tests.
              </p>
            </div>
            <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="btn" style="background: #ef4444; color: #ffffff; font-weight: 700; border: none; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
              <span>▶</span>
              <span>SUBSCRIBE ON YOUTUBE</span>
            </a>
          </div>

          <!-- Video Showcase Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
            <!-- Featured Video Card 1 -->
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s;">
              <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: #020617;">
                <img src="assets/images/banner_machines.png" alt="TouchPower X-Pro Test Video" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); text-decoration: none;">
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 1.4rem; padding-left: 4px; box-shadow: 0 4px 20px rgba(239,68,68,0.6);">
                    ▶
                  </div>
                </a>
                <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 700;">14:28</span>
                <span style="position: absolute; top: 10px; left: 10px; background: #ef4444; color: #fff; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 800;">LATEST REVIEW</span>
              </div>
              <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.8rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 6px;">FEATURED EPISODE • 148K VIEWS</div>
                  <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; line-height: 1.4; color: #ffffff; margin-bottom: 10px;">
                    EXTREME DESTRUCTION TEST: Can This 1500W Rotary Hammer Survive 100 Holes in Solid Concrete?
                  </h3>
                  <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">
                    We took our best-selling brushless core drill to an active jobsite to see if thermal protection holds up under non-stop full load.
                  </p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <a href="#product?id=c3d4e5f6-a1b2-4c3d-8e9f-012345678901" class="btn btn-primary btn-sm" style="flex: 1; justify-content: center; font-weight: 700;">
                    CHECK PRODUCT (₹9,999)
                  </a>
                  <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255,255,255,0.3); font-size: 0.8rem;">
                    WATCH ▶
                  </a>
                </div>
              </div>
            </div>

            <!-- Featured Video Card 2 -->
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s;">
              <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: #020617;">
                <img src="assets/images/banner_blades.png" alt="Diamond Blade Test Video" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); text-decoration: none;">
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 1.4rem; padding-left: 4px; box-shadow: 0 4px 20px rgba(239,68,68,0.6);">
                    ▶
                  </div>
                </a>
                <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 700;">11:05</span>
                <span style="position: absolute; top: 10px; left: 10px; background: #d97706; color: #fff; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 800;">BLADE LAB</span>
              </div>
              <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.8rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 6px;">BLADE COMPARISON • 96K VIEWS</div>
                  <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; line-height: 1.4; color: #ffffff; margin-bottom: 10px;">
                    Cheap Blade vs Laser-Welded Diamond: Cutting Reinforced Concrete & Rebar Head-to-Head
                  </h3>
                  <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">
                    Comparing segmented diamond matrices at 4,800 RPM. We show you exactly where cheap blades fail and which blade lasts 10x longer.
                  </p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <a href="#catalog?category=blades" class="btn btn-primary btn-sm" style="flex: 1; justify-content: center; font-weight: 700;">
                    SHOP BLADES
                  </a>
                  <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255,255,255,0.3); font-size: 0.8rem;">
                    WATCH ▶
                  </a>
                </div>
              </div>
            </div>

            <!-- Featured Video Card 3 -->
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s;">
              <div style="position: relative; aspect-ratio: 16/9; overflow: hidden; background: #020617;">
                <img src="assets/images/banner_bits.png" alt="Safety Gear & Bits Testing" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.35); text-decoration: none;">
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 1.4rem; padding-left: 4px; box-shadow: 0 4px 20px rgba(239,68,68,0.6);">
                    ▶
                  </div>
                </a>
                <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-weight: 700;">18:40</span>
                <span style="position: absolute; top: 10px; left: 10px; background: #10b981; color: #fff; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; font-weight: 800;">GEAR LAB</span>
              </div>
              <div style="padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.8rem; color: #94a3b8; font-family: var(--font-mono); margin-bottom: 6px;">SAFETY & HARDWARE • 112K VIEWS</div>
                  <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; line-height: 1.4; color: #ffffff; margin-bottom: 10px;">
                    Safety Gear Stress Test: Steel-Toe Shoes vs 200kg Drop & Cut-Resistant Gloves vs Angle Grinder
                  </h3>
                  <p style="color: #94a3b8; font-size: 0.88rem; line-height: 1.5; margin-bottom: 16px;">
                    We test certified helmets, puncture-proof shoes, and anti-fog glasses so you know exactly what gear protects your life on site.
                  </p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <a href="#catalog?category=safety-guards" class="btn btn-primary btn-sm" style="flex: 1; justify-content: center; font-weight: 700;">
                    SHOP SAFETY GEAR
                  </a>
                  <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: rgba(255,255,255,0.3); font-size: 0.8rem;">
                    WATCH ▶
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Customer Testimonials Section (Light Mode) -->
      <section class="testimonials-section" style="padding: 70px 0; background: #f8fafc;">
        <div class="container">
          <div class="section-header" style="text-align: center; margin-bottom: 40px;">
            <div>
              <span class="section-tag" style="justify-content: center;">JOBSITE FIELD REVIEWS</span>
              <h2 class="section-title">WHAT CONTRACTORS SAY</h2>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <!-- Testimonial 1 -->
            <div class="glass-card" style="padding: 28px; border-radius: 8px; position: relative;">
              <div style="font-size: 2.5rem; color: var(--accent-orange); font-family: serif; line-height: 1; margin-bottom: 8px;">“</div>
              <p style="color: #334155; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px;">
                The 22.5V Rotary Hammer tore through 4-inch cured foundation walls on our metro construction project without bogging down once. The anti-vibration grip saved our foremen serious fatigue.
              </p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff;">
                  MV
                </div>
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">Marcus Vance</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Master Superintendent, Vance Framing</div>
                </div>
              </div>
            </div>

            <!-- Testimonial 2 -->
            <div class="glass-card" style="padding: 28px; border-radius: 8px; position: relative;">
              <div style="font-size: 2.5rem; color: var(--accent-orange); font-family: serif; line-height: 1; margin-bottom: 8px;">“</div>
              <p style="color: #334155; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px;">
                We switched our entire crew to Sharp-Edge diamond discs. They outlast competitor blades 3 to 1 in granite and reinforced precast slabs. Freight dispatch has been spot-on every single time.
              </p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #ea580c; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff;">
                  SJ
                </div>
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">Sarah Jenkins</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Lead Estimator, Apex Concrete Works</div>
                </div>
              </div>
            </div>

            <!-- Testimonial 3 -->
            <div class="glass-card" style="padding: 28px; border-radius: 8px; position: relative;">
              <div style="font-size: 2.5rem; color: var(--accent-orange); font-family: serif; line-height: 1; margin-bottom: 8px;">“</div>
              <p style="color: #334155; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px;">
                The OSHA table 1 dust extraction shrouds passed site safety inspection with flying colors. Clean air on interior tenant fit-outs without having to haul heavy generators.
              </p>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #d97706; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff;">
                  DM
                </div>
                <div>
                  <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">David Miller</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Project Safety Director, Miller Steel Corp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Social Media Jobsite Feed with Official Links -->
      <section class="social-feed-section" style="padding: 60px 0; background: #ffffff; border-top: 1px solid var(--border-subtle);">
        <div class="container">
          <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
            <div>
              <span class="section-tag">COMMUNITY IN ACTION</span>
              <h2 class="section-title">#TOUCHPOWERPRO FIELD FEED</h2>
              <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px;">
                Connect with our YouTube & social creator community across Instagram, YouTube, and Facebook.
              </p>
            </div>
            
            <!-- Direct Social Media Links -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <a 
                href="https://www.instagram.com/touc_hpower_official?stkn=MWY4c2xkdnZhbXdvbQ==" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-sm"
                style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: #ffffff; font-weight: 700; border: none; padding: 8px 16px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(220, 39, 67, 0.3);"
              >
                <span>📸</span>
                <span>FOLLOW ON INSTAGRAM</span>
              </a>

              <a 
                href="https://www.youtube.com/@TOUCHPOWERVLOGS" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-sm"
                style="background: #ef4444; color: #ffffff; font-weight: 700; border: none; padding: 8px 16px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);"
              >
                <span>▶</span>
                <span>YOUTUBE CHANNEL</span>
              </a>

              <a 
                href="https://facebook.com/touchpowerofficial" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-outline btn-sm"
                style="font-size: 0.85rem; padding: 8px 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;"
              >
                <span>📘</span>
                <span>FACEBOOK</span>
              </a>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <a href="https://www.instagram.com/touc_hpower_official?stkn=MWY4c2xkdnZhbXdvbQ==" target="_blank" rel="noopener noreferrer" class="social-card" style="position: relative; border-radius: 8px; overflow: hidden; height: 260px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); display: block; text-decoration: none;">
              <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80" alt="Jobsite Wood Framing" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="social-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent); padding: 16px; color: #fff;">
                <span style="font-size: 0.75rem; color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">@touc_hpower_official • Instagram</span>
                <p style="font-size: 0.82rem; margin-top: 4px;">Framing roof trusses with the new 20V drill.</p>
              </div>
            </a>

            <a href="https://facebook.com/touchpowerofficial" target="_blank" rel="noopener noreferrer" class="social-card" style="position: relative; border-radius: 8px; overflow: hidden; height: 260px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); display: block; text-decoration: none;">
              <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" alt="Steel Grinding Sparks" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="social-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent); padding: 16px; color: #fff;">
                <span style="font-size: 0.75rem; color: #60a5fa; font-family: var(--font-mono); font-weight: 700;">@apexconcrete • Facebook</span>
                <p style="font-size: 0.82rem; margin-top: 4px;">Diamond cuts like butter through reinforced lintels.</p>
              </div>
            </a>

            <a href="https://www.instagram.com/touc_hpower_official?stkn=MWY4c2xkdnZhbXdvbQ==" target="_blank" rel="noopener noreferrer" class="social-card" style="position: relative; border-radius: 8px; overflow: hidden; height: 260px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); display: block; text-decoration: none;">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" alt="Angle Grinder Dust Shroud" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="social-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent); padding: 16px; color: #fff;">
                <span style="font-size: 0.75rem; color: #fbbf24; font-family: var(--font-mono); font-weight: 700;">@touc_hpower_official • Instagram</span>
                <p style="font-size: 0.82rem; margin-top: 4px;">Surface prep done in record time with OSHA shroud.</p>
              </div>
            </a>

            <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="social-card" style="position: relative; border-radius: 8px; overflow: hidden; height: 260px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); display: block; text-decoration: none;">
              <img src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80" alt="Contractor with Power Tools" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="social-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,23,42,0.9), transparent); padding: 16px; color: #fff;">
                <span style="font-size: 0.75rem; color: #ef4444; font-family: var(--font-mono); font-weight: 700;">@TOUCHPOWERVLOGS • YouTube</span>
                <p style="font-size: 0.82rem; margin-top: 4px;">Unloading new multi-brand shipments for channel reviews.</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  `;

  return html;
}

export function attachHomeEvents() {
  // Quick Add to Cart button handlers
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

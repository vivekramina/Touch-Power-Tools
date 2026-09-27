// ============================================================================
// TouchPower™ - Hero & Category Showcase Component
// Matches user mockups: Unleash The Power banner, top category banners,
// and 4-category explore cards (Machines, Blades, Bits, Safety Guards).
// Zero warranty mentions.
// ============================================================================

export function renderHero() {
  return `
    <!-- Main Hero Slider Section -->
    <section class="hero-section" aria-label="Hero Showcase">
      <div class="container hero-inner">
        <div class="hero-content">
          <h1 class="hero-title">
            TESTED ON JOBSITE.<br>
            <span class="text-highlight">TOUCHPOWER VLOGS</span><br>
            TOP BRANDS. REAL POWER.
          </h1>
          <p class="hero-subtitle">
            Welcome to the official TouchPower Vlogs gear store. We field-test the industry's toughest cordless machines, diamond blades, impact bits, and safety gear so you buy with 100% confidence.
          </p>
          <div class="hero-cta-group">
            <a href="#catalog" class="btn btn-primary btn-lg">
              SHOP TESTED GEAR
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <button type="button" class="btn btn-ai-hero" data-open-ai-assistant title="Consult TouchPower AI Commercial Specialist">
              <span class="btn-ai-hero-icon">
                <img src="assets/images/ai_assistant_logo.jpg" alt="AI Specialist" class="btn-ai-hero-img">
              </span>
              <span>AI ASSISTANT</span>
            </button>
            <a href="https://www.youtube.com/@TOUCHPOWERVLOGS" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg" style="display: inline-flex; align-items: center; gap: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>WATCH ON YOUTUBE ↗</span>
            </a>
          </div>

          <div class="hero-metrics">
            <div class="hero-metric-item">
              <span class="metric-val">1,200</span>
              <span class="metric-lbl">IN-LBS PEAK TORQUE</span>
            </div>
            <div class="hero-metric-item">
              <span class="metric-val">3,000</span>
              <span class="metric-lbl">RPM BRUSHLESS</span>
            </div>
            <div class="hero-metric-item">
              <span class="metric-val">OSHA</span>
              <span class="metric-lbl">TABLE 1 CERTIFIED</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-image-frame">
            <img 
              src="assets/images/drill_rotary_pro.jpg" 
              alt="TouchPower 22.5V Brushless High Torque Commercial Rotary Hammer Drill" 
              class="hero-img"
              onerror="this.src='assets/images/banner_machines.png'"
            >
            <div class="hero-glow"></div>
            <div class="hero-floating-badge">
              <span class="badge-title">VOLT 22.5V</span>
              <span class="badge-sub">HIGH CAPACITY LITHIUM</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Big Top Category Banners (From User Image 1) -->
    <section class="top-banners-section" aria-label="Featured Category Banners">
      <div class="container">
        <div class="top-banners-grid">
          <!-- MACHINES -->
          <a href="#catalog?category=machines" class="top-banner-card banner-machines">
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-tag">BRAND: VOLT</span>
              <h3 class="banner-title">MACHINES</h3>
              <p class="banner-desc">ULTRA-MODERN HEAVY-DUTY ROTARY HAMMER DRILL</p>
              <div class="banner-price-row">
                <span class="banner-price">₹9,999</span>
                <span class="banner-btn">SHOP NOW →</span>
              </div>
            </div>
            <div class="banner-img-box">
              <img src="assets/images/drill_rotary_pro_thumb.jpg" alt="Machines Hammer Drill" class="banner-img" width="140" height="140" decoding="async" onerror="this.src='assets/images/banner_machines.png'">
            </div>
          </a>

          <!-- BLADES -->
          <a href="#catalog?category=blades" class="top-banner-card banner-blades">
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-tag">BRAND: SHARP-EDGE</span>
              <h3 class="banner-title">BLADES</h3>
              <p class="banner-desc">HIGH-DEFINITION PREMIUM DIAMOND SAW BLADES</p>
              <div class="banner-price-row">
                <span class="banner-price">₹4,899</span>
                <span class="banner-btn">SHOP NOW →</span>
              </div>
            </div>
            <div class="banner-img-box">
              <img src="assets/images/blade_diamond_pro_thumb.jpg" alt="Diamond Blades" class="banner-img" width="140" height="140" decoding="async" onerror="this.src='assets/images/banner_blades.png'">
            </div>
          </a>

          <!-- BITS -->
          <a href="#catalog?category=bits" class="top-banner-card banner-bits">
            <div class="banner-overlay"></div>
            <div class="banner-content">
              <span class="banner-tag">BRAND: DRILL-MASTER</span>
              <h3 class="banner-title">BITS</h3>
              <p class="banner-desc">PREMIUM TITANIUM-COATED DRILL BITS</p>
              <div class="banner-price-row">
                <span class="banner-price">₹2,499</span>
                <span class="banner-btn">SHOP NOW →</span>
              </div>
            </div>
            <div class="banner-img-box">
              <img src="assets/images/banner_bits.png" alt="Drill Bits" class="banner-img" onerror="this.src='assets/images/mockup_home_grid.png'">
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Clean & Attractive Category Cards -->
    <section class="explore-categories-section" aria-label="Shop Categories">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-tag">CATALOG DIRECTORY</span>
            <h2 class="section-title">SHOP BY TRADE CATEGORY</h2>
          </div>
          <a href="#catalog" class="view-all-link">View All Tools →</a>
        </div>

        <div class="explore-grid">
          <!-- Machines -->
          <a href="#catalog?category=machines" class="explore-card">
            <div class="category-visual-box">
              <img src="assets/images/drill_rotary_pro_thumb.jpg" alt="Machines" onerror="this.src='assets/images/banner_machines.png'">
            </div>
            <h3 class="category-card-title">MACHINES</h3>
            <p class="category-card-sub">Heavy Drills, Saws & Grinders</p>
            <span class="category-card-action">Explore Machines →</span>
          </a>

          <!-- Blades -->
          <a href="#catalog?category=blades" class="explore-card">
            <div class="category-visual-box">
              <img src="assets/images/blade_diamond_pro_thumb.jpg" alt="Diamond Blades" onerror="this.src='assets/images/banner_blades.png'">
            </div>
            <h3 class="category-card-title">BLADES</h3>
            <p class="category-card-sub">Diamond & Carbide Cutters</p>
            <span class="category-card-action">Explore Blades →</span>
          </a>

          <!-- Bits -->
          <a href="#catalog?category=bits" class="explore-card">
            <div class="category-visual-box">
              <img src="assets/images/banner_bits.png" alt="Driver Bits" onerror="this.src='assets/images/cat_bits.png'">
            </div>
            <h3 class="category-card-title">BITS</h3>
            <p class="category-card-sub">Impact & Titanium Driver Sets</p>
            <span class="category-card-action">Explore Bits →</span>
          </a>

          <!-- Safety Guards -->
          <a href="#catalog?category=safety-guards" class="explore-card">
            <div class="category-visual-box">
              <img src="assets/images/safety/safety_helmet_pro.jpg" alt="Safety Guards" onerror="this.src='assets/images/cat_safety_guards.png'">
            </div>
            <h3 class="category-card-title">SAFETY GUARDS</h3>
            <p class="category-card-sub">Helmets, Gloves, Glasses & Vests</p>
            <span class="category-card-action">Explore Safety →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Top Industrial Brand Partners Showcase (Bosch, DongCheng, DeWalt, Makita) -->
    <section class="brands-showcase-section" aria-label="Brand Partners">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-tag">OFFICIAL BRAND PARTNERS</span>
            <h2 class="section-title">TOP INDUSTRIAL BRANDS</h2>
          </div>
          <a href="#catalog" class="view-all-link">Browse All Brands →</a>
        </div>

        <div class="brands-grid">
          <!-- BOSCH -->
          <a href="#catalog?brand=bosch" class="brand-card" title="Shop Bosch Commercial Tools">
            <div class="brand-logo-container">
              <img src="images/brands/bosch.png" alt="Bosch Professional Tools" class="brand-logo-img">
            </div>
            <div class="brand-info">
              <div class="brand-title">BOSCH</div>
              <div class="brand-count">Professional Power Tools</div>
              <span class="brand-action-link">View Collection →</span>
            </div>
          </a>

          <!-- DONGCHENG -->
          <a href="#catalog?brand=dongcheng" class="brand-card" title="Shop DongCheng Power Tools">
            <div class="brand-logo-container">
              <img src="images/brands/dongcheng.png" alt="DongCheng Professional Tools" class="brand-logo-img">
            </div>
            <div class="brand-info">
              <div class="brand-title">DONGCHENG</div>
              <div class="brand-count">Heavy Demolition & Cutting</div>
              <span class="brand-action-link">View Collection →</span>
            </div>
          </a>

          <!-- DEWALT -->
          <a href="#catalog?brand=dewalt" class="brand-card" title="Shop DeWalt Guaranteed Tough Tools">
            <div class="brand-logo-container">
              <img src="images/brands/dewalt.jpg" alt="DeWalt Guaranteed Tough" class="brand-logo-img">
            </div>
            <div class="brand-info">
              <div class="brand-title">DEWALT</div>
              <div class="brand-count">Guaranteed Tough Fleet</div>
              <span class="brand-action-link">View Collection →</span>
            </div>
          </a>

          <!-- MAKITA -->
          <a href="#catalog?brand=makita" class="brand-card" title="Shop Makita Commercial Tools">
            <div class="brand-logo-container">
              <img src="images/brands/makita.jpg" alt="Makita Industrial Tools" class="brand-logo-img">
            </div>
            <div class="brand-info">
              <div class="brand-title">MAKITA</div>
              <div class="brand-count">Cordless Innovation Leader</div>
              <span class="brand-action-link">View Collection →</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  `;
}

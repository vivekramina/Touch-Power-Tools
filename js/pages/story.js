// ============================================================================
// TouchPower™ - Brand Story Page
// Explains the TouchPower mission, heavy-duty industrial quality,
// Gen-4 thermal brushless technology, and precision craftsmanship.
// Zero warranty mentions.
// ============================================================================

export function renderStoryPage() {
  return `
    <div class="page-story">
      <!-- Story Hero Banner -->
      <section style="background: linear-gradient(135deg, #090c10 0%, #161d27 100%); border-bottom: 1px solid var(--border-medium); padding: 80px 0; text-align: center;">
        <div class="container" style="max-width: 800px;">
          <span class="badge badge-orange" style="margin-bottom: 14px;">PRECISION INDUSTRIAL ENGINEERING</span>
          <h1 style="font-size: 2.8rem; font-family: var(--font-heading); color: #fff; line-height: 1.15; margin-bottom: 16px;">
            POWER BEYOND LIMITS. BRED FOR THE TOUGHEST JOBSITES.
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6;">
            TouchPower was founded on a simple jobsite truth: commercial construction trades don't need consumer gimmicks. They need relentless motor power, drop-tested armor, and precision diamond edges that refuse to dull.
          </p>
        </div>
      </section>

      <!-- Mission & Engineering Philosophy -->
      <section style="padding: 70px 0; background: var(--bg-surface);">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; align-items: center;">
            <div>
              <span class="section-tag">OUR ORIGIN & PURPOSE</span>
              <h2 style="font-size: 2.2rem; font-family: var(--font-heading); color: #fff; margin-bottom: 16px;">
                THE ZERO-COMPROMISE STANDARD
              </h2>
              <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px;">
                Every tool in the TouchPower lineup is designed directly from feedback on high-rise concrete pours, structural steel erecting, and commercial infrastructure framing. When a tool fails in the field, entire crews stall and jobsite schedules bleed capital.
              </p>
              <p style="color: var(--text-secondary); line-height: 1.7;">
                That is why our engineers rebuild power delivery from the core: neodymium magnets, reinforced copper windings, epoxy-sealed switchgear, and cast magnesium housings drop-tested from 10 feet directly onto cured concrete slabs.
              </p>
            </div>

            <div style="border-radius: 8px; overflow: hidden; border: 2px solid var(--border-medium); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <img src="assets/images/hero_drill_desktop.png" alt="TouchPower Heavy Engineering" style="width: 100%; display: block;" onerror="this.src='https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'">
            </div>
          </div>
        </div>
      </section>

      <!-- 3 Core Engineering Pillars -->
      <section style="padding: 80px 0; background: #090c10; border-top: 1px solid var(--border-medium);">
        <div class="container">
          <div class="section-header" style="text-align: center; margin-bottom: 50px;">
            <span class="section-tag" style="justify-content: center;">TECHNOLOGICAL INNOVATION</span>
            <h2 class="section-title">THE THREE TOUCHPOWER ADVANTAGES</h2>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
            
            <!-- Pillar 1 -->
            <div class="glass-card" style="padding: 32px; border-radius: 8px; border-top: 4px solid var(--primary);">
              <div style="font-size: 2.2rem; margin-bottom: 16px;">⚡</div>
              <h3 style="font-size: 1.3rem; font-family: var(--font-heading); color: #fff; margin-bottom: 12px;">
                GEN-4 THERMAL BRUSHLESS
              </h3>
              <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
                Engineered with directional cooling air channels and thermal overload smart micro-controllers, TouchPower motors run up to 35% cooler under sustained stall-torque conditions than conventional cordless systems.
              </p>
            </div>

            <!-- Pillar 2 -->
            <div class="glass-card" style="padding: 32px; border-radius: 8px; border-top: 4px solid var(--accent-orange);">
              <div style="font-size: 2.2rem; margin-bottom: 16px;">🪚</div>
              <h3 style="font-size: 1.3rem; font-family: var(--font-heading); color: #fff; margin-bottom: 12px;">
                LASER-WELDED DIAMOND MATRIX
              </h3>
              <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
                Our Sharp-Edge diamond blades utilize robotic laser fusion to fuse high-concentration industrial diamonds into tensioned alloy cores. Segments will not shed or separate even under intense thermal loads.
              </p>
            </div>

            <!-- Pillar 3 -->
            <div class="glass-card" style="padding: 32px; border-radius: 8px; border-top: 4px solid var(--primary);">
              <div style="font-size: 2.2rem; margin-bottom: 16px;">🛡️</div>
              <h3 style="font-size: 1.3rem; font-family: var(--font-heading); color: #fff; margin-bottom: 12px;">
                OSHA SILICA COMPLIANCE
              </h3>
              <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">
                Designed specifically to meet and exceed OSHA 29 CFR 1926.1153 Table 1 standards for respirable crystalline silica dust extraction. Safer air, cleaner jobsites, and effortless safety audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom CTA Strip -->
      <section style="background: linear-gradient(135deg, #161d27, #090c10); padding: 60px 0; text-align: center; border-top: 1px solid var(--border-medium);">
        <div class="container" style="max-width: 600px;">
          <h2 style="font-size: 2rem; font-family: var(--font-heading); color: #fff; margin-bottom: 14px;">
            EQUIP YOUR CREW WITH TOUCHPOWER
          </h2>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">
            Explore our industrial catalogue of machines, blades, bits, and safety dust extraction guards.
          </p>
          <a href="#catalog" class="btn btn-primary btn-lg">
            BROWSE COMMERCIAL CATALOG →
          </a>
        </div>
      </section>
    </div>
  `;
}

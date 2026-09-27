// ============================================================================
// TouchPower™ - Seed Catalog Data
// Pricing in Indian Rupees (₹)
// Categories strictly: Machines, Blades, Bits, Safety Guards
// Integrated with user-provided images & YouTube video demonstration links
// ZERO warranty mentions.
// ============================================================================

export const INITIAL_PRODUCTS = [
  // MACHINES -----------------------------------------------------------------
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678901',
    name: 'TouchPower X-Pro Rotary Hammer Drill',
    category: 'Machines',
    price: 9999.00,
    description: 'Ultra-modern heavy-duty rotary hammer drill engineered for high-impact commercial concrete coring and masonry demolition. Equipped with continuous brushless output and anti-vibration ergonomic control.',
    stock_count: 42,
    image_urls: [
      'assets/images/drill_rotary_pro.jpg',
      'assets/images/pdp_rotary_hammer.png',
      'assets/images/banner_machines.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
    brand: 'VOLT',
    rating: 4.9,
    reviews_count: 128,
    contractor_location: 'Navi Mumbai Metro Corridor, MH',
    specs: {
      'Voltage': '22.5V Brushless High Torque',
      'RPM': '3,000 RPM',
      'Impact Energy': '3.4 Joules',
      'Chuck Type': 'SDS-Plus Quick Lock',
      'Weight': '3.1 kg',
      'Motor': 'Industrial Brushless 4-Pole',
      'Handle': 'Ergonomic 360-Degree Auxiliary'
    },
    features: [
      'Brushless continuous power delivery with Gen-4 cooling',
      'Ergonomic multi-position vibration dampening handle',
      'Precision depth gauge with auto-stop torque clutch',
      'Sealed magnesium gear casing for extreme jobsite durability'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678902',
    name: 'Volt Compact Industrial Miter Saw 10-Inch',
    category: 'Machines',
    price: 14499.00,
    description: 'Dual-bevel sliding compound miter saw delivering laser-guided precision crosscuts and miter angles up to 50 degrees left and right. Heavy cast aluminum table with rapid-lock clamp.',
    stock_count: 28,
    image_urls: [
      'assets/images/saw_miter_pro.jpg',
      'assets/images/tool_miter_saw.png',
      'assets/images/mockup_home_grid.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=F3_6eQo6t7s',
    brand: 'VOLT',
    rating: 4.9,
    reviews_count: 94,
    contractor_location: 'DLF Cyber City Expansion, Gurugram',
    specs: {
      'Blade Diameter': '10 Inch (254mm)',
      'No Load Speed': '4,800 RPM',
      'Bevel Capacity': 'Dual 0-48 deg',
      'Arbor Size': '5/8 Inch',
      'Weight': '14 kg',
      'Cutting Accuracy': '+/- 0.05 mm'
    },
    features: [
      'Shadow line LED cut guide never requires re-calibration',
      'High sliding fences support 5-1/2 inch nested crown molding',
      'Integrated dust port collects over 75% of particulate',
      'Cam-lock miter handle with detent override for fast locking'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678903',
    name: 'Sharp-Edge X-Pro Angle Grinder 7-Inch Cordless',
    category: 'Machines',
    price: 4899.00,
    description: 'High-torque industrial brushless angle grinder with rapid electronic brake stopping wheels in under 1.5 seconds. Designed for aggressive weld cleaning, steel cutting, and concrete surfacing.',
    stock_count: 65,
    image_urls: [
      'assets/images/grinder_angle_pro.jpg',
      'assets/images/tool_angle_grinder.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=vVj_pS3cW9I',
    brand: 'SHARP-EDGE',
    rating: 4.9,
    reviews_count: 87,
    contractor_location: 'Bengaluru Outer Ring Road Phase 2',
    specs: {
      'Wheel Diameter': '7 Inch (180mm)',
      'Spindle Thread': 'M14 / 5/8-11 UNC',
      'No Load Speed': '8,500 RPM',
      'Brake Time': '< 1.5s Rapid Electronic',
      'Weight': '2.4 kg',
      'Power Output': '18 Amp Heavy Equivalent'
    },
    features: [
      'Electronic kickback clutch disengages motor on wheel pinch',
      'Tool-free burst-resistant guard adjustment',
      'Removable epoxy-coated air screens protect motor from grinding dust',
      'Slim barrel perimeter with vibration-isolated side handle'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678904',
    name: 'TouchPower Precision Plunge-Cut Track Circular Saw',
    category: 'Machines',
    price: 18999.00,
    description: 'Ultra-precise brushless plunge-cut track circular saw with anti-splinter guard and variable speed control. Engineered for clean splinter-free sheet cutting on commercial jobsites.',
    stock_count: 19,
    image_urls: [
      'assets/images/saw_circular_pro.jpg',
      'assets/images/tool_table_saw.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=gT8ZcQv5d-8',
    brand: 'TOUCHPOWER',
    rating: 4.9,
    reviews_count: 64,
    contractor_location: 'GIFT City Financial Tower, Gujarat',
    specs: {
      'Track Length': '1.4 Meter Precision Guide Rail',
      'Motor Power': '2,200W High-Torque Brushless',
      'Blade Size': '165mm 48-Tooth Precision ATB',
      'Depth of Cut at 90': '65mm with Guide Rail',
      'Weight': '4.8 kg',
      'Base Plate': 'Die-Cast Magnesium'
    },
    features: [
      'Precision guide-rail alignment slots with zero-play adjustment',
      'Electronic speed stabilization maintains RPM under heavy load',
      'Scoring mode prevents splintering on delicate veneer and melamine',
      '360-degree rotating dust port connects cleanly to vacuum extractors'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678905',
    name: 'Volt Heavy-Duty Variable Speed Jigsaw',
    category: 'Machines',
    price: 5499.00,
    description: 'Precision barrel-grip orbital jigsaw with 4-position orbital action for fine cuts to aggressive rough cuts in lumber, aluminum, and sheet metal. Cast aluminum footplate with no-mar shoe.',
    stock_count: 35,
    image_urls: [
      'assets/images/tool_jigsaw.png',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=3V9K6j8vP1U',
    brand: 'VOLT',
    rating: 4.9,
    reviews_count: 52,
    contractor_location: 'Bullet Train Depot Construction, Ahmedabad',
    specs: {
      'Stroke Length': '26 mm (1 Inch)',
      'Strokes Per Min': '800 - 3,500 SPM',
      'Bevel Angle': '0 to 45 deg Dual Detents',
      'Orbital Settings': '4 Positions',
      'Weight': '2.3 kg',
      'Shoe Material': 'Cast Aluminum with No-Mar Cover'
    },
    features: [
      'All-metal keyless T-shank blade clamp for rapid changes',
      'Dual LED worklights eliminate cutting line shadows',
      'Adjustable dust blower keeps cut line clear of sawdust',
      'Counterbalanced mechanism minimizes vibration for maximum operator comfort'
    ]
  },

  // BLADES -------------------------------------------------------------------
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678906',
    name: 'Sharp-Edge 14" Laser-Welded Diamond Turbo Blade',
    category: 'Blades',
    price: 2499.00,
    description: 'Laser-welded commercial diamond cutting disc engineered for reinforced concrete, brick, granite, and fieldstone. Deep gullet design dissipates heat and evacuates sludge instantly.',
    stock_count: 85,
    image_urls: [
      'assets/images/blade_diamond_pro.jpg',
      'assets/images/banner_blades.png',
      'assets/images/tool_diamond_blade.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
    brand: 'SHARP-EDGE',
    rating: 5.0,
    reviews_count: 143,
    contractor_location: 'Mumbai Coastal Road Project, Worli',
    specs: {
      'Diameter': '14 Inch (350mm)',
      'Segment Height': '14mm Diamond Matrix',
      'Arbor Size': '1 Inch (25.4mm) / 20mm Bushing',
      'Max RPM': '5,400 RPM',
      'Cutting Type': 'Dry or Wet Cutting',
      'Core': 'Tensioned Heavy Alloy Steel'
    },
    features: [
      'Premium industrial diamond grit ensures up to 4x longer cutting life',
      'Keyhole gullet design accelerates slurry ejection and cooling',
      'Tensioned steel core reduces wobble and harmonic vibration',
      'Laser-welded segment joints withstand high heat without shedding'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678907',
    name: 'TouchPower Titanium Carbide Oscillating Multitool Blade 10-Piece Set',
    category: 'Blades',
    price: 1299.00,
    description: 'Commercial 10-piece titanium and carbide-tipped oscillating multitool saw blade set engineered for plunge cutting hardwood, drywall, nails, screws, and copper pipes.',
    stock_count: 120,
    image_urls: [
      'assets/images/blade_carbide_pro.jpg',
      'assets/images/tool_diamond_blade.png',
      'assets/images/cat_blades.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=kY3P6R7cE_w',
    brand: 'TOUCHPOWER',
    rating: 4.9,
    reviews_count: 76,
    contractor_location: 'Delhi-NCR Expressway Structural Hub',
    specs: {
      'Set Count': '10 Precision Blades',
      'Teeth': 'Titanium Carbide Bi-Metal',
      'Fitment': 'Universal Quick-Release Star Arbor',
      'Cutting Depth': 'Up to 65mm Plunge',
      'Coating': 'Titanium Nitride Anti-Friction'
    },
    features: [
      'Titanium carbide teeth resist heavy impact against hidden masonry and rebar',
      'Laser-etched depth gauges on both metric and imperial scales',
      'Universal arbor fits all major commercial oscillating multitools without adapters',
      'High-speed plunge tooth pattern delivers smooth, chatter-free cuts'
    ]
  },

  // BITS ---------------------------------------------------------------------
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678908',
    name: 'Drill-Master Premium Titanium-Coated Drill Bits',
    category: 'Bits',
    price: 1899.00,
    description: 'Precision 29-piece titanium nitride (TiN) coated M2 high-speed steel drill bit set with 135-degree split point tip that starts on contact without center punching.',
    stock_count: 95,
    image_urls: [
      'assets/images/banner_bits.png',
      'assets/images/cat_bits.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=Tz3F6p4tQ1Q',
    brand: 'DRILL-MASTER',
    rating: 4.9,
    reviews_count: 162,
    contractor_location: 'Tata Steel Yard Fabrication, Jamshedpur',
    specs: {
      'Pieces': '29-Piece Indexed Set',
      'Sizes': '1.5mm to 13mm by 0.5mm steps',
      'Coating': 'Titanium Nitride (TiN)',
      'Flute': 'Parabolic Precision Ground',
      'Case': 'Steel Index with Shock Corners'
    },
    features: [
      '135-degree split point prevents walking on hardened metals',
      'Titanium nitride coating reduces friction and heat buildup',
      'Heavy-gauge steel indexing storage case with rubber shock bumpers',
      'Ideal for structural steel, stainless steel, cast iron, and alloys'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678909',
    name: 'TouchPower ShockWave Torsion Impact Bit Set',
    category: 'Bits',
    price: 999.00,
    description: 'Contractor grade 40-piece impact driver bit set with engineered torsion flex zone that absorbs high peak torque spikes from 1/4" impact drivers without snapping.',
    stock_count: 140,
    image_urls: [
      'assets/images/cat_bits.png',
      'assets/images/banner_bits.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=B8x0Kq7tY1g',
    brand: 'TOUCHPOWER',
    rating: 4.9,
    reviews_count: 110,
    contractor_location: 'Hyderabad HITEC City Phase 3',
    specs: {
      'Drive Sizes': 'PH1-PH3, PZ1-PZ3, Torx T10-T40, Hex',
      'Shank': '1/4 Inch (6.35mm) Quick-Change Power Groove',
      'Steel': 'Custom S2 Modified Shock Steel',
      'Case': 'Drop-Proof Polycarbonate Case'
    },
    features: [
      'Optimized ShockZone geometry flexes to absorb peak torque spikes',
      'Precision CNC machined tips prevent stripping and cam-out',
      'Laser-hardened wear guard tip delivers supreme grip',
      'Modular customizable case with magnetic bit collar'
    ]
  },

  // SAFETY GUARDS ------------------------------------------------------------
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678910',
    name: 'TouchPower OSHA Dust Extraction Surface Grinder Shroud',
    category: 'Safety Guards',
    price: 2199.00,
    description: 'Heavy-duty universal 5" surface grinding dust shroud with spring-loaded flexible brush ring and flush-edge flip cover for grinding right up to walls and curbs.',
    stock_count: 58,
    image_urls: [
      'assets/images/cat_safety_guards.png',
      'assets/images/mockup_pdp.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=kY3P6R7cE_w',
    brand: 'TOUCHPOWER',
    rating: 4.9,
    reviews_count: 83,
    contractor_location: 'Pune Metro Underground Station',
    specs: {
      'Compatibility': 'Fits 100mm, 115mm, and 125mm Grinders',
      'Vacuum Port': 'Universal 32mm & 38mm Hose Connection',
      'Seal': 'High-Density Polypropylene Brush Ring',
      'Standard': 'OSHA 29 CFR 1926.1153 Table 1 Compliant'
    },
    features: [
      'Complies with OSHA respirable crystalline silica standards',
      'Flush grind edge piece flips open for flush work against vertical walls',
      'Universal collar adapters fit all major industrial angle grinder brands',
      'Spring suspension maintains constant contact on uneven concrete floors'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678911',
    name: 'TouchPower Cut-Off Dust Extraction Enclosure Guard',
    category: 'Safety Guards',
    price: 2799.00,
    description: 'Transparent polycarbonate cut-off saw containment guard with multi-directional vacuum manifold. Captures over 95% of airborne silica particulates during masonry saw cuts.',
    stock_count: 34,
    image_urls: [
      'assets/images/cat_safety_guards.png',
      'assets/images/mockup_pdp.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
    brand: 'TOUCHPOWER',
    rating: 4.8,
    reviews_count: 39,
    contractor_location: 'Chennai Port Maritime Terminal',
    specs: {
      'Compatibility': '180mm to 230mm (7-1/4 to 9 Inch) Cut-Off Saws',
      'Material': 'High-Impact Polycarbonate',
      'Port': '50mm High-CFM Hose Port',
      'Rating': 'OSHA Table 1 Certified'
    },
    features: [
      'Impact-resistant transparent shield keeps cutting line visible',
      'Dual water feed nozzles optional for slurry suppression',
      'Rugged steel mounting bracket withstands severe drop impact',
      'Tool-free depth of cut adjustment with positive stops'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678913',
    name: 'Pro-Armor Vented Industrial Safety Helmet',
    category: 'Safety Guards',
    price: 1499.00,
    description: 'High-density impact-resistant safety helmet with 6-point ratchet suspension, sliding ventilation louvers, and integrated accessory slots for ear protection and visors.',
    stock_count: 85,
    image_urls: [
      'assets/images/safety/safety_helmet_pro.jpg',
      'assets/images/cat_safety_guards.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
    brand: 'PRO-ARMOR',
    rating: 4.9,
    reviews_count: 64,
    contractor_location: 'Mumbai Trans Harbour Link Project',
    specs: {
      'Standard': 'ANSI Z89.1 Type 1 Class C',
      'Material': 'High-Density Polyethylene (HDPE)',
      'Suspension': '6-Point Wheel Ratchet',
      'Weight': '390g',
      'Ventilation': 'Dual-Side Sliding Vents'
    },
    features: [
      'Rapid-turn wheel ratchet fits head sizes 53-64 cm',
      'Sweatband with moisture-wicking antimicrobial foam',
      'Universal 30mm slots for earmuffs and face shields',
      'Reflective strips for enhanced 360-degree night visibility'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678914',
    name: 'ArmorGrip Level 5 Cut-Resistant Work Gloves',
    category: 'Safety Guards',
    price: 699.00,
    description: 'EN388 Level 5 cut-proof HPPE seamless knit work gloves coated in sandy micro-foam nitrile for extreme grip in dry, wet, and oily commercial environments.',
    stock_count: 150,
    image_urls: [
      'assets/images/safety/safety_gloves_pro.jpg',
      'assets/images/cat_safety_guards.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=3V9K6j8vP1U',
    brand: 'ARMOR-GRIP',
    rating: 4.8,
    reviews_count: 142,
    contractor_location: 'Tata Steel Fabrication Yard, Jamshedpur',
    specs: {
      'Cut Level': 'ANSI A4 / EN388 Level 5',
      'Coating': 'Sandy Micro-Foam Nitrile Palm',
      'Material': '13-Gauge HPPE + Glass Fiber',
      'Touchscreen': 'Conductive Index & Thumb',
      'Washable': 'Machine Washable 40°C'
    },
    features: [
      'Level 5 cut resistance protects hands against sharp metal and glass edges',
      'Sandy nitrile palm provides non-slip grip on oily power tools',
      'Reinforced thumb saddle extends glove wear life by 3x',
      'Touchscreen-compatible fingertips allow phone and tablet use without removing gloves'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678915',
    name: 'Hi-Vis All-Weather Reflective Safety Jacket',
    category: 'Safety Guards',
    price: 2499.00,
    description: 'ANSI Class 3 certified heavy-duty high-visibility waterproof work jacket with 2-inch 3M Scotchlite reflective stripes, thermal fleece lining, and reinforced radio tabs.',
    stock_count: 60,
    image_urls: [
      'assets/images/safety/safety_jacket_pro.jpg',
      'assets/images/cat_safety_guards.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=Tz3F6p4tQ1Q',
    brand: 'PRO-GUARD',
    rating: 4.9,
    reviews_count: 58,
    contractor_location: 'Delhi Metro Elevated Rail Corridor',
    specs: {
      'Rating': 'ANSI/ISEA 107-2020 Class 3',
      'Shell': '300D Oxford Polyester with Waterproof PU',
      'Tape': '2-inch 3M Scotchlite Reflective Tape',
      'Lining': 'Removable 280g Thermal Polar Fleece',
      'Pockets': '6 Multi-Utility Pockets + Mic Tabs'
    },
    features: [
      'Class 3 360-degree reflectivity ensures maximum visibility in low light',
      '100% waterproof taped seam construction keeps you dry in heavy downpours',
      'Concealed storm hood rolls neatly into collar',
      'Heavy-duty front brass zipper with hook-and-loop storm flap'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678916',
    name: 'TitanShield Steel-Toe Puncture-Proof Safety Work Shoes',
    category: 'Safety Guards',
    price: 3299.00,
    description: 'European standard steel toe industrial safety shoes with bulletproof Kevlar anti-puncture midsole, breathable flyknit upper, and oil/slip-resistant shock absorption outsole.',
    stock_count: 75,
    image_urls: [
      'assets/images/cat_safety_guards.png',
      'assets/images/mockup_pdp.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=B8x0Kq7tY1g',
    brand: 'TITAN-SHIELD',
    rating: 4.9,
    reviews_count: 119,
    contractor_location: 'Adani Port Logistics Hub, Mundra',
    specs: {
      'Toe Cap': '200J Impact-Resistant Steel Cap',
      'Midsole': '1100N Anti-Penetration Kevlar Plate',
      'Outsole': 'SRC Anti-Slip Polyurethane & Rubber',
      'Weight': '480g (Per Shoe)',
      'Insole': 'Memory Foam Arch Support'
    },
    features: [
      'Widened steel toe box withstands 15,000 N compression forces',
      'Puncture-resistant Kevlar midsole stops sharp nails and rebar penetration',
      'Air-cushioned shock absorbing heel reduces lumbar fatigue on concrete',
      'Anti-static and oil-resistant outsole with deep traction lugs'
    ]
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678917',
    name: 'ClearSight Anti-Fog UV400 Industrial Safety Glasses',
    category: 'Safety Guards',
    price: 499.00,
    description: 'Ballistic-grade wrap-around safety glasses with dual anti-fog and anti-scratch coating. Provides 99.9% UVA/UVB protection and panoramic peripheral vision on jobsite.',
    stock_count: 200,
    image_urls: [
      'assets/images/safety/safety_glasses_pro.jpg',
      'assets/images/cat_safety_guards.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=kY3P6R7cE_w',
    brand: 'OPTIC-SHIELD',
    rating: 4.9,
    reviews_count: 185,
    contractor_location: 'Bengaluru Metro Underground Coring Site',
    specs: {
      'Certification': 'ANSI Z87.1+ High-Impact Rated',
      'Lens Material': 'Optical Grade Polycarbonate',
      'Coating': 'Hydrophobic Permanent Anti-Fog',
      'UV Protection': '100% UV400 Blocking',
      'Nose Bridge': 'Soft Non-Slip Silicone'
    },
    features: [
      'Certified ANSI Z87.1+ protects against high-speed projectile debris',
      'Hydrophobic anti-fog technology keeps lenses clear even when wearing respirators',
      'Ultra-lightweight 28g frame with flexible rubber-tipped temples',
      'Full wrap-around design protects brow and side angles without blind spots'
    ]
  },

  // MACHINES (CONTINUED) ---------------------------------------------------
  {
    id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678912',
    name: 'Drill-Master High-Torque Drill Driver Set',
    category: 'Machines',
    price: 8999.00,
    description: 'Next-generation 20V brushless compact drill driver set delivering 1,200 in-lbs of breakaway torque. Includes 2x 5.0Ah high-output batteries and rapid multi-voltage charger.',
    stock_count: 45,
    image_urls: [
      'assets/images/hero_drill_desktop.png',
      'assets/images/drill_rotary_pro.jpg'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
    brand: 'DRILL-MASTER',
    rating: 4.9,
    reviews_count: 210,
    contractor_location: 'Noida International Airport Site, Jewar',
    specs: {
      'Torque': '1,200 in-lbs (135 Nm) Peak Torque',
      'Speed': '2-Speed (0-550 / 0-2,100 RPM)',
      'Chuck': '13mm (1/2 Inch) All-Metal Ratcheting',
      'Battery': '2x 20V 5.0Ah Lithium Heavy Cells',
      'Weight': '1.7 kg with Battery Pack'
    },
    features: [
      'High-efficiency 4-pole brushless motor maximizes battery runtime',
      'All-metal ratcheting chuck with carbide jaws prevents bit slip',
      'Tri-LED ring delivers 360-degree shadowless illumination',
      'Thermal overload smart chip prevents overheating under continuous heavy load'
    ]
  },

  // ==========================================================================
  // BRAND SHOWCASE PRODUCTS (BOSCH, DONGCHENG, DEWALT, MAKITA)
  // ==========================================================================

  // --- BOSCH ---
  {
    id: 'b05c0001-a1b2-4c3d-8e9f-012345678901',
    name: 'Bosch GBH 220 Professional Rotary Hammer Drill 720W',
    category: 'Machines',
    price: 7899.00,
    description: 'Compact and powerful 720W commercial rotary hammer drill with 2.0 Joules of impact energy. Engineered for rapid drilling up to 22mm in concrete and masonry with durable metal gearbox.',
    stock_count: 55,
    image_urls: [
      'assets/images/tools/bosch_gbh220.jpg',
      'assets/images/drill_rotary_pro.jpg'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
    brand: 'BOSCH',
    rating: 4.9,
    reviews_count: 184,
    contractor_location: 'Pune Industrial Area, Maharashtra',
    specs: {
      'Rated Input Power': '720 W',
      'Impact Energy': '2.0 Joules',
      'Drilling Dia in Concrete': '4 - 22 mm (SDS-Plus)',
      'No-Load Speed': '0 - 2,000 RPM',
      'Weight': '2.3 kg',
      'Operation Modes': 'Drilling, Hammer Drilling, Chiselling'
    },
    features: [
      'Three-mode selector for hammer drilling, rotary drilling, and chiselling',
      'Forward/reverse rotation for dislodging jammed drill bits',
      'Overload clutch protects operator and machine during sudden bit binds',
      'Ergonomic soft-grip main handle and auxiliary 360-degree side handle'
    ]
  },
  {
    id: 'b05c0002-a1b2-4c3d-8e9f-012345678902',
    name: 'Bosch GWS 600 Professional 4-Inch Angle Grinder 670W',
    category: 'Machines',
    price: 3199.00,
    description: 'High-precision 670W angle grinder with burst-proof guard, armoured coils that protect the motor against sharp grinding dust, and robust metal flange bearing.',
    stock_count: 80,
    image_urls: [
      'assets/images/grinder_angle_pro.jpg',
      'assets/images/tool_angle_grinder.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=vVj_pS3cW9I',
    brand: 'BOSCH',
    rating: 4.8,
    reviews_count: 240,
    contractor_location: 'Bengaluru Metro Rail Phase 2',
    specs: {
      'Rated Input Power': '670 W',
      'Disc Diameter': '100 mm (4 Inch)',
      'No-Load Speed': '11,000 RPM',
      'Spindle Thread': 'M10',
      'Weight': '1.8 kg'
    },
    features: [
      'Armoured coils protect motor from sharp abrasive dust',
      'Anti-rotation protective guard stands firm even if disc bursts',
      'Compact gear housing allows easy operation in tight site corners',
      'Two-motion safety switch prevents accidental startup'
    ]
  },
  {
    id: 'b05c0003-a1b2-4c3d-8e9f-012345678903',
    name: 'Bosch GST 650 Professional Variable Speed Jigsaw',
    category: 'Machines',
    price: 3799.00,
    description: 'Reliable entry-level commercial jigsaw with stroke rate selection up to 3,100 SPM. Robust steel base plate and dust extraction blower keep the cutline visible.',
    stock_count: 42,
    image_urls: [
      'assets/images/tool_jigsaw.png',
      'assets/images/mockup_home_grid.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=3V9K6j8vP1U',
    brand: 'BOSCH',
    rating: 4.8,
    reviews_count: 92,
    contractor_location: 'Noida Tech Zone Framing Site',
    specs: {
      'Rated Input Power': '450 W',
      'Stroke Rate': '800 - 3,100 SPM',
      'Stroke Height': '18 mm',
      'Cutting Depth in Wood': '65 mm',
      'Weight': '1.9 kg'
    },
    features: [
      'Variable speed pre-selection dial for material-specific cutting',
      'Dust blower clears cutting line continuously during operation',
      'Robust reinforced steel footplate with bevel capacity up to 45 degrees',
      'Compact ergonomic handle with large trigger lock button'
    ]
  },

  // --- DONGCHENG ---
  {
    id: 'd0c00001-a1b2-4c3d-8e9f-012345678901',
    name: 'DongCheng DZG06-6 Heavy Demolition Hammer Breaker 900W',
    category: 'Machines',
    price: 8499.00,
    description: 'High-efficiency 900W commercial demolition breaker delivering 10.0 Joules of high-frequency concrete breaking impact. Solid all-aluminum housing for heavy structural wall removal.',
    stock_count: 38,
    image_urls: [
      'assets/images/tools/dongcheng_dzg06.jpg',
      'assets/images/drill_rotary_pro.jpg'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=0h9Vp0d5l_U',
    brand: 'DONGCHENG',
    rating: 4.9,
    reviews_count: 115,
    contractor_location: 'Mumbai Coastal Highway Pier Demolition',
    specs: {
      'Rated Power Input': '900 W',
      'Impact Energy': '10.0 Joules',
      'Rated Impacting Frequency': '2,900 /min',
      'Chuck Type': 'Hex 17mm Quick Chuck',
      'Net Weight': '6.8 kg',
      'Housing': 'Die-Cast Industrial Aluminum'
    },
    features: [
      'Grease-lubricated high-impact cylinder design ensures long continuous service',
      'Rugged die-cast aluminum casing withstands severe site drops',
      '360-degree rotating side handle for optimal chiselling angles',
      'Auto-stop carbon brushes protect commutator from armature damage'
    ]
  },
  {
    id: 'd0c00002-a1b2-4c3d-8e9f-012345678902',
    name: 'DongCheng DZE04-110 Professional Marble Cutter 1200W',
    category: 'Machines',
    price: 2699.00,
    description: 'High-speed 1200W commercial marble, granite, and tile cutter. Built-in water feed attachment for dust-free wet cutting with 13,000 RPM high-torque motor.',
    stock_count: 65,
    image_urls: [
      'assets/images/saw_circular_pro.jpg',
      'assets/images/blade_diamond_pro.jpg'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=F3_6eQo6t7s',
    brand: 'DONGCHENG',
    rating: 4.8,
    reviews_count: 178,
    contractor_location: 'Jaipur Marble Processing Hub, RJ',
    specs: {
      'Rated Power Input': '1,200 W',
      'Blade Diameter': '110 mm (4-3/8 Inch)',
      'No-Load Speed': '13,000 RPM',
      'Max Cutting Depth': '30 mm at 90 deg',
      'Net Weight': '3.0 kg'
    },
    features: [
      '1200W high-copper armature motor resists high-load overheating',
      'Deep base plate with accurate depth gauge up to 30mm',
      'Wet-cutting water feed valve and hose connector included',
      'Trigger lock-on switch for extended tile and slab cutting sessions'
    ]
  },
  {
    id: 'd0c00003-a1b2-4c3d-8e9f-012345678903',
    name: 'DongCheng DCPB488 Brushless Cordless Impact Wrench 20V',
    category: 'Machines',
    price: 6999.00,
    description: 'High-torque 20V brushless impact wrench delivering 488 Nm of breakaway torque with 1/2" friction ring anvil. Designed for structural steel framing and scaffolding bolts.',
    stock_count: 40,
    image_urls: [
      'assets/images/tool_drill_driver.png',
      'assets/images/hero_drill_desktop.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=B8x0Kq7tY1g',
    brand: 'DONGCHENG',
    rating: 4.9,
    reviews_count: 88,
    contractor_location: 'Ahmedabad Bullet Train Structural Hub',
    specs: {
      'Voltage': '20V Max Lithium-Ion',
      'Max Torque': '488 Nm (360 ft-lbs)',
      'No-Load Speed': '0 - 2,400 RPM',
      'Impact Rate': '0 - 3,200 IPM',
      'Drive Size': '1/2 Inch Friction Ring Anvil',
      'Weight': '1.85 kg with Battery'
    },
    features: [
      'Smart reverse auto-stop mode stops rotation immediately once nut is loosened',
      'High-capacity 20V 4.0Ah battery pack with LED charge indicator',
      'Tri-LED jobsite ring light illuminates dark framing joints',
      'Brushless digital motor extends motor lifespan by 5x'
    ]
  },

  // --- DEWALT ---
  {
    id: 'de000001-a1b2-4c3d-8e9f-012345678901',
    name: 'DeWalt DCD796 20V MAX XR Brushless Compact Hammer Drill',
    category: 'Machines',
    price: 12499.00,
    description: 'High-performance commercial 20V MAX XR brushless hammer drill/driver with 2-speed all-metal transmission and 34,000 BPM hammer mechanism for masonry drilling.',
    stock_count: 50,
    image_urls: [
      'assets/images/tools/dewalt_dcd796.jpg',
      'assets/images/hero_drill_desktop.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=rW_kX4d4x_0',
    brand: 'DEWALT',
    rating: 5.0,
    reviews_count: 312,
    contractor_location: 'GIFT City International Finance Tower',
    specs: {
      'Voltage': '20V MAX Lithium Ion',
      'Power Output': '460 UWO (Unit Watts Out)',
      'No-Load Speed': '0-550 / 0-2,000 RPM',
      'Blows Per Min': '0-34,000 BPM',
      'Chuck Size': '13mm (1/2 Inch) All-Metal Ratcheting',
      'Weight': '1.6 kg'
    },
    features: [
      'DeWalt XR brushless motor delivers up to 57% more runtime over brushed',
      '3-mode LED worklight with 20-minute spotlight delay function',
      'Compact 7.5-inch front-to-back length fits into tight framing studs',
      'Heavy-duty all-metal 1/2" ratcheting chuck with carbide inserts'
    ]
  },
  {
    id: 'de000002-a1b2-4c3d-8e9f-012345678902',
    name: 'DeWalt DWE493 Heavy Duty 9-Inch Angle Grinder 2200W',
    category: 'Machines',
    price: 7299.00,
    description: 'Massive 2,200W industrial angle grinder with epoxy-coated field windings for high abrasion protection in steel fabrication, pipeline grinding, and concrete surface prep.',
    stock_count: 32,
    image_urls: [
      'assets/images/grinder_angle_pro.jpg',
      'assets/images/tool_angle_grinder.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=vVj_pS3cW9I',
    brand: 'DEWALT',
    rating: 4.9,
    reviews_count: 146,
    contractor_location: 'Visakhapatnam Steel Yard Fabrication',
    specs: {
      'Power Input': '2,200 W Heavy Industrial',
      'Wheel Diameter': '230 mm (9 Inch)',
      'No-Load Speed': '6,500 RPM',
      'Spindle Thread': 'M14 Heavy',
      'Weight': '5.2 kg'
    },
    features: [
      'Epoxy-coated motor windings guard against highly abrasive metal grinding grit',
      'Two-position side handle allows right and left hand heavy balance',
      'Keyless adjustable wheel guard enables fast adjustments',
      'Spindle lock for quick single-wrench disc changes'
    ]
  },
  {
    id: 'de000003-a1b2-4c3d-8e9f-012345678903',
    name: 'DeWalt DCS380 20V MAX Cordless Reciprocating Saw',
    category: 'Machines',
    price: 9899.00,
    description: 'Contractor reciprocating saw with 4-position keyless blade clamp for flush cutting in wall cavities and variable-speed trigger up to 3,000 SPM.',
    stock_count: 28,
    image_urls: [
      'assets/images/saw_miter_pro.jpg',
      'assets/images/tool_miter_saw.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=F3_6eQo6t7s',
    brand: 'DEWALT',
    rating: 4.9,
    reviews_count: 85,
    contractor_location: 'Hyderabad Commercial Demolition Sector',
    specs: {
      'Voltage': '20V MAX',
      'Stroke Length': '28.6 mm (1-1/8 Inch)',
      'Strokes Per Min': '0 - 3,000 SPM',
      'Blade Clamp': '4-Position Tool-Free Keyless',
      'Shoe': 'Pivoting Adjustable Steel Shoe',
      'Weight': '2.7 kg'
    },
    features: [
      '4-position blade clamp allows flush cutting and versatility without changing tool position',
      '1-1/8" stroke length delivers rapid material removal in wood and metal framing',
      'Pivoting adjustable shoe extends blade life and allows depth-of-cut control',
      'Double oil-sealed shaft resists site dust and water contamination'
    ]
  },

  // --- MAKITA ---
  {
    id: 'aa000001-a1b2-4c3d-8e9f-012345678901',
    name: 'Makita HR2470 24mm SDS-Plus Rotary Hammer 780W',
    category: 'Machines',
    price: 9299.00,
    description: 'Legendary 780W Makita rotary hammer with 3-mode operation and torque limiter that automatically disengages clutch if drill bit jams in reinforced concrete.',
    stock_count: 48,
    image_urls: [
      'assets/images/drill_rotary_pro.jpg',
      'assets/images/banner_machines.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=kY3P6R7cE_w',
    brand: 'MAKITA',
    rating: 5.0,
    reviews_count: 280,
    contractor_location: 'Delhi Metro Underground TBM Station',
    specs: {
      'Continuous Rating Input': '780 W',
      'Impact Energy': '2.4 Joules',
      'Capacity in Concrete': '24 mm (SDS-Plus)',
      'No-Load Speed': '0 - 1,100 RPM',
      'Impacts Per Min': '0 - 4,500 IPM',
      'Weight': '2.9 kg'
    },
    features: [
      'Torque limiter stops bit rotation upon encountering concrete rebar',
      'Recessed lock-on button for continuous commercial drilling runs',
      'Rubberized ergonomic soft grip for reduced operator fatigue',
      'One-touch sliding chuck for rapid SDS-plus bit replacement'
    ]
  },
  {
    id: 'aa000002-a1b2-4c3d-8e9f-012345678902',
    name: 'Makita GA4030 4-Inch Heavy Duty Angle Grinder 720W',
    category: 'Machines',
    price: 3499.00,
    description: 'Precision slim-barrel 720W angle grinder with labyrinth construction that seals the motor and bearings from dust and debris contamination.',
    stock_count: 90,
    image_urls: [
      'assets/images/tools/makita_ga4030.jpg',
      'assets/images/grinder_angle_pro.jpg'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=vVj_pS3cW9I',
    brand: 'MAKITA',
    rating: 4.9,
    reviews_count: 220,
    contractor_location: 'Chennai Automotive Framing Plant',
    specs: {
      'Continuous Rating Input': '720 W',
      'Wheel Diameter': '100 mm (4 Inch)',
      'No-Load Speed': '11,000 RPM',
      'Barrel Diameter': 'Slim 57mm Comfort Grip',
      'Weight': '1.7 kg'
    },
    features: [
      'Labyrinth construction seals armature and ball bearings from metal swarf',
      'Slim 57mm barrel grip provides exceptional operator control and comfort',
      'High-grade machined bevel gears for 2x longer service life',
      'Side handle installed at 20-degree ergonomic tilt angle'
    ]
  },
  {
    id: 'aa000003-a1b2-4c3d-8e9f-012345678903',
    name: 'Makita SP6000J Plunge Cut Circular Track Saw 165mm',
    category: 'Machines',
    price: 21999.00,
    description: 'Precision plunge circular saw with electronic speed control, soft start, and mechanical brake. Designed for mirror-finish splinter-free cuts in architectural millwork.',
    stock_count: 18,
    image_urls: [
      'assets/images/saw_circular_pro.jpg',
      'assets/images/tool_table_saw.png'
    ],
    youtube_url: 'https://www.youtube.com/watch?v=gT8ZcQv5d-8',
    brand: 'MAKITA',
    rating: 5.0,
    reviews_count: 67,
    contractor_location: 'Mumbai Commercial Interior High-Rise Fitout',
    specs: {
      'Continuous Input': '1,300 W Brushless Controlled',
      'Blade Diameter': '165 mm (6-1/2 Inch)',
      'Max Cutting Capacity at 90': '56 mm',
      'Variable Speed': '2,000 - 5,800 RPM',
      'Weight': '4.4 kg'
    },
    features: [
      'Precision bevel cuts from -1 to 48 degrees with positive stops at 22.5 and 45',
      'Close-to-wall cutting: cut within only 18mm from wall edges',
      'Scoring feature creates a 2mm preliminary groove for zero-splinter cuts',
      'Electronic speed control maintains RPM under heavy hardwood load'
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'TP-8841-BOM',
    user_id: null,
    product_details: [
      {
        id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678901',
        name: 'TouchPower X-Pro Rotary Hammer Drill',
        price: 9999.00,
        quantity: 1,
        image: 'assets/images/banner_machines.png'
      },
      {
        id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678906',
        name: 'Sharp-Edge High-Definition Diamond Saw Blades',
        price: 2499.00,
        quantity: 2,
        image: 'assets/images/banner_blades.png'
      }
    ],
    total_amount: 14997.00,
    shipping_address: {
      street: 'Plot 42, MIDC Industrial Area, Phase II',
      city: 'Mumbai',
      state: 'MH',
      zip: '400093',
      country: 'India'
    },
    delivery_status: 'Out for Delivery',
    carrier: 'TouchPower BlueDart Jobsite Direct',
    tracking_number: 'TP-TRK-99284102',
    estimated_delivery: 'Today by 4:30 PM',
    customer_name: 'Rajesh Sharma',
    customer_email: 'rajesh@sharmaconstruction.in',
    customer_phone: '+91 98200 55199',
    notes: 'Gate access 2. Deliver to site engineer office.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'TP-7719-DEL',
    user_id: null,
    product_details: [
      {
        id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678908',
        name: 'Drill-Master Premium Titanium-Coated Drill Bits',
        price: 1899.00,
        quantity: 1,
        image: 'assets/images/banner_bits.png'
      }
    ],
    total_amount: 1899.00,
    shipping_address: {
      street: 'B-14 Okhla Industrial Area, Phase 3',
      city: 'New Delhi',
      state: 'DL',
      zip: '110020',
      country: 'India'
    },
    delivery_status: 'Shipped',
    carrier: 'Delhivery Commercial Express',
    tracking_number: 'DL-7719401928',
    estimated_delivery: 'Tomorrow by 11:00 AM',
    customer_name: 'Pooja Verma',
    customer_email: 'pooja@apexinfra.in',
    customer_phone: '+91 98110 44143',
    notes: 'Forklift available at receiving dock.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'TP-6602-BLR',
    user_id: null,
    product_details: [
      {
        id: 'c3d4e5f6-a1b2-4c3d-8e9f-012345678912',
        name: 'Drill-Master High-Torque Drill Driver Set',
        price: 8999.00,
        quantity: 2,
        image: 'assets/images/tool_drill_driver.png'
      }
    ],
    total_amount: 17998.00,
    shipping_address: {
      street: '7th Cross, Peenya Industrial Area',
      city: 'Bengaluru',
      state: 'KA',
      zip: '560058',
      country: 'India'
    },
    delivery_status: 'Processing',
    carrier: 'TouchPower ProFreight Logistics',
    tracking_number: 'TP-BLR-6602819234',
    estimated_delivery: 'In 2 Days',
    customer_name: 'Anand Kumar',
    customer_email: 'anand@kumarfab.in',
    customer_phone: '+91 99000 88177',
    notes: 'Notify site supervisor before arrival.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

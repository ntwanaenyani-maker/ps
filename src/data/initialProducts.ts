import { Product, Review, Order, UserAccount, StoreSettings, AdminAnalytics } from '../types/store';

// Generated authentic South African Wellness & Cosmetics image assets.
// Served as static files from the web root (public/images) so that both the
// storefront and the API can reference the same stable, un-hashed paths.
export const brandLogoImg = '/images/phethagatsa_solutions_logo_1790843735832.jpg';
export const heroRadiantModelImg = '/images/hero_radiant_model_1790846849702.jpg';
export const faceCreamImg = '/images/product_puso_glow_face_cream.jpg';
export const radiantSerumImg = '/images/product_radiant_serum_1790846873117.jpg';
export const cleanserImg = '/images/product_face_cleanser_1790846885678.jpg';
export const tonerImg = '/images/product_brightening_toner_1790846896810.jpg';
export const motherChildEczemaImg = '/images/mother_child_eczema_1790843745243.jpg';
export const eczemaBalmImg = '/images/eczema_soothing_balm_1790843756444.jpg';
export const chiaSeedsImg = '/images/product_chia_seeds.jpg';
export const collagenImg = '/images/product_collagen_peptides.jpg';
export const thighCreamImg = '/images/wellness_thigh_cream_1790763805596.jpg';
export const pulaComboImg = '/images/wellness_pula_combo_1790763815812.jpg';
export const fofaScrubImg = '/images/product_fofa_scrub.jpg';
export const skinGummiesImg = '/images/wellness_skin_gummies_1790763835715.jpg';

export const BRAND_LOGO_IMAGE = brandLogoImg;
export const HERO_RADIANT_MODEL_IMAGE = heroRadiantModelImg;
export const MOTHER_CHILD_ECZEMA_IMAGE = motherChildEczemaImg;
export const ECZEMA_BALM_IMAGE = eczemaBalmImg;

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Puso Glow Face Cream (From Mockup Best Seller)
  {
    id: 'puso-glow-face-cream',
    handle: 'puso-glow-face-cream',
    name: 'Puso Glow Face Cream',
    tagline: 'Deeply nourishes, hydrates and gives your skin a healthy, natural glow. Perfect for daily use.',
    category: 'face-care',
    vendor: 'Phethagatsa Solutions',
    type: 'Moisturizer',
    tags: ['Face Care', 'Glow', 'Moisturizer', 'All Skin Types'],
    sku: 'PGFC-50ML',
    grams: 180,
    price: 199.0, // R 199.00
    originalPrice: 249.0,
    currency: 'ZAR',
    image: faceCreamImg,
    additionalImages: [
      '/images/product_face_cream_1790846862559.jpg',
      '/images/product_puso_glow_face_cream_alt1.jpg',
    ],
    description:
      'A deeply restorative daily moisturizing cream crafted with raw African Marula oil, wild Mongongo butter, and cold-pressed botanical hydrators. Delivers intense barrier nourishment and locks in dewy luminosity without feeling heavy.',
    bodyHtml:
      '<p>Deeply nourishes, hydrates and gives your skin a healthy, natural glow. Perfect for daily use.</p><ul><li><strong>Deep Moisture:</strong> Keeps melanin-rich skin supple and illuminated all day.</li><li><strong>Antioxidant Rich:</strong> Protects against harsh South African UV and environmental stressors.</li><li><strong>Lightweight Finish:</strong> Absorbs in seconds with zero greasy residue.</li></ul><p><strong>How to Use:</strong> Warm a pea-sized dab between fingertips and massage gently onto clean face and neck every morning and evening.</p>',
    howToUse: 'Warm a pea-sized dab between fingertips and massage gently onto clean face and neck every morning and evening.',
    ingredients: 'Aqua, Butyrospermum Parkii (Shea) Butter, Sclerocarya Birrea (Marula) Seed Oil, Cetearyl Alcohol, Glycerin, Cape Chamomile Extract, Niacinamide, Sodium Hyaluronate, Tocopherol (Vitamin E).',
    benefits: ['Hydrating', 'Nourishing', 'All Skin Types'],
    details: [
      'Deep 24-hour hydration with organic Marula & Mongongo oils',
      'Non-comedogenic formula suitable for sensitive and reactive skin',
      'Cruelty-free, paraben-free, 100% natural active botanicals',
      'Net Weight: 50ml UV-protective amber glass jar',
    ],
    stock: 45,
    rating: 4.8,
    reviewCount: 124,
    edition: 'Botanical Radiance Nº 01',
    featured: true,
    variants: [
      { id: 'v-50ml', name: '50ml Glass Jar', inStock: true, sku: 'PGFC-50ML', size: '50ml', price: 199.0 },
      { id: 'v-100ml', name: '100ml Value Jar', inStock: true, sku: 'PGFC-100ML', size: '100ml', price: 349.0 },
    ],
  },

  // 2. Radiant Serum (From Mockup)
  {
    id: 'radiant-serum',
    handle: 'radiant-serum',
    name: 'Radiant Serum',
    tagline: 'Concentrated Vitamin C and botanical elixir designed to fade hyperpigmentation and illuminate tone.',
    category: 'face-care',
    vendor: 'Phethagatsa Solutions',
    type: 'Serum',
    tags: ['Face Care', 'Serum', 'Vitamin C', 'Hyperpigmentation'],
    sku: 'RS-30ML',
    grams: 120,
    price: 249.0, // R 249.00
    originalPrice: 299.0,
    currency: 'ZAR',
    image: radiantSerumImg,
    additionalImages: [radiantSerumImg],
    description:
      'An ultra-concentrated botanical serum loaded with stabilized Vitamin C, Kalahari melon seed oil, and Niacinamide to restore uniform skin clarity, reduce sun spots, and impart an undeniable natural radiance.',
    bodyHtml:
      '<p>Illuminating elixir formulated for dark spots, uneven complexion, and dull skin texture.</p><ul><li><strong>15% Vitamin C Complex:</strong> Fades stubborn discoloration safely.</li><li><strong>Barrier Rebuilding:</strong> Infused with Kalahari Melon and Aloe ferox.</li><li><strong>Instant Glow:</strong> Silky golden drops absorb immediately.</li></ul><p><strong>How to Use:</strong> Dispense 3–4 drops onto freshly cleansed skin morning and night before moisturizer.</p>',
    howToUse: 'Dispense 3–4 drops onto freshly cleansed skin morning and night before moisturizer.',
    ingredients: 'Kalahari Melon Seed Oil, Ascorbyl Tetraisopalmitate (Vitamin C), Niacinamide 5%, Aloe Ferox Leaf Extract, Squalane, Rosehip Oil.',
    benefits: ['Brightening', 'Anti-Aging', 'Even Tone'],
    details: [
      'Clinically formulated for melanin-rich skin tone uniformity',
      'Zero alcohol, zero artificial fragrance or parabens',
      'Amber dropper bottle to preserve light-sensitive vitamins',
    ],
    stock: 32,
    rating: 4.9,
    reviewCount: 98,
    edition: 'Botanical Radiance Nº 02',
    featured: true,
    variants: [
      { id: 'v-30ml', name: '30ml Dropper Bottle', inStock: true, sku: 'RS-30ML', size: '30ml', price: 249.0 },
    ],
  },

  // 3. Revive Face Cleanser (From Mockup)
  {
    id: 'revive-face-cleanser',
    handle: 'revive-face-cleanser',
    name: 'Revive Face Cleanser',
    tagline: 'Gentle clarifying botanical wash that purifies pores while protecting essential skin lipids.',
    category: 'face-care',
    vendor: 'Phethagatsa Solutions',
    type: 'Cleanser',
    tags: ['Face Care', 'Cleanser', 'Gentle', 'Sensitive Skin'],
    sku: 'RFC-150ML',
    grams: 220,
    price: 159.0, // R 159.00
    originalPrice: 189.0,
    currency: 'ZAR',
    image: cleanserImg,
    additionalImages: [cleanserImg],
    description:
      'Sulfate-free foaming cleanser formulated with African Rooibos, Cape Chamomile, and gentle coconut glucoside. Sweeps away impurities, sunscreen, and excess sebum without stripping the skin acid mantle.',
    bodyHtml:
      '<p>A gentle pH-balanced foaming cleanser suited for morning and evening routines.</p>',
    howToUse: 'Massage 1–2 pumps onto damp face in circular motions for 60 seconds, then rinse with lukewarm water.',
    ingredients: 'Aspalathus Linearis (Rooibos) Extract, Coco-Glucoside, Vegetable Glycerin, Cape Chamomile, Panthenol (Pro-Vitamin B5).',
    benefits: ['Gentle Purifying', 'Sulfate-Free', 'Skin Balancing'],
    details: [
      'pH 5.5 balanced to protect the skin microbiome',
      'Free from sulfates (SLS/SLES), dyes, and harsh soaps',
      'Easy pump dispenser bottle: 150ml',
    ],
    stock: 28,
    rating: 4.7,
    reviewCount: 76,
    edition: 'Botanical Purity Nº 03',
    featured: true,
    variants: [
      { id: 'v-150ml', name: '150ml Pump Bottle', inStock: true, sku: 'RFC-150ML', size: '150ml', price: 159.0 },
    ],
  },

  // 4. Brightening Toner (From Mockup)
  {
    id: 'brightening-toner',
    handle: 'brightening-toner',
    name: 'Brightening Toner',
    tagline: 'Alcohol-free botanical mist that refines pore texture and balances skin tone effortlessly.',
    category: 'face-care',
    vendor: 'Phethagatsa Solutions',
    type: 'Toner',
    tags: ['Face Care', 'Toner', 'Pore Refining', 'Vitamin C'],
    sku: 'BT-200ML',
    grams: 250,
    price: 179.0, // R 179.00
    originalPrice: 219.0,
    currency: 'ZAR',
    image: tonerImg,
    additionalImages: [tonerImg],
    description:
      'A revitalizing mist infused with witch hazel, organic hibiscus flower acids, and niacinamide to gently sweep away dead surface cells, tighten pores, and prep skin for serums.',
    bodyHtml:
      '<p>Botanical tonic designed to balance natural skin pH and boost cellular renewal.</p>',
    howToUse: 'Spritz onto a cotton pad or mist directly over clean skin after cleansing before applying serums.',
    ingredients: 'Distilled Rose Water, Hamamelis Virginiana (Witch Hazel), Hibiscus Sabdariffa Extract, Niacinamide, Sodium PCA.',
    benefits: ['Pore Refining', 'Clarifying', 'Antioxidant Tone'],
    details: [
      '100% alcohol-free so skin never feels tight or dry',
      'Preps skin for maximum absorption of moisturizers and balms',
      'Net volume: 200ml spray flacon',
    ],
    stock: 21,
    rating: 4.8,
    reviewCount: 63,
    edition: 'Botanical Balance Nº 04',
    featured: true,
    variants: [
      { id: 'v-200ml', name: '200ml Spray Bottle', inStock: true, sku: 'BT-200ML', size: '200ml', price: 179.0 },
    ],
  },

  // 5. Soothing Eczema Barrier Balm (Signature Hero Formula)
  {
    id: 'soothing-eczema-barrier-balm',
    handle: 'soothing-eczema-barrier-balm',
    name: 'Soothing Eczema Barrier Balm',
    tagline: 'Pediatrician-tested, 0% cortisone botanical barrier balm for sensitive baby and children skin',
    category: 'body-care',
    vendor: 'Phethagatsa Solutions',
    type: 'Barrier Balm',
    tags: ['Eczema', 'Baby Safe', 'Cortisone-Free', 'Sensitive Skin', 'Body Care'],
    sku: 'SEBB-125ML',
    grams: 160,
    price: 95.0, // in ZAR (R 95.00)
    originalPrice: 125.0,
    currency: 'ZAR',
    image: eczemaBalmImg,
    additionalImages: [eczemaBalmImg],
    description:
      'Formulated in Johannesburg for mothers seeking gentle, steroid-free eczema care. Enriched with unrefined Cape shea butter, colloidal oatmeal, and Cape Chamomile.',
    bodyHtml:
      '<p>A specialized pediatrician-tested soothing balm created specifically for children and adults suffering from dry, atopic, or inflamed skin patches.</p>',
    howToUse: 'Gently warm a small amount between fingertips and smooth over affected skin patches 2–3 times daily.',
    ingredients: 'Raw Organic Butyrospermum Parkii (Shea) Butter, Avena Sativa (Colloidal Oat) Flour, Calendula Officinalis Extract, Eriocephalus Punctulatus (Cape Chamomile) Oil, Zinc Oxide.',
    benefits: ['Steroid-Free', 'Instant Itch Relief', 'Pediatrician Tested'],
    details: [
      '0% Cortisone, 0% artificial fragrances, zero mineral oils',
      'Clinically observed calm in 48 hours for childhood flare-ups',
      'Safe for newborns, toddlers, and adult sensitive skin',
      'Net Weight: 125ml protective amber canister',
    ],
    stock: 85,
    rating: 5.0,
    reviewCount: 112,
    edition: 'Gentle Mother & Child Formula Nº 07',
    featured: true,
    variants: [
      { id: 'v-125ml', name: '125ml Balm Tub', inStock: true, sku: 'SEBB-125ML', size: '125ml', price: 95.0 },
    ],
  },

  // 6. Dark Inner Thigh Cream
  {
    id: 'dark-inner-thigh-cream',
    handle: 'dark-inner-thigh-cream',
    name: 'Phethabatsa Solutions Dark Inner Thigh Cream',
    tagline: 'Targeted brightening cream specially formulated for delicate body areas to reduce hyperpigmentation',
    category: 'body-care',
    vendor: 'Phethabatsa Solutions',
    type: 'Body Skincare',
    tags: ['Brightening', 'Hyperpigmentation', 'Body Cream', 'Body Care'],
    sku: 'DITC-125ML',
    grams: 125,
    price: 80.0, // in ZAR (R 80.00)
    originalPrice: 110.0,
    currency: 'ZAR',
    image: thighCreamImg,
    additionalImages: [thighCreamImg],
    description:
      'A targeted brightening cream specially formulated for delicate body areas to reduce hyperpigmentation, smooth texture, and restore natural skin tone.',
    bodyHtml:
      '<p>A targeted brightening cream specially formulated for delicate body areas to reduce hyperpigmentation, smooth texture, and restore natural skin tone.</p><ul><li><strong>Fades Dark Spots:</strong> Reduces stubborn discoloration and hyperpigmentation.</li><li><strong>Deep Moisture:</strong> Hydrates and softens sensitive inner thigh skin.</li><li><strong>Gentle & Safe:</strong> Formulated with Vitamin C for sensitive skin types.</li></ul><p><strong>How to Use:</strong> Massage a small amount onto clean, dry inner thighs twice daily until fully absorbed.</p>',
    howToUse: 'Massage a small amount onto clean, dry inner thighs twice daily until fully absorbed.',
    benefits: ['Fades Discoloration', 'Chafing Relief', 'Vitamin C Infused'],
    details: [
      'Fades stubborn friction-induced discoloration safely',
      'Deep moisture without stickiness or residue',
      'Formulated with Vitamin C and soothing botanical botanicals',
    ],
    stock: 100,
    rating: 4.8,
    reviewCount: 88,
    edition: 'Targeted Pigmentation Series Nº 02',
    featured: true,
    variants: [
      { id: 'v-125ml', name: '125ml Precision Jar', inStock: true, sku: 'DITC-125ML', size: '125ml', price: 80.0 },
    ],
  },

  // 7. Pula Skin Pigmentation Corrector Combo (Bundles)
  {
    id: 'pigmentation-corrector-combo',
    handle: 'pigmentation-corrector-combo',
    name: 'Pula Skin Pigmentation Corrector Combo',
    tagline: 'Complete 4-step transformational ritual featuring Khanya Serum, Fofa Scrub, and Pula Organic Cream',
    category: 'bundles',
    vendor: 'Pula Skin',
    type: 'Skincare Kits',
    tags: ['Pigmentation', 'Skincare Set', 'Serum', 'Scrub', 'Bundles'],
    sku: 'PS-COMBO4',
    grams: 500,
    price: 320.0, // in ZAR (R 320.00)
    originalPrice: 420.0,
    currency: 'ZAR',
    image: pulaComboImg,
    additionalImages: [pulaComboImg],
    description:
      'Clear dark spots and restore skin radiance with a complete 4-step routine featuring the Khanya Serum, Fofa Scrub, and Pula Organic Cream.',
    bodyHtml:
      '<p>Clear dark spots and restore skin radiance with a complete 4-step routine featuring the Khanya Serum, Fofa Scrub, and Pula Organic Cream.</p><ul><li><strong>Targets Hyperpigmentation:</strong> Fades uneven tones and restores natural glow.</li><li><strong>Exfoliates & Renews:</strong> Removes dead skin cells to reveal smoother skin.</li><li><strong>Protects Barrier:</strong> Strengthens skin barrier for long-lasting clarity.</li></ul><p><strong>How to Use:</strong> Cleanse with bar soap, exfoliate 2–3 times weekly with Fofa Scrub, apply Khanya Serum, and lock in moisture with Pula Organic Cream.</p>',
    howToUse: 'Cleanse with bar soap, exfoliate 2–3 times weekly with Fofa Scrub, apply Khanya Serum, and lock in moisture with Pula Organic Cream.',
    benefits: ['Complete 4-Step Regimen', 'Saves R100 on Individual Items', 'Visible Results in 30 Days'],
    details: [
      'Comprehensive 4-piece botanical kit for stubborn facial and body pigmentation',
      'Includes Khanya Glow Serum (30ml), Fofa Micro-Polish (200g), and Pula Organic Moisture Cream',
      'Formulated in South Africa for melanin skin care needs',
    ],
    stock: 50,
    rating: 5.0,
    reviewCount: 94,
    edition: 'Complete Ritual System Nº 04',
    featured: true,
    variants: [
      { id: 'v-combo', name: '4-Piece Full Kit', inStock: true, sku: 'PS-COMBO4', price: 320.0 },
    ],
  },

  // 8. Fofa Scrub (Body Care)
  {
    id: 'fofa-scrub',
    handle: 'fofa-scrub',
    name: 'Pula Skin Fofa Exfoliating Scrub',
    tagline: 'Rejuvenate dull skin with an exfoliating scrub designed to unclog pores and smooth rough texture',
    category: 'body-care',
    vendor: 'Pula Skin',
    type: 'Exfoliator',
    tags: ['Scrub', 'Body Scrub', 'Exfoliant', 'Body Care'],
    sku: 'PS-FOFA200',
    grams: 200,
    price: 80.0, // in ZAR (R 80.00)
    originalPrice: 105.0,
    currency: 'ZAR',
    image: fofaScrubImg,
    additionalImages: [
      '/images/wellness_fofa_scrub_1790763824821.jpg',
      '/images/product_fofa_scrub_alt1.jpg',
    ],
    description:
      'Rejuvenate dull skin with an exfoliating scrub designed to unclog pores, smooth rough texture, and promote a radiant skin tone.',
    bodyHtml:
      '<p>Rejuvenate dull skin with an exfoliating scrub designed to unclog pores, smooth rough texture, and promote a radiant skin tone.</p><ul><li><strong>Deep Exfoliation:</strong> Lifts away dead skin cells and impurities.</li><li><strong>Purifies Pores:</strong> Leaves skin feeling refreshed, soft, and renewed.</li><li><strong>Preps Skin:</strong> Enhances absorption of creams and serums.</li></ul><p><strong>How to Use:</strong> Gently massage onto wet skin in circular motions 2–3 times per week, then rinse thoroughly.</p>',
    howToUse: 'Gently massage onto wet skin in circular motions 2–3 times per week, then rinse thoroughly.',
    benefits: ['Smooths Keratosis Pilaris', 'Unclogs Pores', 'Preps for Serums'],
    details: [
      'Fine volcanic mineral micro-crystals and crushed botanical seeds',
      'Smooths rough strawberry legs, elbows, and bikini lines',
      'Net Weight: 200g jar',
    ],
    stock: 100,
    rating: 4.8,
    reviewCount: 54,
    edition: 'Exfoliating Ritual Nº 05',
    featured: false,
    variants: [
      { id: 'v-200g', name: '200g Scrub Jar', inStock: true, sku: 'PS-FOFA200', size: '200g', price: 80.0 },
    ],
  },

  // 9. Pure Collagen Peptides Powder (Supplements)
  {
    id: 'collagen-peptides',
    handle: 'collagen-peptides',
    name: 'Phethagatsa Organics Pure Collagen Peptides Powder',
    tagline: 'Pure hydrolyzed Type I & III peptides to nourish skin elasticity, hair growth and joint flexibility',
    category: 'supplements',
    vendor: 'Phethagatsa Organics',
    type: 'Supplements',
    tags: ['Collagen', 'Skin Care', 'Anti Aging', 'Hair Growth', 'Supplements'],
    sku: 'COL-300G',
    grams: 300,
    price: 100.0, // in ZAR (R 100.00)
    originalPrice: 140.0,
    currency: 'ZAR',
    image: collagenImg,
    additionalImages: [
      '/images/wellness_collagen_powder_1790763792825.jpg',
      '/images/product_collagen_peptides_alt1.jpg',
      '/images/product_collagen_peptides_alt2.jpg',
    ],
    description:
      'Nourish your body from within with pure collagen peptides formulated to support skin elasticity, hair growth, nail strength, and flexible joints.',
    bodyHtml:
      '<p>Nourish your body from within with pure collagen peptides formulated to support skin elasticity, hair growth, nail strength, and flexible joints.</p><ul><li><strong>Radiant Skin:</strong> Improves skin hydration and elasticity.</li><li><strong>Stronger Hair & Nails:</strong> Reduces brittleness and supports healthy growth.</li><li><strong>Joint & Muscle Support:</strong> Helps maintain joint flexibility and mobility.</li></ul><p><strong>How to Use:</strong> Mix 1 scoop daily into warm water, coffee, tea, or your favourite smoothie.</p>',
    howToUse: 'Mix 1 scoop daily into warm water, coffee, tea, or your favourite smoothie.',
    benefits: ['Youthful Elasticity', 'Fast Hair Growth', 'Neutral Taste'],
    details: [
      'Hydrolyzed Grass-Fed Bovine Collagen Peptides (Types I & III)',
      '100% soluble in hot or cold liquids with zero odor or aftertaste',
      'Net Weight: 300g resealable barrier pouch (30 servings)',
    ],
    stock: 100,
    rating: 4.9,
    reviewCount: 82,
    edition: 'Nutricosmetics Nº 06',
    featured: true,
    variants: [
      { id: 'v-300g', name: '300g Pouch (30 Servings)', inStock: true, sku: 'COL-300G', grams: 300, price: 100.0 },
    ],
  },

  // 10. Radiant Skin Gummies (Supplements)
  {
    id: 'radiant-skin-gummies',
    handle: 'radiant-skin-gummies',
    name: 'Vital Radiant Skin Adult Gummies',
    tagline: 'Tangy raspberry vitamin gummies with Vitamin A, C, and Biotin for glowing skin and strong nails',
    category: 'supplements',
    vendor: 'Vital',
    type: 'Supplements',
    tags: ['Gummies', 'Vitamin C', 'Biotin', 'Hair Nails', 'Supplements'],
    sku: 'VIT-GUM60',
    grams: 250,
    price: 150.0, // in ZAR (R 150.00)
    originalPrice: 195.0,
    currency: 'ZAR',
    image: skinGummiesImg,
    additionalImages: [skinGummiesImg],
    description:
      'Delicious tangy raspberry gummies packed with Vitamin A, Vitamin C, and Biotin to support glowing skin, strong hair, and healthy nails.',
    bodyHtml:
      '<p>Delicious tangy raspberry gummies packed with Vitamin A, Vitamin C, and Biotin to support glowing skin, strong hair, and healthy nails.</p><ul><li><strong>Glow From Within:</strong> Supports skin elasticity and natural moisture.</li><li><strong>Hair & Nail Health:</strong> Biotin strengthens brittle nails and hair growth.</li><li><strong>Antioxidant Protection:</strong> Vitamin C protects skin against free radical damage.</li></ul><p><strong>How to Use:</strong> Chew 2 gummies daily with food.</p>',
    howToUse: 'Chew 2 gummies daily with food.',
    benefits: ['Delicious Berry Flavor', 'High-Potency Biotin', 'Gelatin-Free Pectin'],
    details: [
      'Daily essential beautifying vitamin complex',
      'Naturally flavored with real raspberry juice extract',
      '60 chewable gummies per bottle (30-day supply)',
    ],
    stock: 100,
    rating: 4.9,
    reviewCount: 67,
    edition: 'Nutricosmetics Nº 07',
    featured: false,
    variants: [
      { id: 'v-60ct', name: '60 Chewable Gummies Bottle', inStock: true, sku: 'VIT-GUM60', price: 150.0 },
    ],
  },

  // 11. Natural Organic Chia Seeds (Superfood)
  {
    id: 'chia-seeds',
    handle: 'chia-seeds',
    name: 'Natural Organic Chia Seeds',
    tagline: 'Boost your daily nutrition with pure, premium chia seeds packed with Omega-3, protein & fibre',
    category: 'superfood',
    vendor: 'Healthy Choices',
    type: 'Superfood',
    tags: ['Chia Seeds', 'Omega 3', 'Superfood', 'Protein'],
    sku: 'CS-300G',
    grams: 300,
    price: 40.0, // in ZAR (R 40.00)
    originalPrice: 55.0,
    currency: 'ZAR',
    image: chiaSeedsImg,
    additionalImages: [
      '/images/wellness_chia_seeds_1790763781382.jpg',
      '/images/product_chia_seeds_alt1.jpg',
    ],
    description:
      'Boost your daily nutrition with pure, premium chia seeds packed with essential Omega-3 fatty acids, protein, and dietary fibre for energy and digestion.',
    bodyHtml:
      '<p>Boost your daily nutrition with pure, premium chia seeds packed with essential Omega-3 fatty acids, protein, and dietary fibre for energy and digestion.</p><ul><li><strong>Rich in Omega-3s:</strong> Supports heart, brain, and joint health.</li><li><strong>High Fibre & Protein:</strong> Promotes healthy digestion and keeps you full longer.</li><li><strong>Versatile Superfood:</strong> Easily mixes into smoothies, oatmeal, yoghurt, or baked goods.</li></ul><p><strong>How to Use:</strong> Add 1–2 tablespoons to water, juices, smoothies, or breakfast bowls daily.</p>',
    howToUse: 'Add 1–2 tablespoons to water, juices, smoothies, or breakfast bowls daily.',
    benefits: ['Packed with Omega-3', 'High Digestive Fibre', 'Plant-Based Protein'],
    details: [
      '100% Certified Organic Raw Black Chia Seeds',
      'Organically grown without chemical pesticides or sprays',
      'Net Weight: 300g resealable pouch',
    ],
    stock: 100,
    rating: 4.9,
    reviewCount: 42,
    edition: 'Pure Nutrition Nº 01',
    featured: false,
    variants: [
      { id: 'v-300g', name: '300g Resealable Pouch', inStock: true, sku: 'CS-300G', grams: 300, price: 40.0 },
    ],
  },
];

// Seed Customer Profile (matching Mockup screen 7 "Welcome back, Mpho!")
export const SEED_CUSTOMER: UserAccount = {
  id: 'usr-mpho-01',
  name: 'Mpho Dlamini',
  email: 'mpho@example.com',
  phone: '+27 82 123 4567',
  address: '123 Main Street',
  city: 'Pretoria',
  province: 'Gauteng',
  postalCode: '0123',
  memberTier: 'VIP Radiant',
  loyaltyPoints: 250,
  totalOrdersCount: 3,
  memberSince: 'July 2024',
  wishlistIds: ['radiant-serum', 'revive-face-cleanser', 'brightening-toner'],
};

// Seed Orders (matching Mockup screen 7, 8, 15)
export const SEED_ORDERS: Order[] = [
  {
    id: 'PS2437',
    customer: {
      fullName: 'Mpho Dlamini',
      email: 'mpho@example.com',
      phone: '+27 82 123 4567',
      address: '123 Main Street',
      city: 'Pretoria',
      province: 'Gauteng',
      postalCode: '0123',
      country: 'South Africa',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Puso Glow Face Cream
        quantity: 1,
        selectedVariant: INITIAL_PRODUCTS[0].variants[0],
      },
      {
        product: INITIAL_PRODUCTS[1], // Radiant Serum
        quantity: 1,
        selectedVariant: INITIAL_PRODUCTS[1].variants[0],
      },
      {
        product: INITIAL_PRODUCTS[3], // Brightening Toner
        quantity: 1,
        selectedVariant: INITIAL_PRODUCTS[3].variants[0],
      },
    ],
    subtotal: 627.0,
    discount: 0,
    shipping: 0, // Free courier over R450
    tax: 0,
    total: 627.0,
    currency: 'ZAR',
    paymentMethod: 'instant-eft',
    status: 'delivered',
    createdAt: '12 Aug 2025, 10:24',
    estimatedDelivery: '15 Aug 2025, 14:20',
    timeline: [
      { title: 'Order Placed', description: 'Order confirmed & paid via Instant EFT', timestamp: '12 Aug 2025, 10:24', completed: true },
      { title: 'Processing', description: 'Formulations prepared & sanitized at Pretoria lab', timestamp: '13 Aug 2025, 11:03', completed: true },
      { title: 'Shipped', description: 'Dispatched with The Courier Guy (Waybill TCG-78921)', timestamp: '15 Aug 2025, 09:12', completed: true },
      { title: 'Delivered', description: 'Signed and received by Mpho Dlamini', timestamp: '15 Aug 2025, 14:20', completed: true },
    ],
  },
  {
    id: 'PS2419',
    customer: {
      fullName: 'Thandiwe Ngcobo',
      email: 'thandiwe@example.com',
      phone: '+27 71 987 6543',
      address: '45 Beach Road, Sea Point',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8005',
      country: 'South Africa',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[6], // Pigmentation Corrector Combo
        quantity: 1,
      },
      {
        product: INITIAL_PRODUCTS[1], // Radiant Serum
        quantity: 1,
      },
    ],
    subtotal: 569.0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 569.0,
    currency: 'ZAR',
    paymentMethod: 'card',
    status: 'shipped',
    createdAt: '28 Jul 2025, 16:45',
    estimatedDelivery: '01 Aug 2025',
    timeline: [
      { title: 'Order Placed', description: 'Visa payment verified', timestamp: '28 Jul 2025, 16:45', completed: true },
      { title: 'Processing', description: 'Care package assembled', timestamp: '29 Jul 2025, 08:30', completed: true },
      { title: 'Shipped', description: 'In transit to Cape Town hub via RAM', timestamp: '30 Jul 2025, 14:15', completed: true },
      { title: 'Delivered', description: 'Scheduled for delivery', timestamp: 'Pending', completed: false },
    ],
  },
  {
    id: 'PS2366',
    customer: {
      fullName: 'Lerato Mokoena',
      email: 'lerato@example.com',
      phone: '+27 83 456 7890',
      address: '78 Umhlanga Rocks Drive',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4320',
      country: 'South Africa',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[8], // Collagen Peptides
        quantity: 2,
      },
      {
        product: INITIAL_PRODUCTS[9], // Radiant Skin Gummies
        quantity: 1,
      },
    ],
    subtotal: 350.0,
    discount: 0,
    shipping: 75.0,
    tax: 0,
    total: 425.0,
    currency: 'ZAR',
    paymentMethod: 'instant-eft',
    status: 'delivered',
    createdAt: '15 Jul 2025, 09:10',
    estimatedDelivery: '18 Jul 2025',
    timeline: [
      { title: 'Order Placed', description: 'Paid via Capitec Pay', timestamp: '15 Jul 2025, 09:10', completed: true },
      { title: 'Processing', description: 'Packed at distribution hub', timestamp: '15 Jul 2025, 12:00', completed: true },
      { title: 'Shipped', description: 'Out with courier', timestamp: '16 Jul 2025, 10:00', completed: true },
      { title: 'Delivered', description: 'Delivered to concierge', timestamp: '18 Jul 2025, 11:30', completed: true },
    ],
  },
  {
    id: 'PS2367',
    customer: {
      fullName: 'Sipho Dlamini',
      email: 'sipho@example.com',
      phone: '+27 72 381 9402',
      address: '12 Jan Smuts Avenue',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2193',
      country: 'South Africa',
    },
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Soothing Eczema Barrier Balm
        quantity: 2,
      },
    ],
    subtotal: 190.0,
    discount: 0,
    shipping: 75.0,
    tax: 0,
    total: 265.0,
    currency: 'ZAR',
    paymentMethod: 'cod',
    status: 'pending',
    createdAt: 'Just now',
    estimatedDelivery: 'In 2 days',
    timeline: [
      { title: 'Order Placed', description: 'Cash on delivery requested via WhatsApp', timestamp: 'Just now', completed: true },
      { title: 'Processing', description: 'Pending address verification call', timestamp: 'Pending', completed: false },
      { title: 'Shipped', description: 'Awaiting courier dispatch', timestamp: 'Pending', completed: false },
      { title: 'Delivered', description: 'Awaiting delivery', timestamp: 'Pending', completed: false },
    ],
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Phethagatsa Solutions',
  storeEmail: 'care@phethagatsa.co.za',
  storePhone: '+27 (0)11 832 9400',
  storeAddress: '123 Main Street, Pretoria / Johannesburg, Gauteng, 0001',
  whatsappNumber: '27723819402',
  currency: 'ZAR',
  paymentGateway: 'PayFast / Instant EFT (Ozow, Capitec)',
  defaultShipping: 75,
  freeShippingThreshold: 450,
};

export const INITIAL_ANALYTICS: AdminAnalytics = {
  totalRevenue: 24560,
  totalOrders: 124,
  totalCustomers: 89,
  totalProducts: 28,
  averageOrderValue: 198,
  salesGrowthPct: 16,
  monthlySales: [
    { month: 'Jan', sales: 12400, orders: 62 },
    { month: 'Feb', sales: 14800, orders: 74 },
    { month: 'Mar', sales: 16200, orders: 81 },
    { month: 'Apr', sales: 18900, orders: 95 },
    { month: 'May', sales: 21500, orders: 108 },
    { month: 'Jun', sales: 24560, orders: 124 },
  ],
};

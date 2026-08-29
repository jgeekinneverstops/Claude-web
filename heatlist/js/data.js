/* ============================================================================
   SEED DATA  —  MIAMI  —  DEMO ONLY
   ----------------------------------------------------------------------------
   Miami is the launch market and the only city with data. Everything below is
   FICTIONAL sample data written to exercise the UI: invented store names,
   invented sales figures, invented prices. None of it describes a real
   business. Replace with a fetch() against your own API before showing anyone.

   Three tables, deliberately normalized:

     CITY    – the market. One for now. Neighborhoods drive the map + filters.
     MODELS  – the canonical piece ("LV Neverfull MM"), with how it SELLS.
     STOCK   – one physical listing of a model, in one store, at one price.

   The split is the whole point. Heat belongs to the MODEL (it is a fact about
   demand across the city, measured in units sold and days-to-sell), and price
   belongs to the STOCK row (it is a fact about one store). That is what lets
   the app answer both "what's moving in Miami" and "who has it cheapest."
   ========================================================================== */

/** The launch market. Adding a city = adding an entry here + its data. */
const CITY = {
  id: 'mia',
  name: 'Miami',
  tagline: 'Wynwood to Bal Harbour',
  /** Neighborhoods with a real resale presence, north to south. */
  hoods: [
    'Aventura', 'North Miami', 'Bal Harbour', 'Little Haiti', 'Design District',
    'Midtown', 'Wynwood', 'Downtown', 'Brickell', 'Little Havana',
    'South Beach', 'Coconut Grove', 'Coral Gables'
  ]
};

/** Cities the waitlist is open for. No data yet — the map is Miami-only. */
const SOON = ['Los Angeles', 'New York', 'Atlanta', 'Toronto'];

/**
 * @typedef {Object} Store
 * @property {string}   id          slug, stable forever (used in URLs)
 * @property {string}   name
 * @property {string}   hood        must appear in CITY.hoods
 * @property {string}   address
 * @property {number}   x,y         position on the stylized map, 0-100 (%)
 * @property {number}   distanceMi  from the user; server-computed
 * @property {number}   payout      what they pay when YOU sell to them, 1-5.
 *                                  Reported by sellers — the one rating that
 *                                  cannot be computed from listings.
 * @property {number}   reviews     seller reports behind that payout number
 * @property {number[]} hours       [openHour, closeHour] 24h, local
 * @property {string[]} tags
 * @property {string}   verified    ISO date inventory was last confirmed
 *
 * Floor heat and price fairness are NOT stored — both are computed from
 * MODELS and STOCK in app.js, so a store cannot coast on an old reputation.
 */
const STORES = [
  { id: 'bal-harbour-reserve', name: 'Bal Harbour Reserve', hood: 'Bal Harbour',
    address: '96XX Collins Ave', x: 85, y: 15, distanceMi: 9.4,
    payout: 3.6, reviews: 214, hours: [11, 19],
    tags: ['Watches & jewelry', 'Appointment only', 'Authenticates'], verified: '2026-08-29' },

  { id: 'aventura-trade', name: 'Aventura Trade House', hood: 'Aventura',
    address: '19XXX Biscayne Blvd', x: 68, y: 9, distanceMi: 11.8,
    payout: 4.7, reviews: 386, hours: [10, 20],
    tags: ['Best payouts', 'Buys on the spot', 'Cash payout'], verified: '2026-08-28' },

  { id: 'northside-heat', name: 'Northside Heat', hood: 'North Miami',
    address: '12XX NE 125th St', x: 55, y: 13, distanceMi: 8.2,
    payout: 4.4, reviews: 98, hours: [11, 19],
    tags: ['Sleeper spot', 'Cash payout', 'No appointment'], verified: '2026-08-22' },

  { id: 'second-sunday', name: 'Second Sunday', hood: 'Little Haiti',
    address: '5XX NE 59th Ter', x: 52, y: 24, distanceMi: 3.6,
    payout: 4.6, reviews: 288, hours: [11, 20],
    tags: ['Best payouts', 'Consignment', 'Trade-ins'], verified: '2026-08-27' },

  { id: 'vault-mia', name: 'Vault MIA', hood: 'Design District',
    address: '1XX NE 39th St', x: 50, y: 30, distanceMi: 2.1,
    payout: 3.2, reviews: 655, hours: [11, 22],
    tags: ['Deadstock only', 'Appointment room', 'Authenticates'], verified: '2026-08-29' },

  { id: 'archive-305', name: 'Archive 305', hood: 'Midtown',
    address: '32XX NE 1st Ave', x: 44, y: 33, distanceMi: 1.9,
    payout: 3.8, reviews: 341, hours: [12, 20],
    tags: ['Archive pieces', 'Authenticates', 'Trade-ins'], verified: '2026-08-28' },

  { id: 'grail-room', name: 'The Grail Room', hood: 'Wynwood',
    address: '2XX NW 24th St', x: 40, y: 38, distanceMi: 1.2,
    payout: 4.1, reviews: 412, hours: [12, 21],
    tags: ['Buys on the spot', 'Cash payout', 'Authenticates'], verified: '2026-08-28' },

  { id: 'brickell-luxe', name: 'Brickell Luxe Exchange', hood: 'Brickell',
    address: '11XX Brickell Ave', x: 48, y: 55, distanceMi: 3.3,
    payout: 3.4, reviews: 497, hours: [10, 20],
    tags: ['Bags & leather', 'Authenticates', 'Consignment'], verified: '2026-08-29' },

  { id: 'flamingo-trade', name: 'Flamingo Trade Co.', hood: 'Little Havana',
    address: '8XX SW 8th St', x: 30, y: 54, distanceMi: 4.4,
    payout: 4.8, reviews: 176, hours: [10, 19],
    tags: ['Best payouts', 'Cash payout', 'No appointment'], verified: '2026-08-26' },

  { id: 'sobe-consign', name: 'SoBe Consignment', hood: 'South Beach',
    address: '7XX Collins Ave', x: 85, y: 52, distanceMi: 6.8,
    payout: 2.9, reviews: 523, hours: [12, 23],
    tags: ['Open late', 'Consignment', 'Tourist heavy'], verified: '2026-08-25' },

  { id: 'grove-vintage', name: 'Grove Vintage Co.', hood: 'Coconut Grove',
    address: '31XX Grand Ave', x: 36, y: 72, distanceMi: 5.9,
    payout: 4.0, reviews: 143, hours: [11, 19],
    tags: ['Vintage', 'Eyewear strong', 'No appointment'], verified: '2026-08-27' },

  { id: 'coral-curated', name: 'Coral Curated', hood: 'Coral Gables',
    address: '2XX Miracle Mile', x: 24, y: 78, distanceMi: 7.1,
    payout: 3.5, reviews: 209, hours: [11, 19],
    tags: ['Womenswear strong', 'Consignment', 'Appointment room'], verified: '2026-08-24' }
];

/**
 * @typedef {Object} Model
 * @property {string} id
 * @property {string} brand
 * @property {string} name
 * @property {'Tops'|'Outerwear'|'Denim'|'Footwear'|'Bags'|'Jewelry'|'Watches'|'Eyewear'|'Accessories'} cat
 * @property {number} comp    current market comp, USD
 * @property {number} sold30  units sold across tracked Miami stores, last 30 days
 * @property {number} days    median days on the floor before it sells, Miami
 *
 * sold30 + days ARE the ranking. Heat is derived from them in app.js — nobody
 * types a star rating in. Volume without speed is a slow mover; speed without
 * volume is a one-off. A piece is hot only when it does both.
 */
const MODELS = [
  // ---- Chrome Hearts ------------------------------------------------------
  { id: 'm01', brand: 'Chrome Hearts', name: 'Horseshoe Logo Hoodie', cat: 'Tops', comp: 1450, sold30: 18, days: 5 },
  { id: 'm02', brand: 'Chrome Hearts', name: 'Dagger Zip Hoodie', cat: 'Tops', comp: 1600, sold30: 12, days: 6 },
  { id: 'm03', brand: 'Chrome Hearts', name: 'Cemetery Cross Ring', cat: 'Jewelry', comp: 720, sold30: 26, days: 4 },
  { id: 'm04', brand: 'Chrome Hearts', name: 'Matty Boy Leather Jacket', cat: 'Outerwear', comp: 9400, sold30: 3, days: 21 },
  { id: 'm05', brand: 'Chrome Hearts', name: 'Trucker Cap', cat: 'Accessories', comp: 480, sold30: 21, days: 5 },
  // ---- Louis Vuitton ------------------------------------------------------
  { id: 'm06', brand: 'Louis Vuitton', name: 'Neverfull MM', cat: 'Bags', comp: 1850, sold30: 34, days: 3 },
  { id: 'm07', brand: 'Louis Vuitton', name: 'Keepall 55 Bandoulière', cat: 'Bags', comp: 2400, sold30: 19, days: 6 },
  { id: 'm08', brand: 'Louis Vuitton', name: 'Pochette Métis', cat: 'Bags', comp: 2100, sold30: 24, days: 4 },
  { id: 'm09', brand: 'Louis Vuitton', name: 'LV Trainer Sneaker', cat: 'Footwear', comp: 980, sold30: 11, days: 12 },
  // ---- Valley -------------------------------------------------------------
  { id: 'm10', brand: 'Valley', name: 'Nudge Sunglasses', cat: 'Eyewear', comp: 210, sold30: 16, days: 9 },
  { id: 'm11', brand: 'Valley', name: 'Vitesse Sunglasses', cat: 'Eyewear', comp: 195, sold30: 9, days: 14 },
  // ---- Hard luxury --------------------------------------------------------
  { id: 'm12', brand: 'Cartier', name: 'Love Bracelet', cat: 'Jewelry', comp: 6200, sold30: 8, days: 7 },
  { id: 'm13', brand: 'Cartier', name: 'Santos de Cartier', cat: 'Watches', comp: 6900, sold30: 5, days: 16 },
  { id: 'm14', brand: 'Van Cleef & Arpels', name: 'Alhambra Necklace', cat: 'Jewelry', comp: 4100, sold30: 6, days: 11 },
  { id: 'm15', brand: 'Rolex', name: 'Datejust 41', cat: 'Watches', comp: 11200, sold30: 9, days: 8 },
  { id: 'm16', brand: 'Audemars Piguet', name: 'Royal Oak 15500ST', cat: 'Watches', comp: 28500, sold30: 2, days: 34 },
  // ---- Bags ---------------------------------------------------------------
  { id: 'm17', brand: 'Hermès', name: 'Birkin 30', cat: 'Bags', comp: 21500, sold30: 2, days: 26 },
  { id: 'm18', brand: 'Goyard', name: 'Saint Louis PM', cat: 'Bags', comp: 1750, sold30: 13, days: 8 },
  { id: 'm19', brand: 'Dior', name: 'Saddle Bag', cat: 'Bags', comp: 2900, sold30: 10, days: 12 },
  { id: 'm20', brand: 'Bottega Veneta', name: 'Cassette Bag', cat: 'Bags', comp: 1900, sold30: 7, days: 18 },
  { id: 'm21', brand: 'Prada', name: 'Re-Nylon Shoulder Bag', cat: 'Bags', comp: 890, sold30: 14, days: 10 },
  { id: 'm22', brand: 'Gucci', name: 'Horsebit Loafer', cat: 'Footwear', comp: 620, sold30: 12, days: 15 },
  { id: 'm23', brand: 'Celine', name: 'Triomphe Sunglasses', cat: 'Eyewear', comp: 340, sold30: 15, days: 9 },
  // ---- Streetwear ---------------------------------------------------------
  { id: 'm24', brand: 'Corteiz', name: 'Alcatraz Cargo', cat: 'Denim', comp: 330, sold30: 29, days: 3 },
  { id: 'm25', brand: 'Supreme', name: 'Box Logo Crewneck FW23', cat: 'Tops', comp: 520, sold30: 17, days: 6 },
  { id: 'm26', brand: 'Denim Tears', name: 'Cotton Wreath Sweatpants', cat: 'Denim', comp: 340, sold30: 22, days: 5 },
  { id: 'm27', brand: 'Rick Owens', name: 'DRKSHDW Ramones', cat: 'Footwear', comp: 810, sold30: 8, days: 17 },
  { id: 'm28', brand: 'Gallery Dept', name: 'Painted Flare Jean', cat: 'Denim', comp: 360, sold30: 6, days: 31 },
  { id: 'm29', brand: 'Hellstar', name: 'Studio Records Hoodie', cat: 'Tops', comp: 250, sold30: 24, days: 4 },
  { id: 'm30', brand: 'Sp5der', name: 'Web Print Hoodie', cat: 'Tops', comp: 280, sold30: 20, days: 6 },
  { id: 'm31', brand: 'Nike', name: 'Travis Scott Jordan 1 Low', cat: 'Footwear', comp: 1150, sold30: 15, days: 5 },
  { id: 'm32', brand: 'Bape', name: 'Shark Full-Zip Hoodie', cat: 'Outerwear', comp: 390, sold30: 11, days: 12 },
  { id: 'm33', brand: 'Stüssy', name: '8-Ball Fleece', cat: 'Tops', comp: 185, sold30: 13, days: 14 },
  { id: 'm34', brand: 'Amiri', name: 'MX1 Distressed Jean', cat: 'Denim', comp: 820, sold30: 5, days: 29 },
  { id: 'm35', brand: 'Aimé Leon Dore', name: 'Uni Crewneck', cat: 'Tops', comp: 210, sold30: 9, days: 16 },
  { id: 'm36', brand: 'Kapital', name: 'Boro Patchwork Vest', cat: 'Outerwear', comp: 690, sold30: 4, days: 27 },
  { id: 'm37', brand: 'Raf Simons', name: 'Consumed Bomber AW03', cat: 'Outerwear', comp: 4100, sold30: 2, days: 19 },
  { id: 'm38', brand: 'Nike', name: 'Dunk Low Panda', cat: 'Footwear', comp: 115, sold30: 7, days: 44 }
];

/**
 * @typedef {Object} Stock
 * @property {string} id
 * @property {string} storeId
 * @property {string} modelId
 * @property {string} size
 * @property {'DS'|'VNDS'|'Used'} cond
 * @property {number} price   what THIS store is asking
 * @property {number} daysIn  days this piece has sat on this floor
 *
 * Models carried by several stores are the point — that spread is what the
 * Compare view ranks, and what "best price in Miami" is measured against.
 */
const STOCK = [
  // LV Neverfull MM — the widest spread in the city
  { id: 's001', storeId: 'brickell-luxe', modelId: 'm06', size: 'MM', cond: 'VNDS', price: 1690, daysIn: 4 },
  { id: 's002', storeId: 'sobe-consign', modelId: 'm06', size: 'MM', cond: 'Used', price: 2050, daysIn: 12 },
  { id: 's003', storeId: 'aventura-trade', modelId: 'm06', size: 'MM', cond: 'Used', price: 1580, daysIn: 2 },
  { id: 's004', storeId: 'coral-curated', modelId: 'm06', size: 'MM', cond: 'VNDS', price: 1795, daysIn: 9 },

  // LV Pochette Métis
  { id: 's005', storeId: 'brickell-luxe', modelId: 'm08', size: 'OS', cond: 'VNDS', price: 1980, daysIn: 6 },
  { id: 's006', storeId: 'sobe-consign', modelId: 'm08', size: 'OS', cond: 'VNDS', price: 2290, daysIn: 15 },
  { id: 's007', storeId: 'aventura-trade', modelId: 'm08', size: 'OS', cond: 'Used', price: 1890, daysIn: 3 },

  // LV Keepall 55
  { id: 's008', storeId: 'brickell-luxe', modelId: 'm07', size: '55', cond: 'Used', price: 2240, daysIn: 8 },
  { id: 's009', storeId: 'aventura-trade', modelId: 'm07', size: '55', cond: 'VNDS', price: 2350, daysIn: 5 },

  // LV Trainer
  { id: 's010', storeId: 'vault-mia', modelId: 'm09', size: '9', cond: 'DS', price: 1040, daysIn: 11 },
  { id: 's011', storeId: 'flamingo-trade', modelId: 'm09', size: '10', cond: 'VNDS', price: 890, daysIn: 6 },

  // Chrome Hearts Horseshoe Hoodie — four stores, big spread
  { id: 's012', storeId: 'grail-room', modelId: 'm01', size: 'L', cond: 'VNDS', price: 1180, daysIn: 2 },
  { id: 's013', storeId: 'vault-mia', modelId: 'm01', size: 'M', cond: 'DS', price: 1520, daysIn: 5 },
  { id: 's014', storeId: 'sobe-consign', modelId: 'm01', size: 'XL', cond: 'Used', price: 1620, daysIn: 21 },
  { id: 's015', storeId: 'aventura-trade', modelId: 'm01', size: 'L', cond: 'VNDS', price: 1290, daysIn: 7 },

  // Chrome Hearts Dagger Zip
  { id: 's016', storeId: 'vault-mia', modelId: 'm02', size: 'XL', cond: 'VNDS', price: 1350, daysIn: 1 },
  { id: 's017', storeId: 'grail-room', modelId: 'm02', size: 'M', cond: 'VNDS', price: 1480, daysIn: 9 },

  // Chrome Hearts Cross Ring
  { id: 's018', storeId: 'grail-room', modelId: 'm03', size: '10', cond: 'Used', price: 640, daysIn: 11 },
  { id: 's019', storeId: 'bal-harbour-reserve', modelId: 'm03', size: '9', cond: 'VNDS', price: 780, daysIn: 6 },
  { id: 's020', storeId: 'northside-heat', modelId: 'm03', size: '11', cond: 'Used', price: 595, daysIn: 4 },

  // Chrome Hearts jacket + cap
  { id: 's021', storeId: 'vault-mia', modelId: 'm04', size: 'M', cond: 'DS', price: 8900, daysIn: 4 },
  { id: 's022', storeId: 'sobe-consign', modelId: 'm05', size: 'OS', cond: 'Used', price: 520, daysIn: 16 },
  { id: 's023', storeId: 'grail-room', modelId: 'm05', size: 'OS', cond: 'VNDS', price: 430, daysIn: 3 },

  // Valley eyewear
  { id: 's024', storeId: 'grove-vintage', modelId: 'm10', size: 'OS', cond: 'DS', price: 165, daysIn: 5 },
  { id: 's025', storeId: 'coral-curated', modelId: 'm10', size: 'OS', cond: 'VNDS', price: 195, daysIn: 12 },
  { id: 's026', storeId: 'sobe-consign', modelId: 'm10', size: 'OS', cond: 'DS', price: 230, daysIn: 18 },
  { id: 's027', storeId: 'grove-vintage', modelId: 'm11', size: 'OS', cond: 'VNDS', price: 150, daysIn: 8 },

  // Hard luxury
  { id: 's028', storeId: 'bal-harbour-reserve', modelId: 'm12', size: '17', cond: 'VNDS', price: 5950, daysIn: 5 },
  { id: 's029', storeId: 'brickell-luxe', modelId: 'm12', size: '16', cond: 'Used', price: 5700, daysIn: 10 },
  { id: 's030', storeId: 'bal-harbour-reserve', modelId: 'm13', size: 'Med', cond: 'VNDS', price: 6650, daysIn: 14 },
  { id: 's031', storeId: 'bal-harbour-reserve', modelId: 'm14', size: '10-motif', cond: 'VNDS', price: 3980, daysIn: 7 },
  { id: 's032', storeId: 'aventura-trade', modelId: 'm14', size: '10-motif', cond: 'Used', price: 3790, daysIn: 3 },
  { id: 's033', storeId: 'bal-harbour-reserve', modelId: 'm15', size: '41mm', cond: 'VNDS', price: 10900, daysIn: 9 },
  { id: 's034', storeId: 'aventura-trade', modelId: 'm15', size: '41mm', cond: 'Used', price: 10400, daysIn: 4 },
  { id: 's035', storeId: 'bal-harbour-reserve', modelId: 'm16', size: '41mm', cond: 'VNDS', price: 28900, daysIn: 22 },
  { id: 's036', storeId: 'bal-harbour-reserve', modelId: 'm17', size: '30', cond: 'VNDS', price: 21900, daysIn: 19 },
  { id: 's037', storeId: 'brickell-luxe', modelId: 'm17', size: '30', cond: 'Used', price: 19800, daysIn: 27 },

  // Designer bags
  { id: 's038', storeId: 'brickell-luxe', modelId: 'm18', size: 'PM', cond: 'VNDS', price: 1620, daysIn: 6 },
  { id: 's039', storeId: 'coral-curated', modelId: 'm18', size: 'PM', cond: 'Used', price: 1740, daysIn: 13 },
  { id: 's040', storeId: 'brickell-luxe', modelId: 'm19', size: 'OS', cond: 'VNDS', price: 2740, daysIn: 8 },
  { id: 's041', storeId: 'sobe-consign', modelId: 'm19', size: 'OS', cond: 'Used', price: 3050, daysIn: 24 },
  { id: 's042', storeId: 'coral-curated', modelId: 'm20', size: 'OS', cond: 'VNDS', price: 1780, daysIn: 15 },
  { id: 's043', storeId: 'brickell-luxe', modelId: 'm21', size: 'OS', cond: 'Used', price: 790, daysIn: 11 },
  { id: 's044', storeId: 'coral-curated', modelId: 'm21', size: 'OS', cond: 'VNDS', price: 860, daysIn: 17 },
  { id: 's045', storeId: 'sobe-consign', modelId: 'm22', size: '42', cond: 'Used', price: 640, daysIn: 20 },
  { id: 's046', storeId: 'grove-vintage', modelId: 'm23', size: 'OS', cond: 'VNDS', price: 285, daysIn: 7 },
  { id: 's047', storeId: 'coral-curated', modelId: 'm23', size: 'OS', cond: 'DS', price: 330, daysIn: 14 },

  // Streetwear
  { id: 's048', storeId: 'second-sunday', modelId: 'm24', size: 'M', cond: 'DS', price: 240, daysIn: 1 },
  { id: 's049', storeId: 'northside-heat', modelId: 'm24', size: 'L', cond: 'VNDS', price: 265, daysIn: 5 },
  { id: 's050', storeId: 'grail-room', modelId: 'm24', size: 'S', cond: 'DS', price: 310, daysIn: 8 },
  { id: 's051', storeId: 'second-sunday', modelId: 'm25', size: 'L', cond: 'VNDS', price: 420, daysIn: 6 },
  { id: 's052', storeId: 'vault-mia', modelId: 'm25', size: 'M', cond: 'DS', price: 545, daysIn: 12 },
  { id: 's053', storeId: 'grail-room', modelId: 'm26', size: 'M', cond: 'DS', price: 310, daysIn: 5 },
  { id: 's054', storeId: 'second-sunday', modelId: 'm26', size: 'L', cond: 'VNDS', price: 285, daysIn: 3 },
  { id: 's055', storeId: 'grail-room', modelId: 'm27', size: '43', cond: 'VNDS', price: 720, daysIn: 18 },
  { id: 's056', storeId: 'archive-305', modelId: 'm27', size: '42', cond: 'DS', price: 845, daysIn: 10 },
  { id: 's057', storeId: 'grail-room', modelId: 'm28', size: '32', cond: 'Used', price: 380, daysIn: 34 },
  { id: 's058', storeId: 'northside-heat', modelId: 'm29', size: 'L', cond: 'DS', price: 185, daysIn: 4 },
  { id: 's059', storeId: 'flamingo-trade', modelId: 'm29', size: 'M', cond: 'VNDS', price: 210, daysIn: 9 },
  { id: 's060', storeId: 'flamingo-trade', modelId: 'm30', size: 'L', cond: 'VNDS', price: 210, daysIn: 7 },
  { id: 's061', storeId: 'northside-heat', modelId: 'm30', size: 'M', cond: 'DS', price: 245, daysIn: 11 },
  { id: 's062', storeId: 'flamingo-trade', modelId: 'm31', size: '10.5', cond: 'VNDS', price: 980, daysIn: 2 },
  { id: 's063', storeId: 'vault-mia', modelId: 'm31', size: '9.5', cond: 'DS', price: 1240, daysIn: 6 },
  { id: 's064', storeId: 'second-sunday', modelId: 'm32', size: 'XL', cond: 'Used', price: 330, daysIn: 9 },
  { id: 's065', storeId: 'second-sunday', modelId: 'm33', size: 'M', cond: 'VNDS', price: 145, daysIn: 14 },
  { id: 's066', storeId: 'flamingo-trade', modelId: 'm33', size: 'L', cond: 'Used', price: 120, daysIn: 22 },
  { id: 's067', storeId: 'sobe-consign', modelId: 'm34', size: '32', cond: 'VNDS', price: 890, daysIn: 29 },
  { id: 's068', storeId: 'coral-curated', modelId: 'm35', size: 'S', cond: 'DS', price: 175, daysIn: 9 },
  { id: 's069', storeId: 'archive-305', modelId: 'm36', size: '2', cond: 'VNDS', price: 640, daysIn: 15 },
  { id: 's070', storeId: 'grove-vintage', modelId: 'm36', size: '3', cond: 'Used', price: 580, daysIn: 21 },
  { id: 's071', storeId: 'archive-305', modelId: 'm37', size: '48', cond: 'Used', price: 3400, daysIn: 3 },
  { id: 's072', storeId: 'northside-heat', modelId: 'm38', size: '11', cond: 'DS', price: 105, daysIn: 63 },
  { id: 's073', storeId: 'flamingo-trade', modelId: 'm38', size: '10', cond: 'VNDS', price: 95, daysIn: 41 }
];

/* ============================================================================
   SEED DATA  —  DEMO ONLY
   ----------------------------------------------------------------------------
   Every store, rating, item and price below is FICTIONAL sample data, written
   to exercise the UI. None of it describes a real business, and none of the
   ratings come from real customers. Replace this file with a fetch() against
   your own API before showing this to anyone.

   The shapes below ARE the real thing though — this is the schema you would
   fill from store check-ins, so treat it as the contract between app and API.
   ========================================================================== */

/**
 * @typedef {Object} Store
 * @property {string}   id            slug, stable forever (used in URLs)
 * @property {string}   name
 * @property {string}   hood          neighborhood label shown on the card
 * @property {string}   address
 * @property {number}   x,y           position on the stylized map, 0-100 (%)
 * @property {number}   distanceMi    from the user; server-computed
 * @property {number}   stock         "how much heat is on the floor" 1-5
 * @property {number}   payout        "what they pay when YOU sell to them" 1-5
 * @property {number}   pricing       "are their retail prices fair" 1-5
 * @property {number}   reviews       count backing those three numbers
 * @property {number[]} hours         [openHour, closeHour] 24h, local
 * @property {string[]} tags
 * @property {string[]} brands        marquee brands they're known for
 * @property {string}   verified      ISO date of last confirmed inventory check
 */
const STORES = [
  {
    id: 'grail-room', name: 'The Grail Room', hood: 'Wynwood',
    address: '2XX NW 24th St', x: 46, y: 30, distanceMi: 1.2,
    stock: 4.8, payout: 4.1, pricing: 3.4, reviews: 412, hours: [12, 21],
    tags: ['Buys on the spot', 'Cash payout', 'Authenticates'],
    brands: ['Chrome Hearts', 'Rick Owens', 'Gallery Dept', 'Denim Tears'],
    verified: '2026-08-28'
  },
  {
    id: 'second-sunday', name: 'Second Sunday', hood: 'Little Haiti',
    address: '5XX NE 59th Ter', x: 58, y: 14, distanceMi: 3.6,
    stock: 4.2, payout: 4.6, pricing: 4.4, reviews: 288, hours: [11, 20],
    tags: ['Best payouts', 'Consignment', 'Trade-ins'],
    brands: ['Supreme', 'Stüssy', 'Bape', 'Corteiz'],
    verified: '2026-08-27'
  },
  {
    id: 'vault-mia', name: 'Vault MIA', hood: 'Design District',
    address: '1XX NE 39th St', x: 52, y: 22, distanceMi: 2.1,
    stock: 4.9, payout: 3.2, pricing: 2.6, reviews: 655, hours: [11, 22],
    tags: ['Deadstock only', 'Appointment room', 'Authenticates'],
    brands: ['Chrome Hearts', 'Vetements', 'Rick Owens', 'ERD'],
    verified: '2026-08-29'
  },
  {
    id: 'flamingo-trade', name: 'Flamingo Trade Co.', hood: 'Little Havana',
    address: '8XX SW 8th St', x: 30, y: 56, distanceMi: 4.4,
    stock: 3.4, payout: 4.8, pricing: 4.7, reviews: 176, hours: [10, 19],
    tags: ['Best payouts', 'Cash payout', 'No appointment'],
    brands: ['Nike', 'Stüssy', 'Carhartt WIP', 'Sp5der'],
    verified: '2026-08-26'
  },
  {
    id: 'south-beach-consign', name: 'SoBe Consignment', hood: 'South Beach',
    address: '7XX Collins Ave', x: 84, y: 62, distanceMi: 6.8,
    stock: 3.9, payout: 2.9, pricing: 2.8, reviews: 523, hours: [12, 23],
    tags: ['Open late', 'Consignment', 'Tourist heavy'],
    brands: ['Chrome Hearts', 'Amiri', 'Gallery Dept', 'Palm Angels'],
    verified: '2026-08-25'
  },
  {
    id: 'archive-305', name: 'Archive 305', hood: 'Wynwood',
    address: '3XX NW 26th St', x: 36, y: 20, distanceMi: 1.5,
    stock: 4.4, payout: 3.8, pricing: 4.1, reviews: 341, hours: [12, 20],
    tags: ['Archive pieces', 'Authenticates', 'Trade-ins'],
    brands: ['Raf Simons', 'Undercover', 'Kapital', 'Number (N)ine'],
    verified: '2026-08-28'
  },
  {
    id: 'northside-heat', name: 'Northside Heat', hood: 'North Miami',
    address: '12XX NE 125th St', x: 62, y: 13, distanceMi: 8.2,
    stock: 3.1, payout: 4.4, pricing: 4.9, reviews: 98, hours: [11, 19],
    tags: ['Sleeper spot', 'Cash payout', 'No appointment'],
    brands: ['Hellstar', 'Sp5der', 'Nike', 'Broken Planet'],
    verified: '2026-08-22'
  },
  {
    id: 'coral-curated', name: 'Coral Curated', hood: 'Coral Gables',
    address: '2XX Miracle Mile', x: 22, y: 74, distanceMi: 7.1,
    stock: 3.6, payout: 3.5, pricing: 3.2, reviews: 209, hours: [11, 19],
    tags: ['Womenswear strong', 'Consignment', 'Appointment room'],
    brands: ['Aimé Leon Dore', 'Kapital', 'Stüssy', 'Comme des Garçons'],
    verified: '2026-08-24'
  }
];

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} storeId
 * @property {string} brand
 * @property {string} name
 * @property {'Tops'|'Outerwear'|'Denim'|'Footwear'|'Accessories'} cat
 * @property {string} size
 * @property {'DS'|'VNDS'|'Used'} cond
 * @property {number} price   what the store is asking, USD
 * @property {number} comp    recent market comp, USD — drives the deal score
 * @property {number} heat    street demand 1-5 (see scoring in app.js)
 * @property {number} daysIn  days it has sat on the floor
 */
const ITEMS = [
  { id: 'i01', storeId: 'grail-room', brand: 'Chrome Hearts', name: 'Horseshoe Logo Hoodie', cat: 'Tops', size: 'L', cond: 'VNDS', price: 1180, comp: 1450, heat: 5, daysIn: 2 },
  { id: 'i02', storeId: 'grail-room', brand: 'Chrome Hearts', name: 'Cemetery Cross Ring', cat: 'Accessories', size: '10', cond: 'Used', price: 640, comp: 720, heat: 4, daysIn: 11 },
  { id: 'i03', storeId: 'grail-room', brand: 'Denim Tears', name: 'Cotton Wreath Sweatpants', cat: 'Denim', size: 'M', cond: 'DS', price: 310, comp: 340, heat: 4, daysIn: 5 },
  { id: 'i04', storeId: 'grail-room', brand: 'Rick Owens', name: 'DRKSHDW Ramones', cat: 'Footwear', size: '43', cond: 'VNDS', price: 720, comp: 810, heat: 4, daysIn: 18 },
  { id: 'i05', storeId: 'grail-room', brand: 'Gallery Dept', name: 'Painted Flare Jean', cat: 'Denim', size: '32', cond: 'Used', price: 380, comp: 360, heat: 3, daysIn: 34 },

  { id: 'i06', storeId: 'second-sunday', brand: 'Corteiz', name: 'Alcatraz Cargo', cat: 'Denim', size: 'M', cond: 'DS', price: 240, comp: 330, heat: 5, daysIn: 1 },
  { id: 'i07', storeId: 'second-sunday', brand: 'Supreme', name: 'Box Logo Crewneck FW23', cat: 'Tops', size: 'L', cond: 'VNDS', price: 420, comp: 520, heat: 4, daysIn: 6 },
  { id: 'i08', storeId: 'second-sunday', brand: 'Bape', name: 'Shark Full-Zip Hoodie', cat: 'Outerwear', size: 'XL', cond: 'Used', price: 330, comp: 390, heat: 4, daysIn: 9 },
  { id: 'i09', storeId: 'second-sunday', brand: 'Stüssy', name: '8-Ball Fleece', cat: 'Tops', size: 'M', cond: 'VNDS', price: 145, comp: 185, heat: 3, daysIn: 14 },
  { id: 'i10', storeId: 'second-sunday', brand: 'Corteiz', name: 'Bolo Track Jacket', cat: 'Outerwear', size: 'L', cond: 'DS', price: 290, comp: 300, heat: 4, daysIn: 3 },

  { id: 'i11', storeId: 'vault-mia', brand: 'Chrome Hearts', name: 'Matty Boy Leather Jacket', cat: 'Outerwear', size: 'M', cond: 'DS', price: 8900, comp: 9400, heat: 5, daysIn: 4 },
  { id: 'i12', storeId: 'vault-mia', brand: 'Vetements', name: 'Oversized Anarchy Hoodie', cat: 'Tops', size: 'L', cond: 'DS', price: 780, comp: 720, heat: 3, daysIn: 26 },
  { id: 'i13', storeId: 'vault-mia', brand: 'Rick Owens', name: 'Geobasket Hi', cat: 'Footwear', size: '42', cond: 'DS', price: 1050, comp: 1120, heat: 4, daysIn: 8 },
  { id: 'i14', storeId: 'vault-mia', brand: 'ERD', name: 'Enfants Riches Déprimés Tee', cat: 'Tops', size: 'M', cond: 'VNDS', price: 460, comp: 500, heat: 4, daysIn: 12 },
  { id: 'i15', storeId: 'vault-mia', brand: 'Chrome Hearts', name: 'Dagger Zip Hoodie', cat: 'Tops', size: 'XL', cond: 'VNDS', price: 1350, comp: 1600, heat: 5, daysIn: 1 },

  { id: 'i16', storeId: 'flamingo-trade', brand: 'Sp5der', name: 'Web Print Hoodie', cat: 'Tops', size: 'L', cond: 'VNDS', price: 210, comp: 280, heat: 4, daysIn: 7 },
  { id: 'i17', storeId: 'flamingo-trade', brand: 'Nike', name: 'Travis Scott Jordan 1 Low', cat: 'Footwear', size: '10.5', cond: 'VNDS', price: 980, comp: 1150, heat: 5, daysIn: 2 },
  { id: 'i18', storeId: 'flamingo-trade', brand: 'Carhartt WIP', name: 'Detroit Jacket', cat: 'Outerwear', size: 'L', cond: 'Used', price: 190, comp: 210, heat: 2, daysIn: 41 },
  { id: 'i19', storeId: 'flamingo-trade', brand: 'Stüssy', name: 'Basic Logo Tee', cat: 'Tops', size: 'M', cond: 'DS', price: 55, comp: 70, heat: 2, daysIn: 22 },

  { id: 'i20', storeId: 'south-beach-consign', brand: 'Amiri', name: 'MX1 Distressed Jean', cat: 'Denim', size: '32', cond: 'VNDS', price: 890, comp: 820, heat: 3, daysIn: 29 },
  { id: 'i21', storeId: 'south-beach-consign', brand: 'Chrome Hearts', name: 'Trucker Cap', cat: 'Accessories', size: 'OS', cond: 'Used', price: 520, comp: 480, heat: 4, daysIn: 16 },
  { id: 'i22', storeId: 'south-beach-consign', brand: 'Palm Angels', name: 'Track Pant', cat: 'Denim', size: 'L', cond: 'DS', price: 320, comp: 260, heat: 2, daysIn: 52 },
  { id: 'i23', storeId: 'south-beach-consign', brand: 'Gallery Dept', name: 'La Flare Hoodie', cat: 'Tops', size: 'M', cond: 'VNDS', price: 410, comp: 430, heat: 3, daysIn: 19 },

  { id: 'i24', storeId: 'archive-305', brand: 'Raf Simons', name: 'Consumed Bomber AW03', cat: 'Outerwear', size: '48', cond: 'Used', price: 3400, comp: 4100, heat: 5, daysIn: 3 },
  { id: 'i25', storeId: 'archive-305', brand: 'Undercover', name: 'Scab Era Cardigan', cat: 'Outerwear', size: '3', cond: 'Used', price: 1250, comp: 1400, heat: 4, daysIn: 10 },
  { id: 'i26', storeId: 'archive-305', brand: 'Kapital', name: 'Boro Patchwork Vest', cat: 'Outerwear', size: '2', cond: 'VNDS', price: 640, comp: 690, heat: 3, daysIn: 15 },
  { id: 'i27', storeId: 'archive-305', brand: 'Number (N)ine', name: 'Wallet Chain Denim', cat: 'Denim', size: '30', cond: 'Used', price: 780, comp: 900, heat: 4, daysIn: 6 },

  { id: 'i28', storeId: 'northside-heat', brand: 'Hellstar', name: 'Studio Records Hoodie', cat: 'Tops', size: 'L', cond: 'DS', price: 185, comp: 250, heat: 4, daysIn: 4 },
  { id: 'i29', storeId: 'northside-heat', brand: 'Broken Planet', name: 'Moonrock Sweatsuit', cat: 'Tops', size: 'M', cond: 'VNDS', price: 240, comp: 300, heat: 4, daysIn: 8 },
  { id: 'i30', storeId: 'northside-heat', brand: 'Sp5der', name: 'OG Web Sweatpant', cat: 'Denim', size: 'L', cond: 'VNDS', price: 165, comp: 220, heat: 3, daysIn: 13 },
  { id: 'i31', storeId: 'northside-heat', brand: 'Nike', name: 'Dunk Low Panda', cat: 'Footwear', size: '11', cond: 'DS', price: 105, comp: 115, heat: 1, daysIn: 63 },

  { id: 'i32', storeId: 'coral-curated', brand: 'Aimé Leon Dore', name: 'Uni Crewneck', cat: 'Tops', size: 'S', cond: 'DS', price: 175, comp: 210, heat: 3, daysIn: 9 },
  { id: 'i33', storeId: 'coral-curated', brand: 'Comme des Garçons', name: 'PLAY Heart Cardigan', cat: 'Outerwear', size: 'M', cond: 'VNDS', price: 340, comp: 380, heat: 3, daysIn: 17 },
  { id: 'i34', storeId: 'coral-curated', brand: 'Kapital', name: 'Smiley Bandana Scarf', cat: 'Accessories', size: 'OS', cond: 'DS', price: 210, comp: 240, heat: 2, daysIn: 24 }
];

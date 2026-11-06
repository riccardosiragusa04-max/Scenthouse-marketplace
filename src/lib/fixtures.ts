/**
 * Stubbed marketplace data.
 *
 * Every screen reads from this module only, so a later milestone can swap
 * these exports for Netlify Database queries without touching the UI.
 * Business rules follow the project document (chapters 4.4, 5 and 7): see PLAN.md.
 */

export type Concentration = 'Eau de Parfum' | 'Extrait de Parfum' | 'Eau de Toilette' | 'Parfum'
export type Family = 'Ambrato' | 'Legnoso' | 'Floreale' | 'Agrumato' | 'Cuoio' | 'Aromatico' | 'Gourmand' | 'Chypre'
export type Condition = 'Nuovo sigillato' | 'Come nuovo' | 'Ottimo' | 'Buono' | 'Segni d’uso'
export type Storage = 'Al buio, in scatola' | 'Armadio o cassetto' | 'Mensola, lontano dalla luce' | 'Esposto a luce o calore'

export interface CatalogueEntry {
  id: string
  brand: string
  name: string
  concentration: Concentration
  sizeMl: number
  year?: string
  family: Family
  notes: string[]
  retailPrice: number
  image: string
  /** EAN on the box: scanning it links the bottle to this entry. */
  ean: string
}

export interface Member {
  id: string
  handle: string
  city: string
  memberSince: string
  /** Sales closed without a dispute: they drive the seller level. */
  salesCompleted: number
  rating: number
  reviewCount: number
  verificationsPassed: number
  identityVerified: boolean
  lastSeen: string
}

export interface Listing {
  id: string
  catalogueId: string
  sellerId: string
  price: number
  fillPercent: number
  condition: Condition
  storage: Storage
  shipsFrom: string
  batchCode: string
  hasBox: boolean
  hasReceipt: boolean
  /** A Scent House specialist has checked this bottle and filed a verification report. */
  verified: boolean
  featured?: boolean
  listedAt: string
  description: string
}

export interface Review {
  id: string
  memberId: string
  author: string
  role: 'acquirente' | 'venditore'
  rating: number
  date: string
  text: string
}

/**
 * Editable from the admin dashboard in a later milestone — never hard-code these in UI.
 * Values from chapter 7 of the project document.
 */
export const platformSettings = {
  /** Seller commission on the sale price (ch. 7: 8%, between generalist platforms and luxury resale). */
  sellerCommissionPercent: 8,
  /** Buyer protection: fixed part + percentage of the price (ch. 7: 0,70 € + 5%). */
  buyerProtectionFixed: 0.7,
  buyerProtectionPercent: 5,
  /** Physical verification is a flat price, not a percentage (ch. 7: 20 €). */
  verificationFee: 20,
  /** Risk factor "value": above this price a bottle counts as high value (ch. 3: «oltre i 150 euro»). */
  highValueThreshold: 150,
  /** Hours after delivery to confirm or open a dispute; then the payment is released automatically (ch. 5: 48 ore). */
  disputeWindowHours: 48,
  /** Insured shipping with the authorised carrier, one leg. */
  shippingFlat: 9.9,
  /** Only decants are excluded: partly used bottles are accepted. Guards against empty bottles. */
  minFillPercent: 10,
  minPhotos: 4,
}

// ——— Seller levels (ch. 4.4 and 5.1) ———

export type SellerLevel = 'Nuovo' | 'Affidabile' | 'Esperto'

/** Limits for each level. They loosen with every sale closed without disputes. */
export const sellerLevels: { level: SellerLevel; fromSales: number; maxListingPrice: number | null; maxActiveListings: number | null }[] = [
  { level: 'Nuovo', fromSales: 0, maxListingPrice: 150, maxActiveListings: 3 },
  { level: 'Affidabile', fromSales: 5, maxListingPrice: 400, maxActiveListings: 10 },
  { level: 'Esperto', fromSales: 25, maxListingPrice: null, maxActiveListings: null },
]

export function sellerLevel(m: Pick<Member, 'salesCompleted'>) {
  const current = [...sellerLevels].reverse().find((l) => m.salesCompleted >= l.fromSales)!
  const next = sellerLevels[sellerLevels.indexOf(current) + 1]
  return { ...current, next, salesToNext: next ? next.fromSales - m.salesCompleted : 0 }
}

// ——— Catalogue ———

export const families: Family[] = ['Ambrato', 'Legnoso', 'Floreale', 'Agrumato', 'Cuoio', 'Aromatico', 'Gourmand', 'Chypre']
export const storageOptions: Storage[] = ['Al buio, in scatola', 'Armadio o cassetto', 'Mensola, lontano dalla luce', 'Esposto a luce o calore']

/** Brands the editorial team considers most counterfeited (viral on social media). Risk factor "brand". */
export const highRiskBrands = ['Maison Francis Kurkdjian', 'Xerjoff', 'Le Labo', 'Tiziana Terenzi']

export const catalogue: CatalogueEntry[] = [
  { id: 'xerjoff-naxos-100', brand: 'Xerjoff', name: 'Naxos', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Gourmand', notes: ['Miele', 'Tabacco', 'Lavanda', 'Vaniglia'], retailPrice: 265, image: 'bottle-3.png', ean: '8033488155612' },
  { id: 'mfk-br540-extrait-70', brand: 'Maison Francis Kurkdjian', name: 'Baccarat Rouge 540', concentration: 'Extrait de Parfum', sizeMl: 70, family: 'Ambrato', notes: ['Zafferano', 'Mandorla amara', 'Ambra', 'Cedro'], retailPrice: 385, image: 'bottle-8.png', ean: '3700559603123' },
  { id: 'malle-portrait-100', brand: 'Frédéric Malle', name: 'Portrait of a Lady', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Chypre', notes: ['Rosa turca', 'Patchouli', 'Incenso', 'Ribes nero'], retailPrice: 395, image: 'bottle-2.png', ean: '3700135000315' },
  { id: 'lelabo-santal33-100', brand: 'Le Labo', name: 'Santal 33', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Legnoso', notes: ['Sandalo', 'Cardamomo', 'Iris', 'Cuoio'], retailPrice: 290, image: 'bottle-5.png', ean: '0842185109372' },
  { id: 'amouage-interlude-man-100', brand: 'Amouage', name: 'Interlude Man', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Ambrato', notes: ['Incenso', 'Oud', 'Origano', 'Ambra'], retailPrice: 320, image: 'bottle-7.png', ean: '0701666410096' },
  { id: 'profumum-acqua-sale-100', brand: 'Profumum Roma', name: 'Acqua e Sale', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Aromatico', notes: ['Alga', 'Mirto', 'Salvia', 'Accordo marino'], retailPrice: 230, image: 'bottle-4.png', ean: '8032865620012' },
  { id: 'nishane-hacivat-100', brand: 'Nishane', name: 'Hacivat', concentration: 'Extrait de Parfum', sizeMl: 50, family: 'Chypre', notes: ['Ananas', 'Bergamotto', 'Muschio di quercia', 'Patchouli'], retailPrice: 210, image: 'bottle-1.png', ean: '8681008055081' },
  { id: 'orto-parisi-terroni-50', brand: 'Orto Parisi', name: 'Terroni', concentration: 'Parfum', sizeMl: 50, family: 'Legnoso', notes: ['Terra', 'Ambra grigia', 'Cuoio', 'Cedro'], retailPrice: 210, image: 'bottle-6.png', ean: '8058774090014' },
  { id: 'tiziana-terenzi-kirke-100', brand: 'Tiziana Terenzi', name: 'Kirkè', concentration: 'Extrait de Parfum', sizeMl: 100, year: '2015', family: 'Floreale', notes: ['Frutto della passione', 'Pesca', 'Mughetto', 'Muschio'], retailPrice: 245, image: 'bottle-8.png', ean: '8016741832512' },
  { id: 'lutens-chergui-50', brand: 'Serge Lutens', name: 'Chergui', concentration: 'Eau de Parfum', sizeMl: 50, year: 'Bell jar, 2008', family: 'Ambrato', notes: ['Tabacco', 'Miele', 'Fieno', 'Incenso'], retailPrice: 260, image: 'bottle-3.png', ean: '3700358123358' },
  { id: 'byredo-gypsy-water-100', brand: 'Byredo', name: 'Gypsy Water', concentration: 'Eau de Parfum', sizeMl: 100, family: 'Legnoso', notes: ['Bergamotto', 'Pino', 'Incenso', 'Vaniglia'], retailPrice: 270, image: 'bottle-5.png', ean: '7340032806052' },
  { id: 'mancera-roses-vanille-120', brand: 'Mancera', name: 'Roses Vanille', concentration: 'Eau de Parfum', sizeMl: 120, family: 'Gourmand', notes: ['Rosa', 'Vaniglia', 'Zucchero', 'Limone'], retailPrice: 165, image: 'bottle-2.png', ean: '3760265190027' },
]

export const members: Member[] = [
  { id: 'm1', handle: 'giulia.iris', city: 'Milano', memberSince: '2021', salesCompleted: 34, rating: 4.9, reviewCount: 31, verificationsPassed: 12, identityVerified: true, lastSeen: 'oggi' },
  { id: 'm2', handle: 'nasodiroma', city: 'Roma', memberSince: '2019', salesCompleted: 78, rating: 4.95, reviewCount: 70, verificationsPassed: 29, identityVerified: true, lastSeen: 'oggi' },
  { id: 'm3', handle: 'vetiver_e_sale', city: 'Genova', memberSince: '2022', salesCompleted: 11, rating: 4.8, reviewCount: 10, verificationsPassed: 4, identityVerified: true, lastSeen: 'ieri' },
  { id: 'm4', handle: 'ambraoud.to', city: 'Torino', memberSince: '2020', salesCompleted: 52, rating: 4.85, reviewCount: 47, verificationsPassed: 18, identityVerified: true, lastSeen: '2 giorni fa' },
  { id: 'm5', handle: 'fiordinotte', city: 'Firenze', memberSince: '2023', salesCompleted: 6, rating: 5, reviewCount: 6, verificationsPassed: 2, identityVerified: true, lastSeen: 'oggi' },
  { id: 'm6', handle: 'iris.nera', city: 'Bologna', memberSince: '2026', salesCompleted: 1, rating: 5, reviewCount: 1, verificationsPassed: 1, identityVerified: true, lastSeen: 'oggi' },
]

/** The signed-in member in the prototype. A new seller, so limits and automatic checks are visible. */
export const currentMemberId = 'm6'

export const listings: Listing[] = [
  { id: 'a1001', catalogueId: 'mfk-br540-extrait-70', sellerId: 'm2', price: 289, fillPercent: 90, condition: 'Ottimo', storage: 'Al buio, in scatola', shipsFrom: 'Roma', batchCode: '2E01', hasBox: true, hasReceipt: true, verified: true, featured: true, listedAt: '2026-11-05', description: 'Acquistato in boutique a Parigi nel 2025. Usato poche volte in occasioni serali. Tappo e atomizzatore perfetti.' },
  { id: 'a1002', catalogueId: 'malle-portrait-100', sellerId: 'm1', price: 265, fillPercent: 75, condition: 'Ottimo', storage: 'Al buio, in scatola', shipsFrom: 'Milano', batchCode: 'L83A', hasBox: true, hasReceipt: false, verified: true, featured: true, listedAt: '2026-11-04', description: 'Un classico che ho amato molto, ma ne ho un secondo flacone. Lieve segno sul lato del tappo, visibile in foto.' },
  { id: 'a1003', catalogueId: 'xerjoff-naxos-100', sellerId: 'm4', price: 175, fillPercent: 85, condition: 'Come nuovo', storage: 'Al buio, in scatola', shipsFrom: 'Torino', batchCode: 'NX2301', hasBox: true, hasReceipt: true, verified: false, featured: true, listedAt: '2026-11-06', description: 'Batch 2023. Cedo perché in inverno preferisco profumi più secchi.' },
  { id: 'a1004', catalogueId: 'lelabo-santal33-100', sellerId: 'm3', price: 160, fillPercent: 70, condition: 'Buono', storage: 'Mensola, lontano dalla luce', shipsFrom: 'Genova', batchCode: '31JUL24', hasBox: false, hasReceipt: false, verified: false, listedAt: '2026-11-06', description: 'Etichetta stampata con data di produzione luglio 2024. Qualche graffio sul vetro alla base.' },
  { id: 'a1005', catalogueId: 'amouage-interlude-man-100', sellerId: 'm2', price: 210, fillPercent: 80, condition: 'Ottimo', storage: 'Armadio o cassetto', shipsFrom: 'Roma', batchCode: 'A19K', hasBox: true, hasReceipt: false, verified: true, listedAt: '2026-11-03', description: 'Versione con tappo in resina nera. Proiezione potente, una spruzzata basta.' },
  { id: 'a1006', catalogueId: 'profumum-acqua-sale-100', sellerId: 'm5', price: 120, fillPercent: 65, condition: 'Buono', storage: 'Mensola, lontano dalla luce', shipsFrom: 'Firenze', batchCode: 'PR0422', hasBox: false, hasReceipt: true, verified: false, listedAt: '2026-11-05', description: 'Perfetto per l’estate. Allego scontrino della profumeria di Firenze.' },
  { id: 'a1007', catalogueId: 'orto-parisi-terroni-50', sellerId: 'm4', price: 140, fillPercent: 100, condition: 'Nuovo sigillato', storage: 'Al buio, in scatola', shipsFrom: 'Torino', batchCode: 'OP-T-118', hasBox: true, hasReceipt: true, verified: false, listedAt: '2026-11-06', description: 'Ancora nel cellophane: regalo doppio.' },
  { id: 'a1008', catalogueId: 'lutens-chergui-50', sellerId: 'm1', price: 330, fillPercent: 60, condition: 'Segni d’uso', storage: 'Armadio o cassetto', shipsFrom: 'Milano', batchCode: 'B08C', hasBox: true, hasReceipt: false, verified: true, featured: true, listedAt: '2026-11-02', description: 'Bell jar della prima formulazione, 2008. Pezzo da collezione, fuori produzione.' },
  { id: 'a1009', catalogueId: 'tiziana-terenzi-kirke-100', sellerId: 'm6', price: 145, fillPercent: 80, condition: 'Ottimo', storage: 'Armadio o cassetto', shipsFrom: 'Bologna', batchCode: 'TT15K', hasBox: false, hasReceipt: false, verified: false, listedAt: '2026-11-04', description: 'Fruttato e luminoso, firma inconfondibile. Senza scatola.' },
  { id: 'a1010', catalogueId: 'nishane-hacivat-100', sellerId: 'm3', price: 125, fillPercent: 85, condition: 'Ottimo', storage: 'Al buio, in scatola', shipsFrom: 'Genova', batchCode: 'NH2210', hasBox: true, hasReceipt: false, verified: true, listedAt: '2026-11-01', description: 'Extrait 50 ml. Cedo per fare spazio nella collezione.' },
  { id: 'a1011', catalogueId: 'mfk-br540-extrait-70', sellerId: 'm5', price: 240, fillPercent: 70, condition: 'Buono', storage: 'Armadio o cassetto', shipsFrom: 'Firenze', batchCode: '1F12', hasBox: false, hasReceipt: false, verified: false, listedAt: '2026-10-30', description: 'Senza scatola. Codice lotto leggibile alla base.' },
  { id: 'a1012', catalogueId: 'byredo-gypsy-water-100', sellerId: 'm2', price: 135, fillPercent: 55, condition: 'Buono', storage: 'Mensola, lontano dalla luce', shipsFrom: 'Roma', batchCode: '9C21', hasBox: true, hasReceipt: false, verified: false, listedAt: '2026-10-29', description: 'Poco più di metà flacone, prezzo adeguato al livello.' },
]

export const reviews: Review[] = [
  { id: 'r1', memberId: 'm2', author: 'giulia.iris', role: 'acquirente', rating: 5, date: '2026-10-21', text: 'Flacone esattamente come descritto, livello perfino superiore alle foto. Imballo impeccabile.' },
  { id: 'r2', memberId: 'm2', author: 'fiordinotte', role: 'acquirente', rating: 5, date: '2026-09-30', text: 'Venditore gentile e preciso. Verifica Scent House superata, spedizione rapida.' },
  { id: 'r3', memberId: 'm1', author: 'ambraoud.to', role: 'acquirente', rating: 5, date: '2026-10-11', text: 'Tutto perfetto, scatola in ottime condizioni.' },
  { id: 'r4', memberId: 'm4', author: 'nasodiroma', role: 'acquirente', rating: 4, date: '2026-10-02', text: 'Ottimo profumo, spedizione un giorno più lenta del previsto.' },
  { id: 'r5', memberId: 'm3', author: 'giulia.iris', role: 'venditore', rating: 5, date: '2026-08-14', text: 'Acquirente puntuale, ha confermato la ricezione subito.' },
  { id: 'r6', memberId: 'm5', author: 'vetiver_e_sale', role: 'acquirente', rating: 5, date: '2026-10-18', text: 'Comunicazione chiara, flacone ben protetto.' },
  { id: 'r7', memberId: 'm6', author: 'ambraoud.to', role: 'acquirente', rating: 5, date: '2026-10-12', text: 'Prima vendita e già impeccabile: foto chiare e flacone identico.' },
]

// ——— Helpers ———

export const getCatalogueEntry = (id: string) => catalogue.find((c) => c.id === id)
export const getCatalogueByEan = (ean: string) => catalogue.find((c) => c.ean === ean.replace(/\D/g, ''))
export const getMember = (id: string) => members.find((m) => m.id === id)
export const getListing = (id: string) => listings.find((l) => l.id === id)
export const currentMember = () => getMember(currentMemberId)!

export interface ListingView extends Listing {
  perfume: CatalogueEntry
  seller: Member
}

export function viewListing(l: Listing): ListingView {
  return { ...l, perfume: getCatalogueEntry(l.catalogueId)!, seller: getMember(l.sellerId)! }
}

export const allListings = (): ListingView[] => listings.map(viewListing)

export const brands = Array.from(new Set(catalogue.map((c) => c.brand))).sort()
export const allNotes = Array.from(new Set(catalogue.flatMap((c) => c.notes))).sort()
export const sizes = Array.from(new Set(catalogue.map((c) => c.sizeMl))).sort((a, b) => a - b)

export const mlLeft = (sizeMl: number, fillPercent: number) => Math.round((sizeMl * fillPercent) / 100)

// ——— Risk-based verification (ch. 4.4) ———

export type RiskFactor = 'valore' | 'marchio' | 'venditore'

/**
 * Verification is automatic when the risk is high. Risk combines three factors:
 * the value of the bottle, the brand (some are counterfeited more) and the seller level
 * (new sellers are checked more often). Two factors out of three trigger the check.
 * Below that, the buyer can still request it and pays for it.
 */
export function verificationAssessment(input: { price: number; brand: string; sellerSales: number }) {
  const factors: { key: RiskFactor; label: string }[] = []
  if (input.price > platformSettings.highValueThreshold) factors.push({ key: 'valore', label: `valore oltre ${formatEUR(platformSettings.highValueThreshold)}` })
  if (highRiskBrands.includes(input.brand)) factors.push({ key: 'marchio', label: 'marchio tra i più contraffatti' })
  if (sellerLevel({ salesCompleted: input.sellerSales }).level === 'Nuovo') factors.push({ key: 'venditore', label: 'venditore nuovo' })
  return { automatic: factors.length >= 2, factors }
}

export const assessListing = (l: ListingView) =>
  verificationAssessment({ price: l.price, brand: l.perfume.brand, sellerSales: l.seller.salesCompleted })

// ——— Fees (ch. 7) ———

const round2 = (n: number) => Math.round(n * 100) / 100

export const buyerProtectionFee = (price: number) =>
  round2(platformSettings.buyerProtectionFixed + (price * platformSettings.buyerProtectionPercent) / 100)

export const sellerCommission = (price: number) => round2((price * platformSettings.sellerCommissionPercent) / 100)

/** Every line the buyer sees before paying, kept separate on purpose (ch. 5.2). */
export function checkoutBreakdown(price: number, withVerification: boolean) {
  const s = platformSettings
  const protection = buyerProtectionFee(price)
  const verification = withVerification ? s.verificationFee : 0
  return { price, shipping: s.shippingFlat, protection, verification, total: round2(price + s.shippingFlat + protection + verification) }
}

// ——— Price reference (ch. 4.4 and 5.1) ———

/**
 * A range, not a single figure. Starts from the editorial research (new price minus 20–40%,
 * as interviewed sellers do) scaled to the liquid left, and blends in closed sales as they accumulate.
 */
export function priceReference(catalogueId: string, fillPercent: number) {
  const entry = getCatalogueEntry(catalogueId)
  if (!entry) return null
  const fill = Math.max(0, Math.min(100, fillPercent)) / 100
  const editorialLow = entry.retailPrice * 0.6 * fill
  const editorialHigh = entry.retailPrice * 0.8 * fill
  const similar = listings.filter((l) => l.catalogueId === catalogueId)
  const marketPerFull = similar.length ? similar.reduce((sum, l) => sum + l.price / (l.fillPercent / 100), 0) / similar.length : null
  // Weight of platform data grows with the number of exchanges, capped at 70%.
  const weight = Math.min(similar.length * 0.15, 0.7)
  const blend = (editorial: number, spread: number) =>
    marketPerFull ? editorial * (1 - weight) + marketPerFull * fill * spread * weight : editorial
  const low = Math.round(blend(editorialLow, 0.9))
  const high = Math.round(blend(editorialHigh, 1.1))
  return { retail: entry.retailPrice, low, high, mid: Math.round((low + high) / 2), sampleSize: similar.length, platformWeight: Math.round(weight * 100) }
}

export const formatEUR = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n)

export const imageUrl = (file: string, w: number, h?: number) =>
  `/.netlify/images?url=/img/${file}&w=${w}${h ? `&h=${h}&fit=cover` : ''}&fm=webp&q=78`

// ——— Orders ———

export type OrderStepState = 'done' | 'current' | 'upcoming'
export interface OrderStep {
  label: string
  detail: string
  date?: string
  state: OrderStepState
  tracking?: string
}

export const sampleOrder = {
  id: 'SH-24817',
  listingId: 'a1008',
  buyer: 'iris.nera',
  placedAt: '2026-11-03',
  /** 'automatica' when the risk rule triggered it, 'richiesta' when the buyer asked for it. */
  verification: 'richiesta' as 'automatica' | 'richiesta',
  steps: [
    { label: 'Pagamento trattenuto', detail: 'Il fornitore dei pagamenti custodisce la somma fino alla chiusura dell’ordine.', date: '3 nov', state: 'done' },
    { label: 'Spedito al punto di verifica', detail: 'Venditore → specialisti Scent House, Milano. Etichetta generata dal servizio, assicurazione inclusa.', date: '4 nov', state: 'done', tracking: 'Poste 0583 2211 9087' },
    { label: 'Verifica dello specialista', detail: 'Autenticità, livello del liquido e condizioni rispetto all’annuncio.', date: '6 nov', state: 'current' },
    { label: 'Spedito a te', detail: 'Lo specialista fotografa il flacone imballato e lo inoltra con il sigillo Scent House.', state: 'upcoming' },
    { label: 'Consegna e 48 ore per decidere', detail: 'Confermi la ricezione o apri una contestazione. Senza azioni, il pagamento si sblocca da solo.', state: 'upcoming' },
  ] as OrderStep[],
}

export interface OrderSummary {
  id: string
  listingId: string
  side: 'acquisto' | 'vendita'
  counterpart: string
  date: string
  status: string
  tone: 'progress' | 'done' | 'action'
}

export const orderSummaries: OrderSummary[] = [
  { id: 'SH-24817', listingId: 'a1008', side: 'acquisto', counterpart: 'giulia.iris', date: '3 nov 2026', status: 'In verifica dagli specialisti', tone: 'progress' },
  { id: 'SH-24602', listingId: 'a1010', side: 'acquisto', counterpart: 'vetiver_e_sale', date: '21 ott 2026', status: 'Completato · lascia una valutazione', tone: 'action' },
  { id: 'SH-24790', listingId: 'a1009', side: 'vendita', counterpart: 'nasodiroma', date: '2 nov 2026', status: 'Da spedire · etichetta pronta', tone: 'action' },
  { id: 'SH-24411', listingId: 'a1006', side: 'vendita', counterpart: 'ambraoud.to', date: '9 ott 2026', status: 'Pagamento rilasciato', tone: 'done' },
]

// ——— Personal area (ch. 5.1 and 5.3) ———

export type MyListingStatus = 'in_revisione' | 'da_correggere' | 'pubblicato' | 'venduto'

export interface MyListing {
  id: string
  catalogueId: string
  price: number
  fillPercent: number
  status: MyListingStatus
  submittedAt: string
  /** Precise feedback from the editorial team when the listing is returned. */
  editorialNote?: string
  listingId?: string
}

export const myListings: MyListing[] = [
  { id: 'd-301', catalogueId: 'byredo-gypsy-water-100', price: 120, fillPercent: 60, status: 'da_correggere', submittedAt: '5 nov 2026', editorialNote: 'La foto del codice di lotto è sfocata: rifalla da vicino, con luce laterale.' },
  { id: 'd-302', catalogueId: 'profumum-acqua-sale-100', price: 110, fillPercent: 70, status: 'in_revisione', submittedAt: '6 nov 2026' },
  { id: 'd-298', catalogueId: 'tiziana-terenzi-kirke-100', price: 145, fillPercent: 80, status: 'pubblicato', submittedAt: '3 nov 2026', listingId: 'a1009' },
]

export interface WishlistItem {
  catalogueId: string
  maxPrice?: number
  minFill?: number
  alert: boolean
}

export const wishlist: WishlistItem[] = [
  { catalogueId: 'lutens-chergui-50', maxPrice: 300, alert: true },
  { catalogueId: 'malle-portrait-100', minFill: 70, alert: true },
  { catalogueId: 'mancera-roses-vanille-120', alert: false },
]

export interface WardrobeItem {
  catalogueId: string
  addedVia: 'codice a barre' | 'manuale'
  fillPercent: number
}

export const wardrobe: WardrobeItem[] = [
  { catalogueId: 'byredo-gypsy-water-100', addedVia: 'codice a barre', fillPercent: 60 },
  { catalogueId: 'profumum-acqua-sale-100', addedVia: 'codice a barre', fillPercent: 70 },
  { catalogueId: 'nishane-hacivat-100', addedVia: 'manuale', fillPercent: 95 },
]

// ——— Community requests (ch. 4.4 and 5.3) ———

export interface CommunityRequest {
  id: string
  author: string
  /** Catalogue entry when it exists; free text for rare or discontinued bottles. */
  catalogueId?: string
  title: string
  detail: string
  maxPrice?: number
  createdAt: string
  responses: number
}

export const communityRequests: CommunityRequest[] = [
  { id: 'q1', author: 'vetiver_e_sale', title: 'Serge Lutens Chergui, bell jar', catalogueId: 'lutens-chergui-50', detail: 'Cerco la prima formulazione, anche al 50%. Va bene senza scatola.', maxPrice: 300, createdAt: '5 nov 2026', responses: 2 },
  { id: 'q2', author: 'giulia.iris', title: 'L’Artisan Parfumeur Dzing! (fuori produzione)', detail: 'Il flacone pre-2015, quello con l’etichetta crema. Qualsiasi livello sopra il 40%.', createdAt: '4 nov 2026', responses: 0 },
  { id: 'q3', author: 'fiordinotte', title: 'Frédéric Malle Portrait of a Lady', catalogueId: 'malle-portrait-100', detail: 'Almeno 70%, preferibilmente con scatola.', maxPrice: 280, createdAt: '2 nov 2026', responses: 1 },
  { id: 'q4', author: 'ambraoud.to', title: 'Amouage Jubilation XXV, vecchio batch', detail: 'Batch precedenti al 2019. Pago la verifica io.', maxPrice: 260, createdAt: '30 ott 2026', responses: 3 },
]

// ——— Editorial content linked to the bottles changing hands (ch. 4.3 and 5) ———

export interface Article {
  id: string
  section: 'Cultura olfattiva' | 'Brand e persone' | 'Cultura dello scambio' | 'Community'
  title: string
  excerpt: string
  catalogueId?: string
  image: string
}

export const articles: Article[] = [
  { id: 'e1', section: 'Cultura dello scambio', title: 'Come leggere un codice di lotto', excerpt: 'Dove si trova, che cosa dice sull’anno di produzione e perché è la prima foto che chiediamo.', image: 'verification.png' },
  { id: 'e2', section: 'Cultura olfattiva', title: 'Baccarat Rouge 540, perché è il più copiato', excerpt: 'Il successo sui social, i falsi in circolazione e i dettagli del flacone che li tradiscono.', catalogueId: 'mfk-br540-extrait-70', image: 'bottle-8.png' },
  { id: 'e3', section: 'Cultura dello scambio', title: 'Il prezzo giusto di un flacone usato', excerpt: 'Livello, scatola, conservazione: come si costruisce l’intervallo che ti proponiamo quando vendi.', image: 'bottle-5.png' },
]

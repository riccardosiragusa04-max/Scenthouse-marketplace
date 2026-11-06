import { createFileRoute, Link } from '@tanstack/react-router'
import { Camera, Check, ChevronLeft, ChevronRight, Clock, ImagePlus, Info, PackageCheck, Receipt, Search, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BarcodeLookup } from '@/components/barcode-lookup'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  catalogue,
  currentMember,
  formatEUR,
  getCatalogueEntry,
  imageUrl,
  listings,
  mlLeft,
  platformSettings,
  priceReference,
  sellerCommission,
  sellerLevel,
  storageOptions,
  verificationAssessment,
  wardrobe,
  type Condition,
  type Storage,
} from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/vendi')({
  validateSearch: (s: Record<string, unknown>): { catalogo?: string } => ({
    catalogo: typeof s.catalogo === 'string' && getCatalogueEntry(s.catalogo) ? s.catalogo : undefined,
  }),
  head: () => ({ meta: [{ title: 'Vendi un flacone · Scent House Marketplace' }] }),
  component: SellFlow,
})

const steps = ['Profumo', 'Foto', 'Condizione', 'Prezzo', 'Riepilogo'] as const
const conditions: Condition[] = ['Nuovo sigillato', 'Come nuovo', 'Ottimo', 'Buono', 'Segni d’uso']

/** The four mandatory photos of the standard sheet (ch. 4.4), each with a framing silhouette. */
const requiredPhotos = [
  { key: 'batch', label: 'Codice di lotto', hint: 'Primo piano leggibile, sul fondo o sull’etichetta', guide: 'batch' },
  { key: 'level', label: 'Livello del liquido', hint: 'Di lato, all’altezza del liquido, controluce', guide: 'level' },
  { key: 'box', label: 'Confezione', hint: 'La scatola; se manca, il flacone intero di fronte', guide: 'box' },
  { key: 'sprayer', label: 'Erogatore', hint: 'Tappo tolto, erogatore e collo del flacone', guide: 'sprayer' },
] as const

type PhotoKey = (typeof requiredPhotos)[number]['key'] | 'receipt'

function SellFlow() {
  const { catalogo } = Route.useSearch()
  const me = currentMember()
  const level = sellerLevel(me)
  const activeListings = listings.filter((l) => l.sellerId === me.id).length
  const atListingLimit = level.maxActiveListings !== null && activeListings >= level.maxActiveListings

  const [step, setStep] = useState(0)
  const [catalogueId, setCatalogueId] = useState<string | undefined>(catalogo)
  const [original, setOriginal] = useState(false)
  const [photos, setPhotos] = useState<Partial<Record<PhotoKey, string>>>({})
  const [batchCode, setBatchCode] = useState('')
  const [fill, setFill] = useState<number | null>(() => wardrobe.find((w) => w.catalogueId === catalogo)?.fillPercent ?? null)
  const [fillConfirmed, setFillConfirmed] = useState(false)
  const [condition, setCondition] = useState<Condition | ''>('')
  const [hasBox, setHasBox] = useState<'si' | 'no' | ''>('')
  const [storage, setStorage] = useState<Storage | ''>('')
  const [price, setPrice] = useState<number | ''>('')
  const [showErrors, setShowErrors] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const perfume = catalogueId ? getCatalogueEntry(catalogueId) : undefined
  const s = platformSettings
  const fillNum = condition === 'Nuovo sigillato' ? 100 : fill ?? 0
  const requiredCount = requiredPhotos.filter((p) => photos[p.key]).length
  const priceNum = typeof price === 'number' ? price : 0
  const overLevelLimit = level.maxListingPrice !== null && priceNum > level.maxListingPrice

  const errors: string[][] = [
    [
      !perfume && 'Collega il flacone a una scheda del catalogo: dal guardaroba, con il codice a barre o cercandolo.',
      !original && 'Conferma che vendi il flacone originale del produttore: i decant non sono ammessi.',
    ].filter(Boolean) as string[],
    [
      requiredCount < s.minPhotos && `Servono tutte le ${s.minPhotos} foto della scheda: lotto, livello, confezione ed erogatore.`,
      batchCode.trim().length < 2 && 'Trascrivi il codice di lotto.',
    ].filter(Boolean) as string[],
    [
      !condition && 'Scegli la condizione del flacone.',
      condition && condition !== 'Nuovo sigillato' && !fillConfirmed && 'Conferma o correggi la stima dei millilitri rimasti.',
      condition && condition !== 'Nuovo sigillato' && fillConfirmed && fillNum < s.minFillPercent && `Il flacone è quasi vuoto: serve almeno il ${s.minFillPercent}% di liquido.`,
      !hasBox && 'Indica se la confezione è presente.',
      !storage && 'Indica come è stato conservato.',
    ].filter(Boolean) as string[],
    [
      priceNum <= 0 ? 'Inserisci un prezzo.' : false,
      overLevelLimit && `Come venditore ${level.level.toLowerCase()} puoi pubblicare annunci fino a ${formatEUR(level.maxListingPrice!)}.`,
    ].filter(Boolean) as string[],
    [],
  ]

  const next = () => {
    if (errors[step].length) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep((x) => Math.min(x + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted && perfume) return <Submitted name={`${perfume.brand} ${perfume.name}`} />

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
      <header className="mb-8">
        <p className="eyebrow mb-3 text-muted-foreground">Area personale · Vendi</p>
        <h1 className="text-5xl sm:text-6xl">Metti in vendita un flacone</h1>
      </header>

      <SellerStatus atListingLimit={atListingLimit} activeListings={activeListings} />

      {atListingLimit ? null : (
        <>
          {/* Stepper */}
          <ol className="mt-12 mb-12 grid grid-cols-5 gap-2" aria-label="Avanzamento">
            {steps.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  className="w-full text-left disabled:cursor-default"
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className={cn('block h-px w-full', i <= step ? 'bg-foreground' : 'bg-border')} />
                  <span className={cn('mt-3 flex items-center gap-1.5 text-xs', i === step ? 'text-foreground' : 'text-muted-foreground')}>
                    {i < step ? <Check className="size-3.5 text-bronze" /> : <span className="font-display text-sm">{i + 1}</span>}
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <h2 className="mb-6 text-3xl sm:hidden">{steps[step]}</h2>

          {step === 0 && (
            <div className="space-y-10">
              {perfume ? (
                <SelectedPerfume id={perfume.id} onChange={() => setCatalogueId(undefined)} />
              ) : (
                <StepPerfume
                  onSelect={(id) => {
                    setCatalogueId(id)
                    const w = wardrobe.find((x) => x.catalogueId === id)
                    if (w) setFill(w.fillPercent)
                    setShowErrors(false)
                  }}
                />
              )}
              <label className="flex items-start gap-3 border border-border p-5 text-sm">
                <Checkbox checked={original} onCheckedChange={(c) => setOriginal(c === true)} className="mt-0.5" />
                <span>
                  <span className="font-medium">Vendo il flacone originale del produttore, usato o sigillato.</span>
                  <span className="mt-1 block text-muted-foreground">
                    I decant non sono ammessi: una volta travasato, il liquido non si può più ricondurre a un flacone verificabile.
                  </span>
                </span>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10">
              <div className="flex gap-3 bg-secondary/70 p-5 text-sm">
                <Camera className="mt-0.5 size-4 shrink-0 text-bronze" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Quattro foto, sempre le stesse.</span> Così chi compra confronta annunci di
                  persone diverse con lo stesso metro. Segui la sagoma, luce naturale, niente immagini di repertorio.
                </p>
              </div>
              <div>
                <p className="mb-4 text-sm font-medium">Obbligatorie <span className="text-muted-foreground">({requiredCount}/{s.minPhotos})</span></p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {requiredPhotos.map((p) => (
                    <PhotoSlot key={p.key} label={p.label} hint={p.hint} guide={p.guide} value={photos[p.key]} invalid={showErrors && !photos[p.key]} onChange={(url) => setPhotos((x) => ({ ...x, [p.key]: url }))} />
                  ))}
                </div>
              </div>
              <div className="grid gap-8 sm:grid-cols-[1fr_14rem]">
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="batch">Codice di lotto</Label>
                  <Input id="batch" value={batchCode} onChange={(e) => setBatchCode(e.target.value.toUpperCase())} placeholder="Es. 2E01" className="h-11 rounded-none font-mono" />
                  <p className="text-xs text-muted-foreground">Trascrivilo come appare nella foto: la redazione li confronta.</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Ricevuta <span className="font-normal text-muted-foreground">(facoltativa)</span></p>
                  <PhotoSlot label="Scontrino o fattura" hint="Oscura i tuoi dati personali" icon={Receipt} value={photos.receipt} onChange={(url) => setPhotos((x) => ({ ...x, receipt: url }))} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && perfume && (
            <div className="space-y-10">
              <fieldset>
                <legend className="mb-3 text-sm font-medium">Condizione</legend>
                <RadioGroup value={condition} onValueChange={(v) => setCondition(v as Condition)} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {conditions.map((c) => (
                    <Label key={c} className={cn('flex cursor-pointer items-center gap-2 border p-4 font-normal', condition === c ? 'border-foreground' : 'border-border')}>
                      <RadioGroupItem value={c} /> {c}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              {condition && condition !== 'Nuovo sigillato' && (
                <FillEstimate
                  sizeMl={perfume.sizeMl}
                  fill={fill}
                  confirmed={fillConfirmed}
                  hasLevelPhoto={!!photos.level}
                  onChange={(v) => { setFill(v); setFillConfirmed(true) }}
                  onConfirm={(v) => { setFill(v); setFillConfirmed(true) }}
                />
              )}

              <ClosedQuestion legend="La confezione originale è presente?" value={hasBox} onChange={(v) => setHasBox(v as 'si' | 'no')} options={[['si', 'Sì'], ['no', 'No']]} />
              <ClosedQuestion legend="Come è stato conservato?" value={storage} onChange={(v) => setStorage(v as Storage)} options={storageOptions.map((o) => [o, o] as const)} />
            </div>
          )}

          {step === 3 && perfume && (
            <StepPrice catalogueId={perfume.id} brand={perfume.brand} fill={fillNum} price={price} setPrice={setPrice} />
          )}

          {step === 4 && perfume && (
            <div className="grid gap-10 sm:grid-cols-[14rem_1fr]">
              <img src={photos.box ?? imageUrl(perfume.image, 480, 600)} alt="Foto della confezione" className="aspect-[4/5] w-full object-cover" />
              <div>
                <p className="eyebrow text-muted-foreground">{perfume.brand}</p>
                <h2 className="mt-1 text-4xl">{perfume.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{perfume.concentration} · {perfume.sizeMl} ml</p>
                <dl className="mt-6 grid grid-cols-[9rem_1fr] gap-y-2.5 text-sm">
                  <dt className="text-muted-foreground">Condizione</dt><dd>{condition}</dd>
                  <dt className="text-muted-foreground">Liquido rimasto</dt><dd>≈ {mlLeft(perfume.sizeMl, fillNum)} ml ({fillNum}%)</dd>
                  <dt className="text-muted-foreground">Confezione</dt><dd>{hasBox === 'si' ? 'Presente' : 'Assente'}</dd>
                  <dt className="text-muted-foreground">Conservazione</dt><dd>{storage}</dd>
                  <dt className="text-muted-foreground">Codice di lotto</dt><dd className="font-mono">{batchCode}</dd>
                  <dt className="text-muted-foreground">Foto</dt><dd>{requiredCount} obbligatorie{photos.receipt ? ' · ricevuta' : ''}</dd>
                  <dt className="text-muted-foreground">Prezzo</dt><dd>{formatEUR(priceNum)}</dd>
                  <dt className="text-muted-foreground">Riceverai</dt><dd>{formatEUR(priceNum - sellerCommission(priceNum))}</dd>
                </dl>
                <p className="mt-8 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  L’annuncio non va subito online: la redazione lo controlla e lo pubblica, oppure te lo restituisce con indicazioni
                  precise. Inviando confermi che le foto ritraggono il flacone reale.
                </p>
              </div>
            </div>
          )}

          {showErrors && errors[step].length > 0 && (
            <ul role="alert" className="mt-8 space-y-1 border-l-2 border-destructive pl-4 text-sm text-destructive">
              {errors[step].map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" className="rounded-none" disabled={step === 0} onClick={() => { setShowErrors(false); setStep((x) => x - 1) }}>
              <ChevronLeft /> Indietro
            </Button>
            {step < steps.length - 1 ? (
              <Button size="lg" className="rounded-none" onClick={next}>
                Continua <ChevronRight />
              </Button>
            ) : (
              <Button size="lg" className="rounded-none" onClick={() => { setSubmitted(true); window.scrollTo({ top: 0 }) }}>
                Invia alla redazione
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** Seller gate (ch. 4.4 and 5.1): checks done, current level and its limits, shown as a starting phase. */
function SellerStatus({ atListingLimit, activeListings }: { atListingLimit: boolean; activeListings: number }) {
  const me = currentMember()
  const level = sellerLevel(me)
  const checks = [
    ['Profilo completo', true],
    ['Identità verificata dal fornitore dei pagamenti', me.identityVerified],
    ['Richiesta approvata dalla redazione', true],
    ['Vendi come privato, non come operatore professionale', true],
  ] as const
  return (
    <section aria-label="Il tuo stato di venditore" className="grid gap-6 border border-border p-6 md:grid-cols-[1fr_1fr]">
      <ul className="space-y-2 text-sm">
        {checks.map(([label, ok]) => (
          <li key={label} className="flex items-center gap-2">
            <Check className={cn('size-4', ok ? 'text-bronze' : 'text-muted-foreground')} /> {label}
          </li>
        ))}
      </ul>
      <div className="text-sm md:border-l md:border-border md:pl-6">
        <p className="eyebrow text-bronze">Venditore {level.level.toLowerCase()}</p>
        <p className="mt-2 text-muted-foreground">
          {level.maxListingPrice ? `Annunci fino a ${formatEUR(level.maxListingPrice)}` : 'Nessun limite di valore'} ·{' '}
          {level.maxActiveListings ? `${activeListings} di ${level.maxActiveListings} annunci attivi` : `${activeListings} annunci attivi`}
        </p>
        {level.next && (
          <p className="mt-2 text-xs text-muted-foreground">
            È la fase iniziale per tutti: dopo altre {level.salesToNext} vendite senza contestazioni diventi venditore {level.next.level.toLowerCase()} e i limiti si allargano.
          </p>
        )}
        {atListingLimit && (
          <p role="alert" className="mt-3 text-destructive">Hai raggiunto il numero massimo di annunci attivi per il tuo livello.</p>
        )}
      </div>
    </section>
  )
}

function StepPerfume({ onSelect }: { onSelect: (id: string) => void }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const t = q.toLowerCase().trim()
    return catalogue.filter((c) => !t || `${c.brand} ${c.name}`.toLowerCase().includes(t))
  }, [q])

  return (
    <div>
      <p className="mb-6 max-w-xl text-muted-foreground">
        Il flacone viene collegato alla sua scheda: marchio, nome, concentrazione e formato si compilano da soli. Si vendono solo i
        marchi ammessi dalla redazione.
      </p>
      <Tabs defaultValue="guardaroba">
        <TabsList className="mb-6 rounded-none">
          <TabsTrigger value="guardaroba" className="rounded-none">Dal guardaroba</TabsTrigger>
          <TabsTrigger value="codice" className="rounded-none">Codice a barre</TabsTrigger>
          <TabsTrigger value="catalogo" className="rounded-none">Cerca a mano</TabsTrigger>
        </TabsList>
        <TabsContent value="guardaroba">
          <ul className="divide-y divide-border border-y border-border">
            {wardrobe.map((w) => {
              const c = getCatalogueEntry(w.catalogueId)!
              return (
                <li key={c.id}>
                  <CatalogueRow id={c.id} onSelect={onSelect} sub={`Nel tuo guardaroba · ≈ ${mlLeft(c.sizeMl, w.fillPercent)} ml`} />
                </li>
              )
            })}
          </ul>
        </TabsContent>
        <TabsContent value="codice">
          <BarcodeLookup onFound={(e) => { onSelect(e.id); toast('Flacone riconosciuto', { description: `${e.brand} ${e.name}, ${e.sizeMl} ml` }) }} />
        </TabsContent>
        <TabsContent value="catalogo">
          <div className="relative mb-6">
            <Search className="absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per marchio o nome" aria-label="Cerca nel catalogo" className="h-12 rounded-none border-0 border-b border-border pl-7 text-base shadow-none focus-visible:ring-0" />
          </div>
          <ul className="divide-y divide-border border-y border-border" aria-label="Catalogo">
            {results.map((c) => (
              <li key={c.id}><CatalogueRow id={c.id} onSelect={onSelect} /></li>
            ))}
            {results.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Nessun profumo trovato tra i marchi ammessi.</li>}
          </ul>
          <RequestPerfumeDialog />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CatalogueRow({ id, onSelect, sub }: { id: string; onSelect: (id: string) => void; sub?: string }) {
  const c = getCatalogueEntry(id)!
  return (
    <button type="button" onClick={() => onSelect(c.id)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-secondary/60 motion-reduce:transition-none">
      <img src={imageUrl(c.image, 112, 112)} alt="" className="size-14 object-cover" loading="lazy" />
      <span className="flex-1">
        <span className="eyebrow block text-muted-foreground">{c.brand}</span>
        <span className="font-display text-xl">{c.name}</span>
        <span className="block text-xs text-muted-foreground">{sub ?? `${c.concentration} · ${c.sizeMl} ml${c.year ? ` · ${c.year}` : ''}`}</span>
      </span>
      <ChevronRight className="mr-3 size-4 text-muted-foreground" />
    </button>
  )
}

function RequestPerfumeDialog() {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Non trovi il tuo profumo? Chiedi alla redazione di aggiungerlo</button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">Proponi un profumo</DialogTitle>
          <DialogDescription>La redazione decide i marchi ammessi e aggiorna l’elenco anche in base alle richieste della community.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="rq-brand">Marchio</Label><Input id="rq-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-none" /></div>
          <div className="space-y-2"><Label htmlFor="rq-name">Nome, concentrazione e formato</Label><Input id="rq-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Ombre Nomade, EDP, 100 ml" className="rounded-none" /></div>
        </div>
        <DialogFooter>
          <Button
            className="rounded-none"
            disabled={!brand.trim() || !name.trim()}
            onClick={() => {
              setOpen(false)
              setBrand('')
              setName('')
              toast('Proposta inviata', { description: 'Ti avviseremo quando la redazione avrà deciso.' })
            }}
          >
            Invia proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SelectedPerfume({ id, onChange }: { id: string; onChange: () => void }) {
  const p = getCatalogueEntry(id)!
  return (
    <div className="flex items-center gap-4 border-b border-border pb-6">
      <img src={imageUrl(p.image, 128, 128)} alt="" className="size-16 object-cover" />
      <div className="flex-1">
        <p className="eyebrow text-muted-foreground">{p.brand}</p>
        <p className="font-display text-2xl">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.concentration} · {p.sizeMl} ml · scheda collegata</p>
      </div>
      <Button variant="link" onClick={onChange}>Cambia</Button>
    </div>
  )
}

/** Framing silhouettes: a simple outline of where the subject should sit. */
function Guide({ kind }: { kind: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }
  return (
    <svg viewBox="0 0 60 60" className="size-14 text-muted-foreground/70" aria-hidden>
      {kind === 'batch' && (<><rect x="10" y="20" width="40" height="20" rx="2" {...common} /><path d="M16 30h28" {...common} /></>)}
      {kind === 'level' && (<><rect x="18" y="14" width="24" height="38" rx="2" {...common} /><path d="M14 34h32" stroke="currentColor" strokeWidth={1.4} /></>)}
      {kind === 'box' && (<><rect x="14" y="10" width="32" height="42" rx="1" {...common} /><path d="M14 18h32" {...common} /></>)}
      {kind === 'sprayer' && (<><rect x="24" y="8" width="12" height="10" rx="1" {...common} /><rect x="27" y="18" width="6" height="8" {...common} /><rect x="16" y="26" width="28" height="26" rx="2" {...common} /></>)}
    </svg>
  )
}

function PhotoSlot({ label, hint, guide, icon: Icon = ImagePlus, value, invalid, onChange }: { label: string; hint: string; guide?: string; icon?: typeof ImagePlus; value?: string; invalid?: boolean; onChange: (url?: string) => void }) {
  return (
    <div>
      <div className={cn('relative aspect-square overflow-hidden border border-dashed bg-secondary/40', invalid ? 'border-destructive' : 'border-border', value && 'border-solid')}>
        {value ? (
          <>
            <img src={value} alt={label} className="size-full object-cover" />
            <button type="button" onClick={() => onChange(undefined)} aria-label={`Rimuovi foto ${label}`} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/90">
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <label className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-3 text-center text-muted-foreground hover:bg-secondary">
            {guide ? <Guide kind={guide} /> : <Icon className="size-5" strokeWidth={1.5} />}
            <span className="text-xs">Scatta o carica</span>
            <input type="file" accept="image/*" capture="environment" className="sr-only" aria-label={`Foto: ${label}`} onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(URL.createObjectURL(f)) }} />
          </label>
        )}
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

/**
 * Estimate of the millilitres left, proposed from the level photo (ch. 5.1).
 * Stub: the image model arrives with the backend; until then the estimate is a fixed placeholder
 * (or the level saved in the wardrobe). The seller always confirms or corrects it.
 */
function FillEstimate({ sizeMl, fill, confirmed, hasLevelPhoto, onChange, onConfirm }: { sizeMl: number; fill: number | null; confirmed: boolean; hasLevelPhoto: boolean; onChange: (v: number) => void; onConfirm: (v: number) => void }) {
  const estimate = fill ?? 75
  const value = fill ?? estimate
  return (
    <div className="space-y-4 border border-border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Millilitri rimasti</p>
        {!confirmed && hasLevelPhoto && <p className="text-xs text-bronze">Stima dalla foto del livello</p>}
      </div>
      <p className="font-display text-4xl">≈ {mlLeft(sizeMl, value)} ml <span className="text-lg text-muted-foreground">di {sizeMl} ({value}%)</span></p>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-[var(--bronze)]"
        aria-label="Correggi il livello del liquido"
      />
      <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        È una stima: dipende dalla forma e dalla trasparenza del flacone e sarà confrontata con il flacone reale in caso di verifica.
        Sposta il cursore per correggerla.
      </p>
      {!confirmed && (
        <Button variant="outline" size="sm" className="rounded-none" onClick={() => onConfirm(value)}>
          Confermo la stima
        </Button>
      )}
      {confirmed && <p className="flex items-center gap-1.5 text-xs text-bronze"><Check className="size-3.5" /> Livello confermato</p>}
    </div>
  )
}

function ClosedQuestion({ legend, value, onChange, options }: { legend: string; value: string; onChange: (v: string) => void; options: ReadonlyArray<readonly [string, string]> }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">{legend}</legend>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-3">
        {options.map(([v, label]) => (
          <Label key={v} className={cn('flex cursor-pointer items-center gap-2 border px-4 py-3 font-normal', value === v ? 'border-foreground' : 'border-border')}>
            <RadioGroupItem value={v} /> {label}
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

function StepPrice({ catalogueId, brand, fill, price, setPrice }: { catalogueId: string; brand: string; fill: number; price: number | ''; setPrice: (p: number | '') => void }) {
  const ref = priceReference(catalogueId, fill)!
  const me = currentMember()
  const level = sellerLevel(me)
  const s = platformSettings
  const priceNum = typeof price === 'number' ? price : 0
  const commission = sellerCommission(priceNum)
  const risk = verificationAssessment({ price: priceNum, brand, sellerSales: me.salesCompleted })
  const position = priceNum <= 0 ? null : priceNum < ref.low ? 'sotto' : priceNum > ref.high ? 'sopra' : 'dentro'

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_20rem]">
      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="price">Prezzo di vendita</Label>
          <div className="relative">
            <span className="font-display absolute top-1/2 left-4 -translate-y-1/2 text-2xl text-muted-foreground">€</span>
            <Input id="price" type="number" inputMode="decimal" min={1} value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : +e.target.value)} className="h-16 rounded-none pl-11 text-3xl" />
          </div>
          <p className="text-xs text-muted-foreground">
            Il prezzo lo decidi tu.{' '}
            {position && <span className="text-foreground">È {position === 'dentro' ? 'dentro' : position === 'sotto' ? 'sotto' : 'sopra'} l’intervallo di riferimento.</span>}
            {level.maxListingPrice && ` Come venditore ${level.level.toLowerCase()} il massimo per annuncio è ${formatEUR(level.maxListingPrice)}.`}
          </p>
        </div>

        {priceNum > 0 && risk.automatic && (
          <div className="flex gap-3 border border-bronze/40 p-5 text-sm">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bronze" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">L’articolo sarà controllato prima di arrivare all’acquirente</span> ({risk.factors.map((f) => f.label).join(', ')}).
              Dopo la vendita lo spedisci al punto di verifica con l’etichetta che generiamo noi. Tu non anticipi nulla: la verifica la paga
              l’acquirente.
            </p>
          </div>
        )}

        <div className="flex gap-3 bg-secondary/70 p-5 text-sm">
          <PackageCheck className="mt-0.5 size-4 shrink-0 text-bronze" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Non devi scegliere il corriere.</span> I profumi sono merce pericolosa: la spedizione è
            affidata a un operatore autorizzato, con assicurazione compresa e pagata dall’acquirente.
          </p>
        </div>

        {priceNum > 0 && (
          <dl className="space-y-2 border-t border-border pt-6 text-sm">
            <div className="flex justify-between text-muted-foreground"><dt>Prezzo</dt><dd className="text-foreground">{formatEUR(priceNum)}</dd></div>
            <div className="flex justify-between text-muted-foreground"><dt>Commissione Scent House ({s.sellerCommissionPercent}%)</dt><dd className="text-foreground">− {formatEUR(commission)}</dd></div>
            <div className="flex justify-between pt-2 font-medium"><dt>Riceverai</dt><dd className="text-lg">{formatEUR(priceNum - commission)}</dd></div>
            <p className="pt-1 text-xs text-muted-foreground">Rilasciato quando l’acquirente conferma la ricezione, o {s.disputeWindowHours} ore dopo la consegna senza contestazioni.</p>
          </dl>
        )}
      </div>

      <aside className="h-fit bg-secondary/70 p-6" aria-label="Riferimento di prezzo">
        <p className="eyebrow mb-5 text-bronze">Riferimento · liquido {fill}%</p>
        <p className="text-xs text-muted-foreground">Intervallo consigliato</p>
        <p className="font-display text-4xl">{formatEUR(ref.low)}–{formatEUR(ref.high)}</p>
        <Button variant="outline" size="sm" className="mt-4 w-full rounded-none" onClick={() => setPrice(ref.mid)}>
          Usa il centro ({formatEUR(ref.mid)})
        </Button>
        <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Come lo calcoliamo</p>
          <p>Partiamo dal prezzo del nuovo ({formatEUR(ref.retail)}) e togliamo dal 20% al 40%, come fa chi vende abitualmente. Poi lo riduciamo in proporzione al liquido rimasto.</p>
          <p>
            {ref.sampleSize
              ? `Su questo profumo ci sono ${ref.sampleSize} scambi sulla piattaforma: pesano per il ${ref.platformWeight}% del riferimento. Più vendite si accumulano, più il riferimento diventa fedele.`
              : 'Non ci sono ancora scambi su questo profumo: il riferimento si basa solo sulla ricerca della redazione.'}
          </p>
        </div>
      </aside>
    </div>
  )
}

/** Status screen after submitting: the listing waits for the editorial review (ch. 5.1). */
function Submitted({ name }: { name: string }) {
  const states = [
    { label: 'Inviato', detail: 'Foto e scheda ricevute.', state: 'done' },
    { label: 'In revisione', detail: 'La redazione confronta foto, lotto e dati dichiarati. Di solito entro 24 ore.', state: 'current' },
    { label: 'Pubblicato', detail: 'Oppure ti viene restituito con indicazioni precise, per esempio una foto del lotto da rifare.', state: 'upcoming' },
  ] as const
  return (
    <div className="mx-auto max-w-reading px-4 py-20 sm:px-6">
      <div className="grid size-14 place-items-center rounded-full bg-accent"><Clock className="size-6 text-bronze" /></div>
      <p className="eyebrow mt-8 text-bronze">In revisione</p>
      <h1 className="mt-3 text-5xl">«{name}» è nelle mani della redazione.</h1>
      <ol className="mt-10 space-y-6 border-l border-border pl-6">
        {states.map((s) => (
          <li key={s.label}>
            <p className={cn('font-display text-2xl', s.state === 'upcoming' && 'text-muted-foreground', s.state === 'current' && 'text-bronze')}>{s.label}</p>
            <p className="text-sm text-muted-foreground">{s.detail}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="rounded-none"><Link to="/area-personale" search={{ sezione: 'annunci' }}>Segui lo stato nell’area personale</Link></Button>
        <Button variant="outline" className="rounded-none" onClick={() => window.location.reload()}>Vendi un altro flacone</Button>
      </div>
    </div>
  )
}

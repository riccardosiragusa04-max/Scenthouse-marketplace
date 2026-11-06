import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ChevronLeft, Clock, Heart, Lock, MapPin, MessageCircle, PackageCheck, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FillMeter, ListingCard, LogoMark, TrustBadge } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  allListings,
  assessListing,
  checkoutBreakdown,
  formatEUR,
  getListing,
  imageUrl,
  mlLeft,
  platformSettings,
  priceReference,
  reviews,
  sellerLevel,
  viewListing,
  type ListingView,
} from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/annunci/$listingId')({
  loader: ({ params }) => {
    const l = getListing(params.listingId)
    if (!l) throw notFound()
    return viewListing(l)
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.perfume.brand} ${loaderData.perfume.name} · Scent House Marketplace` },
          { name: 'description', content: `${loaderData.perfume.concentration} ${loaderData.perfume.sizeMl} ml, livello ${loaderData.fillPercent}%, ${formatEUR(loaderData.price)}.` },
        ]
      : [],
  }),
  component: ListingPage,
})

// The four mandatory photos of the standard listing sheet (ch. 4.4). Stub: crops of one image.
const shots = [
  { label: 'Codice di lotto', pos: '50% 85%' },
  { label: 'Livello del liquido', pos: '70% 55%' },
  { label: 'Confezione', pos: 'center' },
  { label: 'Erogatore', pos: '50% 15%' },
]

function ListingPage() {
  const listing = Route.useLoaderData()
  const { perfume, seller } = listing
  const [shot, setShot] = useState(0)
  const [saved, setSaved] = useState(false)
  const risk = assessListing(listing)
  const level = sellerLevel(seller)
  const ref = priceReference(perfume.id, listing.fillPercent)
  const s = platformSettings
  const sellerReviews = reviews.filter((r) => r.memberId === seller.id)
  const similar = allListings().filter((l) => l.id !== listing.id && (l.perfume.family === perfume.family || l.perfume.brand === perfume.brand)).slice(0, 4)

  return (
    <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 md:pt-10">
      <Link to="/cerca" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Tutti gli annunci
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={imageUrl(perfume.image, 1200, 1200)}
              srcSet={`${imageUrl(perfume.image, 700, 700)} 700w, ${imageUrl(perfume.image, 1200, 1200)} 1200w`}
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt={`${perfume.brand} ${perfume.name} — ${shots[shot].label}`}
              className={cn('size-full object-cover transition-transform duration-500 motion-reduce:transition-none', shot !== 2 && 'scale-[1.6]')}
              style={{ objectPosition: shots[shot].pos, transformOrigin: shots[shot].pos }}
            />
            <span className="eyebrow absolute bottom-4 left-4 bg-background/90 px-2.5 py-1 text-foreground">{shots[shot].label}</span>
            {shot === 0 && <span className="absolute right-4 bottom-4 bg-background/90 px-2.5 py-1 font-mono text-xs">{listing.batchCode}</span>}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Foto obbligatorie del flacone">
            {shots.map((sh, i) => (
              <button
                key={sh.label}
                role="tab"
                aria-selected={shot === i}
                onClick={() => setShot(i)}
                className={cn('group text-left', shot === i ? 'opacity-100' : 'opacity-60 hover:opacity-100')}
              >
                <div className={cn('aspect-square overflow-hidden bg-secondary ring-offset-2 ring-offset-background', shot === i && 'ring-1 ring-foreground')}>
                  <img src={imageUrl(perfume.image, 240, 240)} alt="" className={cn('size-full object-cover', i !== 2 && 'scale-[1.6]')} style={{ objectPosition: sh.pos, transformOrigin: sh.pos }} loading="lazy" />
                </div>
                <span className="mt-1.5 block text-[0.7rem] text-muted-foreground">{sh.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Le quattro foto della scheda standard, scattate dal venditore al flacone reale e controllate dalla redazione prima
            della pubblicazione.
          </p>
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <p className="eyebrow text-muted-foreground">{perfume.brand}</p>
          <h1 className="mt-2 text-5xl leading-[1.05] sm:text-6xl">{perfume.name}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {perfume.concentration} · {perfume.sizeMl} ml{perfume.year ? ` · ${perfume.year}` : ''} · {perfume.family}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {listing.verified ? <TrustBadge kind="verified" /> : risk.automatic && <TrustBadge kind="scheduled" />}
            {listing.hasBox && <TrustBadge kind="box" />}
            {listing.hasReceipt && <TrustBadge kind="receipt" />}
          </div>

          <div className="mt-8 flex items-end justify-between border-y border-border py-6">
            <div>
              <p className="text-4xl font-medium tracking-tight">{formatEUR(listing.price)}</p>
              {ref && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Riferimento Scent House per questo livello: {formatEUR(ref.low)}–{formatEUR(ref.high)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="eyebrow mb-2 text-muted-foreground">Liquido rimasto</p>
              <FillMeter percent={listing.fillPercent} sizeMl={perfume.sizeMl} className="text-sm text-foreground" />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">{listing.fillPercent}% di {perfume.sizeMl} ml</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <CheckoutDialog listing={listing} />
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-none"
              aria-pressed={saved}
              aria-label={saved ? 'Rimuovi dalla lista dei desideri' : 'Aggiungi alla lista dei desideri'}
              onClick={() => {
                setSaved(!saved)
                toast(saved ? 'Rimosso dalla lista dei desideri' : 'Aggiunto alla lista dei desideri', { description: saved ? undefined : 'Ti scriveremo via mail quando arriva un altro flacone come questo.' })
              }}
            >
              <Heart className={cn(saved && 'fill-current text-bronze')} />
            </Button>
          </div>

          <div className="mt-6 space-y-3 bg-secondary/70 p-5 text-sm">
            <Assurance icon={ShieldCheck} title={listing.verified ? 'Già verificato' : risk.automatic ? 'Verifica prevista' : 'Verifica su richiesta'}>
              {listing.verified
                ? 'Gli specialisti hanno controllato questo flacone: la scheda di verifica resta legata all’annuncio.'
                : risk.automatic
                  ? `Gli specialisti controllano il flacone prima che arrivi a te (${risk.factors.map((f) => f.label).join(', ')}).`
                  : `Puoi richiedere tu la verifica degli specialisti al momento dell’acquisto, per ${formatEUR(s.verificationFee)}.`}
            </Assurance>
            <Assurance icon={Lock} title="Pagamento trattenuto">
              Il venditore viene pagato quando confermi la ricezione, o {s.disputeWindowHours} ore dopo la consegna senza contestazioni.
            </Assurance>
            <Assurance icon={PackageCheck} title="Spedizione assicurata">
              Operatore autorizzato al trasporto di profumi, assicurazione compresa. Parte da {listing.shipsFrom}.
            </Assurance>
          </div>

          {/* Standard condition sheet */}
          <h2 className="eyebrow mt-8 mb-3 text-muted-foreground">Scheda del flacone</h2>
          <dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Condizione</dt><dd>{listing.condition}</dd>
            <dt className="text-muted-foreground">Liquido rimasto</dt><dd>≈ {mlLeft(perfume.sizeMl, listing.fillPercent)} ml ({listing.fillPercent}%)</dd>
            <dt className="text-muted-foreground">Confezione</dt><dd>{listing.hasBox ? 'Presente' : 'Assente'}</dd>
            <dt className="text-muted-foreground">Conservazione</dt><dd>{listing.storage}</dd>
            <dt className="text-muted-foreground">Codice di lotto</dt><dd className="font-mono text-xs leading-5">{listing.batchCode}</dd>
            <dt className="text-muted-foreground">Ricevuta</dt><dd>{listing.hasReceipt ? 'Presente' : 'Non disponibile'}</dd>
            <dt className="text-muted-foreground">Spedisce da</dt><dd className="flex items-center gap-1"><MapPin className="size-3.5" />{listing.shipsFrom}</dd>
            <dt className="text-muted-foreground">Note olfattive</dt><dd>{perfume.notes.join(', ')}</dd>
          </dl>

          <p className="mt-8 font-display text-xl leading-relaxed italic">“{listing.description}”</p>

          {/* Seller */}
          <div className="mt-10 border-t border-border pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="font-display grid size-12 place-items-center rounded-full bg-accent text-xl uppercase">{seller.handle[0]}</div>
                <div>
                  <p className="font-medium">{seller.handle}</p>
                  <p className="text-xs text-muted-foreground">
                    {seller.city} · Membro dal {seller.memberSince}{seller.identityVerified && ' · Identità verificata'}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> Ultimo accesso: {seller.lastSeen}</p>
                </div>
              </div>
              <MessageDialog sellerHandle={seller.handle} perfumeName={perfume.name} />
            </div>
            <div className="mt-6 grid grid-cols-4 border-y border-border text-center">
              <Stat value={level.level} label="Livello" />
              <Stat value={seller.salesCompleted} label="Vendite concluse" />
              <Stat value={<span className="inline-flex items-center gap-1">{seller.rating.toFixed(2).replace('.', ',')}<Star className="size-3.5 fill-current text-bronze" /></span>} label={`${seller.reviewCount} valutazioni`} />
              <Stat value={seller.verificationsPassed} label="Verifiche superate" />
            </div>
            {sellerReviews.length > 0 && (
              <ul className="mt-6 space-y-5">
                {sellerReviews.slice(0, 2).map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-bronze">{'★'.repeat(r.rating)}</span>
                      <span>{r.author}, {r.role}</span>
                    </div>
                    <p className="mt-1 leading-relaxed">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 text-4xl">Potrebbe piacerti anche</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {similar.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function Assurance({ icon: Icon, title, children }: { icon: typeof Lock; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-bronze" strokeWidth={1.75} aria-hidden />
      <p><span className="font-medium">{title}.</span> <span className="text-muted-foreground">{children}</span></p>
    </div>
  )
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="border-r border-border py-4 last:border-r-0">
      <p className="font-display text-xl sm:text-2xl">{value}</p>
      <p className="text-[0.7rem] text-muted-foreground">{label}</p>
    </div>
  )
}

/** Registration is asked only here, at the moment of buying (ch. 4.4 and 5.2). */
function CheckoutDialog({ listing }: { listing: ListingView }) {
  const { automatic } = assessListing(listing)
  const alreadyVerified = listing.verified
  const [requested, setRequested] = useState(false)
  const [step, setStep] = useState<'account' | 'summary'>('account')
  const withVerification = !alreadyVerified && (automatic || requested)
  const b = checkoutBreakdown(listing.price, withVerification)
  const s = platformSettings

  return (
    <Dialog onOpenChange={(o) => o && setStep('account')}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 flex-1 rounded-none text-[0.95rem]">Acquista</Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        {step === 'account' ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium">Entra per acquistare</DialogTitle>
              <DialogDescription>
                Sfogliare è libero; per comprare serve un profilo nella community, così ordine, pagamento e contestazioni restano a tuo nome.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button className="w-full rounded-none" size="lg" onClick={() => setStep('summary')}>Continua come iris.nera</Button>
              <Button variant="outline" className="w-full rounded-none" size="lg" onClick={() => setStep('summary')}>Registrati con la tua email</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-medium">Riepilogo</DialogTitle>
              <DialogDescription>
                {listing.perfume.brand} {listing.perfume.name} · {listing.perfume.sizeMl} ml · {listing.fillPercent}%
              </DialogDescription>
            </DialogHeader>

            {!alreadyVerified && !automatic && (
              <label className="flex items-start justify-between gap-4 border border-border p-4">
                <span className="text-sm">
                  <span className="flex items-center gap-1.5 font-medium"><LogoMark className="size-4 text-bronze" />Richiedi la verifica degli specialisti</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Il flacone passa dal punto di verifica prima di arrivare a te. Se non è autentico, ti rimborsiamo tutto, verifica compresa.
                  </span>
                </span>
                <Switch checked={requested} onCheckedChange={setRequested} aria-label="Richiedi la verifica" />
              </label>
            )}
            {automatic && !alreadyVerified && (
              <p className="flex gap-2 border border-bronze/40 p-4 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bronze" />
                Per questo annuncio la verifica è prevista: il rischio è alto per {assessListing(listing).factors.map((f) => f.label).join(' e ')}.
              </p>
            )}

            <dl className="space-y-2 text-sm">
              <Row label="Prezzo del flacone" value={formatEUR(b.price)} />
              <Row label="Spedizione assicurata" value={formatEUR(b.shipping)} />
              <Row label={`Protezione acquisti (${formatEUR(s.buyerProtectionFixed)} + ${s.buyerProtectionPercent}%)`} value={formatEUR(b.protection)} />
              <Row
                label="Verifica degli specialisti"
                value={alreadyVerified ? 'Già fatta' : withVerification ? formatEUR(b.verification) : '—'}
              />
              <Separator className="my-3" />
              <Row label={<span className="font-medium text-foreground">Totale</span>} value={<span className="text-lg font-medium">{formatEUR(b.total)}</span>} />
            </dl>

            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              Paghi tramite il fornitore dei pagamenti del marketplace, che trattiene la somma. Il venditore la riceve quando confermi la
              ricezione, o {s.disputeWindowHours} ore dopo la consegna senza contestazioni.
            </p>

            <DialogFooter>
              <Button asChild size="lg" className="w-full rounded-none">
                <Link to="/ordini/$orderId" params={{ orderId: 'SH-24817' }} onClick={() => toast('Anteprima del pagamento', { description: 'Il pagamento reale sarà attivo nella prossima versione. Ecco come apparirà il tuo ordine.' })}>
                  Paga {formatEUR(b.total)}
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground">
      <dt>{label}</dt>
      <dd className="shrink-0 text-foreground">{value}</dd>
    </div>
  )
}

function MessageDialog({ sellerHandle, perfumeName }: { sellerHandle: string; perfumeName: string }) {
  const [text, setText] = useState('')
  const hasContact = /(\+?\d[\d\s]{7,}|@[a-z0-9-]+\.[a-z]{2,}|whatsapp|telegram|iban)/i.test(text)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-none"><MessageCircle /> Scrivi</Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">Messaggio a {sellerHandle}</DialogTitle>
          <DialogDescription>A proposito di «{perfumeName}». La conversazione resta legata a questo annuncio.</DialogDescription>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Ciao! Potresti mandarmi una foto del tappo da vicino?" aria-label="Messaggio" />
        <p className={cn('text-xs', hasContact ? 'text-destructive' : 'text-muted-foreground')}>
          {hasContact
            ? 'Sembra che il messaggio contenga recapiti esterni: verranno nascosti. Le trattative fuori piattaforma non sono protette.'
            : 'Per la tua sicurezza, numeri di telefono, email e link esterni vengono oscurati.'}
        </p>
        <DialogFooter>
          <Button
            className="rounded-none"
            disabled={!text.trim()}
            onClick={() => {
              setText('')
              toast('Messaggio inviato', { description: `${sellerHandle} riceverà una notifica.` })
            }}
          >
            Invia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

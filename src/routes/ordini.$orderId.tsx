import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { AlertTriangle, ChevronLeft, ImagePlus, Lock, ShieldCheck, Truck, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { checkoutBreakdown, formatEUR, getListing, imageUrl, platformSettings, sampleOrder, viewListing } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/ordini/$orderId')({
  loader: ({ params }) => {
    if (params.orderId !== sampleOrder.id) throw notFound()
    return { order: sampleOrder, listing: viewListing(getListing(sampleOrder.listingId)!) }
  },
  head: ({ params }) => ({ meta: [{ title: `Ordine ${params.orderId} · Scent House Marketplace` }] }),
  component: OrderPage,
})

const disputeReasons = ['Non conforme alla descrizione', 'Livello inferiore a quanto dichiarato', 'Flacone danneggiato', 'Sospetto falso']

function OrderPage() {
  const { order, listing } = Route.useLoaderData()
  const s = platformSettings
  const b = checkoutBreakdown(listing.price, true)

  return (
    <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 md:pt-10">
      <Link to="/ordini" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> I miei ordini
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <p className="eyebrow text-muted-foreground">Ordine {order.id} · {order.placedAt.split('-').reverse().join('/')}</p>
          <h1 className="mt-2 text-5xl leading-tight sm:text-6xl">In verifica dagli specialisti</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Il flacone è al punto di verifica. Riceverai qui la scheda del controllo; se tutto corrisponde all’annuncio parte verso di te
            con il sigillo Scent House. Il pagamento resta trattenuto.
          </p>

          {/* Timeline */}
          <ol className="mt-12 space-y-0">
            {order.steps.map((step, i) => (
              <li key={step.label} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-10 last:pb-0">
                {i < order.steps.length - 1 && (
                  <span className={cn('absolute top-7 left-[0.95rem] h-[calc(100%-1.75rem)] w-px', step.state === 'done' ? 'bg-foreground' : 'bg-border')} aria-hidden />
                )}
                <span
                  className={cn(
                    'relative z-10 mt-1 grid size-8 place-items-center rounded-full border text-xs',
                    step.state === 'done' && 'border-foreground bg-foreground text-background',
                    step.state === 'current' && 'border-bronze bg-background text-bronze',
                    step.state === 'upcoming' && 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {step.state === 'current' && <span className="absolute inset-0 animate-ping rounded-full border border-bronze/50 motion-reduce:animate-none" />}
                  <span className="font-display text-sm">{i + 1}</span>
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h2 className={cn('text-2xl', step.state === 'upcoming' && 'text-muted-foreground')}>{step.label}</h2>
                    {step.date && <span className="text-xs text-muted-foreground">{step.date}</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                  {step.tracking && (
                    <p className="mt-2 inline-flex items-center gap-2 bg-secondary px-3 py-1.5 font-mono text-xs">
                      <Truck className="size-3.5" /> {step.tracking}
                    </p>
                  )}
                  {step.state === 'current' && (
                    <div className="mt-5 border border-border p-5">
                      <p className="eyebrow mb-3 text-bronze">Controlli in corso</p>
                      <ul className="grid gap-2 text-sm sm:grid-cols-2">
                        {[
                          ['Codice di lotto coerente con il marchio', true],
                          ['Confezione, vetro, tappo ed erogatore', true],
                          ['Colore e limpidezza del liquido', false],
                          [`Livello dichiarato (${listing.fillPercent}%)`, false],
                        ].map(([label, ok]) => (
                          <li key={label as string} className="flex items-center gap-2">
                            <span className={cn('size-1.5 rounded-full', ok ? 'bg-bronze' : 'bg-border')} />
                            <span className={ok ? '' : 'text-muted-foreground'}>{label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {/* What happens if the check fails (ch. 5.1) */}
          <section className="mt-14 border-t border-border pt-8">
            <h2 className="text-3xl">Se la verifica non va a buon fine</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Outcome title="Il flacone non è autentico">
                L’ordine viene annullato e ricevi il rimborso di tutto, verifica compresa. Il flacone non torna al venditore, che viene
                sospeso in attesa dell’esame della redazione.
              </Outcome>
              <Outcome title="È autentico ma diverso dall’annuncio">
                Per esempio un livello più basso del dichiarato. La scheda registra la differenza e scegli tu: lo accetti com’è, oppure
                annulli con rimborso integrale e il flacone torna al venditore a sue spese.
              </Outcome>
            </div>
          </section>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-border pt-8">
            <Button size="lg" className="rounded-none" disabled>
              Conferma ricezione
            </Button>
            <DisputeDialog />
          </div>
          <p className="mt-3 max-w-xl text-xs text-muted-foreground">
            Alla consegna hai {s.disputeWindowHours} ore per decidere. Se confermi, il pagamento va al venditore e vi lasciate una valutazione a
            vicenda. Se qualcosa non va, apri una contestazione da qui con le foto dell’apertura. Senza azioni, dopo {s.disputeWindowHours} ore il
            pagamento si sblocca da solo.
          </p>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-36">
          <Link to="/annunci/$listingId" params={{ listingId: listing.id }} className="flex gap-4">
            <img src={imageUrl(listing.perfume.image, 200, 250)} alt="" className="h-28 w-[5.5rem] object-cover" />
            <div>
              <p className="eyebrow text-muted-foreground">{listing.perfume.brand}</p>
              <p className="font-display text-2xl leading-tight">{listing.perfume.name}</p>
              <p className="text-xs text-muted-foreground">{listing.perfume.sizeMl} ml · {listing.fillPercent}% · da {listing.seller.handle}</p>
            </div>
          </Link>
          <div className="bg-secondary/70 p-5">
            <dl className="space-y-2 text-sm">
              <SumRow label="Prezzo del flacone" value={formatEUR(b.price)} />
              <SumRow label="Spedizione assicurata" value={formatEUR(b.shipping)} />
              <SumRow label="Protezione acquisti" value={formatEUR(b.protection)} />
              <SumRow label={order.verification === 'richiesta' ? 'Verifica richiesta da te' : 'Verifica prevista'} value={formatEUR(b.verification)} />
              <Separator className="my-3" />
              <div className="flex justify-between font-medium"><dt>Totale pagato</dt><dd>{formatEUR(b.total)}</dd></div>
            </dl>
          </div>
          <div className="space-y-4 text-sm">
            <p className="flex gap-3"><Lock className="mt-0.5 size-4 shrink-0 text-bronze" /><span><span className="font-medium">Somma trattenuta.</span> <span className="text-muted-foreground">La custodisce il fornitore dei pagamenti fino alla chiusura dell’ordine.</span></span></p>
            <p className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-bronze" /><span><span className="font-medium">Chi verifica risponde dell’esito.</span> <span className="text-muted-foreground">Se un flacone con il sigillo risulta falso, Scent House ti rimborsa.</span></span></p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Outcome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground"><dt>{label}</dt><dd className="text-foreground">{value}</dd></div>
  )
}

/** The dispute compares listing photos, the shipping photos and the photos taken at opening (ch. 4.4 and 5.2). */
function DisputeDialog() {
  const [photos, setPhotos] = useState<string[]>([])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="rounded-none"><AlertTriangle /> Apri una contestazione</Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">Apri una contestazione</DialogTitle>
          <DialogDescription>
            Il pagamento resta bloccato. Un esperto che sa leggere un lotto confronta le foto dell’annuncio, quelle della spedizione e le
            tue, e decide sul rimborso.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup defaultValue={disputeReasons[0]} className="space-y-1">
          {disputeReasons.map((r) => (
            <Label key={r} className="flex items-center gap-3 font-normal"><RadioGroupItem value={r} />{r}</Label>
          ))}
        </RadioGroup>
        <Textarea rows={3} placeholder="Descrivi cosa non va" aria-label="Descrizione del problema" className="rounded-none" />
        <div>
          <p className="mb-2 text-sm font-medium">Foto dell’apertura del pacco</p>
          <div className="flex flex-wrap gap-2">
            {photos.map((p, i) => (
              <div key={p} className="relative size-16">
                <img src={p} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                <button type="button" aria-label={`Rimuovi foto ${i + 1}`} onClick={() => setPhotos((x) => x.filter((y) => y !== p))} className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-background shadow">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <label className="grid size-16 cursor-pointer place-items-center border border-dashed border-border text-muted-foreground hover:bg-secondary">
              <ImagePlus className="size-4" />
              <input type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Aggiungi foto" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhotos((x) => [...x, URL.createObjectURL(f)]) }} />
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button className="rounded-none" onClick={() => toast('Disponibile alla consegna', { description: 'Potrai aprire una contestazione nelle 48 ore successive alla consegna.' })}>
            Invia contestazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

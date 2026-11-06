import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Bell, BellOff, Camera, Check, PackageCheck, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BarcodeLookup } from '@/components/barcode-lookup'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  allListings,
  currentMember,
  formatEUR,
  getCatalogueEntry,
  imageUrl,
  listings,
  mlLeft,
  myListings,
  sellerLevel,
  sellerLevels,
  wardrobe as initialWardrobe,
  wishlist as initialWishlist,
  type MyListingStatus,
  type WardrobeItem,
} from '@/lib/fixtures'
import { cn } from '@/lib/utils'

const sections = ['venditore', 'annunci', 'desideri', 'guardaroba'] as const
type Section = (typeof sections)[number]

export const Route = createFileRoute('/area-personale')({
  validateSearch: (s: Record<string, unknown>): { sezione?: Section } => ({
    sezione: sections.find((x) => x === s.sezione),
  }),
  head: () => ({ meta: [{ title: 'Area personale · Scent House' }] }),
  component: PersonalArea,
})

function PersonalArea() {
  const { sezione } = Route.useSearch()
  const navigate = useNavigate({ from: '/area-personale' })
  const me = currentMember()

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
      <p className="eyebrow mb-3 text-muted-foreground">Area personale</p>
      <h1 className="text-5xl sm:text-6xl">Ciao, {me.handle}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Membro dal {me.memberSince} · {me.city}</p>

      <Tabs value={sezione ?? 'venditore'} onValueChange={(v) => navigate({ search: { sezione: v as Section }, replace: true })} className="mt-10">
        <TabsList className="mb-8 flex h-auto flex-wrap rounded-none">
          <TabsTrigger value="venditore" className="rounded-none">Il mio livello</TabsTrigger>
          <TabsTrigger value="annunci" className="rounded-none">I miei annunci</TabsTrigger>
          <TabsTrigger value="desideri" className="rounded-none">Lista dei desideri</TabsTrigger>
          <TabsTrigger value="guardaroba" className="rounded-none">Guardaroba</TabsTrigger>
        </TabsList>
        <TabsContent value="venditore"><SellerPanel /></TabsContent>
        <TabsContent value="annunci"><MyListingsPanel /></TabsContent>
        <TabsContent value="desideri"><WishlistPanel /></TabsContent>
        <TabsContent value="guardaroba"><WardrobePanel /></TabsContent>
      </Tabs>
    </div>
  )
}

function SellerPanel() {
  const me = currentMember()
  const level = sellerLevel(me)
  const active = listings.filter((l) => l.sellerId === me.id).length
  return (
    <div className="space-y-10">
      <section>
        <p className="eyebrow text-bronze">Venditore {level.level.toLowerCase()}</p>
        <p className="mt-2 max-w-xl text-muted-foreground">
          L’affidabilità si costruisce nel tempo ed è visibile a tutti. Ogni vendita conclusa senza contestazioni ti avvicina al livello
          successivo; una verifica con esito negativo lo abbassa.
        </p>
        <ol className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
          {sellerLevels.map((l) => (
            <li key={l.level} className={cn('bg-background p-5', l.level === level.level && 'bg-secondary')}>
              <p className="font-display text-2xl">{l.level}</p>
              <p className="text-xs text-muted-foreground">da {l.fromSales} vendite</p>
              <p className="mt-3 text-sm">{l.maxListingPrice ? `Fino a ${formatEUR(l.maxListingPrice)} per annuncio` : 'Nessun limite di valore'}</p>
              <p className="text-sm">{l.maxActiveListings ? `${l.maxActiveListings} annunci attivi` : 'Annunci attivi illimitati'}</p>
              {l.level === level.level && <p className="mt-3 text-xs text-bronze">Sei qui · {active} annunci attivi</p>}
            </li>
          ))}
        </ol>
        {level.next && (
          <p className="mt-3 text-sm text-muted-foreground">Mancano {level.salesToNext} vendite per diventare venditore {level.next.level.toLowerCase()}.</p>
        )}
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-3xl">Da spedire</h2>
        <div className="mt-4 flex gap-4 border border-border p-5 text-sm">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-bronze" />
          <div className="space-y-2">
            <p><span className="font-medium">Ordine SH-24790 · Tiziana Terenzi Kirkè.</span> <span className="text-muted-foreground">L’etichetta dell’operatore autorizzato è pronta, assicurazione inclusa.</span></p>
            <ul className="list-inside list-disc text-muted-foreground">
              <li>Flacone con il tappo, avvolto nel pluriball, in una scatola rigida con riempitivo su tutti i lati.</li>
              <li>Fotografa il flacone imballato prima di chiudere il pacco: le foto servono in caso di contestazione.</li>
              <li>Consegna il pacco al punto di ritiro indicato sull’etichetta; il tracciamento parte da solo.</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" className="rounded-none" onClick={() => toast('Etichetta scaricata', { description: 'Prototipo: il PDF arriverà con l’integrazione del corriere.' })}>Scarica etichetta</Button>
              <Button size="sm" variant="outline" className="rounded-none" asChild>
                <label className="cursor-pointer">
                  <Camera /> Carica foto dell’imballo
                  <input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={(e) => e.target.files?.length && toast('Foto caricate', { description: `${e.target.files.length} foto allegate all’ordine.` })} />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const statusCopy: Record<MyListingStatus, { label: string; tone: string }> = {
  in_revisione: { label: 'In revisione dalla redazione', tone: 'text-bronze' },
  da_correggere: { label: 'Restituito con indicazioni', tone: 'text-destructive' },
  pubblicato: { label: 'Pubblicato', tone: 'text-foreground' },
  venduto: { label: 'Venduto', tone: 'text-muted-foreground' },
}

function MyListingsPanel() {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button asChild className="rounded-none"><Link to="/vendi"><Plus /> Nuovo annuncio</Link></Button>
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {myListings.map((m) => {
          const c = getCatalogueEntry(m.catalogueId)!
          const st = statusCopy[m.status]
          return (
            <li key={m.id} className="flex gap-4 py-5">
              <img src={imageUrl(c.image, 160, 200)} alt="" className="h-20 w-16 object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-muted-foreground">{c.brand}</p>
                <p className="font-display text-xl">{c.name}</p>
                <p className="text-xs text-muted-foreground">{formatEUR(m.price)} · {m.fillPercent}% · inviato il {m.submittedAt}</p>
                <p className={cn('mt-1 text-sm', st.tone)}>{st.label}</p>
                {m.editorialNote && (
                  <p className="mt-2 border-l-2 border-destructive pl-3 text-sm">
                    <span className="text-muted-foreground">Nota della redazione:</span> {m.editorialNote}
                  </p>
                )}
              </div>
              <div className="self-center">
                {m.status === 'da_correggere' && <Button size="sm" variant="outline" className="rounded-none" onClick={() => toast('Correzione', { description: 'Prototipo: riapre la scheda alla foto da rifare.' })}>Correggi</Button>}
                {m.listingId && <Button size="sm" variant="ghost" className="rounded-none" asChild><Link to="/annunci/$listingId" params={{ listingId: m.listingId }}>Vedi</Link></Button>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function WishlistPanel() {
  const [items, setItems] = useState(initialWishlist)
  const available = allListings()
  return (
    <div>
      <p className="mb-6 max-w-xl text-muted-foreground">
        Salva i profumi che cerchi e attiva l’avviso: quando un flacone corrispondente viene messo in vendita ti scriviamo via mail. Se
        non basta, pubblica una richiesta alla community.
      </p>
      <ul className="divide-y divide-border border-y border-border">
        {items.map((w) => {
          const c = getCatalogueEntry(w.catalogueId)!
          const matches = available.filter((l) => l.catalogueId === w.catalogueId && (!w.maxPrice || l.price <= w.maxPrice) && (!w.minFill || l.fillPercent >= w.minFill))
          return (
            <li key={w.catalogueId} className="flex items-center gap-4 py-5">
              <img src={imageUrl(c.image, 112, 112)} alt="" className="size-14 object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-muted-foreground">{c.brand}</p>
                <p className="font-display text-xl">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[w.maxPrice && `fino a ${formatEUR(w.maxPrice)}`, w.minFill && `almeno ${w.minFill}%`].filter(Boolean).join(' · ') || 'Qualsiasi annuncio'}
                  {matches.length > 0 && (
                    <>
                      {' · '}
                      <Link to="/annunci/$listingId" params={{ listingId: matches[0].id }} className="text-foreground underline underline-offset-4">
                        {matches.length} in vendita ora
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <Button
                variant={w.alert ? 'default' : 'outline'}
                size="sm"
                className="rounded-none"
                aria-pressed={w.alert}
                onClick={() => setItems((xs) => xs.map((x) => (x === w ? { ...x, alert: !x.alert } : x)))}
              >
                {w.alert ? <Bell /> : <BellOff />} {w.alert ? 'Avviso attivo' : 'Attiva avviso'}
              </Button>
            </li>
          )
        })}
      </ul>
      <Button asChild variant="outline" className="mt-6 rounded-none"><Link to="/richieste">Pubblica una richiesta alla community</Link></Button>
    </div>
  )
}

function WardrobePanel() {
  const [items, setItems] = useState<WardrobeItem[]>(initialWardrobe)
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-xl text-muted-foreground">
          I profumi che possiedi, collegati alla loro scheda. Quando vuoi vendere un flacone, parti da qui: i dati sono già compilati.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none"><Plus /> Aggiungi un profumo</Button>
          </DialogTrigger>
          <DialogContent className="rounded-none sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-medium">Aggiungi al guardaroba</DialogTitle>
              <DialogDescription>Inquadra il codice a barre della confezione: il profumo si collega da solo alla sua scheda.</DialogDescription>
            </DialogHeader>
            <BarcodeLookup
              onFound={(e) => {
                setItems((xs) => (xs.some((x) => x.catalogueId === e.id) ? xs : [...xs, { catalogueId: e.id, addedVia: 'codice a barre', fillPercent: 100 }]))
                setOpen(false)
                toast('Aggiunto al guardaroba', { description: `${e.brand} ${e.name}` })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {items.map((w) => {
          const c = getCatalogueEntry(w.catalogueId)!
          return (
            <li key={w.catalogueId}>
              <img src={imageUrl(c.image, 400, 500)} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
              <p className="eyebrow mt-3 text-muted-foreground">{c.brand}</p>
              <p className="font-display text-xl">{c.name}</p>
              <p className="text-xs text-muted-foreground">≈ {mlLeft(c.sizeMl, w.fillPercent)} ml · aggiunto con {w.addedVia}</p>
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-none">
                <Link to="/vendi" search={{ catalogo: c.id }}><Check /> Vendi questo</Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

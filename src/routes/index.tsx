import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Lock, MessageSquareText, PackageCheck, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ListingCard } from '@/components/listing-card'
import { allListings, articles, communityRequests, families, formatEUR, getCatalogueEntry, imageUrl, platformSettings } from '@/lib/fixtures'

export const Route = createFileRoute('/')({
  component: MarketplaceHome,
})

function MarketplaceHome() {
  const listings = allListings()
  const recent = [...listings].sort((a, b) => b.listedAt.localeCompare(a.listedAt)).slice(0, 8)
  const verified = listings.filter((l) => l.verified).slice(0, 4)
  const s = platformSettings

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-content px-4 pt-6 sm:px-6 md:pt-10">
          <div className="relative overflow-hidden bg-secondary">
            <img
              src={imageUrl('hero.png', 1600)}
              srcSet={`${imageUrl('hero.png', 800)} 800w, ${imageUrl('hero.png', 1600)} 1600w, ${imageUrl('hero.png', 2400)} 2400w`}
              sizes="(min-width: 1280px) 1280px, 100vw"
              alt="Tre flaconi di profumo di nicchia su una lastra di travertino"
              className="aspect-[4/5] w-full object-cover object-[45%_center] sm:aspect-[16/9] lg:aspect-[21/9]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent sm:bg-gradient-to-r sm:from-foreground/45 sm:via-foreground/5" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground sm:inset-y-0 sm:right-auto sm:flex sm:max-w-xl sm:flex-col sm:justify-end sm:p-12">
              <p className="eyebrow mb-4 text-primary-foreground/80">Il marketplace della community</p>
              <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl">
                Flaconi che <em className="font-normal">cambiano casa.</em>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                Profumi di nicchia usati o sigillati, venduti da membri della community. Ogni annuncio è controllato dalla
                redazione e il pagamento resta trattenuto fino alla consegna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search + sell invite, right below the hero (ch. 5) */}
      <section aria-label="Cerca o vendi" className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center">
          <HomeSearch />
          <Button asChild size="lg" variant="outline" className="h-12 rounded-none">
            <Link to="/vendi">Vendi un flacone <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      {/* Trust pillars */}
      <section aria-label="Le nostre garanzie" className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid border-b border-border md:grid-cols-3">
          <Pillar icon={ShieldCheck} title="Verifica dove serve" text="Valore, marchio e livello del venditore decidono quando il flacone passa dagli specialisti. Puoi richiederla tu su qualsiasi annuncio." />
          <Pillar icon={Lock} title="Pagamento trattenuto" text={`Il venditore viene pagato quando confermi la ricezione, o dopo ${s.disputeWindowHours} ore dalla consegna senza contestazioni.`} />
          <Pillar icon={PackageCheck} title="Spedizione assicurata" text="Un operatore autorizzato al trasporto di profumi, con l’assicurazione già compresa nel prezzo che vedi." />
        </div>
      </section>

      <Shelf eyebrow="Novità" title="Appena arrivati" listings={recent} priority />

      {/* Community requests */}
      <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2 text-muted-foreground">Dalla community</p>
            <h2 className="text-4xl sm:text-5xl">Chi cerca che cosa</h2>
          </div>
          <Link to="/richieste" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            Tutte le richieste <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {communityRequests.map((r) => (
            <li key={r.id} className="flex flex-col bg-background p-6">
              <p className="eyebrow text-muted-foreground">{r.author} · {r.createdAt}</p>
              <h3 className="font-display mt-3 text-2xl leading-tight">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{r.detail}</p>
              <p className="mt-4 flex items-center justify-between text-xs">
                <span>{r.maxPrice ? `Fino a ${formatEUR(r.maxPrice)}` : 'Prezzo da proporre'}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><MessageSquareText className="size-3.5" />{r.responses}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Editorial content linked to what is changing hands */}
      <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
        <p className="eyebrow mb-2 text-muted-foreground">Dal Magazine</p>
        <h2 className="mb-8 text-4xl sm:text-5xl">Prima di comprare, leggi</h2>
        <div className="grid gap-10 md:grid-cols-3">
          {articles.map((a) => {
            const perfume = a.catalogueId ? getCatalogueEntry(a.catalogueId) : undefined
            return (
              <article key={a.id}>
                <img src={imageUrl(a.image, 800, 560)} alt="" className="aspect-[10/7] w-full object-cover" loading="lazy" />
                <p className="eyebrow mt-4 text-bronze">{a.section}</p>
                <h3 className="font-display mt-2 text-2xl leading-tight">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
                {perfume && (
                  <Link to="/cerca" search={{ q: perfume.name }} className="mt-3 inline-flex items-center gap-1 text-sm underline underline-offset-4">
                    Annunci di {perfume.name}
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </section>

      {/* Verification story */}
      <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <img
            src={imageUrl('verification.png', 1200)}
            srcSet={`${imageUrl('verification.png', 700)} 700w, ${imageUrl('verification.png', 1200)} 1200w`}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="Uno specialista Scent House esamina un flacone con una lente"
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
          <div className="max-w-md">
            <p className="eyebrow mb-4 text-bronze">Il sigillo</p>
            <h2 className="text-4xl leading-tight sm:text-5xl">Un controllo solo non basta. Ne mettiamo tre, uno sull’altro.</h2>
            <ol className="mt-8 space-y-5 border-l border-border pl-6 text-sm">
              <li>
                <span className="font-display mr-2 text-lg text-bronze">I.</span>
                <span className="font-medium">Chi vende.</span> <span className="text-muted-foreground">Identità verificata, profilo nella community, limiti che si allentano vendita dopo vendita.</span>
              </li>
              <li>
                <span className="font-display mr-2 text-lg text-bronze">II.</span>
                <span className="font-medium">Che cosa si vende.</span> <span className="text-muted-foreground">Scheda standard con quattro foto obbligatorie, controllata dalla redazione prima della pubblicazione.</span>
              </li>
              <li>
                <span className="font-display mr-2 text-lg text-bronze">III.</span>
                <span className="font-medium">Il flacone in mano.</span> <span className="text-muted-foreground">Quando il rischio è alto, gli specialisti controllano autenticità, livello e condizioni prima che arrivi a te. Se non è autentico, rimborso totale.</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <Shelf eyebrow="Con il sigillo Scent House" title="Già verificati" listings={verified} href="verified" />

      {/* Families */}
      <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
        <p className="eyebrow mb-3 text-muted-foreground">Esplora per famiglia olfattiva</p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {families.map((f) => (
            <Link key={f} to="/cerca" search={{ famiglia: f }} className="font-display text-3xl text-foreground/70 transition-colors hover:text-foreground motion-reduce:transition-none sm:text-4xl">
              {f}
            </Link>
          ))}
        </div>
      </section>

      {/* Sell CTA */}
      <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
        <div className="bg-secondary px-6 py-14 text-center sm:px-12">
          <p className="eyebrow mb-4 text-bronze">Dal tuo guardaroba</p>
          <h2 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-5xl">Dai una nuova casa ai flaconi che non indossi più.</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Inquadri il codice a barre, scatti le quattro foto guidate e ricevi un intervallo di prezzo con la spiegazione di come
            è calcolato. Commissione del {s.sellerCommissionPercent}% solo a vendita conclusa, spedizione già organizzata.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-none">
            <Link to="/vendi">Inizia a vendere <ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function HomeSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      role="search"
      className="relative flex-1"
      onSubmit={(e) => {
        e.preventDefault()
        navigate({ to: '/cerca', search: q.trim() ? { q: q.trim() } : {} })
      }}
    >
      <Search className="absolute top-1/2 left-0 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca un profumo per nome o marchio"
        aria-label="Cerca un profumo per nome o marchio"
        className="h-12 rounded-none border-0 bg-transparent pl-8 text-lg shadow-none focus-visible:ring-0"
      />
    </form>
  )
}

function Pillar({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="flex gap-4 border-border py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
      <Icon className="mt-1 size-5 shrink-0 text-bronze" aria-hidden strokeWidth={1.5} />
      <div>
        <h2 className="text-xl">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function Shelf({
  eyebrow,
  title,
  listings,
  priority,
  href,
}: {
  eyebrow: string
  title: string
  listings: ReturnType<typeof allListings>
  priority?: boolean
  href?: 'verified'
}) {
  return (
    <section className="mx-auto mt-24 max-w-content px-4 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-muted-foreground">{eyebrow}</p>
          <h2 className="text-4xl sm:text-5xl">{title}</h2>
        </div>
        <Link
          to="/cerca"
          search={href === 'verified' ? { verifica: 'sigillo' as const } : {}}
          className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          Vedi tutti <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {listings.map((l, i) => (
          <ListingCard key={l.id} listing={l} priority={priority && i < 2} />
        ))}
      </div>
    </section>
  )
}

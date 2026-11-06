import { Link } from '@tanstack/react-router'
import { Heart, Menu, Search, User } from 'lucide-react'
import { toast } from 'sonner'
import { LogoMark } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

// The marketplace is one section of the Scent House site (ch. 5): editorial, forum, marketplace, personal area.
const communityLinks = [
  { label: 'Magazine', href: '#' },
  { label: 'Forum', href: '#' },
  { label: 'Marketplace', href: '/', active: true },
]

const marketLinks = [
  { label: 'Esplora', to: '/' },
  { label: 'Cerca', to: '/cerca' },
  { label: 'Richieste', to: '/richieste' },
  { label: 'Vendi', to: '/vendi' },
  { label: 'Ordini', to: '/ordini' },
] as const

const signIn = () =>
  toast('Accesso e registrazione', {
    description: 'Nel prototipo sei già entrato come iris.nera. Sfogliare il marketplace non richiede la registrazione: serve solo per acquistare o vendere.',
  })

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`font-display inline-flex items-center gap-2.5 text-2xl tracking-[0.32em] uppercase sm:text-[1.7rem] ${className}`}>
      <LogoMark className="size-6 shrink-0 text-bronze sm:size-7" />
      Scent House
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="hidden border-b border-border md:block">
        <nav aria-label="Scent House" className="mx-auto flex max-w-content items-center justify-center gap-10 px-6 py-2">
          {communityLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-current={l.active ? 'page' : undefined}
              className={`eyebrow transition-colors motion-reduce:transition-none ${l.active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {l.label}
            </a>
          ))}
          <Link to="/area-personale" className="eyebrow text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none">
            Area personale
          </Link>
        </nav>
      </div>

      <div className="mx-auto grid max-w-content grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Apri menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display text-xl tracking-[0.25em] uppercase">Scent House</SheetTitle>
                <SheetDescription>Marketplace di profumeria di nicchia</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Marketplace mobile">
                {marketLinks.map((l) => (
                  <Link key={l.label} to={l.to} className="font-display border-b border-border py-3 text-2xl">
                    {l.label}
                  </Link>
                ))}
                <p className="eyebrow mt-8 mb-2 text-muted-foreground">Scent House</p>
                {communityLinks.filter((l) => !l.active).map((l) => (
                  <a key={l.label} href={l.href} className="py-2 text-sm text-muted-foreground">
                    {l.label}
                  </a>
                ))}
                <Link to="/area-personale" className="py-2 text-sm text-muted-foreground">Area personale</Link>
                <Button variant="outline" className="mt-6 rounded-none" onClick={signIn}>Accedi · Registrati</Button>
              </nav>
            </SheetContent>
          </Sheet>
          <nav aria-label="Marketplace" className="hidden items-center gap-6 lg:flex">
            {marketLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
                activeProps={{ className: 'text-foreground' }}
                activeOptions={{ exact: l.to === '/' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-center">
          <Wordmark />
          <p className="eyebrow mt-0.5 text-[0.6rem] text-bronze">Marketplace</p>
        </div>

        <div className="flex items-center justify-end gap-0.5">
          <Button variant="ghost" size="icon" asChild aria-label="Cerca">
            <Link to="/cerca"><Search /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild aria-label="Lista dei desideri">
            <Link to="/area-personale" search={{ sezione: 'desideri' }}><Heart /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Area personale">
            <Link to="/area-personale"><User /></Link>
          </Button>
          <Button variant="outline" size="sm" className="ml-2 hidden rounded-none xl:inline-flex" onClick={signIn}>
            Accedi · Registrati
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            La casa degli appassionati italiani di profumeria di nicchia. Nel marketplace i flaconi cambiano casa con regole
            condivise: annunci controllati dalla redazione, verifica degli specialisti quando il rischio è alto, pagamento
            trattenuto fino alla consegna.
          </p>
        </div>
        <FooterCol title="Marketplace" items={['Come funziona', 'Marchi ammessi', 'Verifica di autenticità', 'Spedizioni assicurate', 'Tariffe']} />
        <FooterCol title="Community" items={['Magazine', 'Forum', 'Richieste della community', 'Consulenza', 'Newsletter']} />
        <FooterCol title="Assistenza" items={['Centro assistenza', 'Contestazioni', 'Termini di vendita', 'Privacy']} />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-content px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © 2026 Scent House · Vendita tra privati · Pagamenti gestiti da un fornitore autorizzato · Verifica degli specialisti Scent House
        </p>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-muted-foreground">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-bronze">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

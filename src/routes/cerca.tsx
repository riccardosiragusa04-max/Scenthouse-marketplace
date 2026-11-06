import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { allListings, allNotes, assessListing, brands, families, formatEUR, sellerLevel, sellerLevels, sizes, type SellerLevel } from '@/lib/fixtures'

type Sort = 'recenti' | 'prezzo-asc' | 'prezzo-desc' | 'livello'
/** 'sigillo': already checked by a specialist. 'protetti': sealed or checked before delivery. */
type VerificationFilter = 'sigillo' | 'protetti'

interface SearchParams {
  q?: string
  brand?: string
  famiglia?: string
  nota?: string
  formato?: number
  prezzoMax?: number
  livelloMin?: number
  verifica?: VerificationFilter
  venditore?: SellerLevel
  scatola?: boolean
  ordina?: Sort
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined)
const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v && !isNaN(+v) ? +v : undefined)
const bool = (v: unknown) => (v === true || v === 'true' ? true : undefined)

export const Route = createFileRoute('/cerca')({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: str(s.q),
    brand: str(s.brand),
    famiglia: str(s.famiglia),
    nota: str(s.nota),
    formato: num(s.formato),
    prezzoMax: num(s.prezzoMax),
    livelloMin: num(s.livelloMin),
    verifica: (['sigillo', 'protetti'] as const).find((v) => v === s.verifica),
    venditore: sellerLevels.map((l) => l.level).find((v) => v === s.venditore),
    scatola: bool(s.scatola),
    ordina: (['recenti', 'prezzo-asc', 'prezzo-desc', 'livello'] as const).find((o) => o === s.ordina),
  }),
  head: () => ({ meta: [{ title: 'Cerca · Scent House Marketplace' }] }),
  component: SearchPage,
})

const ALL = '__all'

function SearchPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/cerca' })
  const set = (patch: Partial<SearchParams>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })

  const results = useMemo(() => {
    const q = search.q?.toLowerCase()
    const out = allListings().filter((l) => {
      const p = l.perfume
      if (q && !`${p.brand} ${p.name} ${p.notes.join(' ')}`.toLowerCase().includes(q)) return false
      if (search.brand && p.brand !== search.brand) return false
      if (search.famiglia && p.family !== search.famiglia) return false
      if (search.nota && !p.notes.includes(search.nota)) return false
      if (search.formato && p.sizeMl !== search.formato) return false
      if (search.prezzoMax && l.price > search.prezzoMax) return false
      if (search.livelloMin && l.fillPercent < search.livelloMin) return false
      if (search.verifica === 'sigillo' && !l.verified) return false
      if (search.verifica === 'protetti' && !(l.verified || assessListing(l).automatic)) return false
      if (search.venditore && sellerLevel(l.seller).level !== search.venditore) return false
      if (search.scatola && !l.hasBox) return false
      return true
    })
    const sort = search.ordina ?? 'recenti'
    return out.sort((a, b) =>
      sort === 'prezzo-asc' ? a.price - b.price
      : sort === 'prezzo-desc' ? b.price - a.price
      : sort === 'livello' ? b.fillPercent - a.fillPercent
      : b.listedAt.localeCompare(a.listedAt),
    )
  }, [search])

  const activeChips = [
    search.brand && { key: 'brand', label: search.brand },
    search.famiglia && { key: 'famiglia', label: search.famiglia },
    search.nota && { key: 'nota', label: `Nota: ${search.nota}` },
    search.formato && { key: 'formato', label: `${search.formato} ml` },
    search.prezzoMax && { key: 'prezzoMax', label: `Fino a ${formatEUR(search.prezzoMax)}` },
    search.livelloMin && { key: 'livelloMin', label: `Liquido ≥ ${search.livelloMin}%` },
    search.verifica && { key: 'verifica', label: search.verifica === 'sigillo' ? 'Con sigillo' : 'Sigillo o verifica prevista' },
    search.venditore && { key: 'venditore', label: `Venditore ${search.venditore.toLowerCase()}` },
    search.scatola && { key: 'scatola', label: 'Con scatola' },
  ].filter(Boolean) as { key: keyof SearchParams; label: string }[]

  const filters = <Filters search={search} set={set} />

  return (
    <div className="mx-auto max-w-content px-4 pt-10 sm:px-6 md:pt-14">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3 text-muted-foreground">Marketplace</p>
        <h1 className="text-5xl sm:text-6xl">Cerca un flacone</h1>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Brand, profumo o nota — es. «iris», «Naxos»"
          aria-label="Cerca nel marketplace"
          defaultValue={search.q}
          onChange={(e) => set({ q: e.target.value || undefined })}
          className="h-11 flex-1 rounded-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-none lg:hidden">
                <SlidersHorizontal /> Filtri{activeChips.length ? ` (${activeChips.length})` : ''}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Filtri</SheetTitle>
                <SheetDescription>{results.length} annunci corrispondono</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-8">{filters}</div>
            </SheetContent>
          </Sheet>
          <Select value={search.ordina ?? 'recenti'} onValueChange={(v) => set({ ordina: v as Sort })}>
            <SelectTrigger className="w-48 rounded-none" aria-label="Ordina per">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recenti">Più recenti</SelectItem>
              <SelectItem value="prezzo-asc">Prezzo crescente</SelectItem>
              <SelectItem value="prezzo-desc">Prezzo decrescente</SelectItem>
              <SelectItem value="livello">Livello più alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={() => set({ [c.key]: undefined } as Partial<SearchParams>)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs hover:border-foreground"
            >
              {c.label} <X className="size-3" aria-label="Rimuovi filtro" />
            </button>
          ))}
          <button className="text-xs text-muted-foreground underline underline-offset-4" onClick={() => navigate({ search: {}, replace: true })}>
            Azzera tutto
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtri">{filters}</aside>
        <section aria-live="polite">
          <p className="mb-6 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? 'annuncio' : 'annunci'}
          </p>
          {results.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
              {results.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="border border-dashed border-border px-6 py-16 text-center">
              <h2 className="text-3xl">Nessun flacone, per ora.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                Salva questa ricerca: ti avviseremo quando un membro metterà in vendita un profumo che corrisponde.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button className="rounded-none" onClick={() => toast('Ricerca salvata', { description: 'Riceverai una notifica per i nuovi annunci.' })}>
                  Salva ricerca
                </Button>
                <Button variant="outline" className="rounded-none" onClick={() => navigate({ search: {}, replace: true })}>
                  Azzera filtri
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Filters({ search, set }: { search: SearchParams; set: (p: Partial<SearchParams>) => void }) {
  return (
    <div className="space-y-8 text-sm">
      <FilterSelect label="Brand" value={search.brand} options={brands} onChange={(v) => set({ brand: v })} />
      <FilterSelect label="Famiglia olfattiva" value={search.famiglia} options={families} onChange={(v) => set({ famiglia: v })} />
      <FilterSelect label="Formato" value={search.formato ? String(search.formato) : undefined} options={sizes.map(String)} format={(o) => `${o} ml`} onChange={(v) => set({ formato: v ? +v : undefined })} />
      <FilterSelect label="Nota" value={search.nota} options={allNotes} onChange={(v) => set({ nota: v })} />
      <FilterSelect label="Livello del venditore" value={search.venditore} options={sellerLevels.map((l) => l.level)} onChange={(v) => set({ venditore: v as SellerLevel | undefined })} />
      <FilterSelect
        label="Stato di verifica"
        value={search.verifica}
        options={['sigillo', 'protetti']}
        format={(o) => (o === 'sigillo' ? 'Già verificati (sigillo)' : 'Sigillo o verifica prevista')}
        onChange={(v) => set({ verifica: v as VerificationFilter | undefined })}
      />

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="prezzo">Prezzo massimo</Label>
          <span className="text-muted-foreground">{search.prezzoMax ? formatEUR(search.prezzoMax) : 'Qualsiasi'}</span>
        </div>
        <input
          id="prezzo"
          type="range"
          min={50}
          max={400}
          step={10}
          value={search.prezzoMax ?? 400}
          onChange={(e) => set({ prezzoMax: +e.target.value >= 400 ? undefined : +e.target.value })}
          className="w-full accent-[var(--bronze)]"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="livello">Liquido rimasto, minimo</Label>
          <span className="text-muted-foreground">{search.livelloMin ? `${search.livelloMin}%` : 'Qualsiasi'}</span>
        </div>
        <input
          id="livello"
          type="range"
          min={10}
          max={100}
          step={5}
          value={search.livelloMin ?? 10}
          onChange={(e) => set({ livelloMin: +e.target.value <= 10 ? undefined : +e.target.value })}
          className="w-full accent-[var(--bronze)]"
        />
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <label className="flex items-center gap-3">
          <Checkbox checked={!!search.scatola} onCheckedChange={(c) => set({ scatola: c === true || undefined })} />
          Con scatola originale
        </label>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, options, format = (o) => o, onChange }: { label: string; value?: string; options: string[]; format?: (o: string) => string; onChange: (v?: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="eyebrow text-muted-foreground">{label}</Label>
      <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
        <SelectTrigger className="w-full rounded-none" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tutti</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{format(o)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

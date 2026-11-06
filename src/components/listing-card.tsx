import { Link } from '@tanstack/react-router'
import { Archive, Droplet, Receipt, ShieldCheck } from 'lucide-react'
import { assessListing, formatEUR, imageUrl, mlLeft, sellerLevel, type ListingView } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

/** The Scent House sign: a bottle whose cap is a pitched roof (ch. 4.2). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 7.5 12 3.5l4 4" />
      <path d="M9.5 7.5v2.5" />
      <path d="M14.5 7.5v2.5" />
      <rect x="5.5" y="10" width="13" height="10.5" rx="1.2" />
      <path d="M8.5 15.5h7" />
    </svg>
  )
}

export function TrustBadge({ kind, className }: { kind: 'verified' | 'scheduled' | 'box' | 'receipt'; className?: string }) {
  const map = {
    verified: { icon: null, label: 'Sigillo Scent House', tone: 'text-foreground border-bronze/60' },
    scheduled: { icon: ShieldCheck, label: 'Verifica prevista', tone: 'text-bronze border-bronze/40' },
    box: { icon: Archive, label: 'Con scatola', tone: 'text-foreground/80 border-border' },
    receipt: { icon: Receipt, label: 'Con scontrino', tone: 'text-foreground/80 border-border' },
  } as const
  const { icon: Icon, label, tone } = map[kind]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border bg-background/90 px-2.5 py-1 text-[0.7rem] font-medium', tone, className)}>
      {Icon ? <Icon className="size-3.5" aria-hidden /> : <LogoMark className="size-3.5 text-bronze" />}
      {label}
    </span>
  )
}

export function FillMeter({ percent, sizeMl, className }: { percent: number; sizeMl?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <Droplet className="size-3.5" aria-hidden />
      <span className="relative h-1 w-14 overflow-hidden rounded-full bg-border" aria-hidden>
        <span className="absolute inset-y-0 left-0 bg-bronze" style={{ width: `${percent}%` }} />
      </span>
      <span>{sizeMl ? `≈ ${mlLeft(sizeMl, percent)} ml` : `${percent}%`}</span>
    </span>
  )
}

export function SellerLevelTag({ sales, className }: { sales: number; className?: string }) {
  const { level } = sellerLevel({ salesCompleted: sales })
  return (
    <span className={cn('text-[0.7rem] text-muted-foreground', level === 'Esperto' && 'text-bronze', className)}>
      Venditore {level.toLowerCase()}
    </span>
  )
}

export function ListingCard({ listing, priority = false }: { listing: ListingView; priority?: boolean }) {
  const { perfume } = listing
  const { automatic } = assessListing(listing)
  return (
    <Link
      to="/annunci/$listingId"
      params={{ listingId: listing.id }}
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={imageUrl(perfume.image, 640, 800)}
          srcSet={`${imageUrl(perfume.image, 400, 500)} 400w, ${imageUrl(perfume.image, 640, 800)} 640w`}
          sizes="(min-width: 1024px) 25vw, 50vw"
          alt={`${perfume.brand} ${perfume.name}, flacone in vendita`}
          loading={priority ? 'eager' : 'lazy'}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {listing.verified ? <TrustBadge kind="verified" /> : automatic && <TrustBadge kind="scheduled" />}
        </div>
        <div className="absolute inset-0 ring-ring/60 ring-inset group-focus-visible:ring-2" />
      </div>
      <div className="mt-4 space-y-1.5">
        <p className="eyebrow text-muted-foreground">{perfume.brand}</p>
        <h3 className="font-display text-xl leading-tight">{perfume.name}</h3>
        <p className="text-xs text-muted-foreground">
          {perfume.concentration} · {perfume.sizeMl} ml · {listing.condition}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[0.95rem] font-medium">{formatEUR(listing.price)}</span>
          <FillMeter percent={listing.fillPercent} sizeMl={perfume.sizeMl} />
        </div>
        <SellerLevelTag sales={listing.seller.salesCompleted} />
      </div>
    </Link>
  )
}

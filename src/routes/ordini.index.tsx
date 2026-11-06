import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatEUR, getListing, imageUrl, orderSummaries, viewListing, type OrderSummary } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/ordini/')({
  head: () => ({ meta: [{ title: 'I miei ordini · Scent House Marketplace' }] }),
  component: OrdersPage,
})

function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
      <p className="eyebrow mb-3 text-muted-foreground">Area personale</p>
      <h1 className="mb-10 text-5xl sm:text-6xl">I miei ordini</h1>
      <Tabs defaultValue="acquisto">
        <TabsList className="mb-8 rounded-none">
          <TabsTrigger value="acquisto" className="rounded-none">Acquisti</TabsTrigger>
          <TabsTrigger value="vendita" className="rounded-none">Vendite</TabsTrigger>
        </TabsList>
        {(['acquisto', 'vendita'] as const).map((side) => (
          <TabsContent key={side} value={side}>
            <ul className="divide-y divide-border border-y border-border">
              {orderSummaries.filter((o) => o.side === side).map((o) => <OrderRow key={o.id} order={o} />)}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function OrderRow({ order }: { order: OrderSummary }) {
  const l = viewListing(getListing(order.listingId)!)
  const detailAvailable = order.id === 'SH-24817'
  const body = (
    <div className="flex items-center gap-4 py-5">
      <img src={imageUrl(l.perfume.image, 160, 200)} alt="" className="h-20 w-16 object-cover" loading="lazy" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-muted-foreground">{l.perfume.brand}</p>
        <p className="font-display truncate text-xl">{l.perfume.name}</p>
        <p className="text-xs text-muted-foreground">
          {order.id} · {order.date} · {order.side === 'acquisto' ? 'da' : 'a'} {order.counterpart}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="font-medium">{formatEUR(l.price)}</p>
        <StatusPill order={order} />
      </div>
      {detailAvailable && <ChevronRight className="size-4 text-muted-foreground" />}
    </div>
  )
  return (
    <li>
      {detailAvailable ? (
        <Link to="/ordini/$orderId" params={{ orderId: order.id }} className="block hover:bg-secondary/50">{body}</Link>
      ) : (
        body
      )}
      <div className="-mt-3 pb-4 sm:hidden"><StatusPill order={order} /></div>
    </li>
  )
}

function StatusPill({ order }: { order: OrderSummary }) {
  return (
    <span
      className={cn(
        'mt-1 inline-block text-xs',
        order.tone === 'progress' && 'text-bronze',
        order.tone === 'done' && 'text-muted-foreground',
        order.tone === 'action' && 'font-medium text-foreground',
      )}
    >
      {order.status}
    </span>
  )
}

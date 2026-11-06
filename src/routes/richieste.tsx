import { createFileRoute } from '@tanstack/react-router'
import { MessageSquareText } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { communityRequests, currentMember, formatEUR, type CommunityRequest } from '@/lib/fixtures'

export const Route = createFileRoute('/richieste')({
  head: () => ({ meta: [{ title: 'Richieste della community · Scent House Marketplace' }] }),
  component: RequestsPage,
})

/** Members ask for rare or discontinued bottles; sellers answer (ch. 4.4 and 5.3). */
function RequestsPage() {
  const [requests, setRequests] = useState<CommunityRequest[]>(communityRequests)

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
      <p className="eyebrow mb-3 text-muted-foreground">Marketplace</p>
      <h1 className="text-5xl sm:text-6xl">Richieste della community</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Cerchi un pezzo raro o fuori produzione? Pubblica una richiesta: i membri che lo hanno possono risponderti e metterlo in vendita
        per te. Il desiderio di uno diventa l’occasione di un altro.
      </p>
      <NewRequestDialog onCreate={(r) => setRequests((xs) => [r, ...xs])} />

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {requests.map((r) => (
          <li key={r.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="eyebrow text-muted-foreground">{r.author} · {r.createdAt}</p>
              <h2 className="font-display mt-2 text-2xl">{r.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
              <p className="mt-2 text-xs">
                {r.maxPrice ? `Fino a ${formatEUR(r.maxPrice)}` : 'Prezzo da proporre'} ·{' '}
                <span className="inline-flex items-center gap-1 text-muted-foreground"><MessageSquareText className="size-3.5" />{r.responses} risposte</span>
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => toast('Risposta inviata', { description: `${r.author} riceverà la tua proposta. Per vendere servirà comunque un annuncio controllato dalla redazione.` })}
            >
              Ce l’ho
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function NewRequestDialog({ onCreate }: { onCreate: (r: CommunityRequest) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-6 rounded-none">Pubblica una richiesta</Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">Che cosa cerchi?</DialogTitle>
          <DialogDescription>La richiesta è visibile a tutti i membri. Niente recapiti personali: le risposte arrivano qui.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="rq-title">Profumo</Label><Input id="rq-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Serge Lutens Chergui, bell jar" className="rounded-none" /></div>
          <div className="space-y-2"><Label htmlFor="rq-detail">Dettagli</Label><Textarea id="rq-detail" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Batch, livello minimo, scatola…" className="rounded-none" /></div>
          <div className="space-y-2"><Label htmlFor="rq-price">Prezzo massimo (facoltativo)</Label><Input id="rq-price" type="number" inputMode="decimal" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-none" /></div>
        </div>
        <DialogFooter>
          <Button
            className="rounded-none"
            disabled={!title.trim()}
            onClick={() => {
              onCreate({ id: `q${Date.now()}`, author: currentMember().handle, title: title.trim(), detail: detail.trim(), maxPrice: maxPrice ? +maxPrice : undefined, createdAt: 'adesso', responses: 0 })
              setOpen(false)
              setTitle('')
              setDetail('')
              setMaxPrice('')
              toast('Richiesta pubblicata', { description: 'Ti avvisiamo via mail quando qualcuno risponde.' })
            }}
          >
            Pubblica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

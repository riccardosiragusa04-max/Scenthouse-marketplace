import { Camera, ScanBarcode } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCatalogueByEan, type CatalogueEntry } from '@/lib/fixtures'

interface BarcodeDetectorLike {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>
}
type BarcodeDetectorCtor = new (opts: { formats: string[] }) => BarcodeDetectorLike

/**
 * Links a bottle to its catalogue entry from the EAN on the box (ch. 4.4 and 5.1).
 * Uses the browser's BarcodeDetector on a photo when available; typing the 13 digits always works.
 */
export function BarcodeLookup({ onFound }: { onFound: (entry: CatalogueEntry) => void }) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const lookup = (raw: string) => {
    const entry = getCatalogueByEan(raw)
    if (entry) {
      setMessage(null)
      onFound(entry)
    } else {
      setMessage('Codice non presente nel catalogo dei marchi ammessi. Puoi cercarlo a mano o chiederne l’aggiunta.')
    }
  }

  const scanPhoto = async (file: File) => {
    const Detector = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
    if (!Detector) {
      setMessage('Questo browser non legge i codici dalle foto: digita le 13 cifre sotto il codice a barre.')
      return
    }
    try {
      const bitmap = await createImageBitmap(file)
      const [found] = await new Detector({ formats: ['ean_13', 'ean_8', 'upc_a'] }).detect(bitmap)
      if (!found) {
        setMessage('Non riesco a leggere il codice: avvicinati e inquadra solo le barre.')
        return
      }
      setCode(found.rawValue)
      lookup(found.rawValue)
    } catch {
      setMessage('Non riesco a leggere la foto. Digita il codice a mano.')
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-center gap-3 border border-dashed border-border bg-secondary/40 px-4 py-8 text-sm hover:bg-secondary">
        <Camera className="size-5 text-bronze" strokeWidth={1.5} />
        <span>Inquadra il codice a barre della confezione</span>
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void scanPhoto(f) }} />
      </label>
      <form
        className="flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          lookup(code)
        }}
      >
        <div className="flex-1 space-y-2">
          <Label htmlFor="ean">Oppure digita il codice (EAN)</Label>
          <Input id="ean" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Es. 8033488155612" className="h-11 rounded-none font-mono" />
        </div>
        <Button type="submit" variant="outline" className="h-11 rounded-none" disabled={code.replace(/\D/g, '').length < 8}>
          <ScanBarcode /> Cerca
        </Button>
      </form>
      {message && <p role="status" className="text-sm text-destructive">{message}</p>}
    </div>
  )
}

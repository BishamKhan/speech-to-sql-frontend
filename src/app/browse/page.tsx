"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  SlidersHorizontal, LayoutGrid, List,
  Mic, MicOff, Loader2, X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CarCard } from "@/components/dashboard/car-card"
import { getCars, voiceSearch } from "@/lib/api/cars"
import { CarResponse, CarFilters } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

const FUEL_TYPES = ["All", "Petrol", "Diesel", "Electric", "Hybrid"] as const
const YEARS      = ["All", "2024", "2023", "2022", "2021", "2020"] as const

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// ── Shared filters UI ─────────────────────────────────────────────────────────
interface FiltersProps {
  brand:       string;   setBrand:      (v: string)   => void
  model:       string;   setModel:      (v: string)   => void
  fuel_type:   string;   setFuel_type:  (v: string)   => void
  year:        string;   setYear:       (v: string)   => void
  priceRange:  number[]; setPriceRange: (v: number[]) => void
  onReset:     () => void
}

function FiltersContent(p: FiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Brand</label>
        <Input
          placeholder="e.g. BMW, Tesla…"
          value={p.brand}
          onChange={(e) => p.setBrand(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Model</label>
        <Input
          placeholder="e.g. 3 Series, Model 3…"
          value={p.model}
          onChange={(e) => p.setModel(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fuel Type</label>
        <Select value={p.fuel_type} onValueChange={p.setFuel_type}>
          <SelectTrigger  className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent >
            {FUEL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Year</label>
        <Select value={p.year} onValueChange={p.setYear}>
          <SelectTrigger  className="w-full" ><SelectValue /></SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Price Range</label>
          <span className="text-xs text-muted-foreground">
            €{p.priceRange[0].toLocaleString()} – €{p.priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          min={0} max={200000} step={1000}
          value={p.priceRange}
          onValueChange={p.setPriceRange}
        />
      </div>

      <Button variant="outline" className="w-full" onClick={p.onReset}>Reset Filters</Button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BrowseCarsPage() {
  // Filter state
  const [brand,       setBrand]       = useState("")
  const [model,       setModel]       = useState("")
  const [fuel_type,   setFuel_type]   = useState("All")
  const [year,        setYear]        = useState("All")
  const [priceRange,  setPriceRange]  = useState([0, 200000])
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode,    setViewMode]    = useState<"grid" | "table">("grid")

  // Debounced values — brand/model wait 500ms, price range waits 600ms
  const debouncedBrand      = useDebounce(brand, 500)
  const debouncedModel      = useDebounce(model, 500)
  const debouncedPriceRange = useDebounce(priceRange, 600)

  // Data state
  const [cars,    setCars]    = useState<CarResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // Voice state
  const [isRecording,  setIsRecording]  = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript,   setTranscript]   = useState<string | null>(null)
  const [voiceError,   setVoiceError]   = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])

  // ── Fetch cars ──────────────────────────────────────────────────────────────
  const fetchCars = useCallback(async (filters?: CarFilters) => {
    setLoading(true)
    setError(null)
    setTranscript(null)
    try {
      const data = await getCars(filters)
      setCars(data)
    } catch {
      setError("Failed to load cars. Make sure the API server is running.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Reactive filter effect ──────────────────────────────────────────────────
  // Runs whenever any debounced/immediate filter value changes
  useEffect(() => {
    const filters: CarFilters = {}
    if (debouncedBrand)                    filters.brand     = debouncedBrand
    if (debouncedModel)                    filters.model     = debouncedModel
    if (fuel_type !== "All")               filters.fuel_type = fuel_type
    if (year      !== "All")               filters.year      = parseInt(year)
    if (debouncedPriceRange[0] > 0)        filters.min_price = debouncedPriceRange[0]
    if (debouncedPriceRange[1] < 200000)   filters.max_price = debouncedPriceRange[1]
    fetchCars(filters)
  }, [debouncedBrand, debouncedModel, fuel_type, year, debouncedPriceRange, fetchCars])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetFilters = () => {
    setBrand(""); setModel(""); setFuel_type("All"); setYear("All"); setPriceRange([0, 200000])
    fetchCars()  // immediate fetch — no debounce wait
  }

  // ── Voice search ────────────────────────────────────────────────────────────
  const startRecording = async () => {
    setVoiceError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setIsRecording(false)
        setIsProcessing(true)
        try {
          const res = await voiceSearch(blob)
          setTranscript(res.transcribed_text)
          setCars(res.results)
        } catch {
          setVoiceError("Voice search failed. Please try again.")
        } finally {
          setIsProcessing(false)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      setVoiceError("Microphone access denied or not available.")
    }
  }

  const stopRecording = () => mediaRecorderRef.current?.stop()

  const filterProps: FiltersProps = {
    brand, setBrand, model, setModel,
    fuel_type, setFuel_type, year, setYear,
    priceRange, setPriceRange,
    onReset: resetFilters,
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Browse Cars</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${cars.length} cars available`}
            {transcript && <span className="ml-2 italic">· "{transcript}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice search */}
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn("gap-1.5", isRecording && "animate-pulse")}
          >
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : isRecording ? (
              <><MicOff className="h-4 w-4" /> Stop</>
            ) : (
              <><Mic className="h-4 w-4" /> Voice Search</>
            )}
          </Button>

          {/* Clear voice results */}
          {transcript && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}

          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6"><FiltersContent {...filterProps} /></div>
            </SheetContent>
          </Sheet>

          {/* Desktop filter toggle */}
          <Button
            variant={showFilters ? "default" : "outline"} size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>

          {/* View mode */}
          <div className="flex items-center border rounded-lg">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm"
              onClick={() => setViewMode("grid")} className="rounded-r-none">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm"
              onClick={() => setViewMode("table")} className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice error */}
      {voiceError && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{voiceError}</p>
      )}

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        {showFilters && (
          <Card className="hidden md:block w-64 shrink-0 border-border/60 shadow-sm h-fit">
            <CardHeader className="pb-4"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
            <CardContent><FiltersContent {...filterProps} /></CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Loading skeleton */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[4/3]" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <Card className="border-destructive/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="font-medium text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => fetchCars()}>Retry</Button>
              </CardContent>
            </Card>
          )}

          {/* Grid view */}
          {!loading && !error && viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          {/* Table view */}
          {!loading && !error && viewMode === "table" && (
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[72px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Fuel</TableHead>
                      <TableHead>Transmission</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <div className="relative h-10 w-16 overflow-hidden rounded-md bg-muted">
                            {car.images && (
                              <Image src={car.images} alt={car.name} fill className="object-cover" sizes="64px" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{car.name}</TableCell>
                        <TableCell>{car.brand}</TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{car.mileage.toLocaleString()} km</TableCell>
                        <TableCell><Badge variant="secondary">{car.fuel_type}</Badge></TableCell>
                        <TableCell>{car.transmission}</TableCell>
                        <TableCell>{car.city}</TableCell>
                        <TableCell className="text-right font-semibold">€{car.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* Empty */}
          {!loading && !error && cars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">No cars found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>Reset Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

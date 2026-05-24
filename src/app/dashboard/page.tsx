"use client"

import { useState, useCallback, useRef } from "react"
import {
  Mic, MicOff, Loader2, Zap, Car, Search,
  TrendingUp, PlusCircle, ArrowRight, Volume2,
  AlertTriangle, Sparkles, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { CarCard } from "@/components/dashboard/car-card"
import { aiSearch, voiceSearch } from "@/lib/api/cars"
import { CarResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

const suggestions = [
  { label: "Electric cars under €40k", icon: Zap },
  { label: "Latest BMW listings",       icon: Car },
  { label: "Automatic cars",            icon: Search },
  { label: "Cars from 2023 or newer",   icon: TrendingUp },
]

const featurePills = [
  { icon: Sparkles, label: "AI semantic search" },
  { icon: Mic,      label: "Voice enabled" },
  { icon: Zap,      label: "Real-time listings" },
]

export default function DashboardPage() {
  const [isRecording,  setIsRecording]  = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript,   setTranscript]   = useState("")
  const [aiQuery,      setAiQuery]      = useState("")
  const [textQuery,    setTextQuery]    = useState("")
  const [results,      setResults]      = useState<CarResponse[]>([])
  const [hasSearched,  setHasSearched]  = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])

  function apiErrorMessage(err: unknown, fallback: string): string {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
    return typeof detail === "string" ? detail : fallback
  }

  // ── AI text search ────────────────────────────────────────────────────────
  const runAiSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    setIsProcessing(true)
    setError(null)
    setTranscript(query)
    try {
      const res = await aiSearch(query)
      setResults(res.results)
      setAiQuery(res.query)
      setHasSearched(true)
    } catch (err) {
      setError(apiErrorMessage(err, "Search failed. Make sure the API server is running."))
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleTextSearch = () => {
    if (textQuery.trim()) runAiSearch(textQuery.trim())
  }

  // ── Voice search ──────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null)
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
          setAiQuery(res.query)
          setResults(res.results)
          setHasSearched(true)
        } catch (err) {
          setError(apiErrorMessage(err, "Voice search failed. Please try again."))
        } finally {
          setIsProcessing(false)
        }
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      setError("Microphone access denied or not supported in this browser.")
    }
  }, [])

  const stopRecording = useCallback(() => mediaRecorderRef.current?.stop(), [])

  const clearResults = () => {
    setHasSearched(false)
    setTranscript("")
    setAiQuery("")
    setTextQuery("")
    setResults([])
    setError(null)
  }

  return (
    <div className="relative">

      {/* ── Decorative background ──────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[800px] -translate-x-1/2 rounded-full blur-3xl opacity-[0.08]"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -top-10 -right-32 h-72 w-72 rounded-full blur-3xl opacity-[0.07]"
          style={{ background: "var(--color-chart-2)" }}
        />
        <div
          className="absolute top-28 -left-20 h-52 w-52 rounded-full blur-3xl opacity-[0.05]"
          style={{ background: "var(--color-primary)" }}
        />
      </div>

      <div className="space-y-16 py-10">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary tracking-wide shadow-sm shadow-primary/10">
            <Sparkles className="h-3 w-3" />
            AI-Powered Car Search
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl leading-[1.08]">
            Find your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)" }}
            >
              perfect car
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground max-w-[420px] text-base leading-relaxed">
            Speak or type naturally — our AI understands exactly what you&apos;re looking for
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {featurePills.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 border border-border/60 rounded-full px-3 py-1.5"
              >
                <Icon className="h-3 w-3 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Search hub ────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto w-full space-y-7">

          {/* Mic orb */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Outer decorative ring */}
              <span className={cn(
                "absolute -inset-5 rounded-full border-2 transition-all duration-500",
                isRecording ? "border-red-400/35 animate-pulse" : "border-primary/15"
              )} />
              {/* Middle ring */}
              <span className={cn(
                "absolute -inset-2.5 rounded-full border transition-colors duration-300",
                isRecording ? "border-red-400/20" : "border-primary/10"
              )} />

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="relative flex h-24 w-24 items-center justify-center rounded-full text-primary-foreground transition-all hover:scale-105 active:scale-95 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: isRecording
                    ? "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)"
                    : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)",
                  boxShadow: isRecording
                    ? "0 0 64px rgba(239,68,68,0.4), 0 8px 32px rgba(239,68,68,0.3)"
                    : "0 0 64px color-mix(in oklch, var(--color-primary) 40%, transparent), 0 8px 32px color-mix(in oklch, var(--color-primary) 25%, transparent)",
                }}
              >
                <span
                  className={cn("absolute inset-0 rounded-full opacity-20",
                    isRecording ? "animate-ping bg-red-500" : "animate-ping")}
                  style={!isRecording ? { background: "var(--color-primary)" } : undefined}
                />
                {isProcessing ? (
                  <Loader2 className="relative z-10 h-9 w-9 animate-spin" />
                ) : isRecording ? (
                  <Volume2 className="relative z-10 h-9 w-9" />
                ) : (
                  <Mic className="relative z-10 h-9 w-9 drop-shadow" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground h-4 text-center">
              {isProcessing
                ? "Processing…"
                : isRecording
                ? "Recording — tap to stop"
                : "Tap to search by voice"}
            </p>

            {transcript && (isRecording || isProcessing) && (
              <p className="text-sm font-medium italic text-foreground">"{transcript}"</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-background border border-border/50 rounded-full">
              or type your search
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Text search */}
          <div className={cn(
            "flex items-center rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-200",
            "focus-within:border-primary/60 focus-within:shadow-xl focus-within:shadow-primary/10",
            "border-border/60"
          )}>
            <Sparkles className="h-4 w-4 ml-4 text-muted-foreground/60 shrink-0" />
            <input
              type="text"
              placeholder="e.g. 'Black SUV under €50k' or 'Electric cars in Berlin'"
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleTextSearch() }}
              disabled={isRecording || isProcessing}
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            />
            <button
              onClick={handleTextSearch}
              disabled={!textQuery.trim() || isRecording || isProcessing}
              className={cn(
                "m-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0 transition-all",
                "disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              )}
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)" }}
            >
              {isProcessing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── Suggestion chips ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center space-y-3">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Try asking</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => { setTextQuery(label); runAiSearch(label) }}
                disabled={isRecording || isProcessing}
                className="group flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        {!hasSearched && !isRecording && !isProcessing && (
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">

            <Link
              href="/add-car"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)" }}
                >
                  <PlusCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">List Your Car</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Reach thousands of buyers</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>

            <Link
              href="/browse"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-muted shrink-0">
                  <Search className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Browse Listings</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Filter by brand, price & more</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          </div>
        )}

        {/* ── Error dialog ──────────────────────────────────────────────────── */}
        <Dialog open={!!error} onOpenChange={(open) => { if (!open) setError(null) }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader className="items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle>Something went wrong</DialogTitle>
              <DialogDescription className="text-center">{error}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" onClick={() => setError(null)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        {hasSearched && (
          <div className="space-y-6">

            {/* Results header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-xl font-bold">
                    {results.length} {results.length === 1 ? "car" : "cars"} found
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/8 border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI matched
                  </span>
                </div>
                {transcript && (
                  <p className="text-sm text-muted-foreground italic mt-1">"{transcript}"</p>
                )}
                {aiQuery && aiQuery !== transcript && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-medium text-primary/80">AI searched:</span>
                    {aiQuery}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearResults} className="shrink-0 text-muted-foreground hover:text-foreground">
                Clear
              </Button>
            </div>

            {/* Grid */}
            {results.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((car) => <CarCard key={car.id} car={car} />)}
              </div>
            ) : (
              <Card className="border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <MicOff className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-base">No cars matched your search</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Try rephrasing your query or browse all available listings
                  </p>
                  <Button asChild variant="outline" className="mt-5 gap-2 rounded-xl">
                    <Link href="/browse">Browse all listings <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

"use client"

import { useState, useCallback, useRef } from "react"
import {
  Mic, MicOff, Loader2, Zap, Car, Search,
  TrendingUp, PlusCircle, ArrowRight, Volume2, AlertTriangle,
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

// ── Suggestion chips ───────────────────────────────────────────────────────────
const suggestions = [
  { label: "Electric cars under €40k", icon: Zap },
  { label: "Latest BMW listings",       icon: Car },
  { label: "Automatic cars",            icon: Search },
  { label: "Cars from 2023 or newer",   icon: TrendingUp },
]

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [isRecording,  setIsRecording]  = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript,   setTranscript]   = useState("")
  const [results,      setResults]      = useState<CarResponse[]>([])
  const [hasSearched,  setHasSearched]  = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])

  function apiErrorMessage(err: unknown, fallback: string): string {
    const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
    return typeof detail === "string" ? detail : fallback
  }

  // ── AI text search (for suggestion chips) ─────────────────────────────────
  const runAiSearch = useCallback(async (query: string) => {
    setIsProcessing(true)
    setError(null)
    setTranscript(query)
    try {
      const res = await aiSearch(query)
      setResults(res.results)
      setHasSearched(true)
    } catch (err) {
      setError(apiErrorMessage(err, "Search failed. Make sure the API server is running."))
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // ── Audio recording → voice search ────────────────────────────────────────
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

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const handleMicClick = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const clearResults = () => {
    setHasSearched(false)
    setTranscript("")
    setResults([])
    setError(null)
  }

  return (
    <div className="space-y-10 py-8">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center text-center space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Welcome back
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Find your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)" }}
          >
            perfect car
          </span>
        </h1>
        <p className="text-muted-foreground max-w-sm">
          {isRecording ? "Listening… tap again to stop" : "Tap the mic to speak, or pick a suggestion"}
        </p>
      </div>

      {/* ── Mic button ────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleMicClick}
          disabled={isProcessing}
          className="group relative flex h-28 w-28 items-center justify-center rounded-full text-primary-foreground transition-all hover:scale-105 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: isRecording
              ? "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)"
              : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)",
            boxShadow: isRecording
              ? "0 0 48px rgba(239,68,68,0.4)"
              : "0 0 40px color-mix(in oklch, var(--color-primary) 35%, transparent)",
          }}
        >
          <span
            className={cn("absolute inset-0 rounded-full opacity-20", isRecording ? "animate-ping bg-red-500" : "animate-ping")}
            style={!isRecording ? { background: "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))" } : undefined}
          />
          <span className={cn("absolute -inset-3 rounded-full border animate-pulse", isRecording ? "border-red-400/40" : "border-primary/25")} />

          {isProcessing ? (
            <Loader2 className="relative z-10 h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <Volume2 className="relative z-10 h-10 w-10" />
          ) : (
            <Mic className="relative z-10 h-10 w-10 drop-shadow" />
          )}
        </button>

        <p className="text-sm text-muted-foreground">
          {isProcessing ? "Processing…" : isRecording ? "Recording — tap to stop" : "Tap to speak"}
        </p>

        {/* Live transcript preview */}
        {transcript && (isRecording || isProcessing) && (
          <p className="text-sm font-medium italic text-foreground">"{transcript}"</p>
        )}

      </div>

      {/* ── Error dialog ──────────────────────────────────────────────── */}
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

      {/* ── Suggestions ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center space-y-3">
        <p className="text-xs text-muted-foreground">Try asking:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => runAiSearch(label)}
              disabled={isRecording || isProcessing}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick actions (when no search active) ─────────────────────── */}
      {!hasSearched && !isRecording && !isProcessing && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 rounded-xl px-6">
            <Link href="/add-car">
              <PlusCircle className="h-5 w-5" />
              Add a Car
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl px-6">
            <Link href="/browse">
              Browse Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {hasSearched && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {results.length} {results.length === 1 ? "car" : "cars"} found
              </h2>
              {transcript && (
                <p className="text-sm text-muted-foreground italic">"{transcript}"</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearResults}>Clear</Button>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          ) : (
            <Card className="border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MicOff className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No cars matched your search</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different phrase or browse all listings
                </p>
                <Button asChild variant="outline" className="mt-4 gap-2">
                  <Link href="/browse">Browse all <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

    </div>
  )
}

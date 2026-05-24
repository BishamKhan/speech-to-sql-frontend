"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Loader2, Car, CheckCircle2, Lock, X, ImageIcon,
  FileText, Gauge, Tag, Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { addCar } from "@/lib/api/cars"
import { CarCreate } from "@/lib/api/types"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
import { cn } from "@/lib/utils"
import Image from "next/image"

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:         z.string().min(1, "Name is required"),
  brand:        z.string().min(1, "Brand is required"),
  model:        z.string().min(1, "Model is required"),
  price:        z.coerce.number().min(1, "Price must be greater than 0"),
  year:         z.coerce.number().min(1990, "Year must be 1990 or later").max(new Date().getFullYear() + 1, "Invalid year"),
  city:         z.string().min(1, "City is required"),
  color:        z.string().min(1, "Color is required"),
  mileage:      z.coerce.number().min(0, "Mileage cannot be negative"),
  fuel_type:    z.enum(["Petrol", "Diesel", "Electric", "Hybrid"], { required_error: "Select a fuel type" }),
  transmission: z.enum(["Manual", "Automatic"], { required_error: "Select a transmission" }),
  condition:    z.enum(["New", "Used", "Certified Pre-Owned"], { required_error: "Select a condition" }),
  description:  z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const popularBrands = [
  "Audi", "BMW", "Ford", "Honda", "Lexus",
  "Mercedes", "Porsche", "Tesla", "Toyota", "Volkswagen",
]

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({
  step, icon, title, subtitle, children,
}: {
  step: string
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-3.5 bg-muted/40 border-b border-border/40">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
          {step}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          <div>
            <p className="text-sm font-semibold leading-none">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-6 space-y-5">{children}</CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AddCarPage() {
  const { isAuthenticated, openAuthModal, authModalOpen, closeAuthModal } = useAuth()
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [isSuccess,      setIsSuccess]      = useState(false)
  const [serverError,    setServerError]    = useState("")
  const [imageFile,      setImageFile]      = useState<File | null>(null)
  const [imagePreview,   setImagePreview]   = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formKey,        setFormKey]        = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", brand: "", model: "", year: new Date().getFullYear(),
      city: "", color: "", mileage: undefined, fuel_type: undefined,
      transmission: undefined, condition: undefined, description: "",
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    setServerError("")

    let imageUrl: string | null = null
    if (imageFile) {
      setUploadingImage(true)
      try {
        const result = await uploadToCloudinary(imageFile)
        imageUrl = result.url
      } catch {
        setServerError("Failed to upload image. Please try again.")
        setIsSubmitting(false)
        setUploadingImage(false)
        return
      }
      setUploadingImage(false)
    }

    try {
      const payload: CarCreate = {
        ...data,
        images: imageUrl,
        description: data.description || null,
      }
      await addCar(payload)
      setIsSuccess(true)
      form.reset()
      setFormKey((k) => k + 1)
      clearImage()
      setTimeout(() => setIsSuccess(false), 4000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail
      setServerError(typeof msg === "string" ? msg : "Failed to add car. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <Card className="w-full max-w-sm border-border/60 shadow-lg text-center overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-chart-2))" }} />
          <CardContent className="pt-10 pb-8 space-y-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sign in required</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                You need to be logged in to list a car on the marketplace.
              </p>
            </div>
            <Button
              className="w-full h-11 font-semibold"
              onClick={openAuthModal}
              style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)" }}
            >
              Sign In / Register
            </Button>
          </CardContent>
        </Card>
        <AuthModal open={authModalOpen} onOpenChange={closeAuthModal} />
      </div>
    )
  }

  const isDisabled = isSubmitting || uploadingImage

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--color-primary) 12%, transparent) 0%, color-mix(in oklch, var(--color-chart-2) 6%, transparent) 100%)" }}
      >
        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shrink-0"
            style={{ boxShadow: "0 8px 24px color-mix(in oklch, var(--color-primary) 35%, transparent)" }}
          >
            <Car className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">List Your Car</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete all sections below to publish your listing
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary" className="text-xs gap-1">Free Listing</Badge>
              <Badge variant="secondary" className="text-xs gap-1">Instant Publish</Badge>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-2xl"
          style={{ background: "var(--color-primary)" }} />
        <div className="absolute right-12 -bottom-10 h-28 w-28 rounded-full opacity-20 blur-2xl"
          style={{ background: "var(--color-chart-2)" }} />
      </div>

      {/* ── Alerts ── */}
      {isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Car listed successfully! Your listing is now live.
          </p>
        </div>
      )}

      {serverError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="h-4 w-4 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
          </div>
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      <Form {...form}>
        <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* ── 2-column grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* ── Left column: Listing Info + Pricing & Location ── */}
            <div className="space-y-4">

              <SectionCard step="01" icon={<FileText />} title="Listing Info" subtitle="Title, brand and model">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BMW 3 Series 2022 – Low Mileage, Full Service History" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {popularBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 3 Series, Model S" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </SectionCard>

              <SectionCard step="03" icon={<Tag />} title="Pricing & Location" subtitle="Asking price, city and colour">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asking Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">€</span>
                        <Input type="number" placeholder="35,000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Berlin, Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="color" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colour</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Midnight Black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </SectionCard>

            </div>

            {/* ── Right column: Vehicle Specs + Media & Description ── */}
            <div className="space-y-4">

              <SectionCard step="02" icon={<Gauge />} title="Vehicle Specs" subtitle="Year, mileage and drivetrain">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="mileage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" placeholder="15,000" className="pr-10" {...field} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">km</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField control={form.control} name="fuel_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Petrol","Diesel","Electric","Hybrid"].map((v) => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="transmission" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Used">Used</SelectItem>
                          <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </SectionCard>

              <SectionCard step="04" icon={<Camera />} title="Media & Description" subtitle="Photo and additional details">
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none">Car Photo <span className="text-muted-foreground font-normal">(optional)</span></p>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border/60">
                      <div className="relative aspect-video w-full bg-muted">
                        <Image
                          src={imagePreview}
                          alt="Car preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 960px) 100vw, 480px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/40 bg-muted/30">
                        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{imageFile?.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs shrink-0">Ready</Badge>
                      </div>
                    </div>
                  ) : (
                    <label className={cn(
                      "group flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed",
                      "border-border/60 bg-muted/20 cursor-pointer py-10 gap-3 transition-all",
                      "hover:border-primary/50 hover:bg-primary/5"
                    )}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">Click to upload a photo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — up to 10 MB</p>
                      </div>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                  )}
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Highlight key features, service history, recent upgrades…"
                        className="resize-none min-h-[100px]"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </SectionCard>

            </div>
          </div>

          {/* ── Submit — full width ── */}
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 text-sm",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              !isDisabled && "hover:opacity-90 hover:shadow-lg"
            )}
            style={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)",
              boxShadow: isDisabled ? "none" : "0 4px 20px color-mix(in oklch, var(--color-primary) 30%, transparent)",
            }}
          >
            {uploadingImage ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading image…</>
            ) : isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publishing listing…</>
            ) : (
              <><Car className="h-4 w-4" /> Publish Listing</>
            )}
          </button>

        </form>
      </Form>
    </div>
  )
}

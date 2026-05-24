import { Calendar, Gauge, Settings2, MapPin, CloudMoonRain } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { CarResponse } from "@/lib/api/types"

const fuelColors: Record<string, string> = {
  electric: "bg-white/95 text-emerald-700 border border-emerald-200/80",
  hybrid:   "bg-white/95 text-teal-700 border border-teal-200/80",
  diesel:   "bg-white/95 text-blue-700 border border-blue-200/80",
  petrol:   "bg-white/95 text-orange-700 border border-orange-200/80",
}

export function CarCard({ car }: { car: CarResponse }) {
  const imageUrl = car.images ?? "/placeholder.jpg"
  const fuelClass = fuelColors[car.fuel_type.toLowerCase()] ?? "bg-white/95 text-gray-700 border border-gray-200/80"

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Bottom gradient + price */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <p className="absolute bottom-3 left-3 text-white font-bold text-lg leading-none drop-shadow-lg">
          €{car.price.toLocaleString()}
        </p>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {car.condition ? (
            <span className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm",
              car.condition === "New"
                ? "bg-primary text-primary-foreground"
                : "bg-white/20 text-white border border-white/25"
            )}>
              {car.condition}
            </span>
          ) : <span />}

          <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm", fuelClass)}>
            {car.fuel_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{car.brand}</p>
          <h3 className="font-semibold text-sm leading-snug mt-0.5 line-clamp-1">
            {car.name || `${car.brand} ${car.model}`}
          </h3>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground border-t border-border/50 pt-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />{car.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="h-3 w-3 shrink-0" />{car.mileage.toLocaleString()} km
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3 w-3 shrink-0" />{car.transmission}
          </span>
          {car.color && (
            <span className="flex items-center gap-1.5">
              <CloudMoonRain className="h-3 w-3 shrink-0" />
              {car.color}
            </span>
          )}
          {car.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />{car.city}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

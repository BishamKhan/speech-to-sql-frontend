import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, Fuel, Settings2, MapPin } from "lucide-react"
import Image from "next/image"
import type { CarResponse } from "@/lib/api/types"

interface CarCardProps {
  car: CarResponse
}

export function CarCard({ car }: CarCardProps) {
  const imageUrl = car.images ?? "/placeholder.jpg"

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge className="absolute top-3 right-3 bg-card/90 text-card-foreground hover:bg-card/90">
          {car.fuel_type}
        </Badge>
        {car.condition && (
          <Badge
            className="absolute top-3 left-3"
            variant={car.condition === "New" ? "default" : "secondary"}
          >
            {car.condition}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-tight">
              {car.name || `${car.brand} ${car.model}`}
            </h3>
            <p className="text-xl font-bold text-primary mt-0.5">
              €{car.price.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              <span>{car.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 shrink-0" />
              <span>{car.fuel_type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 shrink-0" />
              <span>{car.transmission}</span>
            </div>
            {car.city && (
              <div className="flex items-center gap-1.5 col-span-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{car.city}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

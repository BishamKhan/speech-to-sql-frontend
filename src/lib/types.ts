export interface Car {
  id: string
  brand: string
  model: string
  price: number
  year: number
  mileage: number
  fuel_type: "Petrol" | "Diesel" | "Electric" | "Hybrid"
  transmission: "Manual" | "Automatic"
  imageUrl: string
}

export interface CarStats {
  totalCars: number
  averagePrice: number
  mostPopularBrand: string
  fuelTypeDistribution: { name: string; value: number }[]
  carsByBrand: { brand: string; count: number }[]
}

export interface VoiceSearchResult {
  transcribedText: string
  generatedSQL: string
  results: Car[]
}

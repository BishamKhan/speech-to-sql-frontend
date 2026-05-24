import { Car, CarStats } from "./types"

export const mockCars: Car[] = [
  {
    id: "1",
    brand: "BMW",
    model: "3 Series",
    price: 35000,
    year: 2022,
    mileage: 15000,
    fuel_type: "Petrol",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop"
  },
  {
    id: "2",
    brand: "Mercedes",
    model: "C-Class",
    price: 42000,
    year: 2023,
    mileage: 8000,
    fuel_type: "Diesel",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop"
  },
  {
    id: "3",
    brand: "Audi",
    model: "A4",
    price: 38000,
    year: 2022,
    mileage: 20000,
    fuel_type: "Petrol",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop"
  },
  {
    id: "4",
    brand: "Tesla",
    model: "Model 3",
    price: 45000,
    year: 2023,
    mileage: 5000,
    fuel_type: "Electric",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop"
  },
  {
    id: "5",
    brand: "Toyota",
    model: "Camry",
    price: 28000,
    year: 2021,
    mileage: 35000,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop"
  },
  {
    id: "6",
    brand: "Honda",
    model: "Civic",
    price: 24000,
    year: 2022,
    mileage: 18000,
    fuel_type: "Petrol",
    transmission: "Manual",
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop"
  },
  {
    id: "7",
    brand: "BMW",
    model: "X5",
    price: 65000,
    year: 2023,
    mileage: 10000,
    fuel_type: "Diesel",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=300&fit=crop"
  },
  {
    id: "8",
    brand: "Volkswagen",
    model: "Golf",
    price: 22000,
    year: 2020,
    mileage: 45000,
    fuel_type: "Petrol",
    transmission: "Manual",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop"
  },
  {
    id: "9",
    brand: "Mercedes",
    model: "E-Class",
    price: 55000,
    year: 2023,
    mileage: 12000,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=300&fit=crop"
  },
  {
    id: "10",
    brand: "Audi",
    model: "e-tron",
    price: 72000,
    year: 2023,
    mileage: 3000,
    fuel_type: "Electric",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&h=300&fit=crop"
  },
  {
    id: "11",
    brand: "Ford",
    model: "Mustang",
    price: 48000,
    year: 2022,
    mileage: 12000,
    fuel_type: "Petrol",
    transmission: "Manual",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop"
  },
  {
    id: "12",
    brand: "Toyota",
    model: "RAV4",
    price: 32000,
    year: 2021,
    mileage: 28000,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400&h=300&fit=crop"
  }
]

export function getCarStats(): CarStats {
  const totalCars = mockCars.length
  const averagePrice = Math.round(mockCars.reduce((sum, car) => sum + car.price, 0) / totalCars)
  
  const brandCounts: Record<string, number> = {}
  const fuelCounts: Record<string, number> = {}
  
  mockCars.forEach(car => {
    brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1
    fuelCounts[car.fuel_type] = (fuelCounts[car.fuel_type] || 0) + 1
  })
  
  const mostPopularBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0][0]
  
  const fuelTypeDistribution = Object.entries(fuelCounts).map(([name, value]) => ({ name, value }))
  const carsByBrand = Object.entries(brandCounts).map(([brand, count]) => ({ brand, count }))
  
  return {
    totalCars,
    averagePrice,
    mostPopularBrand,
    fuelTypeDistribution,
    carsByBrand
  }
}

export const priceHistory = [
  { month: "Jan", avgPrice: 38000 },
  { month: "Feb", avgPrice: 39500 },
  { month: "Mar", avgPrice: 37800 },
  { month: "Apr", avgPrice: 40200 },
  { month: "May", avgPrice: 41000 },
  { month: "Jun", avgPrice: 39800 },
]

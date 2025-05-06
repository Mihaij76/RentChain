"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useProperty } from "../providers/property-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Home, Building, Bed } from "lucide-react"

// Simulăm o bibliotecă de hărți
type MapMarker = {
  id: string
  lat: number
  lng: number
  title: string
  price: number
  type: string
  propertyId: string
}

export default function PropertyMap() {
  const { properties } = useProperty()
  const mapRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Simulăm încărcarea hărții
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Generăm markerii pentru proprietăți
  useEffect(() => {
    if (!properties || properties.length === 0) {
      // Generăm câteva proprietăți de test dacă nu avem niciuna
      const demoProperties = [
        {
          id: "prop_1",
          title: "Apartament modern în centru",
          price: 500,
          type: "apartment",
          available: true,
        },
        {
          id: "prop_2",
          title: "Casă spațioasă cu grădină",
          price: 800,
          type: "house",
          available: true,
        },
        {
          id: "prop_3",
          title: "Garsonieră renovată",
          price: 300,
          type: "studio",
          available: true,
        },
        {
          id: "prop_4",
          title: "Vilă de lux cu piscină",
          price: 1200,
          type: "villa",
          available: true,
        },
        {
          id: "prop_5",
          title: "Cameră în apartament shared",
          price: 200,
          type: "room",
          available: true,
        },
      ]

      // Generăm coordonate aleatorii în jurul Bucureștiului
      const propertyMarkers: MapMarker[] = demoProperties.map((property) => {
        const lat = 44.43 + (Math.random() - 0.5) * 0.1
        const lng = 26.1 + (Math.random() - 0.5) * 0.1

        return {
          id: `marker_${property.id}`,
          lat,
          lng,
          title: property.title,
          price: property.price,
          type: property.type,
          propertyId: property.id,
        }
      })

      setMarkers(propertyMarkers)
    } else {
      // Folosim proprietățile reale
      const propertyMarkers: MapMarker[] = properties
        .filter((property) => property.available)
        .map((property) => {
          // Generăm coordonate aleatorii în jurul Bucureștiului
          const lat = 44.43 + (Math.random() - 0.5) * 0.1
          const lng = 26.1 + (Math.random() - 0.5) * 0.1

          return {
            id: `marker_${property.id}`,
            lat,
            lng,
            title: property.title,
            price: property.price,
            type: property.type,
            propertyId: property.id,
          }
        })

      setMarkers(propertyMarkers)
    }
  }, [properties])

  // Funcție pentru a selecta un marker
  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
  }

  // Funcție pentru a închide popup-ul markerului
  const closeMarkerPopup = () => {
    setSelectedMarker(null)
  }

  // Funcție pentru a căuta pe hartă
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // În aplicația reală, aici am face o căutare pe hartă
    console.log("Searching for:", searchQuery)
  }

  // Funcție pentru a obține tipul de proprietate în română
  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case "apartment":
        return "Apartament"
      case "house":
        return "Casă"
      case "studio":
        return "Garsonieră"
      case "villa":
        return "Vilă"
      case "room":
        return "Cameră"
      default:
        return type
    }
  }

  // Funcție pentru a obține iconița corespunzătoare tipului de proprietate
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "apartment":
        return <Building className="h-4 w-4" />
      case "house":
        return <Home className="h-4 w-4" />
      case "studio":
        return <Building className="h-4 w-4" />
      case "villa":
        return <Home className="h-4 w-4" />
      case "room":
        return <Bed className="h-4 w-4" />
      default:
        return <Home className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hartă Proprietăți</h2>
      </div>

      <div className="flex space-x-2 mb-4">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Caută locație..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button type="submit" onClick={handleSearch}>
          Caută
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Proprietăți disponibile</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="w-full h-[500px] bg-gray-100 relative"
            style={{
              backgroundImage:
                "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/26.1,44.43,11,0/1200x500?access_token=pk.dummy')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Se încarcă harta...</p>
                </div>
              </div>
            )}

            {/* Simulăm markerii pe hartă */}
            {mapLoaded &&
              markers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:z-10"
                  style={{
                    left: `${((marker.lng - 26.05) / 0.1) * 100 + 50}%`,
                    top: `${((44.48 - marker.lat) / 0.1) * 100 + 50}%`,
                  }}
                  onClick={() => handleMarkerClick(marker)}
                >
                  <div className="bg-purple-600 text-white rounded-full p-1 shadow-lg hover:bg-purple-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
              ))}

            {/* Popup pentru marker selectat */}
            {selectedMarker && (
              <div
                className="absolute z-20 bg-white rounded-lg shadow-lg p-4 w-64"
                style={{
                  left: `${((selectedMarker.lng - 26.05) / 0.1) * 100 + 50}%`,
                  top: `${((44.48 - selectedMarker.lat) / 0.1) * 100 + 30}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{selectedMarker.title}</h3>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={closeMarkerPopup}>
                    &times;
                  </Button>
                </div>
                <div className="flex items-center mb-2">
                  <Badge className="mr-2 flex items-center gap-1">
                    {getPropertyTypeIcon(selectedMarker.type)}
                    {getPropertyTypeText(selectedMarker.type)}
                  </Badge>
                  <Badge variant="outline">{selectedMarker.price} SOL/lună</Badge>
                </div>
                <Button size="sm" className="w-full">
                  Vezi detalii
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {markers.map((marker) => (
          <Card key={marker.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium mb-1">{marker.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="flex items-center gap-1">
                      {getPropertyTypeIcon(marker.type)}
                      {getPropertyTypeText(marker.type)}
                    </Badge>
                    <Badge variant="outline">{marker.price} SOL/lună</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {marker.lat.toFixed(3)}, {marker.lng.toFixed(3)}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="p-2" onClick={() => handleMarkerClick(marker)}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

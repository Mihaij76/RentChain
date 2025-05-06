"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  useProperty,
  type PropertyFilter,
  type PropertyAmenity,
  type PropertyType,
} from "../providers/property-provider"
import { useUser } from "../providers/user-provider"
import { useMessage } from "../providers/message-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, MapPin, Bed, Bath, HomeIcon, Check, X, MessageSquare, ArrowRight, Filter, Loader2 } from "lucide-react"

export default function PropertySearch() {
  const { properties, featuredProperties, searchProperties, getPropertyById } = useProperty()
  const { currentUser } = useUser()
  const { startConversation, sendMessage } = useMessage()

  // State pentru căutare
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchProperties>>([])
  const [isSearching, setIsSearching] = useState(false)

  // State pentru filtre
  const [filters, setFilters] = useState<PropertyFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 3])
  const [selectedAmenities, setSelectedAmenities] = useState<PropertyAmenity[]>([])

  // State pentru dialog-uri
  const [selectedProperty, setSelectedProperty] = useState<ReturnType<typeof getPropertyById> | null>(null)
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageSuccess, setMessageSuccess] = useState(false)

  // Efectuăm căutarea inițială
  useEffect(() => {
    setSearchResults(searchProperties("", filters))
  }, [searchProperties, filters])

  // Funcție pentru a efectua căutarea
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setIsSearching(true)

    // Simulăm o întârziere pentru a arăta loading state
    setTimeout(() => {
      setSearchResults(searchProperties(searchQuery, filters))
      setIsSearching(false)
    }, 500)
  }

  // Funcție pentru a actualiza filtrele
  const updateFilters = (newFilters: Partial<PropertyFilter>) => {
    setFilters({ ...filters, ...newFilters })
  }

  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setFilters({})
    setPriceRange([0, 3])
    setSelectedAmenities([])
  }

  // Funcție pentru a deschide dialogul unei proprietăți
  const openPropertyDialog = (propertyId: string) => {
    const property = getPropertyById(propertyId)
    if (property) {
      setSelectedProperty(property)
      setIsPropertyDialogOpen(true)
    }
  }

  // Funcție pentru a deschide dialogul de contact
  const openContactDialog = () => {
    setIsPropertyDialogOpen(false)
    setContactMessage("")
    setMessageSuccess(false)
    setIsContactDialogOpen(true)
  }

  // Funcție pentru a trimite un mesaj proprietarului
  const handleSendMessage = async () => {
    if (!currentUser || !selectedProperty || !contactMessage.trim()) return

    setIsSendingMessage(true)

    try {
      // Inițiem o conversație cu proprietarul
      const conversationId = await startConversation(
        selectedProperty.ownerId,
        selectedProperty.ownerName,
        selectedProperty.ownerAvatar,
        selectedProperty.id,
        selectedProperty.title,
      )

      // Trimitem mesajul
      await sendMessage(conversationId, contactMessage)

      setMessageSuccess(true)

      // Resetăm după 3 secunde
      setTimeout(() => {
        setIsContactDialogOpen(false)
        setMessageSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Funcție pentru a verifica dacă o facilitate este selectată
  const isAmenitySelected = (amenity: PropertyAmenity) => {
    return selectedAmenities.includes(amenity)
  }

  // Funcție pentru a comuta o facilitate
  const toggleAmenity = (amenity: PropertyAmenity) => {
    if (isAmenitySelected(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity))
    } else {
      setSelectedAmenities([...selectedAmenities, amenity])
    }
  }

  // Efectuăm căutarea când se schimbă amenitățile selectate
  useEffect(() => {
    updateFilters({ amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined })
  }, [selectedAmenities])

  // Efectuăm căutarea când se schimbă intervalul de preț
  useEffect(() => {
    updateFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] })
  }, [priceRange])

  // Funcție pentru a formata prețul
  const formatPrice = (price: number) => {
    return `${price} SOL`
  }

  // Funcție pentru a afișa amenitățile
  const renderAmenities = (amenities: PropertyAmenity[]) => {
    const amenityLabels: Record<PropertyAmenity, string> = {
      wifi: "Wi-Fi",
      parking: "Parcare",
      pool: "Piscină",
      gym: "Sală fitness",
      airConditioning: "Aer condiționat",
      heating: "Încălzire",
      washer: "Mașină de spălat",
      dryer: "Uscător",
      kitchen: "Bucătărie",
      tv: "TV",
      elevator: "Lift",
      balcony: "Balcon",
      garden: "Grădină",
      petFriendly: "Pet friendly",
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {amenities.slice(0, 4).map((amenity) => (
          <Badge key={amenity} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {amenityLabels[amenity]}
          </Badge>
        ))}
        {amenities.length > 4 && (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            +{amenities.length - 4}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Secțiunea de căutare */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Caută după locație, tip proprietate..."
                className="pl-9 pr-20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-8" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtre
            {Object.keys(filters).length > 0 && (
              <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtre de căutare</CardTitle>
              <CardDescription>Rafinează rezultatele căutării</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Oraș</Label>
                    <Select
                      value={filters.city || ""}
                      onValueChange={(value) => updateFilters({ city: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toate orașele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate orașele</SelectItem>
                        <SelectItem value="București">București</SelectItem>
                        <SelectItem value="Cluj-Napoca">Cluj-Napoca</SelectItem>
                        <SelectItem value="Timișoara">Timișoara</SelectItem>
                        <SelectItem value="Iași">Iași</SelectItem>
                        <SelectItem value="Brașov">Brașov</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tip proprietate</Label>
                    <Select
                      value={filters.propertyType || ""}
                      onValueChange={(value) => updateFilters({ propertyType: (value as PropertyType) || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toate tipurile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toate tipurile</SelectItem>
                        <SelectItem value="apartment">Apartament</SelectItem>
                        <SelectItem value="house">Casă</SelectItem>
                        <SelectItem value="studio">Garsonieră</SelectItem>
                        <SelectItem value="villa">Vilă</SelectItem>
                        <SelectItem value="room">Cameră</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Dormitoare (minim)</Label>
                    <Select
                      value={filters.bedrooms?.toString() || ""}
                      onValueChange={(value) => updateFilters({ bedrooms: value ? Number.parseInt(value) : undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Orice număr" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Orice număr</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Preț (SOL/lună)</Label>
                      <span className="text-sm text-gray-500">
                        {priceRange[0]} - {priceRange[1] === 3 ? "3+" : priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 3]}
                      max={3}
                      step={0.1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Facilități</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="wifi"
                          checked={isAmenitySelected("wifi")}
                          onCheckedChange={() => toggleAmenity("wifi")}
                        />
                        <Label htmlFor="wifi" className="text-sm">
                          Wi-Fi
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="parking"
                          checked={isAmenitySelected("parking")}
                          onCheckedChange={() => toggleAmenity("parking")}
                        />
                        <Label htmlFor="parking" className="text-sm">
                          Parcare
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="airConditioning"
                          checked={isAmenitySelected("airConditioning")}
                          onCheckedChange={() => toggleAmenity("airConditioning")}
                        />
                        <Label htmlFor="airConditioning" className="text-sm">
                          Aer condiționat
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="balcony"
                          checked={isAmenitySelected("balcony")}
                          onCheckedChange={() => toggleAmenity("balcony")}
                        />
                        <Label htmlFor="balcony" className="text-sm">
                          Balcon
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2 lg:col-span-1">
                  <div className="flex flex-col h-full justify-between">
                    <div className="space-y-2">
                      <Label className="mb-2 block">Mai multe facilități</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pool"
                            checked={isAmenitySelected("pool")}
                            onCheckedChange={() => toggleAmenity("pool")}
                          />
                          <Label htmlFor="pool" className="text-sm">
                            Piscină
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="gym"
                            checked={isAmenitySelected("gym")}
                            onCheckedChange={() => toggleAmenity("gym")}
                          />
                          <Label htmlFor="gym" className="text-sm">
                            Sală fitness
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="petFriendly"
                            checked={isAmenitySelected("petFriendly")}
                            onCheckedChange={() => toggleAmenity("petFriendly")}
                          />
                          <Label htmlFor="petFriendly" className="text-sm">
                            Pet friendly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="elevator"
                            checked={isAmenitySelected("elevator")}
                            onCheckedChange={() => toggleAmenity("elevator")}
                          />
                          <Label htmlFor="elevator" className="text-sm">
                            Lift
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button variant="outline" onClick={resetFilters} className="mr-2">
                        Resetare
                      </Button>
                      <Button onClick={handleSearch}>Aplică filtre</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Proprietăți recomandate */}
      {searchQuery === "" && Object.keys(filters).length === 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Proprietăți recomandate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openPropertyDialog(property.id)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <Badge className="absolute top-2 right-2 bg-purple-500">Recomandat</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}, {property.country}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-gray-700">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bedrooms} dormitoare</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bathrooms} băi</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <HomeIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.size} m²</span>
                    </div>
                  </div>
                  {renderAmenities(property.amenities)}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="font-bold text-lg text-purple-700">
                    {formatPrice(property.price)}
                    <span className="text-sm font-normal text-gray-500">/lună</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Detalii
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rezultate căutare */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {searchQuery || Object.keys(filters).length > 0
            ? `Rezultate căutare (${searchResults.length})`
            : "Toate proprietățile"}
        </h2>

        {searchResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <X className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nicio proprietate găsită</h3>
              <p className="text-gray-500">
                Încercați să modificați criteriile de căutare pentru a găsi proprietăți disponibile.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openPropertyDialog(property.id)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  {property.featured && <Badge className="absolute top-2 right-2 bg-purple-500">Recomandat</Badge>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}, {property.country}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-gray-700">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bedrooms} dormitoare</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bathrooms} băi</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <HomeIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.size} m²</span>
                    </div>
                  </div>
                  {renderAmenities(property.amenities)}
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="font-bold text-lg text-purple-700">
                    {formatPrice(property.price)}
                    <span className="text-sm font-normal text-gray-500">/lună</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Detalii
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog detalii proprietate */}
      <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProperty.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.country}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="aspect-video overflow-hidden rounded-md mb-2">
                    <img
                      src={selectedProperty.images[0] || "/placeholder.svg"}
                      alt={selectedProperty.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {selectedProperty.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProperty.images.slice(1).map((image, index) => (
                        <div key={index} className="aspect-video overflow-hidden rounded-md">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`${selectedProperty.title} ${index + 2}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Detalii proprietate</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedProperty.bedrooms} dormitoare</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedProperty.bathrooms} băi</span>
                      </div>
                      <div className="flex items-center">
                        <HomeIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedProperty.size} m²</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>Disponibil imediat</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg">Descriere</h3>
                    <p className="text-gray-700 mt-1">{selectedProperty.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg">Facilități</h3>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedProperty.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>
                            {amenity === "wifi" && "Wi-Fi"}
                            {amenity === "parking" && "Parcare"}
                            {amenity === "pool" && "Piscină"}
                            {amenity === "gym" && "Sală fitness"}
                            {amenity === "airConditioning" && "Aer condiționat"}
                            {amenity === "heating" && "Încălzire"}
                            {amenity === "washer" && "Mașină de spălat"}
                            {amenity === "dryer" && "Uscător"}
                            {amenity === "kitchen" && "Bucătărie"}
                            {amenity === "tv" && "TV"}
                            {amenity === "elevator" && "Lift"}
                            {amenity === "balcony" && "Balcon"}
                            {amenity === "garden" && "Grădină"}
                            {amenity === "petFriendly" && "Pet friendly"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg">Preț</h3>
                    <div className="flex items-center mt-1">
                      <div className="text-2xl font-bold text-purple-700">
                        {formatPrice(selectedProperty.price)}
                        <span className="text-sm font-normal text-gray-500">/lună</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg">Proprietar</h3>
                    <div className="flex items-center mt-1">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                        <img
                          src={selectedProperty.ownerAvatar || "/placeholder.svg"}
                          alt={selectedProperty.ownerName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{selectedProperty.ownerName}</div>
                        <div className="text-sm text-gray-500">Proprietar</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPropertyDialogOpen(false)}>
                  Închide
                </Button>
                <Button onClick={openContactDialog}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactează proprietarul
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog contact proprietar */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contactează proprietarul</DialogTitle>
            <DialogDescription>
              Trimite un mesaj proprietarului pentru a afla mai multe detalii sau pentru a programa o vizionare.
            </DialogDescription>
          </DialogHeader>

          {messageSuccess ? (
            <div className="py-4 text-center">
              <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Mesaj trimis cu succes!</h3>
              <p className="text-gray-500">Proprietarul va primi mesajul tău și îți va răspunde în curând.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {selectedProperty && (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img
                        src={selectedProperty.ownerAvatar || "/placeholder.svg"}
                        alt={selectedProperty.ownerName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{selectedProperty.ownerName}</div>
                      <div className="text-sm text-gray-500">Proprietar</div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    placeholder="Scrie mesajul tău aici..."
                    rows={5}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleSendMessage} disabled={!contactMessage.trim() || isSendingMessage}>
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Trimite mesaj
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

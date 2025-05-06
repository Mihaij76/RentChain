"use client"

import { useState } from "react"
import { useProperty, type PropertyType, type PropertyAmenity } from "../providers/property-provider"
import { useUser } from "../providers/user-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, HomeIcon, Bed, Bath, MapPin, Check, Edit, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PropertyManagement() {
  const { getMyProperties, addProperty, updateProperty, deleteProperty, togglePropertyAvailability } = useProperty()
  const { currentUser } = useUser()

  // State pentru proprietățile mele
  const myProperties = getMyProperties()

  // State pentru adăugare/editare proprietate
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProperty, setCurrentProperty] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // State pentru formularul de proprietate
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    type: "apartment" as PropertyType,
    address: "",
    city: "",
    country: "România",
    price: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    ],
    amenities: [] as PropertyAmenity[],
    available: true,
    featured: false,
  })

  // Funcție pentru a reseta formularul
  const resetForm = () => {
    setPropertyForm({
      title: "",
      description: "",
      type: "apartment",
      address: "",
      city: "",
      country: "România",
      price: "",
      bedrooms: "",
      bathrooms: "",
      size: "",
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      ],
      amenities: [],
      available: true,
      featured: false,
    })
  }

  // Funcție pentru a deschide dialogul de adăugare
  const openAddDialog = () => {
    resetForm()
    setError(null)
    setSuccess(null)
    setIsAddDialogOpen(true)
  }

  // Funcție pentru a deschide dialogul de editare
  const openEditDialog = (propertyId: string) => {
    const property = myProperties.find((p) => p.id === propertyId)
    if (!property) return

    setPropertyForm({
      title: property.title,
      description: property.description,
      type: property.type,
      address: property.address,
      city: property.city,
      country: property.country,
      price: property.price.toString(),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      size: property.size.toString(),
      images: property.images,
      amenities: property.amenities,
      available: property.available,
      featured: property.featured,
    })

    setCurrentProperty(propertyId)
    setError(null)
    setSuccess(null)
    setIsEditDialogOpen(true)
  }

  // Funcție pentru a deschide dialogul de ștergere
  const openDeleteDialog = (propertyId: string) => {
    setCurrentProperty(propertyId)
    setError(null)
    setIsDeleteDialogOpen(true)
  }

  // Funcție pentru a adăuga o proprietate
  const handleAddProperty = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validare
      if (!propertyForm.title || !propertyForm.description || !propertyForm.address || !propertyForm.city) {
        throw new Error("Completați toate câmpurile obligatorii")
      }

      // Adăugare proprietate
      await addProperty({
        title: propertyForm.title,
        description: propertyForm.description,
        type: propertyForm.type,
        address: propertyForm.address,
        city: propertyForm.city,
        country: propertyForm.country,
        price: Number.parseFloat(propertyForm.price),
        bedrooms: Number.parseInt(propertyForm.bedrooms),
        bathrooms: Number.parseInt(propertyForm.bathrooms),
        size: Number.parseInt(propertyForm.size),
        images: propertyForm.images,
        amenities: propertyForm.amenities,
        available: propertyForm.available,
        featured: propertyForm.featured,
      })

      setSuccess("Proprietate adăugată cu succes!")

      // Închide dialogul după 2 secunde
      setTimeout(() => {
        setIsAddDialogOpen(false)
        resetForm()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare la adăugarea proprietății")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Funcție pentru a actualiza o proprietate
  const handleUpdateProperty = async () => {
    if (!currentProperty) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validare
      if (!propertyForm.title || !propertyForm.description || !propertyForm.address || !propertyForm.city) {
        throw new Error("Completați toate câmpurile obligatorii")
      }

      // Actualizare proprietate
      await updateProperty(currentProperty, {
        title: propertyForm.title,
        description: propertyForm.description,
        type: propertyForm.type,
        address: propertyForm.address,
        city: propertyForm.city,
        country: propertyForm.country,
        price: Number.parseFloat(propertyForm.price),
        bedrooms: Number.parseInt(propertyForm.bedrooms),
        bathrooms: Number.parseInt(propertyForm.bathrooms),
        size: Number.parseInt(propertyForm.size),
        images: propertyForm.images,
        amenities: propertyForm.amenities,
        available: propertyForm.available,
        featured: propertyForm.featured,
      })

      setSuccess("Proprietate actualizată cu succes!")

      // Închide dialogul după 2 secunde
      setTimeout(() => {
        setIsEditDialogOpen(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare la actualizarea proprietății")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Funcție pentru a șterge o proprietate
  const handleDeleteProperty = async () => {
    if (!currentProperty) return

    setLoading(true)
    setError(null)

    try {
      await deleteProperty(currentProperty)
      setIsDeleteDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare la ștergerea proprietății")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Funcție pentru a comuta disponibilitatea unei proprietăți
  const handleToggleAvailability = async (propertyId: string) => {
    try {
      await togglePropertyAvailability(propertyId)
    } catch (err) {
      console.error("Error toggling availability:", err)
    }
  }

  // Funcție pentru a verifica dacă o facilitate este selectată
  const isAmenitySelected = (amenity: PropertyAmenity) => {
    return propertyForm.amenities.includes(amenity)
  }

  // Funcție pentru a comuta o facilitate
  const toggleAmenity = (amenity: PropertyAmenity) => {
    if (isAmenitySelected(amenity)) {
      setPropertyForm({
        ...propertyForm,
        amenities: propertyForm.amenities.filter((a) => a !== amenity),
      })
    } else {
      setPropertyForm({
        ...propertyForm,
        amenities: [...propertyForm.amenities, amenity],
      })
    }
  }

  // Funcție pentru a formata prețul
  const formatPrice = (price: number) => {
    return `${price} SOL`
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proprietățile mele</h2>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Adaugă proprietate
        </Button>
      </div>

      {myProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nu aveți proprietăți</h3>
            <p className="text-gray-500 mb-4">
              Adăugați prima proprietate pentru a începe să primiți cereri de închiriere.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă proprietate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
                <Badge className={`absolute top-2 right-2 ${property.available ? "bg-green-500" : "bg-gray-500"}`}>
                  {property.available ? "Disponibil" : "Indisponibil"}
                </Badge>
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
                <div className="font-bold text-lg text-purple-700 mb-2">
                  {formatPrice(property.price)}
                  <span className="text-sm font-normal text-gray-500">/lună</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <Button
                  variant={property.available ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleAvailability(property.id)}
                >
                  {property.available ? "Marchează indisponibil" : "Marchează disponibil"}
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(property.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => openDeleteDialog(property.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog adăugare proprietate */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Adaugă proprietate nouă</DialogTitle>
            <DialogDescription>Completați detaliile proprietății pentru a o adăuga în platformă.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titlu proprietate *</Label>
                <Input
                  id="title"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                  placeholder="Ex: Apartament modern în centru"
                />
              </div>

              <div>
                <Label htmlFor="description">Descriere *</Label>
                <Textarea
                  id="description"
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  placeholder="Descrieți proprietatea în detaliu..."
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="type">Tip proprietate *</Label>
                <Select
                  value={propertyForm.type}
                  onValueChange={(value) => setPropertyForm({ ...propertyForm, type: value as PropertyType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selectați tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartament</SelectItem>
                    <SelectItem value="house">Casă</SelectItem>
                    <SelectItem value="studio">Garsonieră</SelectItem>
                    <SelectItem value="villa">Vilă</SelectItem>
                    <SelectItem value="room">Cameră</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Adresă *</Label>
                <Input
                  id="address"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  placeholder="Ex: Strada Victoriei 10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Oraș *</Label>
                  <Input
                    id="city"
                    value={propertyForm.city}
                    onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                    placeholder="Ex: București"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Țară *</Label>
                  <Input
                    id="country"
                    value={propertyForm.country}
                    onChange={(e) => setPropertyForm({ ...propertyForm, country: e.target.value })}
                    placeholder="Ex: România"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Preț (SOL/lună) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.1"
                  value={propertyForm.price}
                  onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                  placeholder="Ex: 0.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Dormitoare *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                    placeholder="Ex: 2"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Băi *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                    placeholder="Ex: 1"
                  />
                </div>
                <div>
                  <Label htmlFor="size">Suprafață (m²) *</Label>
                  <Input
                    id="size"
                    type="number"
                    value={propertyForm.size}
                    onChange={(e) => setPropertyForm({ ...propertyForm, size: e.target.value })}
                    placeholder="Ex: 65"
                  />
                </div>
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
                      id="heating"
                      checked={isAmenitySelected("heating")}
                      onCheckedChange={() => toggleAmenity("heating")}
                    />
                    <Label htmlFor="heating" className="text-sm">
                      Încălzire
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={propertyForm.featured}
                  onCheckedChange={(checked) => setPropertyForm({ ...propertyForm, featured: checked === true })}
                />
                <Label htmlFor="featured">Marcați ca proprietate recomandată</Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Eroare</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Succes</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddProperty} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Adaugă proprietate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog editare proprietate */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editare proprietate</DialogTitle>
            <DialogDescription>Actualizați detaliile proprietății.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Titlu proprietate *</Label>
                <Input
                  id="edit-title"
                  value={propertyForm.title}
                  onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descriere *</Label>
                <Textarea
                  id="edit-description"
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Tip proprietate *</Label>
                <Select
                  value={propertyForm.type}
                  onValueChange={(value) => setPropertyForm({ ...propertyForm, type: value as PropertyType })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Selectați tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartament</SelectItem>
                    <SelectItem value="house">Casă</SelectItem>
                    <SelectItem value="studio">Garsonieră</SelectItem>
                    <SelectItem value="villa">Vilă</SelectItem>
                    <SelectItem value="room">Cameră</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-address">Adresă *</Label>
                <Input
                  id="edit-address"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-city">Oraș *</Label>
                  <Input
                    id="edit-city"
                    value={propertyForm.city}
                    onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">Țară *</Label>
                  <Input
                    id="edit-country"
                    value={propertyForm.country}
                    onChange={(e) => setPropertyForm({ ...propertyForm, country: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-price">Preț (SOL/lună) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.1"
                  value={propertyForm.price}
                  onChange={(e) => setPropertyForm({ ...propertyForm, price: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-bedrooms">Dormitoare *</Label>
                  <Input
                    id="edit-bedrooms"
                    type="number"
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bathrooms">Băi *</Label>
                  <Input
                    id="edit-bathrooms"
                    type="number"
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-size">Suprafață (m²) *</Label>
                  <Input
                    id="edit-size"
                    type="number"
                    value={propertyForm.size}
                    onChange={(e) => setPropertyForm({ ...propertyForm, size: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Facilități</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-wifi"
                      checked={isAmenitySelected("wifi")}
                      onCheckedChange={() => toggleAmenity("wifi")}
                    />
                    <Label htmlFor="edit-wifi" className="text-sm">
                      Wi-Fi
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-parking"
                      checked={isAmenitySelected("parking")}
                      onCheckedChange={() => toggleAmenity("parking")}
                    />
                    <Label htmlFor="edit-parking" className="text-sm">
                      Parcare
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-airConditioning"
                      checked={isAmenitySelected("airConditioning")}
                      onCheckedChange={() => toggleAmenity("airConditioning")}
                    />
                    <Label htmlFor="edit-airConditioning" className="text-sm">
                      Aer condiționat
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-heating"
                      checked={isAmenitySelected("heating")}
                      onCheckedChange={() => toggleAmenity("heating")}
                    />
                    <Label htmlFor="edit-heating" className="text-sm">
                      Încălzire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-elevator"
                      checked={isAmenitySelected("elevator")}
                      onCheckedChange={() => toggleAmenity("elevator")}
                    />
                    <Label htmlFor="edit-elevator" className="text-sm">
                      Lift
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-balcony"
                      checked={isAmenitySelected("balcony")}
                      onCheckedChange={() => toggleAmenity("balcony")}
                    />
                    <Label htmlFor="edit-balcony" className="text-sm">
                      Balcon
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={propertyForm.featured}
                  onCheckedChange={(checked) => setPropertyForm({ ...propertyForm, featured: checked === true })}
                />
                <Label htmlFor="edit-featured">Marcați ca proprietate recomandată</Label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Eroare</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Succes</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleUpdateProperty} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Salvează modificările"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ștergere proprietate */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Șterge proprietate</DialogTitle>
            <DialogDescription>
              Sunteți sigur că doriți să ștergeți această proprietate? Această acțiune nu poate fi anulată.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Eroare</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Anulează
            </Button>
            <Button variant="destructive" onClick={handleDeleteProperty} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Șterge proprietatea"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

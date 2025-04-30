"use client"

import { useState } from "react"
import { useAuth } from "../providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Loader2, User, Building, MapPin } from "lucide-react"
import type { UserRole } from "../providers/user-provider"

export default function UserOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user, completeOnboarding } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    role: user?.role || ("tenant" as UserRole),
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.walletAddress || "user"}`,
  })

  // Funcție pentru a genera un avatar aleatoriu
  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10)
    setProfileForm({
      ...profileForm,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`,
    })
  }

  // Funcție pentru a finaliza onboarding-ul
  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validăm datele
      if (!profileForm.name) {
        throw new Error("Numele este obligatoriu")
      }

      // Actualizăm profilul utilizatorului
      const success = await completeOnboarding({
        ...profileForm,
      })

      if (!success) {
        throw new Error("Nu s-a putut actualiza profilul")
      }

      setSuccess(true)

      // După 2 secunde, finalizăm onboarding-ul
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error("Error completing onboarding:", error)
      setError(error instanceof Error ? error.message : "A apărut o eroare la salvarea profilului")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bine ai venit la RentChain!</CardTitle>
            <CardDescription>
              Înainte de a începe, avem nevoie de câteva informații pentru a-ți configura contul.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileForm.avatar || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={generateRandomAvatar}>
                Generează alt avatar
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nume complet *</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Introdu numele tău complet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Locație</Label>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  id="location"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  placeholder="Orașul în care locuiești"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Despre tine</Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Spune-ne câteva cuvinte despre tine..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Selectează rolul tău</Label>
              <RadioGroup
                value={profileForm.role}
                onValueChange={(value) => setProfileForm({ ...profileForm, role: value as UserRole })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="tenant" id="tenant" />
                  <Label htmlFor="tenant" className="cursor-pointer flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Chiriaș - Caut proprietăți de închiriat
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="landlord" id="landlord" />
                  <Label htmlFor="landlord" className="cursor-pointer flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Proprietar - Ofer proprietăți spre închiriere
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="cursor-pointer flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <Building className="h-4 w-4 mr-2" />
                    Ambele - Sunt atât chiriaș, cât și proprietar
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Eroare</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Profil creat cu succes!</AlertTitle>
                <AlertDescription>Vei fi redirecționat în curând...</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                "Finalizează"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

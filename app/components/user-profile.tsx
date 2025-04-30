"use client"

import { useState, useEffect } from "react"
import { useUser } from "../providers/user-provider"
import { useWallet } from "../providers/wallet-provider"
import { useAuth } from "../providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Copy, ExternalLink, Loader2, Shield, User, Building } from "lucide-react"
import { useContract } from "./contract-provider"
import type { UserRole } from "../providers/user-provider"

export default function UserProfile() {
  const { currentUser, updateUserProfile } = useUser()
  const { publicKey, balance, signMessage } = useWallet()
  const { contracts } = useContract()
  const { updateUserRole } = useAuth()

  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    location: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || "tenant")
  const [roleChangeSuccess, setRoleChangeSuccess] = useState(false)

  // Inițializăm formularul cu datele utilizatorului curent
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
      })
      setSelectedRole(currentUser.role)
    }
  }, [currentUser])

  // Funcție pentru a copia adresa portofelului în clipboard
  const copyWalletAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
    }
  }

  // Funcție pentru a salva modificările profilului
  const handleSaveProfile = async () => {
    if (!currentUser) return

    setIsSaving(true)
    try {
      // Simulăm o întârziere pentru a arăta starea de încărcare
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await updateUserProfile({
        ...profileForm,
      })

      setSaveSuccess(true)
      setIsEditing(false)

      // Resetăm mesajul de succes după 3 secunde
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Funcție pentru schimbarea rolului utilizatorului
  const handleRoleChange = async () => {
    setIsSaving(true)
    try {
      const success = await updateUserRole(selectedRole)

      if (success) {
        setRoleChangeSuccess(true)
        setIsChangingRole(false)

        // Resetăm mesajul de succes după 3 secunde
        setTimeout(() => {
          setRoleChangeSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error changing role:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Funcție pentru verificarea on-chain a identității
  const verifyOnChain = async () => {
    if (!publicKey || !signMessage) return

    setIsVerifying(true)
    setVerificationError(null)

    try {
      // Creăm un mesaj pentru semnare
      const message = `Verify my identity on RentChain: ${publicKey}`

      // Semnăm mesajul cu Phantom Wallet
      const signature = await signMessage(message)

      if (!signature) {
        throw new Error("Failed to sign verification message")
      }

      // Simulăm verificarea on-chain
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // În aplicația reală, aici am trimite semnătura către un backend care ar verifica
      // semnătura pe blockchain și ar actualiza statusul utilizatorului

      setIsVerified(true)
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  // Statistici pentru utilizator
  const userStats = {
    contractsCreated: contracts.filter((c) => c.owner === publicKey).length,
    contractsSigned: contracts.filter((c) => c.tenant === publicKey && c.isSigned).length,
    activeContracts: contracts.filter((c) => (c.owner === publicKey || c.tenant === publicKey) && c.isActive).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Profilul meu</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Editează profilul</Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Anulează
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                "Salvează modificările"
              )}
            </Button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Succes!</AlertTitle>
          <AlertDescription>Profilul tău a fost actualizat cu succes.</AlertDescription>
        </Alert>
      )}

      {roleChangeSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Succes!</AlertTitle>
          <AlertDescription>Rolul tău a fost actualizat cu succes.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Informații profil</TabsTrigger>
          <TabsTrigger value="wallet">Portofel & Verificare</TabsTrigger>
          <TabsTrigger value="stats">Statistici</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Fotografie profil</CardTitle>
                <CardDescription>Imaginea ta de profil în aplicație</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
                  <AvatarFallback className="text-2xl">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium text-lg">{currentUser?.name}</p>
                  <p className="text-sm text-gray-500">
                    {currentUser?.role === "landlord"
                      ? "Proprietar"
                      : currentUser?.role === "tenant"
                        ? "Chiriaș"
                        : "Proprietar & Chiriaș"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informații personale</CardTitle>
                <CardDescription>Actualizează-ți informațiile personale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nume complet</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografie</Label>
                  <Input
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Locație</Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Rolul tău</Label>
                    {!isChangingRole ? (
                      <Button variant="outline" size="sm" onClick={() => setIsChangingRole(true)}>
                        Schimbă rolul
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsChangingRole(false)}>
                        Anulează
                      </Button>
                    )}
                  </div>

                  {!isChangingRole ? (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="flex items-center">
                        {currentUser?.role === "landlord" ? (
                          <>
                            <Building className="h-4 w-4 mr-2" />
                            Proprietar
                          </>
                        ) : currentUser?.role === "tenant" ? (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Chiriaș
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            <Building className="h-4 w-4 mr-2" />
                            Proprietar & Chiriaș
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value as UserRole)}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="tenant" id="change-tenant" />
                          <Label htmlFor="change-tenant" className="cursor-pointer flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Chiriaș - Caut proprietăți de închiriat
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="landlord" id="change-landlord" />
                          <Label htmlFor="change-landlord" className="cursor-pointer flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Proprietar - Ofer proprietăți spre închiriere
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value="both" id="change-both" />
                          <Label htmlFor="change-both" className="cursor-pointer flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <Building className="h-4 w-4 mr-2" />
                            Ambele - Sunt atât chiriaș, cât și proprietar
                          </Label>
                        </div>
                      </RadioGroup>

                      <Button onClick={handleRoleChange} disabled={isSaving} className="w-full">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Se salvează...
                          </>
                        ) : (
                          "Actualizează rolul"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informații portofel</CardTitle>
                <CardDescription>Detalii despre portofelul tău Phantom conectat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresă portofel</Label>
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2 rounded-l-md flex-grow overflow-hidden">
                      <p className="text-sm truncate">{publicKey}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-l-none"
                      onClick={copyWalletAddress}
                      title="Copiază adresa"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Balanță</Label>
                  <div className="bg-gray-100 p-2 rounded-md">
                    <p className="font-medium">{balance} SOL</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("https://explorer.solana.com/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Vezi pe Solana Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verificare identitate</CardTitle>
                <CardDescription>Verifică-ți identitatea on-chain pentru mai multă credibilitate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-4">
                    <Shield className={`h-5 w-5 mr-2 ${isVerified ? "text-green-500" : "text-gray-400"}`} />
                    <h3 className="font-medium">Status verificare</h3>
                  </div>

                  {isVerified ? (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verificat</Badge>
                      <p className="text-sm text-gray-600">Identitatea ta a fost verificată on-chain</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        Verificarea identității tale on-chain crește încrederea altor utilizatori și deblochează
                        funcționalități suplimentare.
                      </p>

                      {verificationError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertTitle>Eroare la verificare</AlertTitle>
                          <AlertDescription>{verificationError}</AlertDescription>
                        </Alert>
                      )}

                      <Button onClick={verifyOnChain} disabled={isVerifying} className="w-full">
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Se verifică...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Verifică identitatea
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <h3 className="font-medium mb-2">Beneficii verificare</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Credibilitate crescută în fața altor utilizatori
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Prioritate în listările de proprietăți
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      Acces la funcționalități premium
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistici utilizator</CardTitle>
              <CardDescription>Rezumatul activității tale pe platformă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-purple-600 text-sm font-medium">Contracte create</p>
                  <p className="text-3xl font-bold">{userStats.contractsCreated}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-600 text-sm font-medium">Contracte semnate</p>
                  <p className="text-3xl font-bold">{userStats.contractsSigned}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-green-600 text-sm font-medium">Contracte active</p>
                  <p className="text-3xl font-bold">{userStats.activeContracts}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-medium">Activitate recentă</h3>

                <div className="space-y-2">
                  {contracts
                    .filter((c) => c.owner === publicKey || c.tenant === publicKey)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 5)
                    .map((contract, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">Contract #{contract.id.substring(8, 12)}</p>
                          <p className="text-sm text-gray-500">
                            {contract.owner === publicKey ? "Creat de tine" : "Semnat de tine"}
                            {" • "}
                            {new Date(contract.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            contract.isSigned ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {contract.isSigned ? "Semnat" : "În așteptare"}
                        </Badge>
                      </div>
                    ))}

                  {contracts.filter((c) => c.owner === publicKey || c.tenant === publicKey).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nu ai nicio activitate recentă</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

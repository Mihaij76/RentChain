"use client"

import { useState } from "react"
import { useAuth } from "../providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, User, Building } from "lucide-react"
import type { UserRole } from "../providers/user-provider"

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>("tenant")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await login(selectedRole)
      if (success) {
        onLogin()
      } else {
        setError("Autentificarea a eșuat. Te rugăm să încerci din nou.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("A apărut o eroare la autentificare. Te rugăm să încerci din nou.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bine ai venit la RentChain</CardTitle>
            <CardDescription>
              Selectează rolul tău pentru a continua. Poți fi chiriaș, proprietar sau ambele.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
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

            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Continuă"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

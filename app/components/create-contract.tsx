"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { useContract } from "./contract-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreateContract({ onSuccess }: { onSuccess: () => void }) {
  const { publicKey } = useWallet()
  const { createContract } = useContract()

  const [tenantAddress, setTenantAddress] = useState("")
  const [rentAmount, setRentAmount] = useState("")
  const [duration, setDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [contractId, setContractId] = useState<string | null>(null)

  const handleCreateContract = async () => {
    if (!tenantAddress || !rentAmount || !duration) {
      setError("Toate câmpurile sunt obligatorii")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const id = await createContract(tenantAddress, Number.parseFloat(rentAmount), Number.parseInt(duration))

      setContractId(id)
      setSuccess(true)

      // Resetăm formularul
      setTenantAddress("")
      setRentAmount("")
      setDuration("")

      // După 2 secunde, trecem la tab-ul de semnare
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError("A apărut o eroare la crearea contractului")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Creare Contract de Închiriere</h2>
        <p className="text-gray-600 mb-6">
          Completați detaliile pentru a crea un nou contract de închiriere. Contractul va fi stocat pe blockchain-ul
          Solana și va putea fi semnat de chiriaș.
        </p>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
          <h3 className="font-medium text-purple-800 mb-2">Cum funcționează?</h3>
          <ol className="list-decimal list-inside text-sm text-purple-700 space-y-1">
            <li>Completați adresa chiriașului și detaliile contractului</li>
            <li>Creați contractul (va fi semnat cu portofelul dvs.)</li>
            <li>Chiriașul va putea vedea și semna contractul</li>
            <li>După semnare, chiriașul poate efectua plăți prin contract</li>
          </ol>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalii Contract</CardTitle>
          <CardDescription>Completați informațiile pentru noul contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Eroare</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Contract creat cu succes!</AlertTitle>
              <AlertDescription>
                Contractul a fost creat și este gata pentru semnare.
                <div className="mt-1 text-xs">ID Contract: {contractId}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="owner">Proprietar (dvs.)</Label>
            <Input id="owner" value={publicKey || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant">Adresa Chiriașului (Cheie Publică)</Label>
            <Input
              id="tenant"
              placeholder="Eg. 5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV"
              value={tenantAddress}
              onChange={(e) => setTenantAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rent">Suma Chirie (SOL)</Label>
            <Input
              id="rent"
              type="number"
              placeholder="0.5"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (luni)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="12"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCreateContract}
            disabled={loading || !tenantAddress || !rentAmount || !duration}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se procesează...
              </>
            ) : (
              "Creează Contract"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useWallet } from "../providers/wallet-provider"
import { useContract } from "./contract-provider"
import { useToken } from "../providers/token-provider"
import { useTransaction } from "../providers/transaction-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Coins, AlertCircle, CheckCircle2, Loader2, CalendarClock } from "lucide-react"

type AutoPayment = {
  id: string
  contractId: string
  propertyTitle: string
  amount: number
  currency: "SOL" | "RNTY"
  frequency: "monthly" | "weekly" | "biweekly"
  nextPaymentDate: Date
  isActive: boolean
  createdAt: Date
}

export default function AutoPayments() {
  const { publicKey, balance } = useWallet()
  const { contracts } = useContract()
  const { balance: tokenBalance } = useToken()
  const { addTransaction } = useTransaction()

  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newPaymentForm, setNewPaymentForm] = useState({
    contractId: "",
    amount: "",
    currency: "SOL" as "SOL" | "RNTY",
    frequency: "monthly" as "monthly" | "weekly" | "biweekly",
  })

  // Încărcăm plățile automate la montare
  useEffect(() => {
    try {
      // Simulăm încărcarea plăților automate
      const mockAutoPayments: AutoPayment[] = [
        {
          id: "autopay_1",
          contractId: "contract123",
          propertyTitle: "Apartament modern în centru",
          amount: 0.5,
          currency: "SOL",
          frequency: "monthly",
          nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isActive: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
        {
          id: "autopay_2",
          contractId: "contract789",
          propertyTitle: "Casă tradițională renovată",
          amount: 20,
          currency: "RNTY",
          frequency: "monthly",
          nextPaymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          isActive: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        },
      ]

      setAutoPayments(mockAutoPayments)
    } catch (error) {
      console.error("Error loading auto payments:", error)
      setError("Nu s-au putut încărca plățile automate")
    }
  }, [])

  // Funcție pentru a crea o nouă plată automată
  const createAutoPayment = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validăm datele
      if (!newPaymentForm.contractId) {
        throw new Error("Selectați un contract")
      }

      const amount = Number.parseFloat(newPaymentForm.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Suma trebuie să fie un număr pozitiv")
      }

      // Verificăm dacă utilizatorul are suficiente fonduri
      if (newPaymentForm.currency === "SOL" &&(balance ?? 0) < amount) {
        throw new Error("Sold SOL insuficient")
      } else if (newPaymentForm.currency === "RNTY" && tokenBalance < amount) {
        throw new Error("Sold RNTY insuficient")
      }

      // Obținem contractul
      const contract = contracts.find((c) => c.id === newPaymentForm.contractId)
      if (!contract) {
        throw new Error("Contractul nu a fost găsit")
      }

      // Calculăm data următoarei plăți
      const nextPaymentDate = new Date()
      if (newPaymentForm.frequency === "monthly") {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
      } else if (newPaymentForm.frequency === "weekly") {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7)
      } else if (newPaymentForm.frequency === "biweekly") {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 14)
      }

      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Creăm plata automată
      const newAutoPayment: AutoPayment = {
        id: `autopay_${Date.now()}`,
        contractId: newPaymentForm.contractId,
        propertyTitle: `Contract #${newPaymentForm.contractId.substring(8, 12)}`,
        amount,
        currency: newPaymentForm.currency,
        frequency: newPaymentForm.frequency,
        nextPaymentDate,
        isActive: true,
        createdAt: new Date(),
      }

      // Actualizăm starea
      setAutoPayments((prev) => [...prev, newAutoPayment])

      // Resetăm formularul
      setNewPaymentForm({
        contractId: "",
        amount: "",
        currency: "SOL",
        frequency: "monthly",
      })

      setSuccess("Plata automată a fost configurată cu succes")
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating auto payment:", error)
      setError(error instanceof Error ? error.message : "A apărut o eroare la configurarea plății automate")
    } finally {
      setLoading(false)
    }
  }

  // Funcție pentru a activa/dezactiva o plată automată
  const toggleAutoPayment = async (id: string) => {
    try {
      // Actualizăm starea
      setAutoPayments((prev) =>
        prev.map((payment) => (payment.id === id ? { ...payment, isActive: !payment.isActive } : payment)),
      )
    } catch (error) {
      console.error("Error toggling auto payment:", error)
    }
  }

  // Funcție pentru a șterge o plată automată
  const deleteAutoPayment = async (id: string) => {
    try {
      // Actualizăm starea
      setAutoPayments((prev) => prev.filter((payment) => payment.id !== id))
    } catch (error) {
      console.error("Error deleting auto payment:", error)
    }
  }

  // // Funcție pentru a executa manual o plată automată
const executePaymentNow = async (payment: AutoPayment) => {
  setLoading(true)
  setError(null)
  setSuccess(null)

  try {
    // 1) Găsește contractul direct
    const contract = contracts.find((c) => c.id === payment.contractId)
    if (!contract) {
      console.error("Contractul nu a fost găsit", {
        searchedId: payment.contractId,
        availableContracts: contracts.map((c) => c.id),
      })
      throw new Error("Contractul nu a fost găsit")
    }

    // 2) Verifică fondurile
    const solBalance = balance ?? 0
    const rntyBalance = tokenBalance ?? 0
    if (payment.currency === "SOL" && solBalance < payment.amount) {
      throw new Error("Sold SOL insuficient")
    }
    if (payment.currency === "RNTY" && rntyBalance < payment.amount) {
      throw new Error("Sold RNTY insuficient")
    }

    // 3) Simulează delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 4) Trimite tranzacția
    await addTransaction({
      type: "payment",
      from: publicKey!,
      to: contract.owner,
      amount: payment.amount,
      currency: payment.currency,
      description: `Plată chirie pentru ${payment.propertyTitle}`,
      contractId: payment.contractId,
      propertyId: contract.propertyId,
    })

    // 5) Actualizează data următoarei plăți
    setAutoPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? {
              ...p,
              nextPaymentDate: (() => {
                const d = new Date()
                if (p.frequency === "monthly") d.setMonth(d.getMonth() + 1)
                if (p.frequency === "weekly") d.setDate(d.getDate() + 7)
                if (p.frequency === "biweekly") d.setDate(d.getDate() + 14)
                return d
              })(),
            }
          : p
      )
    )

    setSuccess("Plata a fost efectuată cu succes")
  } catch (err) {
    console.error("Error executing payment:", err)
    setError(err instanceof Error ? err.message : "A apărut o eroare la efectuarea plății")
  } finally {
    setLoading(false)
  }
}
    
  // Funcție pentru a formata data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Funcție pentru a obține textul frecvenței
  const getFrequencyText = (frequency: "monthly" | "weekly" | "biweekly") => {
    switch (frequency) {
      case "monthly":
        return "Lunar"
      case "weekly":
        return "Săptămânal"
      case "biweekly":
        return "La două săptămâni"
      default:
        return ""
    }
  }

  // Filtrăm contractele pentru care utilizatorul este chiriaș și sunt semnate
  const availableContracts = contracts.filter((contract) => contract.tenant === publicKey && contract.isSigned)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plăți Automate</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Anulează" : "Configurează plată automată"}
        </Button>
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
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Succes</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Configurare Plată Automată</CardTitle>
            <CardDescription>
              Configurați o plată automată pentru un contract de închiriere. Plata va fi efectuată automat la intervalul
              specificat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          // ...
// În cadrul formularului de creare plată automată:
<div className="space-y-2">
  <Label htmlFor="contract">Contract</Label>
  <Select
    value={newPaymentForm.contractId}
    onValueChange={(value) => setNewPaymentForm({ ...newPaymentForm, contractId: value })}
    disabled={availableContracts.length === 0}
  >
    <SelectTrigger id="contract">
      <SelectValue placeholder="Selectați un contract" />
    </SelectTrigger>
    <SelectContent>
      {availableContracts.length === 0 ? (
        // dacă nu ai contracte, afișezi un mesaj simplu, nu un SelectItem cu value gol
        <div className="p-2 text-sm text-gray-500">Nu aveți contracte disponibile</div>
      ) : (
        // altfel, mapezi fiecare contract pe un SelectItem cu value = contract.id
        availableContracts.map((contract) => (
          <SelectItem key={contract.id} value={contract.id}>
            Contract #{contract.id.substring(8, 12)} – {contract.rentAmount} SOL/lună
          </SelectItem>
        ))
      )}
    </SelectContent>
  </Select>
</div>


            <div className="space-y-2">
              <Label htmlFor="amount">Sumă</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newPaymentForm.amount}
                onChange={(e) => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
                placeholder="Ex: 0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Monedă</Label>
              <Select
                value={newPaymentForm.currency}
                onValueChange={(value) => setNewPaymentForm({ ...newPaymentForm, currency: value as "SOL" | "RNTY" })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selectați moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="RNTY">RNTY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frecvență</Label>
              <Select
                value={newPaymentForm.frequency}
                onValueChange={(value) =>
                  setNewPaymentForm({ ...newPaymentForm, frequency: value as "monthly" | "weekly" | "biweekly" })
                }
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Selectați frecvența" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Lunar</SelectItem>
                  <SelectItem value="biweekly">La două săptămâni</SelectItem>
                  <SelectItem value="weekly">Săptămânal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
              <div className="flex items-center mb-2">
                <CalendarClock className="h-4 w-4 mr-2" />
                <span className="font-medium">Informații despre plățile automate</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Plățile automate sunt efectuate la intervalul specificat</li>
                <li>Puteți dezactiva sau șterge o plată automată oricând</li>
                <li>Veți primi notificări înainte de efectuarea plăților</li>
                <li>Asigurați-vă că aveți suficiente fonduri în portofel</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createAutoPayment} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                "Configurează plata automată"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Plăți automate configurate</h3>

        {autoPayments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CalendarClock className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Nu aveți plăți automate configurate</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {autoPayments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{payment.propertyTitle}</CardTitle>
                    <Badge className={payment.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {payment.isActive ? "Activă" : "Inactivă"}
                    </Badge>
                  </div>
                  <CardDescription>ID: {payment.id}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Coins className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          Sumă: {payment.amount} {payment.currency}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Frecvență: {getFrequencyText(payment.frequency)}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Următoarea plată: {formatDate(payment.nextPaymentDate)}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={payment.isActive}
                          onCheckedChange={() => toggleAutoPayment(payment.id)}
                          id={`active-${payment.id}`}
                        />
                        <Label htmlFor={`active-${payment.id}`}>Activă</Label>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => executePaymentNow(payment)}>
                        Plătește acum
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteAutoPayment(payment.id)}
                  >
                    Șterge
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


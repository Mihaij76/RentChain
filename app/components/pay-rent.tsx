"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { useContract } from "./contract-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, FileText, Calendar, Coins, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function PayRent() {
  const { publicKey, balance } = useWallet()
  const { contracts, payRent } = useContract()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  // Filtrăm contractele care sunt pentru utilizatorul curent (ca chiriaș), sunt semnate și active
  const payableContracts = contracts.filter(
    (contract) => contract.tenant === publicKey && contract.isSigned && contract.isActive,
  )

  const handlePayRent = async (contractId: string, rentAmount: number) => {
    if (balance < rentAmount) {
      setError("Fonduri insuficiente pentru plata chiriei")
      return
    }

    setLoading(true)
    setError(null)
    setSelectedContract(contractId)

    try {
      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      await payRent(contractId)
      setSuccess(true)
      setTransactionId("5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ")
    } catch (err) {
      setError("A apărut o eroare la plata chiriei")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Plată Chirie</h2>
        <p className="text-gray-600">Aici puteți efectua plăți pentru contractele de închiriere semnate.</p>
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
          <AlertTitle>Plată efectuată cu succes!</AlertTitle>
          <AlertDescription>
            Plata chiriei a fost procesată și confirmată pe blockchain.
            <div className="mt-1 text-xs">ID Tranzacție: {transactionId?.substring(0, 20)}...</div>
          </AlertDescription>
        </Alert>
      )}

      {payableContracts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <Coins className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nu există contracte pentru plată</h3>
              <p className="mt-1 text-sm text-gray-500">
                Nu aveți contracte semnate pentru care să puteți efectua plăți.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Contracte disponibile pentru plată</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {payableContracts.map((contract) => (
                <Card key={contract.id} className={selectedContract === contract.id ? "border-purple-400" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Contract de închiriere</CardTitle>
                      <Badge className="bg-green-50 text-green-700 border-green-200">Activ</Badge>
                    </div>
                    <CardDescription>ID: {contract.id.substring(0, 10)}...</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <FileText className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          Proprietar: {contract.owner.substring(0, 6)}...
                          {contract.owner.substring(contract.owner.length - 4)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        <Coins className="mr-2 h-4 w-4 text-purple-500" />
                        <span className="text-purple-700">Chirie: {contract.rentAmount} SOL / lună</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Durată: {contract.durationMonths} luni</span>
                      </div>

                      <div className="pt-2 pb-1">
                        <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md">
                          <span>Balanță portofel:</span>
                          <span className="font-medium">{balance} SOL</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handlePayRent(contract.id, contract.rentAmount)}
                      disabled={loading || balance < contract.rentAmount}
                    >
                      {loading && selectedContract === contract.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se procesează...
                        </>
                      ) : (
                        <>
                          Plătește {contract.rentAmount} SOL
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-medium text-purple-800 mb-2">Despre plățile de chirie</h3>
            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
              <li>Plățile sunt procesate direct prin smart contract-ul de pe blockchain</li>
              <li>Fondurile sunt transferate direct către proprietar</li>
              <li>Toate tranzacțiile sunt înregistrate permanent pe blockchain</li>
              <li>Asigurați-vă că aveți suficiente fonduri în portofel înainte de plată</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

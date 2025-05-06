"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { useContract } from "./contract-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, FileText, Calendar, Coins, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SignContract({ onSuccess }: { onSuccess: () => void }) {
  const { publicKey, signMessage } = useWallet()
  const { contracts, signContract } = useContract()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [isSigningDialogOpen, setIsSigningDialogOpen] = useState(false)
  const [signatureStatus, setSignatureStatus] = useState<"idle" | "signing" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  // Filtrăm contractele care sunt pentru utilizatorul curent (ca chiriaș) și nu sunt semnate
  const availableContracts = contracts.filter((contract) => contract.tenant === publicKey && !contract.isSigned)

  // Contracte semnate de utilizatorul curent
  const signedContracts = contracts.filter((contract) => contract.tenant === publicKey && contract.isSigned)

  // Contracte create de utilizatorul curent (ca proprietar)
  const createdContracts = contracts.filter((contract) => contract.owner === publicKey)

  // Funcție pentru a deschide dialogul de semnare
  const openSigningDialog = (contractId: string) => {
    setSelectedContract(contractId)
    setSignatureStatus("idle")
    setTransactionHash(null)
    setError(null)
    setIsSigningDialogOpen(true)
  }

  // Funcție pentru semnarea contractului cu Phantom Wallet
  const handleSignWithPhantom = async () => {
    if (!selectedContract || !signMessage) {
      setError("Nu se poate semna contractul. Portofelul nu este conectat.")
      return
    }

    setSignatureStatus("signing")
    setError(null)

    try {
      // Obținem contractul selectat
      const contract = contracts.find((c) => c.id === selectedContract)
      if (!contract) {
        throw new Error("Contractul nu a fost găsit")
      }

      // Creăm mesajul pentru semnare
      const message = `Semnez contractul de închiriere #${contract.id} cu proprietarul ${contract.owner} pentru suma de ${contract.rentAmount} SOL pe lună, pe o perioadă de ${contract.durationMonths} luni.`

      // Semnăm mesajul cu Phantom Wallet
      const signature = await signMessage(message)

      if (!signature) {
        throw new Error("Semnarea a eșuat")
      }

      // Simulăm o întârziere pentru a arăta procesul de semnare
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generăm un hash de tranzacție fictiv pentru demo
      const mockTxHash = "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ"
      setTransactionHash(mockTxHash)

      // Actualizăm statusul semnării
      setSignatureStatus("success")

      // Actualizăm contractul în stare
      await signContract(selectedContract)

      // După 2 secunde, închidem dialogul și setăm succesul
      setTimeout(() => {
        setIsSigningDialogOpen(false)
        setSuccess(true)

        // După încă 2 secunde, trecem la tab-ul de plată
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }, 2000)
    } catch (err) {
      console.error("Error signing contract:", err)
      setSignatureStatus("error")
      setError(err instanceof Error ? err.message : "A apărut o eroare la semnarea contractului")
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
        <h2 className="text-2xl font-bold mb-4">Semnare Contracte de Închiriere</h2>
        <p className="text-gray-600">Aici puteți vedea și semna contractele de închiriere în care sunteți chiriaș.</p>
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
          <AlertTitle>Contract semnat cu succes!</AlertTitle>
          <AlertDescription>Contractul a fost semnat și este acum activ. Puteți efectua plăți.</AlertDescription>
        </Alert>
      )}

      {availableContracts.length === 0 && signedContracts.length === 0 && createdContracts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nu există contracte</h3>
              <p className="mt-1 text-sm text-gray-500">Nu aveți contracte disponibile pentru semnare sau plată.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {availableContracts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Contracte de semnat</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {availableContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Contract de închiriere</CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Nesemnat
                        </Badge>
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
                        <div className="flex items-center text-sm">
                          <Coins className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Chirie: {contract.rentAmount} SOL / lună</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Durată: {contract.durationMonths} luni</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Creat la: {formatDate(contract.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => openSigningDialog(contract.id)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Semnează cu Phantom
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {signedContracts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Contracte semnate</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {signedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Contract de închiriere</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Semnat
                        </Badge>
                      </div>
                      <CardDescription>ID: {contract.id.substring(0, 10)}...</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <FileText className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            Proprietar: {contract.owner.substring(0, 6)}...
                            {contract.owner.substring(contract.owner.length - 4)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Coins className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Chirie: {contract.rentAmount} SOL / lună</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Durată: {contract.durationMonths} luni</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {createdContracts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Contracte create de dvs.</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {createdContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Contract de închiriere</CardTitle>
                        <Badge
                          variant={contract.isSigned ? "outline" : "secondary"}
                          className={contract.isSigned ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100"}
                        >
                          {contract.isSigned ? "Semnat" : "În așteptare"}
                        </Badge>
                      </div>
                      <CardDescription>ID: {contract.id.substring(0, 10)}...</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <FileText className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            Chiriaș: {contract.tenant.substring(0, 6)}...
                            {contract.tenant.substring(contract.tenant.length - 4)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Coins className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Chirie: {contract.rentAmount} SOL / lună</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Durată: {contract.durationMonths} luni</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog pentru semnarea contractului cu Phantom */}
      <Dialog open={isSigningDialogOpen} onOpenChange={setIsSigningDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Semnare contract cu Phantom Wallet</DialogTitle>
            <DialogDescription>Semnați contractul folosind portofelul Phantom pentru a-l activa.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {signatureStatus === "idle" && (
              <div className="text-center space-y-4">
                <Shield className="mx-auto h-12 w-12 text-purple-500" />
                <p className="text-sm text-gray-600">
                  Veți semna contractul folosind Phantom Wallet. Acest proces va crea o semnătură digitală care va fi
                  înregistrată pe blockchain-ul Solana.
                </p>
                <Button onClick={handleSignWithPhantom} className="w-full">
                  Semnează cu Phantom
                </Button>
              </div>
            )}

            {signatureStatus === "signing" && (
              <div className="text-center space-y-4">
                <Loader2 className="mx-auto h-12 w-12 text-purple-500 animate-spin" />
                <p className="font-medium">Se procesează semnătura...</p>
                <p className="text-sm text-gray-600">Vă rugăm să confirmați tranzacția în portofelul Phantom.</p>
              </div>
            )}

            {signatureStatus === "success" && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <p className="font-medium">Contract semnat cu succes!</p>
                <p className="text-sm text-gray-600">
                  Semnătura dvs. a fost înregistrată pe blockchain. Contractul este acum activ.
                </p>
                {transactionHash && (
                  <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 break-all">
                    <p className="font-medium mb-1">Hash tranzacție:</p>
                    {transactionHash}
                  </div>
                )}
              </div>
            )}

            {signatureStatus === "error" && (
              <div className="text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <p className="font-medium">Semnarea a eșuat</p>
                <p className="text-sm text-red-600">
                  {error || "A apărut o eroare la semnarea contractului. Vă rugăm să încercați din nou."}
                </p>
                <Button onClick={handleSignWithPhantom} className="w-full">
                  Încearcă din nou
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSigningDialogOpen(false)}
              disabled={signatureStatus === "signing"}
            >
              {signatureStatus === "success" ? "Închide" : "Anulează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

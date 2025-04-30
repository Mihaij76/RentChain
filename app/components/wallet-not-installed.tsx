"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ExternalLink } from "lucide-react"

export default function WalletNotInstalled() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-center">Phantom Wallet nu este instalat</CardTitle>
        <CardDescription className="text-center">
          Pentru a utiliza RentChain, trebuie să instalați Phantom Wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Phantom Wallet este un portofel digital pentru blockchain-ul Solana, care vă permite să vă conectați în
          siguranță la aplicații descentralizate precum RentChain.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-medium">De ce aveți nevoie de Phantom Wallet?</p>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Autentificare sigură fără parole</li>
            <li>Gestionarea proprietăților pe blockchain</li>
            <li>Efectuarea și primirea plăților pentru chirie</li>
            <li>Semnarea contractelor de închiriere</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => window.open("https://phantom.app/", "_blank")}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Instalează Phantom Wallet
        </Button>
      </CardFooter>
    </Card>
  )
}

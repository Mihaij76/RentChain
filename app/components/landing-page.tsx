"use client"
import { Home, FileText, CreditCard, Shield } from "lucide-react"
import WalletConnectButton from "./wallet-connect-button"

export default function LandingPage({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-purple-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RentChain</span>
          </div>
          <WalletConnectButton onSuccess={onConnect} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Contracte de închiriere pe <span className="text-purple-600">blockchain</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Platformă descentralizată pentru gestionarea contractelor de închiriere și plăților, construită pe
          blockchain-ul Solana.
        </p>
        <div className="mt-10">
          <WalletConnectButton onSuccess={onConnect} size="lg" className="bg-purple-600 hover:bg-purple-700" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Contracte Transparente</h3>
            <p className="mt-2 text-gray-500">
              Toate contractele sunt stocate pe blockchain, asigurând transparență și imutabilitate.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Plăți Automate</h3>
            <p className="mt-2 text-gray-500">
              Plățile chiriei sunt procesate automat prin smart contracts, eliminând intermediarii.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Securitate Maximă</h3>
            <p className="mt-2 text-gray-500">
              Tehnologia blockchain asigură securitatea datelor și a tranzacțiilor financiare.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

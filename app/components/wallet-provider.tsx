"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type WalletContextType = {
  publicKey: string | null
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (transaction: any) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState(5) // SOL

  const connect = async () => {
    // Simulăm conectarea la Phantom Wallet
    const mockPublicKey = "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp"
    setPublicKey(mockPublicKey)
    setBalance(5)
    return mockPublicKey
  }

  const disconnect = () => {
    setPublicKey(null)
  }

  const signTransaction = async (transaction: any) => {
    // Simulăm semnarea unei tranzacții
    return "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ"
  }

  return (
    <WalletContext.Provider value={{ publicKey, balance, connect, disconnect, signTransaction }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

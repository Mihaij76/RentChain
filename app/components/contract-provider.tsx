"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { useWallet } from "../providers/wallet-provider"
import { mockDataService, type Contract } from "../lib/mock-data-service"

type ContractContextType = {
  contracts: Contract[]
  createContract: (tenant: string, rentAmount: number, durationMonths: number) => Promise<string>
  signContract: (contractId: string) => Promise<boolean>
  payRent: (contractId: string) => Promise<boolean>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet()
  const [contracts, setContracts] = useState<Contract[]>([])

  // Încărcăm contractele la conectare
  useEffect(() => {
    if (publicKey) {
      // Obținem toate contractele din serviciul de date mock
      const allContracts = mockDataService.getAllContracts()

      // Filtrăm contractele pentru utilizatorul curent (ca proprietar sau chiriaș)
      const userContracts = allContracts.filter(
        (contract) => contract.owner === publicKey || contract.tenant === publicKey,
      )

      setContracts(userContracts)
    } else {
      setContracts([])
    }
  }, [publicKey])

  // Funcție pentru a crea un contract
  const createContract = useCallback(
    async (tenant: string, rentAmount: number, durationMonths: number): Promise<string> => {
      if (!publicKey) throw new Error("Wallet not connected")

      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Creăm contractul în serviciul de date mock
      const newContract = mockDataService.createContract({
        propertyId: `prop_${Math.random().toString(36).substring(2, 9)}`, // ID proprietate aleatoriu pentru demo
        owner: publicKey,
        tenant,
        rentAmount,
        durationMonths,
        isSigned: false,
        isActive: false,
      })

      // Actualizăm starea locală
      setContracts((prev) => [...prev, newContract])

      // Creăm o tranzacție pentru crearea contractului
      mockDataService.createTransaction({
        type: "contract_creation",
        from: publicKey,
        to: tenant,
        amount: 0,
        currency: "SOL",
        description: "Creare contract de închiriere",
        status: "completed",
        txHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
        contractId: newContract.id,
      })

      return newContract.id
    },
    [publicKey],
  )

  // Funcție pentru a semna un contract
  const signContract = useCallback(
    async (contractId: string): Promise<boolean> => {
      if (!publicKey) return false

      // Obținem contractul din serviciul de date mock
      const contract = mockDataService.getContractById(contractId)
      if (!contract) return false

      // Verificăm dacă utilizatorul este chiriașul
      if (contract.tenant !== publicKey) return false

      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Actualizăm contractul în serviciul de date mock
      const updatedContract = mockDataService.updateContract(contractId, {
        isSigned: true,
        isActive: true,
      })
      if (!updatedContract) return false

      // Actualizăm starea locală
      setContracts((prev) => prev.map((c) => (c.id === contractId ? updatedContract : c)))

      // Creăm o tranzacție pentru semnarea contractului
      mockDataService.createTransaction({
        type: "contract_signing",
        from: publicKey,
        to: contract.owner,
        amount: 0,
        currency: "SOL",
        description: "Semnare contract de închiriere",
        status: "completed",
        txHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
        contractId,
      })

      return true
    },
    [publicKey],
  )

  // Funcție pentru a plăti chiria
  const payRent = useCallback(
    async (contractId: string): Promise<boolean> => {
      if (!publicKey) return false

      // Obținem contractul din serviciul de date mock
      const contract = mockDataService.getContractById(contractId)
      if (!contract) return false

      // Verificăm dacă utilizatorul este chiriașul
      if (contract.tenant !== publicKey) return false

      // Verificăm dacă contractul este semnat și activ
      if (!contract.isSigned || !contract.isActive) return false

      // Obținem soldul utilizatorului
      const balance = mockDataService.getTokenBalance(publicKey)
      if (!balance || balance.sol < contract.rentAmount) return false

      // Simulăm o întârziere pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Efectuăm transferul în serviciul de date mock
      const transferResult = mockDataService.transferTokens(publicKey, contract.owner, contract.rentAmount, "SOL")
      if (!transferResult.success) return false

      // Creăm o tranzacție pentru plata chiriei
      mockDataService.createTransaction({
        type: "payment",
        from: publicKey,
        to: contract.owner,
        amount: contract.rentAmount,
        currency: "SOL",
        description: "Plată chirie",
        status: "completed",
        txHash: `tx_${Math.random().toString(36).substring(2, 15)}`,
        contractId,
      })

      return true
    },
    [publicKey],
  )

  // Memoizăm valoarea contextului pentru a preveni re-renderizări inutile
  const contextValue = useMemo(
    () => ({
      contracts,
      createContract,
      signContract,
      payRent,
    }),
    [contracts, createContract, signContract, payRent],
  )

  return <ContractContext.Provider value={contextValue}>{children}</ContractContext.Provider>
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider")
  }
  return context
}

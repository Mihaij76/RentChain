// Acest serviciu simulează stocarea datelor fără a folosi conexiuni externe

import type { UserRole } from "../providers/user-provider"

// Tipuri pentru datele noastre
export type User = {
  id: string
  name: string
  walletAddress: string
  role: UserRole
  avatar: string
  bio?: string
  location?: string
  isVerified?: boolean
  createdAt: Date
}

export type Property = {
  id: string
  title: string
  description: string
  type: string
  address: string
  city: string
  country: string
  price: number
  bedrooms: number
  bathrooms: number
  size: number
  images: string[]
  amenities: string[]
  ownerId: string
  ownerName: string
  ownerAvatar: string
  available: boolean
  featured: boolean
  createdAt: Date
}

export type Contract = {
  id: string
  propertyId: string
  owner: string
  tenant: string
  rentAmount: number
  durationMonths: number
  isSigned: boolean
  isActive: boolean
  createdAt: Date
}

export type Transaction = {
  id: string
  type: string
  from: string
  to: string
  amount: number
  currency: "SOL" | "RNTY"
  timestamp: Date
  description: string
  status: "pending" | "completed" | "failed"
  txHash?: string
  contractId?: string
  propertyId?: string
}

export type AutoPayment = {
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

export type TokenBalance = {
  walletAddress: string
  sol: number
  rnty: number
  lastUpdated: Date
}

// Simulăm o conexiune la blockchain
export const getConnection = () => {
  // Returnăm un obiect mock care simulează o conexiune
  return {
    getMinimumBalanceForRentExemption: async () => 0.01 * 1_000_000_000, // 0.01 SOL în lamports
    getBalance: async () => 5 * 1_000_000_000, // 5 SOL în lamports
    getTokenAccountBalance: async () => ({ value: { uiAmount: 100 } }), // 100 RNTY
    confirmTransaction: async () => ({ value: { err: null } }),
    sendRawTransaction: async () => "mock_transaction_signature",
  }
}

// Stocarea datelor în memorie
class MockDataService {
  private users: Map<string, User> = new Map()
  private properties: Map<string, Property> = new Map()
  private contracts: Map<string, Contract> = new Map()
  private transactions: Map<string, Transaction> = new Map()
  private autoPayments: Map<string, AutoPayment> = new Map()
  private tokenBalances: Map<string, TokenBalance> = new Map()

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Adăugăm câțiva utilizatori de test
    const user1 = {
      id: "user_1",
      name: "Alexandru Popescu",
      walletAddress: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      role: "both" as UserRole,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandru",
      bio: "Investitor imobiliar și chiriaș ocazional",
      location: "București",
      isVerified: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }

    const user2 = {
      id: "user_2",
      name: "Maria Ionescu",
      walletAddress: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      role: "tenant" as UserRole,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      bio: "Profesionist în căutarea unei locuințe confortabile",
      location: "Cluj-Napoca",
      isVerified: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    }

    const user3 = {
      id: "user_3",
      name: "Ion Dumitrescu",
      walletAddress: "7LM4nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      role: "landlord" as UserRole,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ion",
      bio: "Proprietar cu experiență în domeniul imobiliar",
      location: "Timișoara",
      isVerified: true,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    }

    this.users.set(user1.walletAddress, user1)
    this.users.set(user2.walletAddress, user2)
    this.users.set(user3.walletAddress, user3)

    // Adăugăm câteva proprietăți de test
    const property1 = {
      id: "prop_1",
      title: "Apartament modern în centru",
      description:
        "Apartament spațios și modern, complet mobilat și utilat, situat în centrul orașului. Vedere panoramică, acces facil la transport public, magazine și restaurante.",
      type: "apartment",
      address: "Strada Victoriei 10",
      city: "București",
      country: "România",
      price: 0.8,
      bedrooms: 2,
      bathrooms: 1,
      size: 65,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      ],
      amenities: ["wifi", "parking", "airConditioning", "heating", "elevator", "balcony"],
      ownerId: "user_1",
      ownerName: "Alexandru Popescu",
      ownerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandru",
      available: true,
      featured: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }

    const property2 = {
      id: "prop_2",
      title: "Vilă de lux cu piscină",
      description:
        "Vilă spațioasă cu 4 dormitoare, living generos, bucătărie complet utilată, piscină exterioară și grădină amenajată. Perfectă pentru familii.",
      type: "villa",
      address: "Strada Primăverii 25",
      city: "București",
      country: "România",
      price: 2.5,
      bedrooms: 4,
      bathrooms: 3,
      size: 220,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      ],
      amenities: [
        "wifi",
        "parking",
        "pool",
        "airConditioning",
        "heating",
        "washer",
        "dryer",
        "kitchen",
        "tv",
        "garden",
      ],
      ownerId: "user_1",
      ownerName: "Alexandru Popescu",
      ownerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandru",
      available: true,
      featured: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }

    const property3 = {
      id: "prop_3",
      title: "Studio modern în zona universitară",
      description:
        "Studio complet renovat, ideal pentru studenți sau tineri profesioniști. Aproape de universități, transport public și zone de agrement.",
      type: "studio",
      address: "Strada Academiei 15",
      city: "Cluj-Napoca",
      country: "România",
      price: 0.5,
      bedrooms: 1,
      bathrooms: 1,
      size: 35,
      images: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      ],
      amenities: ["wifi", "heating", "kitchen", "tv"],
      ownerId: "user_3",
      ownerName: "Ion Dumitrescu",
      ownerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ion",
      available: true,
      featured: false,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    }

    const property4 = {
      id: "prop_4",
      title: "Casă tradițională renovată",
      description:
        "Casă tradițională complet renovată, îmbinând elementele autentice cu confortul modern. Curte spațioasă și priveliște frumoasă.",
      type: "house",
      address: "Strada Dealului 8",
      city: "Brașov",
      country: "România",
      price: 1.2,
      bedrooms: 3,
      bathrooms: 2,
      size: 120,
      images: [
        "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      ],
      amenities: ["wifi", "parking", "heating", "washer", "dryer", "kitchen", "garden", "petFriendly"],
      ownerId: "user_3",
      ownerName: "Ion Dumitrescu",
      ownerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ion",
      available: true,
      featured: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }

    this.properties.set(property1.id, property1)
    this.properties.set(property2.id, property2)
    this.properties.set(property3.id, property3)
    this.properties.set(property4.id, property4)

    // Adăugăm câteva contracte de test
    const contract1 = {
      id: "contract_1",
      propertyId: "prop_1",
      owner: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      tenant: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      rentAmount: 0.8,
      durationMonths: 12,
      isSigned: true,
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }

    const contract2 = {
      id: "contract_2",
      propertyId: "prop_3",
      owner: "7LM4nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      tenant: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      rentAmount: 0.5,
      durationMonths: 6,
      isSigned: true,
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }

    const contract3 = {
      id: "contract_3",
      propertyId: "prop_4",
      owner: "7LM4nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      tenant: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      rentAmount: 1.2,
      durationMonths: 12,
      isSigned: false,
      isActive: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }

    this.contracts.set(contract1.id, contract1)
    this.contracts.set(contract2.id, contract2)
    this.contracts.set(contract3.id, contract3)

    // Adăugăm câteva tranzacții de test
    const transaction1 = {
      id: "tx_1",
      type: "payment",
      from: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      to: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      amount: 0.8,
      currency: "SOL" as const,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: "Plată chirie pentru luna Mai",
      status: "completed" as const,
      txHash: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ",
      contractId: "contract_1",
      propertyId: "prop_1",
    }

    const transaction2 = {
      id: "tx_2",
      type: "contract_creation",
      from: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      to: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      amount: 0,
      currency: "SOL" as const,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      description: "Creare contract de închiriere",
      status: "completed" as const,
      txHash: "7NT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ",
      contractId: "contract_1",
      propertyId: "prop_1",
    }

    const transaction3 = {
      id: "tx_3",
      type: "payment",
      from: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      to: "7LM4nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      amount: 0.5,
      currency: "SOL" as const,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: "Plată chirie pentru luna Mai",
      status: "completed" as const,
      txHash: "9KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ",
      contractId: "contract_2",
      propertyId: "prop_3",
    }

    const transaction4 = {
      id: "tx_4",
      type: "token_swap",
      from: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      to: "SWAP_ADDRESS",
      amount: 1.0,
      currency: "SOL" as const,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: "Swap 1 SOL to 20 RNTY",
      status: "completed" as const,
      txHash: "8KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAVnDuEJG8zRvyFk6iBVuAqAyyWvfpFHhQiUDbcqwUYGUEZ",
    }

    this.transactions.set(transaction1.id, transaction1)
    this.transactions.set(transaction2.id, transaction2)
    this.transactions.set(transaction3.id, transaction3)
    this.transactions.set(transaction4.id, transaction4)

    // Adăugăm câteva plăți automate de test
    const autoPayment1 = {
      id: "autopay_1",
      contractId: "contract_1",
      propertyTitle: "Apartament modern în centru",
      amount: 0.8,
      currency: "SOL" as const,
      frequency: "monthly" as const,
      nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }

    const autoPayment2 = {
      id: "autopay_2",
      contractId: "contract_2",
      propertyTitle: "Studio modern în zona universitară",
      amount: 0.5,
      currency: "SOL" as const,
      frequency: "monthly" as const,
      nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }

    this.autoPayments.set(autoPayment1.id, autoPayment1)
    this.autoPayments.set(autoPayment2.id, autoPayment2)

    // Adăugăm solduri de token de test
    const balance1 = {
      walletAddress: "8xDrJGHdYWGPVVzEUQAkAJHgC9nxQZMCFEELYPkYxNEp",
      sol: 5.2,
      rnty: 100,
      lastUpdated: new Date(),
    }

    const balance2 = {
      walletAddress: "5KT3nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      sol: 2.8,
      rnty: 50,
      lastUpdated: new Date(),
    }

    const balance3 = {
      walletAddress: "7LM4nMUkB2RLZxrfUj9UX9eFmQxGzQXQqt9WZV8LQxAV",
      sol: 8.5,
      rnty: 200,
      lastUpdated: new Date(),
    }

    this.tokenBalances.set(balance1.walletAddress, balance1)
    this.tokenBalances.set(balance2.walletAddress, balance2)
    this.tokenBalances.set(balance3.walletAddress, balance3)
  }

  // Metode pentru utilizatori
  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  getUserByWalletAddress(walletAddress: string): User | undefined {
    return this.users.get(walletAddress)
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const id = `user_${Math.random().toString(36).substring(2, 9)}`
    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date(),
    }
    this.users.set(userData.walletAddress, newUser)
    return newUser
  }

  updateUser(walletAddress: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(walletAddress)
    if (!user) return undefined

    const updatedUser = { ...user, ...updates }
    this.users.set(walletAddress, updatedUser)
    return updatedUser
  }

  // Metode pentru proprietăți
  getAllProperties(): Property[] {
    return Array.from(this.properties.values())
  }

  getPropertyById(id: string): Property | undefined {
    return this.properties.get(id)
  }

  getPropertiesByOwner(ownerId: string): Property[] {
    return Array.from(this.properties.values()).filter((property) => property.ownerId === ownerId)
  }

  createProperty(propertyData: Omit<Property, "id" | "createdAt">): Property {
    const id = `prop_${Math.random().toString(36).substring(2, 9)}`
    const newProperty: Property = {
      ...propertyData,
      id,
      createdAt: new Date(),
    }
    this.properties.set(id, newProperty)
    return newProperty
  }

  updateProperty(id: string, updates: Partial<Property>): Property | undefined {
    const property = this.properties.get(id)
    if (!property) return undefined

    const updatedProperty = { ...property, ...updates }
    this.properties.set(id, updatedProperty)
    return updatedProperty
  }

  deleteProperty(id: string): boolean {
    return this.properties.delete(id)
  }

  // Metode pentru contracte
  getAllContracts(): Contract[] {
    return Array.from(this.contracts.values())
  }

  getContractById(id: string): Contract | undefined {
    return this.contracts.get(id)
  }

  getContractsByOwner(owner: string): Contract[] {
    return Array.from(this.contracts.values()).filter((contract) => contract.owner === owner)
  }

  getContractsByTenant(tenant: string): Contract[] {
    return Array.from(this.contracts.values()).filter((contract) => contract.tenant === tenant)
  }

  createContract(contractData: Omit<Contract, "id" | "createdAt">): Contract {
    const id = `contract_${Math.random().toString(36).substring(2, 9)}`
    const newContract: Contract = {
      ...contractData,
      id,
      createdAt: new Date(),
    }
    this.contracts.set(id, newContract)
    return newContract
  }

  updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
    const contract = this.contracts.get(id)
    if (!contract) return undefined

    const updatedContract = { ...contract, ...updates }
    this.contracts.set(id, updatedContract)
    return updatedContract
  }

  // Metode pentru tranzacții
  getAllTransactions(): Transaction[] {
    return Array.from(this.transactions.values())
  }

  getTransactionById(id: string): Transaction | undefined {
    return this.transactions.get(id)
  }

  getTransactionsByWallet(walletAddress: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.from === walletAddress || transaction.to === walletAddress,
    )
  }

  createTransaction(transactionData: Omit<Transaction, "id" | "timestamp">): Transaction {
    const id = `tx_${Math.random().toString(36).substring(2, 9)}`
    const newTransaction: Transaction = {
      ...transactionData,
      id,
      timestamp: new Date(),
    }
    this.transactions.set(id, newTransaction)
    return newTransaction
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const transaction = this.transactions.get(id)
    if (!transaction) return undefined

    const updatedTransaction = { ...transaction, ...updates }
    this.transactions.set(id, updatedTransaction)
    return updatedTransaction
  }

  // Metode pentru plăți automate
  getAllAutoPayments(): AutoPayment[] {
    return Array.from(this.autoPayments.values())
  }

  getAutoPaymentById(id: string): AutoPayment | undefined {
    return this.autoPayments.get(id)
  }

  getAutoPaymentsByWallet(walletAddress: string): AutoPayment[] {
    // Găsim contractele în care utilizatorul este chiriaș
    const tenantContracts = this.getContractsByTenant(walletAddress)
    const contractIds = tenantContracts.map((contract) => contract.id)

    // Returnăm plățile automate pentru aceste contracte
    return Array.from(this.autoPayments.values()).filter((payment) => contractIds.includes(payment.contractId))
  }

  createAutoPayment(paymentData: Omit<AutoPayment, "id" | "createdAt">): AutoPayment {
    const id = `autopay_${Math.random().toString(36).substring(2, 9)}`
    const newPayment: AutoPayment = {
      ...paymentData,
      id,
      createdAt: new Date(),
    }
    this.autoPayments.set(id, newPayment)
    return newPayment
  }

  updateAutoPayment(id: string, updates: Partial<AutoPayment>): AutoPayment | undefined {
    const payment = this.autoPayments.get(id)
    if (!payment) return undefined

    const updatedPayment = { ...payment, ...updates }
    this.autoPayments.set(id, updatedPayment)
    return updatedPayment
  }

  deleteAutoPayment(id: string): boolean {
    return this.autoPayments.delete(id)
  }

  // Metode pentru solduri de token
  getTokenBalance(walletAddress: string): TokenBalance | undefined {
    return this.tokenBalances.get(walletAddress)
  }

  updateTokenBalance(walletAddress: string, updates: Partial<TokenBalance>): TokenBalance | undefined {
    const balance = this.tokenBalances.get(walletAddress)
    if (!balance) {
      // Creăm un sold nou dacă nu există
      const newBalance: TokenBalance = {
        walletAddress,
        sol: updates.sol || 0,
        rnty: updates.rnty || 0,
        lastUpdated: new Date(),
      }
      this.tokenBalances.set(walletAddress, newBalance)
      return newBalance
    }

    const updatedBalance = {
      ...balance,
      ...updates,
      lastUpdated: new Date(),
    }
    this.tokenBalances.set(walletAddress, updatedBalance)
    return updatedBalance
  }

  // Simulează un transfer de token
  transferTokens(
    from: string,
    to: string,
    amount: number,
    currency: "SOL" | "RNTY",
  ): { success: boolean; message?: string } {
    const fromBalance = this.tokenBalances.get(from)
    if (!fromBalance) return { success: false, message: "Sender balance not found" }

    // Verificăm dacă expeditorul are suficiente fonduri
    if (currency === "SOL" && fromBalance.sol < amount) {
      return { success: false, message: "Insufficient SOL balance" }
    } else if (currency === "RNTY" && fromBalance.rnty < amount) {
      return { success: false, message: "Insufficient RNTY balance" }
    }

    // Obținem sau creăm soldul destinatarului
    let toBalance = this.tokenBalances.get(to)
    if (!toBalance) {
      toBalance = {
        walletAddress: to,
        sol: 0,
        rnty: 0,
        lastUpdated: new Date(),
      }
    }

    // Efectuăm transferul
    if (currency === "SOL") {
      fromBalance.sol -= amount
      toBalance.sol += amount
    } else {
      fromBalance.rnty -= amount
      toBalance.rnty += amount
    }

    // Actualizăm soldurile
    fromBalance.lastUpdated = new Date()
    toBalance.lastUpdated = new Date()
    this.tokenBalances.set(from, fromBalance)
    this.tokenBalances.set(to, toBalance)

    return { success: true }
  }

  // Simulează un swap între SOL și RNTY
  swapTokens(
    walletAddress: string,
    amount: number,
    fromCurrency: "SOL" | "RNTY",
  ): { success: boolean; message?: string; amountReceived?: number } {
    const balance = this.tokenBalances.get(walletAddress)
    if (!balance) return { success: false, message: "Balance not found" }

    // Rata de schimb: 1 SOL = 20 RNTY
    const exchangeRate = 20

    if (fromCurrency === "SOL") {
      // Verificăm dacă utilizatorul are suficient SOL
      if (balance.sol < amount) {
        return { success: false, message: "Insufficient SOL balance" }
      }

      // Calculăm cantitatea de RNTY primită
      const rntyAmount = amount * exchangeRate

      // Efectuăm swap-ul
      balance.sol -= amount
      balance.rnty += rntyAmount
      balance.lastUpdated = new Date()
      this.tokenBalances.set(walletAddress, balance)

      return { success: true, amountReceived: rntyAmount }
    } else {
      // Verificăm dacă utilizatorul are suficient RNTY
      if (balance.rnty < amount) {
        return { success: false, message: "Insufficient RNTY balance" }
      }

      // Calculăm cantitatea de SOL primită
      const solAmount = amount / exchangeRate

      // Efectuăm swap-ul
      balance.rnty -= amount
      balance.sol += solAmount
      balance.lastUpdated = new Date()
      this.tokenBalances.set(walletAddress, balance)

      return { success: true, amountReceived: solAmount }
    }
  }
}

// Exportăm o instanță singleton a serviciului
export const mockDataService = new MockDataService()

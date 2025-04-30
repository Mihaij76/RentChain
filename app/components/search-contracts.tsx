"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWallet } from "./wallet-provider"
import { useContract } from "./contract-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, Coins, Search, Filter, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

type Contract = {
  id: string
  owner: string
  tenant: string
  rentAmount: number
  durationMonths: number
  isSigned: boolean
  isActive: boolean
  createdAt: Date
}

export default function SearchContracts() {
  const { publicKey } = useWallet()
  const { contracts, searchContracts } = useContract()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "signed" | "unsigned">("all")
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "tenant">("all")
  const [searchResults, setSearchResults] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Efectuăm căutarea când se schimbă query-ul sau filtrele
  useEffect(() => {
    const results = searchContracts(searchQuery, {
      status: statusFilter,
      role: roleFilter,
    })
    setSearchResults(results)
  }, [searchQuery, statusFilter, roleFilter, searchContracts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const results = searchContracts(searchQuery, {
      status: statusFilter,
      role: roleFilter,
    })
    setSearchResults(results)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setRoleFilter("all")
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const viewContractDetails = (contract: Contract) => {
    setSelectedContract(contract)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Căutare Contracte</h2>
        <p className="text-gray-600 mb-6">
          Căutați contracte după ID, adresă proprietar, adresă chiriaș sau alte detalii.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtre de căutare</CardTitle>
          <CardDescription>Introduceți criteriile de căutare pentru a găsi contracte specifice</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Căutare după ID, adresă, sumă..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="signed">Semnate</SelectItem>
                    <SelectItem value="unsigned">Nesemnate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="owner">Proprietar</SelectItem>
                    <SelectItem value="tenant">Chiriaș</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={clearSearch}>
                Resetare filtre
              </Button>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Caută
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-medium mb-3">Rezultate căutare ({searchResults.length})</h3>

        {searchResults.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Niciun contract găsit</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Încercați să modificați criteriile de căutare pentru a găsi contracte.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((contract) => (
              <Card
                key={contract.id}
                className="hover:border-purple-200 transition-colors cursor-pointer"
                onClick={() => viewContractDetails(contract)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Contract #{contract.id.substring(8, 12)}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        contract.isSigned
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {contract.isSigned ? "Semnat" : "Nesemnat"}
                    </Badge>
                  </div>
                  <CardDescription>ID: {contract.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Proprietar: {truncateAddress(contract.owner)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Chiriaș: {truncateAddress(contract.tenant)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Coins className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Chirie: {contract.rentAmount} SOL / lună</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Creat la: {formatDate(contract.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalii Contract</DialogTitle>
            <DialogDescription>Informații complete despre contractul selectat</DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">ID Contract:</div>
                <div className="text-sm">{selectedContract.id}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Status:</div>
                <Badge
                  variant="outline"
                  className={
                    selectedContract.isSigned
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }
                >
                  {selectedContract.isSigned ? "Semnat" : "Nesemnat"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Proprietar:</div>
                <div className="text-sm">{truncateAddress(selectedContract.owner)}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Chiriaș:</div>
                <div className="text-sm">{truncateAddress(selectedContract.tenant)}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Sumă chirie:</div>
                <div className="text-sm">{selectedContract.rentAmount} SOL / lună</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Durată contract:</div>
                <div className="text-sm">{selectedContract.durationMonths} luni</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Data creării:</div>
                <div className="text-sm">{formatDate(selectedContract.createdAt)}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Activ:</div>
                <Badge
                  variant="outline"
                  className={
                    selectedContract.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {selectedContract.isActive ? "Da" : "Nu"}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Închide
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useTransaction, type Transaction, type TransactionType } from "../providers/transaction-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowDownUp, Check, Clock, Coins, ExternalLink, FileText, Filter, Search, X } from "lucide-react"

export default function TransactionHistory() {
  const { transactions } = useTransaction()

  const [activeTab, setActiveTab] = useState<"all" | TransactionType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Filtrăm tranzacțiile în funcție de tab, căutare și filtre
  const filteredTransactions = transactions.filter((transaction) => {
    // Filtrare după tab
    if (activeTab !== "all" && transaction.type !== activeTab) {
      return false
    }

    // Filtrare după status
    if (statusFilter !== "all" && transaction.status !== statusFilter) {
      return false
    }

    // Filtrare după căutare
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        transaction.id.toLowerCase().includes(query) ||
        transaction.from.toLowerCase().includes(query) ||
        transaction.to.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        (transaction.txHash && transaction.txHash.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Sortăm tranzacțiile
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.timestamp.getTime() - a.timestamp.getTime()
    } else {
      return a.timestamp.getTime() - b.timestamp.getTime()
    }
  })

  // Funcție pentru a deschide dialogul cu detalii
  const openTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDialogOpen(true)
  }

  // Funcție pentru a formata data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Funcție pentru a obține textul tipului de tranzacție
  const getTransactionTypeText = (type: TransactionType) => {
    switch (type) {
      case "payment":
        return "Plată chirie"
      case "contract_creation":
        return "Creare contract"
      case "contract_signing":
        return "Semnare contract"
      case "deposit":
        return "Depozit garanție"
      case "refund":
        return "Rambursare"
      case "token_swap":
        return "Schimb token"
      default:
        return type
    }
  }

  // Funcție pentru a obține culoarea badge-ului pentru status
  const getStatusBadgeColor = (status: "pending" | "completed" | "failed") => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return ""
    }
  }

  // Funcție pentru a obține textul statusului
  const getStatusText = (status: "pending" | "completed" | "failed") => {
    switch (status) {
      case "pending":
        return "În așteptare"
      case "completed":
        return "Finalizată"
      case "failed":
        return "Eșuată"
      default:
        return status
    }
  }

  // Funcție pentru a obține iconul pentru tipul de tranzacție
  const getTransactionTypeIcon = (type: TransactionType) => {
    switch (type) {
      case "payment":
        return <Coins className="h-4 w-4" />
      case "contract_creation":
        return <FileText className="h-4 w-4" />
      case "contract_signing":
        return <Check className="h-4 w-4" />
      case "deposit":
        return <Coins className="h-4 w-4" />
      case "refund":
        return <ArrowDownUp className="h-4 w-4" />
      case "token_swap":
        return <ArrowDownUp className="h-4 w-4" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  // Funcție pentru a trunca adresa
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Istoric Tranzacții</h2>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="all">Toate</TabsTrigger>
          <TabsTrigger value="payment">Plăți</TabsTrigger>
          <TabsTrigger value="contract_creation">Contracte</TabsTrigger>
          <TabsTrigger value="contract_signing">Semnături</TabsTrigger>
          <TabsTrigger value="deposit">Depozite</TabsTrigger>
          <TabsTrigger value="refund">Rambursări</TabsTrigger>
          <TabsTrigger value="token_swap">Schimburi</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Caută după ID, adresă, descriere..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="pending">În așteptare</SelectItem>
              <SelectItem value="completed">Finalizate</SelectItem>
              <SelectItem value="failed">Eșuate</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
            <SelectTrigger className="w-[140px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sortare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Cele mai noi</SelectItem>
              <SelectItem value="oldest">Cele mai vechi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tranzacții ({sortedTransactions.length})</CardTitle>
          <CardDescription>Istoricul tranzacțiilor efectuate pe platformă</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <X className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Nu au fost găsite tranzacții</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => openTransactionDetails(transaction)}
                >
                  <div className="flex items-center mb-2 md:mb-0">
                    <div
                      className={`p-2 rounded-full mr-3 ${
                        transaction.type === "payment"
                          ? "bg-blue-100"
                          : transaction.type === "contract_creation"
                            ? "bg-purple-100"
                            : transaction.type === "contract_signing"
                              ? "bg-green-100"
                              : transaction.type === "deposit"
                                ? "bg-yellow-100"
                                : transaction.type === "refund"
                                  ? "bg-orange-100"
                                  : "bg-gray-100"
                      }`}
                    >
                      {getTransactionTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getTransactionTypeText(transaction.type)}</p>
                      <p className="text-sm text-gray-500">{transaction.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {transaction.amount} {transaction.currency}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                    </div>
                    <Badge variant="outline" className={getStatusBadgeColor(transaction.status)}>
                      {getStatusText(transaction.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pentru detalii tranzacție */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalii Tranzacție</DialogTitle>
            <DialogDescription>Informații complete despre tranzacție</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">ID Tranzacție:</div>
                <div className="text-sm">{selectedTransaction.id}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Tip:</div>
                <Badge
                  variant="outline"
                  className={
                    selectedTransaction.type === "payment"
                      ? "bg-blue-100 text-blue-800"
                      : selectedTransaction.type === "contract_creation"
                        ? "bg-purple-100 text-purple-800"
                        : selectedTransaction.type === "contract_signing"
                          ? "bg-green-100 text-green-800"
                          : selectedTransaction.type === "deposit"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedTransaction.type === "refund"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                  }
                >
                  {getTransactionTypeText(selectedTransaction.type)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Status:</div>
                <Badge variant="outline" className={getStatusBadgeColor(selectedTransaction.status)}>
                  {getStatusText(selectedTransaction.status)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>De la:</Label>
                <div className="bg-gray-100 p-2 rounded-md text-sm">{selectedTransaction.from}</div>
              </div>

              <div className="space-y-2">
                <Label>Către:</Label>
                <div className="bg-gray-100 p-2 rounded-md text-sm">{selectedTransaction.to}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Sumă:</div>
                <div className="text-lg font-bold">
                  {selectedTransaction.amount} {selectedTransaction.currency}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-medium">Data:</div>
                <div className="text-sm">{formatDate(selectedTransaction.timestamp)}</div>
              </div>

              <div className="space-y-2">
                <Label>Descriere:</Label>
                <div className="bg-gray-100 p-2 rounded-md text-sm">{selectedTransaction.description}</div>
              </div>

              {selectedTransaction.txHash && (
                <div className="space-y-2">
                  <Label>Hash tranzacție:</Label>
                  <div className="bg-gray-100 p-2 rounded-md text-xs break-all">{selectedTransaction.txHash}</div>
                </div>
              )}

              {selectedTransaction.contractId && (
                <div className="flex justify-between items-center">
                  <div className="font-medium">ID Contract:</div>
                  <div className="text-sm">{selectedTransaction.contractId}</div>
                </div>
              )}

              {selectedTransaction.propertyId && (
                <div className="flex justify-between items-center">
                  <div className="font-medium">ID Proprietate:</div>
                  <div className="text-sm">{selectedTransaction.propertyId}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {selectedTransaction?.txHash && (
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a
                  href={`https://explorer.solana.com/tx/${selectedTransaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vezi pe Explorer
                </a>
              </Button>
            )}
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Închide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useUser } from "../providers/user-provider"
import { useWallet } from "../providers/wallet-provider"
import { useAuth } from "../providers/auth-provider"
import { useMessage } from "../providers/message-provider"
import { useToken } from "../providers/token-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Home, LogOut, MessageSquare, UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import PropertySearch from "./property-search"
import PropertyManagement from "./property-management"
import Messages from "./messages"
import UserProfile from "./user-profile"
import AutoPayments from "./auto-payments"
import PropertyMap from "./property-map"
import TransactionHistory from "./transaction-history"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { currentUser } = useUser()
  const { logout, isLandlord, isTenant } = useAuth()
  const { balance } = useWallet()
  const { getUnreadCount } = useMessage()
  const { tokenBalance, swapSolToRnty, swapRntyToSol, getTokenPrice } = useToken()
  const [activeTab, setActiveTab] = useState("search")

  const [swapForm, setSwapForm] = useState({
    amount: "",
    type: "buy" as "buy" | "sell",
  })
  const [swapLoading, setSwapLoading] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null)

  const handleLogout = async () => {
    logout()
    onLogout()
  }

  const unreadCount = getUnreadCount()

  // Funcție pentru a efectua swap-ul
  const handleSwap = async () => {
    setSwapLoading(true)
    setSwapError(null)
    setSwapSuccess(null)

    try {
      const amount = Number.parseFloat(swapForm.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Suma trebuie să fie un număr pozitiv")
      }

      let success = false
      if (swapForm.type === "buy") {
        // Cumpărăm RNTY cu SOL
        success = await swapSolToRnty(amount)
        if (success) {
          setSwapSuccess(`Ai cumpărat cu succes ${(amount * 20).toFixed(2)} RNTY pentru ${amount} SOL`)
        }
      } else {
        // Vindem RNTY pentru SOL
        success = await swapRntyToSol(amount)
        if (success) {
          setSwapSuccess(`Ai vândut cu succes ${amount} RNTY pentru ${(amount / 20).toFixed(2)} SOL`)
        }
      }

      if (!success) {
        throw new Error("Tranzacția a eșuat")
      }

      // Resetăm formularul
      setSwapForm({
        amount: "",
        type: "buy",
      })
    } catch (error) {
      console.error("Error swapping tokens:", error)
      setSwapError(error instanceof Error ? error.message : "A apărut o eroare la efectuarea tranzacției")
    } finally {
      setSwapLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Home className="h-6 w-6 text-purple-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">RentChain</span>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="relative" onClick={() => setActiveTab("messages")}>
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              </Button>
            )}
            <div className="flex items-center space-x-2">
              {balance !== null && (
                <div className="bg-purple-50 px-3 py-1 rounded-full text-sm text-purple-700">{balance} SOL</div>
              )}
              {tokenBalance !== null && (
                <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">{tokenBalance} RNTY</div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
                      <AvatarFallback>{currentUser?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.walletAddress?.substring(0, 8)}...
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profilul meu</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-8 mb-8">
            {isTenant() && <TabsTrigger value="search">Căutare</TabsTrigger>}
            {isLandlord() && <TabsTrigger value="manage">Proprietăți</TabsTrigger>}
            <TabsTrigger value="messages">Mesaje</TabsTrigger>
            <TabsTrigger value="map">Hartă</TabsTrigger>
            {isTenant() && <TabsTrigger value="autopay">Plăți Auto</TabsTrigger>}
            <TabsTrigger value="transactions">Tranzacții</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          {isTenant() && (
            <TabsContent value="search">
              <PropertySearch />
            </TabsContent>
          )}

          {isLandlord() && (
            <TabsContent value="manage">
              <PropertyManagement />
            </TabsContent>
          )}

          <TabsContent value="messages">
            <Messages />
          </TabsContent>

          <TabsContent value="map">
            <PropertyMap />
          </TabsContent>

          {isTenant() && (
            <TabsContent value="autopay">
              <AutoPayments />
            </TabsContent>
          )}

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="tokens">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">RentToken (RNTY)</h2>
              </div>

              {swapError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Eroare</AlertTitle>
                  <AlertDescription>{swapError}</AlertDescription>
                </Alert>
              )}

              {swapSuccess && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Succes</AlertTitle>
                  <AlertDescription>{swapSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sold Token</CardTitle>
                    <CardDescription>Soldul tău actual de RNTY tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-600">{tokenBalance} RNTY</div>
                    <p className="text-sm text-gray-500 mt-2">Echivalent: ~{(tokenBalance * 0.05).toFixed(2)} SOL</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Schimb Token</CardTitle>
                    <CardDescription>Schimbă între SOL și RNTY tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Rata de schimb:</span>
                        <span className="font-medium">1 SOL = 20 RNTY</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <Button
                            className={`flex-1 ${swapForm.type === "buy" ? "bg-purple-600" : "bg-gray-300"}`}
                            onClick={() => setSwapForm({ ...swapForm, type: "buy" })}
                          >
                            Cumpără RNTY
                          </Button>
                          <Button
                            variant={swapForm.type === "sell" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setSwapForm({ ...swapForm, type: "sell" })}
                          >
                            Vinde RNTY
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amount">{swapForm.type === "buy" ? "Sumă SOL" : "Sumă RNTY"}</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={swapForm.amount}
                            onChange={(e) => setSwapForm({ ...swapForm, amount: e.target.value })}
                            placeholder={swapForm.type === "buy" ? "Ex: 0.5 SOL" : "Ex: 10 RNTY"}
                          />

                          {swapForm.amount && !isNaN(Number(swapForm.amount)) && (
                            <p className="text-sm text-gray-500">
                              {swapForm.type === "buy"
                                ? `Vei primi: ~${(Number(swapForm.amount) * 20).toFixed(2)} RNTY`
                                : `Vei primi: ~${(Number(swapForm.amount) / 20).toFixed(2)} SOL`}
                            </p>
                          )}
                        </div>

                        <Button onClick={handleSwap} disabled={swapLoading || !swapForm.amount} className="w-full">
                          {swapLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Se procesează...
                            </>
                          ) : swapForm.type === "buy" ? (
                            "Cumpără RNTY"
                          ) : (
                            "Vinde RNTY"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

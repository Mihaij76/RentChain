"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useMessage, type Conversation, type Message } from "../providers/message-provider"
import { useUser } from "../providers/user-provider"
import { useContract } from "./contract-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Home, Send, MessageSquare, Loader2, FileText, Plus } from "lucide-react"

export default function Messages() {
  const { currentUser, isTenant, isLandlord } = useUser()
  const { getConversations, getMessages, sendMessage, markConversationAsRead } = useMessage()
  const { createContract } = useContract()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // State pentru dialogul de solicitare contract
  const [isRequestContractDialogOpen, setIsRequestContractDialogOpen] = useState(false)
  const [isCreatingContract, setIsCreatingContract] = useState(false)
  const [contractCreated, setContractCreated] = useState(false)
  const [contractError, setContractError] = useState<string | null>(null)

  // State pentru dialogul de creare contract
  const [isCreateContractDialogOpen, setIsCreateContractDialogOpen] = useState(false)
  const [contractForm, setContractForm] = useState({
    rentAmount: "",
    durationMonths: "",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Încărcăm conversațiile - o singură dată la montare
  useEffect(() => {
    setConversations(getConversations())
  }, [getConversations])

  // Încărcăm mesajele pentru conversația selectată
  useEffect(() => {
    if (!selectedConversation) return
    setMessages(getMessages(selectedConversation))
    markConversationAsRead(selectedConversation)
  }, [selectedConversation, getMessages, markConversationAsRead])
  
  


  // Scroll la ultimul mesaj
  useEffect(() => {
    if (messagesEndRef.current) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [messages])

  // Funcție pentru a selecta o conversație - memoizată pentru a preveni re-crearea
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversation(conversationId)
      markConversationAsRead(conversationId)
    },
    [markConversationAsRead],
  )

  // Funcție pentru a trimite un mesaj - memoizată pentru a preveni re-crearea
  const handleSendMessage = useCallback(async () => {
    if (!selectedConversation || !newMessage.trim()) return

    setLoading(true)

    try {
      await sendMessage(selectedConversation, newMessage)
      setNewMessage("")
      setMessages(getMessages(selectedConversation))
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedConversation, newMessage, sendMessage, getMessages])

  // Funcție pentru a solicita un contract
  const handleRequestContract = useCallback(async () => {
    if (!selectedConversation || !currentUser) return

    setIsRequestContractDialogOpen(true)
  }, [selectedConversation, currentUser])

  // Funcție pentru a trimite solicitarea de contract
  const sendContractRequest = useCallback(async () => {
    if (!selectedConversation) return

    setLoading(true)

    try {
      const requestMessage =
        "Aș dori să solicit crearea unui contract de închiriere pentru această proprietate. Puteți crea un contract pentru mine?"
      await sendMessage(selectedConversation, requestMessage)
      setNewMessage("")
      setMessages(getMessages(selectedConversation))
      setIsRequestContractDialogOpen(false)
    } catch (error) {
      console.error("Error sending contract request:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedConversation, sendMessage, getMessages])

  // Funcție pentru a deschide dialogul de creare contract
  const openCreateContractDialog = useCallback(() => {
    setContractForm({
      rentAmount: "",
      durationMonths: "",
    })
    setContractCreated(false)
    setContractError(null)
    setIsCreateContractDialogOpen(true)
  }, [])

  // Funcție pentru a crea un contract
  const handleCreateContract = useCallback(async () => {
    if (!selectedConversation || !currentUser) return

    setIsCreatingContract(true)
    setContractError(null)

    try {
      const conversation = conversations.find((c) => c.id === selectedConversation)
      if (!conversation) throw new Error("Conversația nu a fost găsită")

      // Găsim destinatarul (celălalt participant din conversație)
      const receiver = conversation.participants.find((p) => p.id !== currentUser.id)
      if (!receiver) throw new Error("Destinatarul nu a fost găsit")

      // Validăm datele formularului
      const rentAmount = Number.parseFloat(contractForm.rentAmount)
      const durationMonths = Number.parseInt(contractForm.durationMonths)

      if (isNaN(rentAmount) || rentAmount <= 0) {
        throw new Error("Suma chiriei trebuie să fie un număr pozitiv")
      }

      if (isNaN(durationMonths) || durationMonths <= 0) {
        throw new Error("Durata trebuie să fie un număr pozitiv")
      }

      // Creăm contractul
      const contractId = await createContract(receiver.id, rentAmount, durationMonths)

      // Trimitem un mesaj cu informațiile contractului
      const contractMessage = `Am creat un contract de închiriere pentru tine (ID: ${contractId}). Suma chiriei: ${rentAmount} SOL/lună, Durată: ${durationMonths} luni. Poți semna contractul din secțiunea "Semnare Contracte".`
      await sendMessage(selectedConversation, contractMessage)

      setContractCreated(true)
      setMessages(getMessages(selectedConversation))

      // Închidem dialogul după 3 secunde
      setTimeout(() => {
        setIsCreateContractDialogOpen(false)
      }, 3000)
    } catch (error) {
      console.error("Error creating contract:", error)
      setContractError(error instanceof Error ? error.message : "A apărut o eroare la crearea contractului")
    } finally {
      setIsCreatingContract(false)
    }
  }, [selectedConversation, currentUser, contractForm, conversations, createContract, sendMessage, getMessages])

  // Funcție pentru a formata data
  const formatMessageDate = useCallback((date?: Date) => {
    if (!date) return "Unknown date"
  
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
  
    if (days > 0) {
      return `${days} ${days === 1 ? "zi" : "zile"} în urmă`
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? "oră" : "ore"} în urmă`
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minut" : "minute"} în urmă`
    } else {
      return "Acum"
    }
  }, [])

  // Funcție pentru a obține cealaltă persoană din conversație
  const getOtherParticipant = useCallback(
    (conversation: Conversation) => {
      if (!currentUser) return null
      return conversation.participants.find((p) => p.id !== currentUser.id)
    },
    [currentUser],
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Lista de conversații */}
      <Card className="md:col-span-1 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Conversații</h2>
          </div>
          <ScrollArea className="flex-1 overflow-y-auto p-4 h-[calc(100vh-380px)]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Nu aveți conversații</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  return (
                    <div
                    key={conversation.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedConversation === conversation.id ? "bg-purple-50" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={otherParticipant?.avatar || "/placeholder.svg"}
                            alt={otherParticipant?.name}
                          />
                          <AvatarFallback>{otherParticipant?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium truncate">{otherParticipant?.name}</p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="ml-2 bg-purple-500">{conversation.unreadCount}</Badge>
                            )}
                          </div>
                          {conversation.propertyTitle && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Home className="h-3 w-3 mr-1" />
                              <span className="truncate">{conversation.propertyTitle}</span>
                            </div>
                          )}
                          {conversation.lastMessage && (
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.senderId === currentUser?.id ? "Tu: " : ""}
                                {conversation.lastMessage.content}
                              </p>
                              <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {formatMessageDate(conversation.lastMessage.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zona de mesaje */}
      <Card className="md:col-span-2 overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header conversație */}
            <div className="p-4 border-b flex justify-between items-center">
              {(() => {
                const conversation = conversations.find((c) => c.id === selectedConversation)
                const otherParticipant = conversation ? getOtherParticipant(conversation) : null
                return (
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={otherParticipant?.avatar || "/placeholder.svg"} alt={otherParticipant?.name} />
                      <AvatarFallback>{otherParticipant?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{otherParticipant?.name}</h3>
                      {conversation?.propertyTitle && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Home className="h-3 w-3 mr-1" />
                          <span>{conversation.propertyTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div className="flex space-x-2">
                {isTenant() && (
                  <Button variant="outline" size="sm" onClick={handleRequestContract}>
                    <FileText className="h-4 w-4 mr-2" />
                    Solicită contract
                  </Button>
                )}
                {isLandlord() && (
                  <Button variant="outline" size="sm" onClick={openCreateContractDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Creează contract
                  </Button>
                )}
              </div>
            </div>

            {/* Mesaje */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Nu există mesaje în această conversație</p>
                    <p className="text-gray-400 text-sm">Trimiteți primul mesaj pentru a începe conversația</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === currentUser?.id
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === currentUser?.id ? "text-purple-100" : "text-gray-500"
                          }`}
                        >
                          {formatMessageDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input mesaj */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex space-x-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nicio conversație selectată</h3>
              <p className="text-gray-500">Selectați o conversație din lista din stânga pentru a vedea mesajele.</p>
            </div>
          </div>
        )}
      </Card>

      {/* Dialog pentru solicitarea unui contract */}
      <Dialog open={isRequestContractDialogOpen} onOpenChange={setIsRequestContractDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicită contract de închiriere</DialogTitle>
            <DialogDescription>
              Trimite o solicitare proprietarului pentru a crea un contract de închiriere.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Vei trimite un mesaj proprietarului prin care soliciți crearea unui contract de închiriere pentru această
              proprietate. Proprietarul va putea crea contractul și îl vei putea semna ulterior.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestContractDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={sendContractRequest} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se trimite...
                </>
              ) : (
                "Trimite solicitare"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru crearea unui contract */}
      <Dialog open={isCreateContractDialogOpen} onOpenChange={setIsCreateContractDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creează contract de închiriere</DialogTitle>
            <DialogDescription>
              Completează detaliile pentru a crea un contract de închiriere pentru chiriaș.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {contractCreated ? (
              <div className="text-center py-4">
                <FileText className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <p className="text-lg font-medium text-gray-900 mb-1">Contract creat cu succes!</p>
                <p className="text-gray-500">Contractul a fost creat și chiriașul a fost notificat.</p>
              </div>
            ) : (
              <>
                {contractError && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{contractError}</div>}

                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Suma chirie (SOL/lună)</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 0.5"
                    value={contractForm.rentAmount}
                    onChange={(e) => setContractForm({ ...contractForm, rentAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Durată (luni)</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    placeholder="Ex: 12"
                    value={contractForm.durationMonths}
                    onChange={(e) => setContractForm({ ...contractForm, durationMonths: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateContractDialogOpen(false)}>
              {contractCreated ? "Închide" : "Anulează"}
            </Button>
            {!contractCreated && (
              <Button onClick={handleCreateContract} disabled={isCreatingContract}>
                {isCreatingContract ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează...
                  </>
                ) : (
                  "Creează contract"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

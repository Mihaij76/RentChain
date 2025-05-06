"use client"

import { useState, useCallback } from "react"
import { useWallet } from "../providers/wallet-provider"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"

interface WalletConnectButtonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export default function WalletConnectButton({
  onSuccess,
  onError,
  className,
  size = "default",
}: WalletConnectButtonProps) {
  const { isConnected, isConnecting, connect } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = useCallback(async () => {
    if (isConnected || isConnecting || isLoading) return

    setIsLoading(true)
    try {
      const publicKey = await connect()
      if (publicKey && onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, isConnecting, isLoading, connect, onSuccess, onError])

  return (
    <Button
      className={`bg-purple-600 hover:bg-purple-700 ${className}`}
      onClick={handleConnect}
      disabled={isConnecting || isLoading}
      size={size}
    >
      {isConnecting || isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Se conectează...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Conectare cu Phantom
        </>
      )}
    </Button>
  )
}

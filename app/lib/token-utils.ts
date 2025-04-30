import { Connection, PublicKey, Keypair } from "@solana/web3.js"
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token"

// RNTY token mint (this would be the actual token mint in production)
export const RNTY_MINT = new PublicKey("RNTYMintAddressXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

// For demo purposes, we'll create a keypair for the token authority
// In production, this would be a secure keypair
export const TOKEN_AUTHORITY = Keypair.generate()

// Get connection to Solana network
export const getConnection = () => {
  return new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed")
}

// Create RNTY token mint (for demo purposes)
export const createRntyMint = async (payer: Keypair): Promise<PublicKey> => {
  const connection = getConnection()

  // Create the token mint
  const mint = await createMint(
    connection,
    payer,
    TOKEN_AUTHORITY.publicKey,
    TOKEN_AUTHORITY.publicKey,
    9, // 9 decimals like SOL
  )

  return mint
}

// Get or create a token account for a wallet
export const getOrCreateTokenAccount = async (walletPublicKey: PublicKey): Promise<PublicKey> => {
  const connection = getConnection()

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    TOKEN_AUTHORITY, // payer
    RNTY_MINT,
    walletPublicKey,
  )

  return tokenAccount.address
}

// Mint RNTY tokens to a wallet
export const mintRntyTokens = async (destinationWallet: PublicKey, amount: number): Promise<string> => {
  const connection = getConnection()

  // Get the token account
  const tokenAccount = await getOrCreateTokenAccount(destinationWallet)

  // Mint tokens
  const signature = await mintTo(
    connection,
    TOKEN_AUTHORITY, // payer
    RNTY_MINT,
    tokenAccount,
    TOKEN_AUTHORITY, // authority
    amount * 1_000_000_000, // amount in smallest units (9 decimals)
  )

  return signature
}

// Transfer RNTY tokens between wallets
export const transferRntyTokens = async (fromWallet: Keypair, toWallet: PublicKey, amount: number): Promise<string> => {
  const connection = getConnection()

  // Get source token account
  const sourceTokenAccount = await getOrCreateTokenAccount(fromWallet.publicKey)

  // Get destination token account
  const destinationTokenAccount = await getOrCreateTokenAccount(toWallet)

  // Transfer tokens
  const signature = await transfer(
    connection,
    fromWallet, // payer
    sourceTokenAccount,
    destinationTokenAccount,
    fromWallet, // owner
    amount * 1_000_000_000, // amount in smallest units (9 decimals)
  )

  return signature
}

// Get RNTY token balance for a wallet
export const getRntyBalance = async (walletPublicKey: PublicKey): Promise<number> => {
  try {
    const connection = getConnection()

    // Get the token account
    const tokenAccount = await getOrCreateTokenAccount(walletPublicKey)

    // Get account info
    const accountInfo = await connection.getTokenAccountBalance(tokenAccount)

    // Return balance in RNTY
    return Number(accountInfo.value.uiAmount || 0)
  } catch (error) {
    console.error("Error getting RNTY balance:", error)
    return 0
  }
}

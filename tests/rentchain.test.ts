import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import assert from "assert";
import 'mocha';

describe("RentChain - create_profile test", () => {
  const provider = anchor.AnchorProvider.env();

  anchor.setProvider(provider);

  const program = anchor.workspace.RentchainAnchor as Program;

  it("✅ Creează un profil cu rol Owner", async () => {
    const wallet = provider.wallet;
    const role = { owner: {} };  // enum = Owner
    const nickname = "ana";

    const [profilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .createProfile(role, nickname)
      .accounts({
        profile: profilePDA,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Profil creat în tx:", tx);

    const profileAccount = await program.account.profileAccount.fetch(profilePDA);
    assert.strictEqual(profileAccount.nickname, "ana");
    console.log("🔎 Profil:", profileAccount);
  });
});

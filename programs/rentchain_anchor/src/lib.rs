use anchor_lang::prelude::*;

declare_id!("BaGvznHhNmC5LxVyCjWYmPZoCViqCXyUXvtJc7quy6eW");

#[program]
pub mod rentchain_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

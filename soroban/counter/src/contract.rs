use soroban_sdk::{contract, contractimpl, contracttype, Env};

// Interface for the counter contract - all functions need the Stellar environment
pub trait CounterTrait {
    // Get current count
    fn count(env: Env) -> u64;
    // Add to counter
    fn add(env: Env, amount: u64) -> u64;
    // Subtract from counter
    fn subtract(env: Env, amount: u64) -> u64;
}

// Key for storing the count value
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Count, // Stores a u64 value
}

// Main contract
#[contract]
pub struct CounterContract;

// Contract implementation with overflow protection using saturating math
#[contractimpl]
impl CounterTrait for CounterContract {
    fn count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0_u64)
    }

    fn add(env: Env, amount: u64) -> u64 {
        let count = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0_u64);
        let new_count = count.saturating_add(amount); // Cap at max to prevent overflow
        env.storage().instance().set(&DataKey::Count, &new_count);
        new_count
    }

    fn subtract(env: Env, amount: u64) -> u64 {
        let count = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0_u64);
        let new_count = count.saturating_sub(amount); // Cap at min to prevent underflow
        env.storage().instance().set(&DataKey::Count, &new_count);
        new_count
    }
}

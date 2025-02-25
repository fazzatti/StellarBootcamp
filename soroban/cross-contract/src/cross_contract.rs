use authorization::auth_contract::{AuthContract, AuthContractClient};
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};
pub trait ControlledCounterTrait {
    fn count(env: Env) -> u64;
    fn add(env: Env, counter: Address, amount: u64) -> u64;
    fn subtract(env: Env, counter: Address, amount: u64) -> u64;
}

// Key for storing the count value
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Count,         // u64
    AccessControl, // Address
}

// Main contract
#[contract]
pub struct CrossCounterContract;

pub trait ConstructorTrait {
    fn __constructor(e: Env, controller: Address);
}

#[contractimpl]
impl ConstructorTrait for CrossCounterContract {
    fn __constructor(e: Env, controller: Address) {
        e.storage()
            .instance()
            .set(&DataKey::AccessControl, &controller);
    }
}

#[contractimpl]
impl ControlledCounterTrait for CrossCounterContract {
    fn count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::Count).unwrap_or(0)
    }

    fn add(env: Env, counter: Address, amount: u64) -> u64 {
        require_counter(&env, counter.clone());

        let count: u64 = env.storage().instance().get(&DataKey::Count).unwrap_or(0);

        let new_count = if count.saturating_add(amount) > 100 {
            remove_counter_role(&env, counter);
            0
        } else {
            count.saturating_add(amount)
        };

        env.storage().instance().set(&DataKey::Count, &new_count);
        new_count
    }

    fn subtract(env: Env, counter: Address, amount: u64) -> u64 {
        counter.require_auth();

        let count: u64 = env.storage().instance().get(&DataKey::Count).unwrap_or(0);

        env.storage()
            .instance()
            .set(&DataKey::Count, &count.saturating_sub(amount));
        count.saturating_sub(amount)
    }
}

fn require_counter(env: &Env, counter: Address) {
    let controller = env
        .storage()
        .instance()
        .get(&DataKey::AccessControl)
        .unwrap_or_else(|| panic!("Contract has not been initialized!"));

    let controller_client = AuthContractClient::new(&env, &controller);
    controller_client.verify_auth(&counter, &symbol_short!("COUNTER"));

    counter.require_auth();
}

fn remove_counter_role(env: &Env, counter: Address) {
    let controller = env
        .storage()
        .instance()
        .get(&DataKey::AccessControl)
        .unwrap_or_else(|| panic!("Contract has not been initialized!"));

    let controller_client = AuthContractClient::new(&env, &controller);
    controller_client.remove_role(&counter, &env.current_contract_address());
}

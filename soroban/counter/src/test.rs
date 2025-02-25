#![cfg(test)]

use crate::contract::{CounterContract, CounterContractClient};

use soroban_sdk::Env;

#[test]
fn test() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CounterContract);
    let client = CounterContractClient::new(&env, &contract_id);

    // Test initial count
    assert_eq!(0, client.count()); // Start with 0

    // Test addition
    assert_eq!(1, client.add(&1_u64)); // Add 1 = 1
    assert_eq!(3, client.add(&2_u64)); // Add 2 = 3
    assert_eq!(7, client.add(&4_u64)); // Add 4 = 7
    assert_eq!(7, client.count()); // Count should be 7

    // Test subtraction
    assert_eq!(6, client.subtract(&1_u64)); // Subtract 1 = 6
    assert_eq!(4, client.subtract(&2_u64)); // Subtract 2 = 4
    assert_eq!(1, client.subtract(&3_u64)); // Subtract 3 = 1
    assert_eq!(1, client.count()); // Count should be 1

    // Test underflow
    assert_eq!(0, client.subtract(&1_u64)); // Subtract 1 = 0
    assert_eq!(0, client.subtract(&2_u64)); // Subtract 2 = 0
    assert_eq!(0, client.subtract(&3_u64)); // Subtract 3 = 0
    assert_eq!(0, client.count()); // Count should be 0

    // Test overflow
    assert_eq!(u64::MAX, client.add(&u64::MAX)); // Add max u64 = u64::MAX
    assert_eq!(u64::MAX, client.add(&1_u64)); // Add 1
    assert_eq!(u64::MAX, client.count()); // Count should be u64::MAX
}

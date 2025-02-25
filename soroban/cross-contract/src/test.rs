#![cfg(test)]

use crate::cross_contract::{
    CrossCounterContract, CrossCounterContractArgs, CrossCounterContractClient,
};
use authorization::auth_contract::{AuthContract, AuthContractArgs, AuthContractClient};
use soroban_sdk::{symbol_short, testutils::Address, Env};

#[test]
fn test_successful_operations() {
    let env = Env::default();
    let admin = <soroban_sdk::Address as Address>::generate(&env);

    env.mock_all_auths();

    let auth_contract_id = env.register(AuthContract, AuthContractArgs::__constructor(&admin));

    let counter_contract_id = env.register(
        CrossCounterContract,
        CrossCounterContractArgs::__constructor(&auth_contract_id),
    );
    let auth_client = AuthContractClient::new(&env, &auth_contract_id);
    let counter_client = CrossCounterContractClient::new(&env, &counter_contract_id);

    assert_eq!(0_u64, counter_client.count());

    auth_client.set_role(&symbol_short!("REMOVER"), &counter_contract_id);

    assert_eq!(
        symbol_short!("REMOVER"),
        auth_client.check_role(&counter_contract_id)
    );

    let user_a = <soroban_sdk::Address as Address>::generate(&env);
    auth_client.set_role(&symbol_short!("COUNTER"), &user_a);

    assert_eq!(symbol_short!("COUNTER"), auth_client.check_role(&user_a));

    counter_client.add(&user_a, &1_u64);
    assert_eq!(1_u64, counter_client.count());

    counter_client.add(&user_a, &2_u64);
    assert_eq!(3_u64, counter_client.count());

    counter_client.subtract(&user_a, &1_u64);
    assert_eq!(2_u64, counter_client.count());

    counter_client.add(&user_a, &100_u64);
    assert_eq!(0_u64, counter_client.count());

    assert_eq!(symbol_short!("NO_ROLE"), auth_client.check_role(&user_a));
}

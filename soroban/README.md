# Soroban Smart Contracts

This directory contains example smart contracts built with Soroban, Stellar's smart **contract** platform.

## Contract Development

Each contract follows a similar structure:

```
contract_name/
├── src/
│   └── lib.rs          # Contract implementation
├── .bindings/          # Generated TypeScript bindings
├── Cargo.toml          # Rust dependencies
└── README.md          # Contract-specific documentation
```

## Testing

Each contract includes tests demonstrating proper functionality. To run tests:

```shell
cd contract_name
cargo test
```

## TypeScript Integration

The contracts automatically generate TypeScript bindings when built. These bindings can be found in the `.bindings` directory of each contract and are used by the TypeScript examples in `typescript/src/soroban/`.

## Available Contracts

### Counter Contract

A basic smart contract demonstrating state management on Stellar:

- Increment/decrement operations
- State persistence
- Basic contract interaction

To build and deploy the counter contract:

```shell
cd counter
stellar contract build
stellar contract deploy
```

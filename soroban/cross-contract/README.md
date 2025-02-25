# Counter Smart Contract

A simple counter smart contract for the Stellar network that demonstrates basic state management and arithmetic operations.

## Contract Features

- Get current count value
- Add to counter (with overflow protection)
- Subtract from counter (with underflow protection)

## Project Structure

```
counter/
├── src/
│   └── contract.rs     # Main contract implementation
├── .bindings-ts/       # TypeScript bindings (Generated)
├── .stellar/           # Local network configuration (Generated)
├── test_snapshots/     # Contract test snapshots
├── Cargo.toml          # Rust dependencies and contract config
└── Makefile            # Build and deployment automation
```

## Development Commands

Build and test the contract:

```bash
# Build the contract
make build

# Run tests
make test

# Format code
make fmt
```

## Deployment

Before deploying the contract, you need a funded Stellar testnet account. If you haven't set one up yet:

```bash
# Generate a new account called 'alice' (only needed once)
make generate-account

# Fund the account (if balance is low)
make fund
```

Then deploy the contract to testnet:

```bash
make deploy
```

## Generate TypeScript Bindings

After deployment, generate TypeScript bindings for frontend integration:

```bash
make bindings <CONTRACT_ID>
```

Replace <CONTRACT_ID> with your deployed contract's ID.

## Available Commands

Run `make help` or `make h` to see all available commands:

```bash
make help
```

## Contract Interface

The contract provides three main functions:

```rust
fn count(env: Env) -> u64;              // Get current count
fn add(env: Env, amount: u64) -> u64;   // Add to counter
fn subtract(env: Env, amount: u64) -> u64; // Subtract from counter
```

All operations use saturating arithmetic to prevent overflow/underflow errors.

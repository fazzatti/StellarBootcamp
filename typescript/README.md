# TypeScript Examples

This directory contains TypeScript examples for interacting with the Stellar network, covering both classic operations and Soroban smart contract interactions.

## Directory Structure

```
src/use cases/
├── classic/     # Classic Stellar operations
└── soroban/     # Smart contract interactions
```

## Prerequisites

1. **Deno Installation**

   ```bash
   # macOS (using Homebrew)
   brew install deno

   # Unix/Linux
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. **Stellar Network Access**

   - By default, examples connect to the Stellar Testnet
   - For local development, follow the Quickstart setup in the main README

3. **Smart Contract Compilation**
   - Before running Soroban examples, the corresponding smart contracts need to be compiled
   - See the [Soroban contracts documentation](../soroban/README.md) for compilation instructions

## Classic Operations

### Account Management

Create and manage Stellar accounts, including funding, key generation, and configuration.

```bash
# Generate a new keypair
deno task keypair

# Initialize account with Friendbot (testnet)
deno task initialize

# Create a new account
deno task create-account

# Create account with trustline
deno task create-account-with-trustline

# Sponsor an account
deno task sponsor-account
```

### Asset Operations

Issue and manage custom assets on the Stellar network, including trustlines and transfers.

```bash
# Create and mint a new asset
deno task create-asset

# Configure asset flags
deno task configure-flags
```

### Authorization

Handle multi-signature operations and authorization.

```bash
# Set up multi-signature account
deno task multisig
```

### Payment Operations

Send payments, handle multi-signature transactions, and work with different asset types.

```bash
# Make a payment
deno task classic-payment
```

## Soroban Smart Contracts

### Counter Contract

Basic example demonstrating contract deployment, method invocation, and state management.

```bash
deno task soroban:counter
```

### Common Utilities

Shared utilities for contract deployment, TypeScript bindings, and event handling.

## Additional Resources

- [Stellar Documentation](https://developers.stellar.org/docs)
- [Soroban Documentation](https://soroban.stellar.org)
- [Deno Manual](https://deno.land/manual)

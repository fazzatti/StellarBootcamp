# StellarBootcamp

Welcome to StellarBootcamp! This repository contains examples and tutorials for working with the Stellar blockchain, including both classic operations and smart contracts using Soroban.

## Repository Structure

```
StellarBootcamp/
├── soroban/                    # Smart contract examples using Soroban
│   ├── counter/                # Basic counter contract example
│   └── README.md               # Smart contract specific documentation
│
├── typescript/                 # TypeScript examples and use cases
│   ├── src/
│   │   └── use cases/
│   │       ├── classic/        # Classic Stellar operations
│   │       └── soroban/        # Smart contract interactions
│   └── README.md               # TypeScript examples documentation
```

### Examples Overview

[TypeScript](typescript/README.md):

- **Classic Operations**: Examples of traditional Stellar operations
- **Contract Interactions**: TypeScript examples for interacting with smart contracts

[Soroban](soroban/README.md):

- **Smart Contracts**: Soroban smart contract implementations

## Infrastructure

### Prerequisites

To run a local Stellar network for development and testing, you'll need:

- **Docker**: Install Docker for your operating system from [docker.com](https://www.docker.com/get-started/)

### Quickstart Setup

By default the examples are set to Testnet but it is also possible to set up your own environment as local network or to connect to existing public infrastructure.
For this, we use the official Stellar Quickstart Docker image to run all components of a Stellar network locally. This includes:

- PostgreSQL for data storage
- Stellar Core
- Horizon API
- Friendbot (on testnet)
- Stellar RPC

To start a local test network:

```shell
docker run --rm -it -p "8000:8000" --name stellar stellar/quickstart --testnet
```

For persistent data storage, mount a local volume:

```shell
docker run --rm -it -p "8000:8000" -v "/path/to/local/data:/opt/stellar" --name stellar stellar/quickstart --testnet
```

Available networks:

- `--testnet`: Public test network
- `--pubnet`: Public production network
- `--local`: Private local network (best for development)

For more details, see the [Stellar Quickstart Documentation](https://github.com/stellar/quickstart).

## Smart Contracts

### Prerequisites

To develop smart contracts on Stellar, you need to meet the following prerequisites:

- **Rust**: Install the Rust programming language, which is essential for writing smart contracts. You can install it using the following command:

  ```shell
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **WebAssembly Target**: The WebAssembly target is necessry for Rust to compile your smart contracts into WASM:

  ```shell
  rustup target add wasm32-unknown-unknown
  ```

- **Stellar CLI**: Install the command-line interface for building and managing Stellar smart contracts.
  On macOS:
  ```shell
  brew install stellar-cli
  ```
  For other platforms and detailed instructions, see the [official installation guide](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli).

### Development Environment Setup

For the best development experience, we recommend setting up your editor with Rust support. Here are our recommended tools:

#### Visual Studio Code

We recommend using Visual Studio Code with the following extensions:

- [**Rust Analyzer**](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer): Provides advanced Rust language support with features like code completion, go to definition, and real-time error checking
- [**CodeLLDB**](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb): Enables step-through debugging for Rust code

#### Stellar CLI Configuration

After installing the Stellar CLI, you can configure your development environment:

**Configure Testnet Identity**

Create a new identity for testing (this will also fund the account using Friendbot):

```shell
stellar keys generate --global alice --network testnet --fund
```

View your public key:

```shell
stellar keys address alice
```

For more detailed configuration options and documentation, visit the [Stellar Smart Contracts Setup Guide](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup).

## TypeScript Examples

### Prerequisites

To run the TypeScript examples in this repository, you'll need a JavaScript runtime. We recommend using Deno for its built-in TypeScript support and security features:

```shell
# On macOS
brew install deno

# Using Shell (macOS, Linux)
curl -fsSL https://deno.land/x/install/install.sh | sh
```

Alternatively, you can use [Node.js](https://nodejs.org/) with npm or [Bun](https://bun.sh) as your runtime.

# StellarBootcamp

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

- **Soroban SDK**: Include the Soroban SDK in your project by adding it to your `Cargo.toml` file:

  ```toml
  [dependencies]
  soroban-sdk = "21.4.0"
  ```

- **Stellar CLI**: Install the command-line interface for building and managing Stellar smart contracts.
  On macOS:
  ```shell
  brew install stellar-cli
  ```
  For other platforms and detailed instructions, see the [official installation guide](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli).

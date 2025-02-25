# Default target - just builds the contract
default: build

# Show help
h help:
	@echo " "
	@echo "Usage: make <command>"
	@echo "Available commands:"
	@echo "  build             - Compile the contract to WASM"
	@echo "  test              - Build and run the test suite"
	@echo "  fmt               - Format all Rust code"
	@echo "  clean             - Remove build artifacts"
	@echo "  generate-account  - Create a new Stellar test account with funds"
	@echo "  fund              - Fund the test account using friendbot"
	@echo "  deploy            - Deploy the contract to testnet using alice's account"
	@echo "  bindings ID       - Generate TypeScript bindings for contract ID and copy bindigngs to the ts example"
	@echo " "

# Run all tests
all: test

# Build and run the test suite
test: build
	cargo test

# Compile the contract to WASM and show the output file
build:
	stellar contract build

# Format all Rust code
fmt:
	cargo fmt --all

# Remove build artifacts
clean:
	cargo clean

# Create a new Stellar test account with funds from friendbot
generate-account:
	stellar keys generate --network testnet --fund alice

# Fund the test account using friendbot
fund:
	stellar keys fund --network testnet alice

# Deploy the contract to testnet using alice's account
# The wasm file is in the parent directory target as this is a subdirectory
# of the workspace.
deploy:
	stellar contract deploy \
		--wasm ../../target/wasm32-unknown-unknown/release/counter.wasm \
		--alias counter \
		--source alice \
		--network testnet

# Generate TypeScript bindings (usage: make bindings CONTRACT_ID)
bindings:
	stellar contract bindings typescript --overwrite --output-dir .bindings/counter-bindings --contract-id $(word 2,$(MAKECMDGOALS)) --network testnet
	cp .bindings/counter-bindings/src/index.ts ../../typescript/src/use\ cases/soroban/counter/bindings.ts

# Special pattern rule to allow additional command-line arguments
%:
	@:




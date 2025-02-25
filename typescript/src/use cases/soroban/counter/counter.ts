/*
    This script demonstrates interaction with a Soroban smart contract by:
    1. Setting up a client with the necessary configuration
    2. Reading the current state of the counter
    3. Incrementing the counter value
    4. Decrementing the counter value

    The counter contract is a simple example that:
    - Maintains a single unsigned 64-bit integer value
    - Allows reading the current value
    - Supports adding to the counter (with overflow protection)
    - Supports subtracting from the counter (with underflow protection)

    Important Concepts:
    - Contract Client: Abstracts the RPC communication with the contract
    - Transaction Signing: Required for state-changing operations
    - Simulation: Preview of transaction results before submission
    - XDR: External Data Representation for transaction encoding
*/

import { Client, networks } from "./bindings.ts";
import * as bindings from "./bindings.ts";
import generateKeypair from "../../classic/account/generate-keypair.ts";
import initalizeWithFriendbot from "../../classic/account/initialize-with-friendbot.ts";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import chalk from "chalk";

// Set up transaction signing function for the contract client
async function setupTransactionSigner(adminKeypair: Keypair) {
  return async (xdr: string, opts?: {
    networkPassphrase?: string;
    address?: string;
    submit?: boolean;
    submitUrl?: string;
  }) => {
    const txEnvelope = TransactionBuilder.fromXDR(
      xdr,
      opts?.networkPassphrase ?? networks.testnet.networkPassphrase,
    );

    txEnvelope.sign(adminKeypair);

    return {
      signedTxXdr: txEnvelope.toXDR(),
      signerAddress: adminKeypair.publicKey(),
    };
  };
}

// Create a new contract client instance
async function createContractClient(adminKeypair: Keypair) {
  console.log(
    chalk.blue(
      `Creating contract client for admin ${adminKeypair.publicKey()}...`,
    ),
  );

  return new Client({
    contractId: networks.testnet.contractId,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: "https://soroban-testnet.stellar.org",
    signTransaction: await setupTransactionSigner(adminKeypair),
    publicKey: adminKeypair.publicKey(),
  });
}

// Read the current counter value
async function readCounter(client: Client) {
  console.log(chalk.yellow("Reading current counter value..."));
  const count = (await client.count()).result;
  console.log(chalk.green(`Current counter value: ${count}`));
  return count;
}

// Increment the counter by a specified amount
async function incrementCounter(client: Client, amount: bigint) {
  console.log(chalk.yellow(`Incrementing counter by ${amount}...`));

  // First simulate the transaction
  const simulation = await client.add({ amount });
  console.log(chalk.blue("Simulation successful, submitting transaction..."));

  // Submit the actual transaction
  const result = await simulation.signAndSend();
  console.log(
    chalk.green(`Counter incremented successfully to ${result.result}`),
  );

  return result.result;
}

// Decrement the counter by a specified amount
async function decrementCounter(client: Client, amount: bigint) {
  console.log(chalk.yellow(`Decrementing counter by ${amount}...`));

  // First simulate the transaction
  const simulation = await client.subtract({ amount });
  console.log(chalk.blue("Simulation successful, submitting transaction..."));

  // Submit the actual transaction
  const result = await simulation.signAndSend();
  console.log(
    chalk.green(`Counter decremented successfully to ${result.result}`),
  );
  return result.result;
}

// Main demonstration script
async function demonstrateCounter() {
  try {
    console.log(chalk.bgCyan("Setting up admin account..."));
    const adminKeypair = await generateKeypair();
    await initalizeWithFriendbot(adminKeypair.publicKey());

    console.log(chalk.bgCyan("Initializing contract client..."));
    const client = await createContractClient(adminKeypair);

    // Read initial value
    console.log(chalk.bgCyan("\nReading initial state..."));
    await readCounter(client);

    // Demonstrate increment
    console.log(chalk.bgCyan("\nDemonstrating increment..."));
    await incrementCounter(client, 1n);
    await incrementCounter(client, 2n);
    await readCounter(client);

    // Demonstrate decrement
    console.log(chalk.bgCyan("\nDemonstrating decrement..."));
    await decrementCounter(client, 1n);
    await readCounter(client);

    console.log(chalk.green("\nCounter demonstration completed successfully!"));
  } catch (e) {
    console.error(chalk.red(`Error in demonstration: ${e}`));
  }
}

// Run the demonstration if this is the main module
if (import.meta.main) {
  demonstrateCounter();
}

export {
  createContractClient,
  decrementCounter,
  incrementCounter,
  readCounter,
};

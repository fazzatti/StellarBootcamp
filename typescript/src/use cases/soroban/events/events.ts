/*
    This script demonstrates interaction with a Soroban event contract by:
    1. Setting up a client with the necessary configuration
    2. Emitting a default event
    3. Emitting custom events with messages
    4. Observing the emitted events

    The event contract is a simple example that:
    - Emits events with contract address and ledger info
    - Supports default events with predefined messages
    - Supports custom events with user-provided messages
    - Organizes events by topics for easy filtering

    Important Concepts:
    - Contract Events: How to emit and track events
    - Event Topics: Organizing events by type
    - Event Data: Including relevant contract information
    - Transaction Simulation: Preview before submission
*/

import { Client, networks } from "./bindings.ts";
import * as bindings from "./bindings.ts";
import generateKeypair from "../../classic/account/generate-keypair.ts";
import initalizeWithFriendbot from "../../classic/account/initialize-with-friendbot.ts";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import chalk from "chalk";
import { logHashLink } from "../../../utils/logHashLink.ts";

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

// Emit a default event
async function emitDefaultEvent(client: Client) {
  console.log(chalk.yellow("Emitting default event..."));

  // First simulate the transaction
  const simulation = await client.default({
    fee: 10000000,
    timeoutInSeconds: 30,
  });
  console.log(chalk.blue("Simulation successful, submitting transaction..."));

  // Submit the actual transaction
  const result = await simulation.signAndSend({ force: true });
  console.log(
    chalk.green("Default event emitted successfully"),
  );
  if (result.sendTransactionResponse?.hash) {
    logHashLink(result.sendTransactionResponse.hash);
  }
}

// Emit a custom event with a specific message
async function emitCustomEvent(client: Client, message: string) {
  console.log(
    chalk.yellow(`Emitting custom event with message: ${message}...`),
  );

  // First simulate the transaction
  const simulation = await client.custom({ message }, {
    fee: 10000000,
    timeoutInSeconds: 30,
  });
  console.log(chalk.blue("Simulation successful, submitting transaction..."));

  // Submit the actual transaction
  const result = await simulation.signAndSend();
  console.log(
    chalk.green(`Custom event with message '${message}' emitted successfully`),
  );
  if (result.sendTransactionResponse?.hash) {
    logHashLink(result.sendTransactionResponse.hash);
  }
}

// Main demonstration script
async function demonstrateEvents() {
  try {
    console.log(chalk.bgCyan("Setting up admin account..."));
    const adminKeypair = await generateKeypair();
    await initalizeWithFriendbot(adminKeypair.publicKey());

    console.log(chalk.bgCyan("Initializing contract client..."));
    const client = await createContractClient(adminKeypair);

    // Demonstrate default event emission
    console.log(chalk.bgCyan("\nDemonstrating default event emission..."));
    await emitDefaultEvent(client);

    // Demonstrate custom event emission
    console.log(chalk.bgCyan("\nDemonstrating custom event emission..."));
    await emitCustomEvent(client, "HELLO");
    await emitCustomEvent(client, "TEST");

    console.log(chalk.green("\nEvent demonstration completed successfully!"));
  } catch (e) {
    console.error(chalk.red(`Error in demonstration: ${e}`));
  }
}

// Run the demonstration if this is the main module
if (import.meta.main) {
  demonstrateEvents();
}

export { createContractClient, emitCustomEvent, emitDefaultEvent };

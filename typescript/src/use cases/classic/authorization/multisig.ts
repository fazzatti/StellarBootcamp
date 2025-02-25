/*
    This script demonstrates Stellar's multisignature capabilities by:
    1. Setting up an account with multiple signers
    2. Configuring different threshold levels (low, medium, high)
    3. Executing transactions that require different signing weights

    Stellar supports 3 threshold levels:
    - Low: Usually for operations of low risk like allowing trust
    - Medium: For regular operations like payments. Most operations
    fall into this category.
    - High: For critical account changes like adding/removing signers

    Each signer has a weight, and transactions need combined
    weights that meet or exceed the threshold level required.


    Important Limitations and Considerations:
    - The original key that controls an account is called the "master key".
    - By default, when an account is created, the master key is the only signer
      with a weight of 1. All thresholds are also 1.
    - Other signers can be added by their public key identifier and a custom weight.
    - Additional signers do not need to be created as accounts. They can be simple
      keypairs.
    - The maximum number of signers in one transaction envelope is 20.
    - The maximums threshold value is 255.
    - The maximum weight for a signer is 255.
    - The total weight of all signers in a transaction envelope needs to be
      greater than or equal to the threshold value.
    - Additional signers to a transaction that are not directly related to
      the underlying operations will invalidate the envelope".

*/

import chalk from "chalk";
import {
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { HORIZON } from "../../../infrastructure/horizon/get-horizon-server.ts";
import { logHashLink } from "../../../utils/logHashLink.ts";
import generateKeypair from "../account/generate-keypair.ts";
import initalizeWithFriendbot from "../account/initialize-with-friendbot.ts";

// This function configures multiple signers and thresholds for an account
export async function configureMultisig(
  primaryKeypair: Keypair,
  signer1Keypair: Keypair,
  signer2Keypair: Keypair,
) {
  console.log(
    `Configuring multisig for account ${
      chalk.blue(primaryKeypair.publicKey())
    }...`,
  );

  const loadedAccount = await HORIZON.loadAccount(primaryKeypair.publicKey());

  // Set up thresholds and add signers with different weights
  // The setOptions operation is used to configure this and
  // other account settings.
  //
  // Args:
  // - lowThreshold: The threshold for low risk operations.
  // - medThreshold: The threshold for medium risk operations.
  // - highThreshold: The threshold for high risk operations.
  // - signer: The signer to add to the account.
  // - weight: The weight of the signer.
  const setOptionsOperation = Operation.setOptions({
    // Set threshold levels
    lowThreshold: 1, // Allow trust requires any 1 signature
    medThreshold: 2, // Payments require 2 combined weight
    highThreshold: 3, // Critical changes require 3 combined weight
    // Add additional signers
    signer: {
      ed25519PublicKey: signer1Keypair.publicKey(),
      weight: 1,
    },
    source: primaryKeypair.publicKey(),
  });

  // Add second signer in separate operation. There is only one
  // slot for managing additional signers in a setOptions operation.
  const addSecondSignerOperation = Operation.setOptions({
    signer: {
      ed25519PublicKey: signer2Keypair.publicKey(),
      weight: 2,
    },
    source: primaryKeypair.publicKey(),
  });

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(setOptionsOperation)
    .addOperation(addSecondSignerOperation)
    .setTimeout(30)
    .build();

  // Sign with the master key
  tx.sign(primaryKeypair);

  console.log(`Submitting multisig configuration...`);
  const result = await HORIZON.submitTransaction(tx);
  console.log(chalk.green(`Multisig configured successfully!`));
  logHashLink(result.hash);
}

// Generic function to make a payment with provided signers
export async function makeMultisigPayment(
  sourceKeypair: Keypair,
  destinationPublicKey: string,
  amount: string,
  ...signers: Keypair[]
) {
  const loadedAccount = await HORIZON.loadAccount(sourceKeypair.publicKey());

  const paymentOperation = Operation.payment({
    destination: destinationPublicKey,
    asset: Asset.native(),
    amount: amount,
    source: sourceKeypair.publicKey(),
  });

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(paymentOperation)
    .setTimeout(30)
    .build();

  // Sign with all provided signers
  signers.forEach((signer) => tx.sign(signer));

  return await HORIZON.submitTransaction(tx);
}

// Generic function to remove a signer with provided signers
//
// Args:
// - sourceKeypair: The keypair of the account to remove the signer from
// - signerToRemove: The public key of the signer to remove. Cannot be the
//   master key.
// - signers: The signers to sign the transaction with
export async function removeMultisigSigner(
  sourceKeypair: Keypair,
  signerToRemove: string,
  ...signers: Keypair[]
) {
  console.log(
    `Removing signer ${signerToRemove} from multisig account ${sourceKeypair.publicKey()}...`,
  );

  const loadedAccount = await HORIZON.loadAccount(sourceKeypair.publicKey());

  const removeSignerOperation = Operation.setOptions({
    signer: {
      ed25519PublicKey: signerToRemove,
      weight: 0,
    },
    source: sourceKeypair.publicKey(),
  });

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(removeSignerOperation)
    .setTimeout(30)
    .build();

  // Sign with all provided signers
  signers.forEach((signer) => tx.sign(signer));

  return await HORIZON.submitTransaction(tx);
}

// Main demonstration script
export default async function demonstrateMultisig() {
  try {
    console.log(chalk.bgCyan`Creating and initializing primary account...`);
    const primaryKeypair = await generateKeypair();
    await initalizeWithFriendbot(primaryKeypair.publicKey());

    console.log(chalk.bgCyan`Generating additional signer accounts...`);
    const signer1Keypair = await generateKeypair(); // weight 1
    const signer2Keypair = await generateKeypair(); // weight 2

    console.log(chalk.bgCyan`Configuring multisig setup...`);
    await configureMultisig(primaryKeypair, signer1Keypair, signer2Keypair);

    // Create a destination account for payment demonstration
    console.log(chalk.bgCyan`Creating destination account...`);
    const destinationKeypair = await generateKeypair();
    await initalizeWithFriendbot(destinationKeypair.publicKey());

    // Demonstrate medium threshold (2) payment scenarios
    console.log(
      `\nDemonstrating payment scenarios requiring medium threshold (2)...`,
    );

    // Try with just weight 1 signer
    try {
      console.log(
        chalk.yellow(`Attempting payment with just weight 1 signer...`),
      );
      await makeMultisigPayment(
        primaryKeypair,
        destinationKeypair.publicKey(),
        "100",
        signer1Keypair, // weight 1
      );
    } catch (e) {
      console.log(
        chalk.red(
          `Expected error: Payment failed - insufficient signatures (weight 1 < threshold 2)`,
        ),
      );
    }

    // Try with weight 2 signer
    try {
      console.log(
        chalk.yellow(`\nAttempting payment with just weight 2 signer...`),
      );
      const result = await makeMultisigPayment(
        primaryKeypair,
        destinationKeypair.publicKey(),
        "100",
        signer2Keypair, // weight 2
      );
      console.log(chalk.green(`Payment successful with weight 2 signer!`));
      logHashLink(result.hash);
    } catch (e) {
      console.error(chalk.red(`Unexpected error: ${e}`));
    }

    // Demonstrate high threshold (3) scenarios
    console.log(`\nDemonstrating high threshold (3) operation scenarios...`);

    // Try with just weight 1 signer
    try {
      console.log(chalk.yellow(`Attempting with just weight 1 signer...`));
      await removeMultisigSigner(
        primaryKeypair,
        signer1Keypair.publicKey(),
        primaryKeypair, // weight 1
      );
    } catch (e) {
      console.log(
        chalk.red(
          `Expected error: Operation failed - insufficient signatures (weight 1 < threshold 3)`,
        ),
      );
    }

    // Try with just weight 2 signer
    try {
      console.log(chalk.yellow(`\nAttempting with just weight 2 signer...`));
      await removeMultisigSigner(
        primaryKeypair,
        signer1Keypair.publicKey(),
        signer2Keypair, // weight 2
      );
    } catch (e) {
      console.log(
        chalk.red(
          `Expected error: Operation failed - insufficient signatures (weight 2 < threshold 3)`,
        ),
      );
    }

    // Try with weight 1 + weight 2 signers combined
    try {
      console.log(
        chalk.yellow(
          `\nAttempting with weight 1 + weight 2 signers combined...`,
        ),
      );
      const result = await removeMultisigSigner(
        primaryKeypair,
        signer1Keypair.publicKey(),
        primaryKeypair, // weight 1
        signer2Keypair, // weight 2
      );
      console.log(
        chalk.green(`Operation successful with combined weight 3 signatures!`),
      );
      logHashLink(result.hash);
    } catch (e) {
      console.error(chalk.red(`Unexpected error: ${e}`));
    }
  } catch (e) {
    console.error(chalk.red(`Error in demonstration: ${e}`));
  }
}

if (import.meta.main) {
  demonstrateMultisig();
}

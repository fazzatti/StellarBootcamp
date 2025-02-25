/*
    This script initializes a new Stellar account by performing
    a create_account operation on the Stellar network for a keypair
    that has been generated but not yet initialized.

    For this script we'll use an admin account to execute the transaction
    and pay for the funds required to create the new account.

    The new account will be funded with 2XLM whichi will barely cover the
    minimum balance.
*/

import chalk from "chalk";
import {
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import generateKeypair from "./generate-keypair.ts";
import initalizeWithFriendbot from "./initialize-with-friendbot.ts";
import { HORIZON } from "../../../infrastructure/horizon/get-horizon-server.ts";
import { logHashLink } from "../../../utils/logHashLink.ts";

export default async function createAccount(
  adminKeypair: Keypair,
  newAccountPublicKey: string,
) {
  console.log(``);
  console.log(
    `Account ${
      chalk.blue(adminKeypair.publicKey())
    } will execute a create_account transaction.`,
  );
  console.log(
    `The account ${chalk.green(newAccountPublicKey)} will be initialized with ${
      chalk.blue("2XLM")
    }.`,
  );

  // Create the create_account operation
  // destination: The public key of the account to be created
  // startingBalance: The amount of XLM to send to the new account
  // source: The public key of the account that will pay for the transaction and the funds
  const createAccountOperation = Operation.createAccount({
    destination: newAccountPublicKey,
    startingBalance: "2",
    source: adminKeypair.publicKey(),
  });

  // Load the admin account from the network to get
  // the current sequence number.
  console.log(`Loading the admin account from the network...`);
  const loadedAdminAccount = await HORIZON.loadAccount(
    adminKeypair.publicKey(),
  );

  // Build the transaction, then append the create_account operation
  // and set a timeout of 30 seconds.
  const tx = new TransactionBuilder(loadedAdminAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(createAccountOperation)
    .setTimeout(30)
    .build();

  // Sign the transaction with the admin account
  tx.sign(adminKeypair);

  // Submit the transaction to the network through the Horizon server
  console.log(`Submitting transaction...`);
  HORIZON.submitTransaction(tx).then((transactionResult) => {
    console.log(chalk.green(`Success!`));
    console.log(``);
    logHashLink(transactionResult.hash);
  });
  return;
}

if (import.meta.main) {
  console.log("");
  console.log(chalk.bgCyan`Creating and Initializing Admin account...`);

  const adminKeypair = await generateKeypair();
  await initalizeWithFriendbot(adminKeypair.publicKey());

  console.log("");
  console.log(chalk.bgCyan`Creating new account...`);
  const newAccountKeypair = await generateKeypair();

  createAccount(adminKeypair, newAccountKeypair.publicKey());
}

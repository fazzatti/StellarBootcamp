/*
    This script is an extension from create-account
    in which we also create a trustline for the new account
    in the same transaction.

    The asset is a dummy asset called TEST and the asset issuer is
    the same admin account that is creating the new account.

    Important: Since this transaction is modifying the new account
    by adding a trustline, this operation requires explicit authorization
    from the new account. This means that the new account must sign the
    transaction as well. As a result, this function requires its keypair
    instead of the public key.
*/

import chalk from "chalk";
import {
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import generateKeypair from "./generate-keypair.ts";
import initalizeWithFriendbot from "./initialize-with-friendbot.ts";
import { HORIZON } from "../../../infrastructure/horizon/get-horizon-server.ts";
import { logHashLink } from "../../../utils/logHashLink.ts";

export default async function createAccountWithTrustline(
  adminKeypair: Keypair,
  newAccountKeypair: Keypair,
  assetSymbol: string,
) {
  console.log(``);
  console.log(
    `Admin account ${
      chalk.blue(adminKeypair.publicKey())
    } will execute a create_account transaction.`,
  );
  console.log(
    `The account ${
      chalk.green(newAccountKeypair.publicKey())
    } will be initialized with ${chalk.blue("2XLM")} and..`,
  );
  console.log(
    `execute a change_trust operation to create a trustline for the ${
      chalk.blue(assetSymbol)
    } asset.`,
  );

  // Create the create_account operation
  // destination: The public key of the account to be created
  // startingBalance: The amount of XLM to send to the new account
  // source: The public key of the account that will pay for the transaction and the funds
  const createAccountOperation = Operation.createAccount({
    destination: newAccountKeypair.publicKey(),
    startingBalance: "2",
    source: adminKeypair.publicKey(),
  });

  // Create the change_trust operation
  // asset: The asset to trust. Here we are trusting the asset issued by the admin account
  // source: The public key of the account that will be modified by getting a trustline
  const changeTrustOperation = Operation.changeTrust({
    asset: new Asset(assetSymbol, adminKeypair.publicKey()),
    source: newAccountKeypair.publicKey(),
  });

  // Load the admin account from the network to get
  // the current sequence number.
  console.log(`Loading the admin account from the network...`);
  const loadedAdminAccount = await HORIZON.loadAccount(
    adminKeypair.publicKey(),
  );

  // Build the transaction, then append the operations in order
  // and set a timeout of 30 seconds.
  const tx = new TransactionBuilder(loadedAdminAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(createAccountOperation)
    .addOperation(changeTrustOperation)
    .setTimeout(30)
    .build();

  // Sign the transaction with the admin account
  tx.sign(adminKeypair);
  // Sign the transaction with the new account
  tx.sign(newAccountKeypair);

  // Submit the transaction to the network through the Horizon server
  console.log(`Submitting transaction...`);
  await HORIZON.submitTransaction(tx).then((transactionResult) => {
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

  const assetSymbol = "TEST";

  console.log("");
  console.log(
    chalk.bgCyan`Creating new account with trutline for the ${
      chalk.blue(assetSymbol)
    } asset...`,
  );
  const newAccountKeypair = await generateKeypair();

  createAccountWithTrustline(adminKeypair, newAccountKeypair, assetSymbol);
}

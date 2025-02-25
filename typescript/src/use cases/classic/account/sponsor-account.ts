/*
    This script is a modified version of create-account-with-trustline
    in which the admin account also sponsors the account being created which
    delegates the minimum balance requirements to the admin account and allows
    the new account to be created with a balance of 0XLM.

    To achieve this, we have to introduce two new operations to encompass the
    sponsorship process around the create_account and the change_trust
    operations.
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

export default async function createSponsoredAccountWithTrustline(
  adminKeypair: Keypair,
  newAccountKeypair: Keypair,
) {
  console.log(``);
  console.log(
    `Admin account ${
      chalk.blue(adminKeypair.publicKey())
    } will execute a create_account transaction`,
  );
  console.log(
    `The account ${
      chalk.green(newAccountKeypair.publicKey())
    } will be initialized with ${chalk.red("0XLM")} and..`,
  );
  console.log(
    `...execute a change_trust operation to create a trustline for the TEST asset.`,
  );
  console.log(
    `The operations will be sponsored by the admin account to cover the minimum balance requirements.`,
  );

  // Create the begin_sponsoring_future_reserves operation
  // sponsoredId: The public key of the account being sponsored
  // source: The public key of the account that will pay for the transaction fees
  //
  // This operation starts a process in which all subsequent operations by the
  // sponsored account are sponsored by the source account until the
  // end_sponsoring_future_reserves operation is executed. If the closing
  // operation is not included in the transaction, it will fail.
  const beginSponsoringOp = Operation.beginSponsoringFutureReserves({
    sponsoredId: newAccountKeypair.publicKey(),
    source: adminKeypair.publicKey(),
  });

  // Create the create_account operation
  // destination: The public key of the account to be created
  // startingBalance: The amount of XLM to send to the new account
  // source: The public key of the account that will pay for the transaction and the funds
  const createAccountOperation = Operation.createAccount({
    destination: newAccountKeypair.publicKey(),
    startingBalance: "0",
    source: adminKeypair.publicKey(),
  });

  // Create the change_trust operation
  // asset: The asset to trust. Here we are trusting the TEST asset issued by the admin account
  // source: The public key of the account that will be modified by getting a trustline
  const changeTrustOperation = Operation.changeTrust({
    asset: new Asset("TEST", adminKeypair.publicKey()),
    source: newAccountKeypair.publicKey(),
  });

  // Create the end_sponsoring_future_reserves operation
  // source: The public key of the account that will stop being sponsored
  //
  // Since this operation is performed from the perspective of the sponsored account,
  // it also required a signature from the sponsored account to authorize the operation.
  const endSponsoringOp = Operation.endSponsoringFutureReserves({
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
    .addOperation(beginSponsoringOp)
    .addOperation(createAccountOperation)
    .addOperation(changeTrustOperation)
    .addOperation(endSponsoringOp)
    .setTimeout(30)
    .build();

  // Sign the transaction with the admin account
  tx.sign(adminKeypair);
  // Sign the transaction with the new account
  tx.sign(newAccountKeypair);

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
  console.log(
    chalk.bgCyan`Sponsoring the Creation of a new account with trutline...`,
  );
  const newAccountKeypair = await generateKeypair();

  createSponsoredAccountWithTrustline(adminKeypair, newAccountKeypair);
}

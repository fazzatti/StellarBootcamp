/*
    This script covers the creation of a native asset through the
    design pattern of a pair issuer/distribution. In this pattern
    a pair of accounts is created to manage the asset creation, its
    supply and distribution.

    This approach is used to concentrate supply management in a single
    account to facilitate transparency and traceability of the asset's
    lifecycle.

    Issuer: The issuer account is responsible for creating and controlling
    the asset. It is the only account that can create new tokens and modify
    the asset's properties.

    Distribution: The distribution account is responsible for creating
    the first trustline for the asset and being the first recipient of all
    the newly minted tokens.

    Important: To use this function, ensure that both the issuer and distribution
    accounts have been initialized and funded with the minimum balance requirements.
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

export default async function createAsset(
  issuerKeypair: Keypair,
  distributionKeypair: Keypair,
  assetSymbol: string,
) {
  console.log(``);
  console.log(
    `Creating asset ${chalk.green(assetSymbol)} with:
     - Issuer: ${chalk.blue(issuerKeypair.publicKey())}
     - Distribution: ${chalk.blue(distributionKeypair.publicKey())}
     
     The asset identifier is the combination of the issuer's public key and the asset symbol:
     ${chalk.green(assetSymbol + ":" + issuerKeypair.publicKey())}
      
The distribution account will create a trustline for the asset.
 and receive ${chalk.blue("1M")} newly minted ${assetSymbol} tokens.
 `,
  );

  // Create the change_trust operation
  //
  // asset: The asset to trust. Here we are trusting the custom asset
  // issued by the issuer account
  //
  // source: The public key of the account that will be modified by getting
  // a trustline. In this case, the distribution account
  const changeTrustOperation = Operation.changeTrust({
    asset: new Asset(assetSymbol, issuerKeypair.publicKey()),
    source: distributionKeypair.publicKey(),
  });

  // Create the payment operation
  //
  // destination: The public key of the account receiving the payment.
  // In this case, the distribution account.
  //
  // asset: The asset to send. In this case, the custom asset issued by the
  // issuer account
  //
  // amount: The amount of the asset to send. In this case, 1M tokens
  //
  // source: The public key of the account sending the payment. In this case,
  // the issuer account. As this is the issuer account, the tokens are minted
  // in the process.
  const payment = Operation.payment({
    destination: distributionKeypair.publicKey(),
    asset: new Asset(assetSymbol, issuerKeypair.publicKey()),
    amount: "1000000",
    source: issuerKeypair.publicKey(),
  });

  // Load the issuer account from the network to get
  // the current sequence number.
  console.log(`Loading the admin account from the network...`);
  const loadedIssuerAccount = await HORIZON.loadAccount(
    issuerKeypair.publicKey(),
  );

  // Build the transaction, then append the operations in order
  // and set a timeout of 30 seconds.
  const tx = new TransactionBuilder(loadedIssuerAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(changeTrustOperation)
    .addOperation(payment)
    .setTimeout(30)
    .build();

  // Sign the transaction with the issuer account
  tx.sign(issuerKeypair);
  // Sign the transaction with the distribution account
  tx.sign(distributionKeypair);

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
  console.log(chalk.bgCyan`Creating and initializing the issuer account...`);

  const issuerKeypair = await generateKeypair();
  await initalizeWithFriendbot(issuerKeypair.publicKey());

  console.log("");
  console.log(
    chalk.bgCyan`Creating and initializing the distribution account...`,
  );
  const distributionKeypair = await generateKeypair();
  await initalizeWithFriendbot(distributionKeypair.publicKey());

  console.log("");
  console.log(chalk.bgCyan`Creating the asset and minting tokens...`);

  const assetSymbol = "FIFO";
  createAsset(issuerKeypair, distributionKeypair, assetSymbol);
}

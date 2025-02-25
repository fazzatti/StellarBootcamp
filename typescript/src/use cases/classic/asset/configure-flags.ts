/*
    This script demonstrates the configuration and usage of asset control flags
    in Stellar, specifically managing asset properties through control flags:

    1. AUTH_REQUIRED: Requires issuer approval before accounts can hold the asset
    2. AUTH_REVOCABLE: Allows the issuer to freeze/unfreeze trustlines
    3. AUTH_CLAWBACK_ENABLED: Allows the issuer to retrieve assets from accounts

    The script demonstrates a complete flow:
    - Setting up an asset with all control flags enabled
    - Creating and approving trustlines
    - Making payments with approved and non-approved accounts
    - Freezing/unfreezing accounts to control payments
    - Performing clawback to retrieve funds

    This helps understand how asset issuers can implement compliance
    and control mechanisms using Stellar's built-in features.
*/

import chalk from "chalk";
import {
  Asset,
  AuthClawbackEnabledFlag,
  AuthFlag,
  AuthRequiredFlag,
  AuthRevocableFlag,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

import { HORIZON } from "../../../infrastructure/horizon/get-horizon-server.ts";
import { logHashLink } from "../../../utils/logHashLink.ts";
import generateKeypair from "../account/generate-keypair.ts";
import initalizeWithFriendbot from "../account/initialize-with-friendbot.ts";
import createAccountWithTrustline from "../account/create-account-with-trustline.ts";

// This function sets up an asset with the following control flags:
// - AUTH_REQUIRED: Requires issuer approval before accounts can hold the asset
// - AUTH_REVOCABLE: Allows the issuer to freeze/unfreeze trustlines
// - AUTH_CLAWBACK_ENABLED: Allows the issuer to retrieve assets from accounts
export async function enableControlFlags(
  issuerKeypair: Keypair,
) {
  console.log(
    `Enabling control flags on issuer account ${
      chalk.blue(issuerKeypair.publicKey())
    }...`,
  );

  const loadedAccount = await HORIZON.loadAccount(issuerKeypair.publicKey());

  // Operation to set the flags on the asset. The operation used here
  // is called setOptions and it serves multiple purposes. In a general
  // sense, it is used to modify certaint attributes of an account.
  //
  // In this case, we are using it to set the flags on the issuer account.
  // As a result, from this moment on, all assets controlled by this
  // issuer account will be affected by the flags.
  //
  // Args:
  // - setFlags: receives the combination of flags to be set.
  //
  // - source: the account that will be modified with these flags.
  // In this case, it is the issuer account.
  const setOptionsOperation = Operation.setOptions({
    setFlags: (AuthClawbackEnabledFlag | AuthRevocableFlag |
      AuthRequiredFlag) as AuthFlag,
    source: issuerKeypair.publicKey(),
  });

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(setOptionsOperation)
    .setTimeout(30)
    .build();

  tx.sign(issuerKeypair);

  console.log(`Submitting set flags transaction...`);
  await HORIZON.submitTransaction(tx).then((result) => {
    console.log(chalk.green(`Flags set successfully!`));
    logHashLink(result.hash);
  });

  return;
}

// This function creates a trustline for an account.
//
// Args:
// - accountKeypair: The keypair of the account that will receive the trustline.
// - asset: The asset that will be used to create the trustline.
export async function createTrustline(
  accountKeypair: Keypair,
  asset: Asset,
) {
  console.log(
    `Creating trustline for account ${
      chalk.blue(accountKeypair.publicKey())
    }...`,
  );

  const loadedAccount = await HORIZON.loadAccount(accountKeypair.publicKey());

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({
      asset,
      source: accountKeypair.publicKey(),
    }))
    .setTimeout(30)
    .build();

  tx.sign(accountKeypair);

  console.log(`Submitting trustline creation...`);
  const result = await HORIZON.submitTransaction(tx);
  console.log(chalk.green(`Trustline created successfully!`));
  logHashLink(result.hash);
}

// This function sets the authorization for a trustline.
//
// Args:
// - issuerKeypair: The keypair of the account that will be used to set the authorization.
// - accountPublicKey: The public key of the account that will receive the trustline.
// - asset: The asset that will be used to create the trustline.
// - authorize: A boolean that indicates if the trustline should be authorized or not.
export async function setTrustlineAuthorization(
  issuerKeypair: Keypair,
  accountPublicKey: string,
  asset: Asset,
  authorize: boolean,
) {
  console.log(
    `\n${
      authorize ? chalk.green("Authorizing") : chalk.red("Deauthorizing")
    } trustline for account ${chalk.blue(accountPublicKey)}...`,
  );

  // This is the allowTrust operation that will be added to the transaction.
  //
  // Args:
  // - trustor: The public key of the account that will receive the trustline.
  // - assetCode: The code of the asset that will be used to create the trustline.
  // - authorize: A boolean that indicates if the trustline should be authorized or not.
  // - source: The public key of the account that will perform the authorization.
  const allowTrustOperation = Operation.allowTrust({
    trustor: accountPublicKey,
    assetCode: asset.getCode(),
    authorize: authorize,
    source: issuerKeypair.publicKey(),
  });

  const loadedAccount = await HORIZON.loadAccount(issuerKeypair.publicKey());

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(allowTrustOperation)
    .setTimeout(30)
    .build();

  tx.sign(issuerKeypair);

  console.log(`Submitting authorization change...`);
  const result = await HORIZON.submitTransaction(tx).catch((e) => {
    console.log(
      chalk.red(`Error: ${e.response.data.extras.result_codes.operations}`),
    );
    throw new Error(e.response.data.extras.result_codes.operations);
  });
  console.log(chalk.green(`Authorization updated successfully!`));
  logHashLink(result.hash);
}

// This function makes a payment from one account to another.
//
// Important: the 'from' account must have XLM to cover the network fee
// for the payment.
//
// Args:
// - fromKeypair: The keypair of the account that will send the payment.
// - toPublicKey: The public key of the account that will receive the payment.
// - asset: The asset that will be used to make the payment.
// - amount: The amount of the payment.
export async function makePayment(
  fromKeypair: Keypair,
  toPublicKey: string,
  asset: Asset,
  amount: string,
) {
  console.log(
    `Making payment of ${chalk.blue(amount)} ${asset.getCode()} from ${
      chalk.green(fromKeypair.publicKey())
    } to ${chalk.green(toPublicKey)}...`,
  );

  // This is the payment operation that will be added to the transaction.
  //
  // Args:
  // - destination: The public key of the account that will receive the payment.
  // - asset: The asset that will be used to make the payment.
  // - amount: The amount of the payment.
  // - source: The public key of the account that will send the payment.
  const paymentOperation = Operation.payment({
    destination: toPublicKey,
    asset: asset,
    amount: amount,
    source: fromKeypair.publicKey(),
  });

  const loadedAccount = await HORIZON.loadAccount(fromKeypair.publicKey());

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(paymentOperation)
    .setTimeout(30)
    .build();

  tx.sign(fromKeypair);

  console.log(`Submitting payment transaction...`);
  const result = await HORIZON.submitTransaction(tx);
  console.log(chalk.green(`Payment successful!`));
  logHashLink(result.hash);
}

// This function performs a clawback of an asset from an account.
//
// Args:
// - issuerKeypair: The keypair of the account that will perform the clawback.
// - fromPublicKey: The public key of the account that will be clawed back.
// - asset: The asset that will be clawed back.
// - amount: The amount of the clawback.
export async function clawback(
  issuerKeypair: Keypair,
  fromPublicKey: string,
  asset: Asset,
  amount: string,
) {
  console.log(
    `Clawing back ${chalk.blue(amount)} ${asset.getCode()} from ${
      chalk.green(fromPublicKey)
    }...`,
  );

  // This is the clawback operation that will be added to the transaction.
  //
  // Args:
  // - from: The public key of the account that will be clawed back.
  // - asset: The asset that will be clawed back.
  // - amount: The amount of the clawback.
  // - source: The public key of the account that will perform the clawback.
  const clawbackOperation = Operation.clawback({
    from: fromPublicKey,
    asset: asset,
    amount: amount,
    source: issuerKeypair.publicKey(),
  });

  const loadedAccount = await HORIZON.loadAccount(issuerKeypair.publicKey());

  const tx = new TransactionBuilder(loadedAccount, {
    fee: "1000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(clawbackOperation)
    .setTimeout(30)
    .build();

  tx.sign(issuerKeypair);

  console.log(`Submitting clawback transaction...`);
  const result = await HORIZON.submitTransaction(tx);
  console.log(chalk.green(`Clawback successful!`));
  logHashLink(result.hash);
}

// Final script that demonstrates the control flags.
//
export default async function demonstrateAssetControls() {
  try {
    console.log(chalk.bgCyan`Creating and initializing issuer account...`);
    const issuerKeypair = await generateKeypair();
    await initalizeWithFriendbot(issuerKeypair.publicKey());

    const assetCode = "CTRL";
    const asset = new Asset(assetCode, issuerKeypair.publicKey());

    console.log(chalk.bgCyan`Enabling control flags on issuer account...`);
    await enableControlFlags(issuerKeypair);

    console.log(
      chalk.bgCyan`Creating and initializing user account: Alice`,
    );
    const alice = await generateKeypair();
    await createAccountWithTrustline(issuerKeypair, alice, assetCode);

    console.log(chalk.bgCyan`Creating and initializing user account: Bob`);
    const bob = await generateKeypair();
    await createAccountWithTrustline(issuerKeypair, bob, assetCode);

    console.log(chalk.bgCyan`\nDemonstrating AUTH_REQUIRED...`);
    try {
      await makePayment(issuerKeypair, alice.publicKey(), asset, "1000");
      console.log(chalk.red(`Unexpected success: Payment should have failed`));
    } catch (e) {
      console.log(
        chalk.yellow(`Expected error: Payment failed before authorization!
            ${(e as Error).message}\n`),
      );
    }

    console.log(chalk.bgCyan`Authorizing trustlines...`);
    await setTrustlineAuthorization(
      issuerKeypair,
      alice.publicKey(),
      asset,
      true,
    );
    await setTrustlineAuthorization(
      issuerKeypair,
      bob.publicKey(),
      asset,
      true,
    );

    console.log(chalk.bgCyan`Making payments...`);
    await makePayment(issuerKeypair, alice.publicKey(), asset, "1000");
    await makePayment(alice, bob.publicKey(), asset, "500");

    // Demonstrate AUTH_REVOCABLE (freeze)
    console.log(chalk.bgCyan`\nDemonstrating AUTH_REVOCABLE...`);
    console.log(
      chalk.bgCyan`Alice's account will be frozen and a payment will fail.`,
    );
    await setTrustlineAuthorization(
      issuerKeypair,
      alice.publicKey(),
      asset,
      false,
    );
    try {
      await makePayment(alice, bob.publicKey(), asset, "100");
      console.log(chalk.red(`Unexpected success: Payment should have failed`));
    } catch (e) {
      console.log(
        chalk.yellow(`Expected error: Payment failed while frozen
        ${(e as Error).message} \n`),
      );
    }

    console.log(
      chalk
        .bgCyan`Alice's account will be unfrozen and a payment will succeed.`,
    );
    await setTrustlineAuthorization(
      issuerKeypair,
      alice.publicKey(),
      asset,
      true,
    );
    await makePayment(alice, bob.publicKey(), asset, "100");

    // Demonstrate CLAWBACK
    const amount = "250";
    console.log(chalk.bgCyan`\nDemonstrating AUTH_CLAWBACK_ENABLED...`);
    console.log(
      chalk.bgCyan`Bob's account will be clawed back and ${
        chalk.blue(amount) + " " + asset.getCode()
      } will be burned.`,
    );
    await clawback(issuerKeypair, bob.publicKey(), asset, amount);
  } catch (e) {
    console.error(chalk.red(`Error in demonstration:`));
  }
}

if (import.meta.main) {
  demonstrateAssetControls();
}

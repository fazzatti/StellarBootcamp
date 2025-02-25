/*
    This script generates a random Stellar keypair.
    The keypair consists primarily of a public key and a secret key.
    The object also contains a few utility methods for signing and verifying signatures.

    !! The secret key should be kept confidential and should never be shared as
    it allows complete control over the account. !!

    It is also important to note that at this stage, the keypair is simply generated
    programmatically and there is no real-world connection to the Stellar network yet.
    In order to interact with the network, the keypair should be initialized as an
    active account through a create_account operation.

*/

import chalk from "chalk";
import { Keypair } from "@stellar/stellar-sdk";

export default async function generateKeypair() {
  const keypair = Keypair.random();
  console.log();
  console.log(``);
  console.log(`Keypair generated!`);
  console.log(`Public Key: ${chalk.green(keypair.publicKey())}`);
  console.log(`Secret Key: ${chalk.red(keypair.secret())}`);

  return keypair;
}

if (import.meta.main) {
  generateKeypair();
}

/*
    This script uses a keypair that hasn't been initialized yet
    and initializes it using the friendbot service.

    The friendbot service is a Stellar service available for test networks
    such as the Stellar Testnet and Stellar Futurenet. It automatically initalizes new
    accounts by executing a transaction with the create_account operation.

    In the process, the friendbot service also funds the account with 10.000XLM to
    cover the minimum balance requirements and the transaction fees when interacting with
    the network.

*/
import chalk from "chalk";
import generateKeypair from "./generate-keypair.ts";

export default async function initalizeWithFriendbot(publicKey: string) {
  console.log(``);
  console.log(
    `Initializing account ${chalk.green(publicKey)} with friendbot...`,
  );

  const URL = `https://friendbot.stellar.org?addr=${publicKey}`;

  await fetch(URL).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Friendbot responded with an error! status: ${response.status} Message: ${response.statusText}`,
      );
    }
    console.log(`Account initialized!`);
  });

  return;
}

if (import.meta.main) {
  const keypair = await generateKeypair();

  initalizeWithFriendbot(keypair.publicKey());
}

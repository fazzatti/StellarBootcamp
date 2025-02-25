import chalk from "chalk";

export const logHashLink = (hash: string) => {
  console.log(
    chalk.blue(`https://stellar.expert/explorer/testnet/tx/${hash} \n`),
  );
};

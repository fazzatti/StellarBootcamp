/*
    This script instantiates a Horizon server client for the Stellar Testnet
    to be used in the use cases.
*/

import { Horizon } from "@stellar/stellar-sdk";

const testnetHorizonUrl = "https://horizon-testnet.stellar.org";
const horizonOptions: Horizon.Server.Options = { allowHttp: true };

export const HORIZON = await new Horizon.Server(
  testnetHorizonUrl,
  horizonOptions,
);

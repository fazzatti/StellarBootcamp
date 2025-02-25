import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  Duration,
  i128,
  i256,
  i32,
  i64,
  Option,
  Typepoint,
  u128,
  u256,
  u32,
  u64,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBHHNW5EBF5BNJRD6625UZQGAF46YFVFKHEVSIA6RHA2YGJK54AV5H3F",
  },
} as const;

export interface DefEvent {
  contract: string;
  ledger_number: u32;
  message: string;
}

export const Errors = {};

export interface Client {
  /**
   * Construct and simulate a default transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  default: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a custom transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  custom: ({ message }: { message: string }, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;
}
export class Client extends ContractClient {
  static override async deploy<T = Client>(
    /** Options for initalizing a Client as well as for calling a method, with extras specific to deploying. */
    options:
      & MethodOptions
      & Omit<ContractClientOptions, "contractId">
      & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public override readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAQAAAAAAAAAAAAAACERlZkV2ZW50AAAAAwAAAAAAAAAIY29udHJhY3QAAAATAAAAAAAAAA1sZWRnZXJfbnVtYmVyAAAAAAAABAAAAAAAAAAHbWVzc2FnZQAAAAAR",
        "AAAAAAAAAAAAAAAHZGVmYXVsdAAAAAAAAAAAAA==",
        "AAAAAAAAAAAAAAAGY3VzdG9tAAAAAAABAAAAAAAAAAdtZXNzYWdlAAAAABEAAAAA",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    default: this.txFromJSON<null>,
    custom: this.txFromJSON<null>,
  };
}

import {
  getClient,
  GrpcClient,
} from "https://deno.land/x/grpc_basic@0.4.7/client.ts";
import { IngestService, Timestamp, Value } from "./ingest.d.ts";

const schemaName = "actions";

export class ActionClient {
  private readonly client: GrpcClient & IngestService;
  private seqNo: number = 0;

  static async new(port: number): Promise<ActionClient> {
    const protoPath = new URL("./ingest.proto", import.meta.url);
    const protoFile = await Deno.readTextFile(protoPath);

    const client = getClient<IngestService>({
      port,
      root: protoFile,
      serviceName: "IngestService",
    });

    return new ActionClient(client);
  }

  private constructor(client: GrpcClient & IngestService) {
    this.client = client;
  }

  /**
   * Deposits money into the account.
   */
  async deposit(time: Date, amountInDollar: number) {
    await this.insert([
      {
        stringValue: "Deposit",
      },
      {
        floatValue: amountInDollar,
      },
      {},
      {
        timestampValue: dateToTimestamp(time),
      },
      {},
    ]);
  }

  /**
   * Buys an asset at given price using all the money in the account.
   */
  async buy(time: Date, ticker: string, priceInDollar: number) {
    await this.insert([
      {
        stringValue: "Buy",
      },
      {},
      {
        stringValue: ticker,
      },
      {
        timestampValue: dateToTimestamp(time),
      },
      {
        floatValue: priceInDollar,
      },
    ]);
  }

  /**
   * Sells all the held asset at given price.
   */
  async sell(time: Date, ticker: string, priceInDollar: number) {
    await this.insert([
      {
        stringValue: "Sell",
      },
      {},
      {
        stringValue: ticker,
      },
      {
        timestampValue: dateToTimestamp(time),
      },
      {
        floatValue: priceInDollar,
      },
    ]);
  }

  async close() {
    await this.client.close();
  }

  private async insert(values: Value[]) {
    const seqNo = this.seqNo;
    this.seqNo += 1;
    await this.client.ingest({
      schemaName,
      typ: "INSERT",
      new: values,
      seqNo,
    });
  }
}

function dateToTimestamp(date: Date): Timestamp {
  const millis = date.getTime();
  const seconds = Math.floor(millis / 1000);
  const nanos = (millis % 1000) * 1000000;
  return {
    seconds,
    nanos,
  };
}

import {
  getClient,
  GrpcClient,
} from "https://deno.land/x/grpc_basic@0.4.7/client.ts";
import { IngestService, Timestamp, Value } from "./ingest.d.ts";

const schemaName = "actions";

export class ActionClient {
  private seqNo: number = 0;

  static async newGrpc(strategy: string, port: number): Promise<ActionClient> {
    return new ActionClient(strategy, await GrpcWriter.new(port));
  }

  static async newFile(path: string): Promise<ActionClient> {
    return new ActionClient(path, await FileWriter.new(path));
  }

  private constructor(
    readonly strategy: string,
    readonly writer: FileWriter | GrpcWriter,
  ) {}

  /**
   * Deposits money into the account.
   */
  async deposit(time: Date, amountInDollar: number) {
    await this.insert([
      {
        stringValue: this.strategy,
      },
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
        stringValue: this.strategy,
      },
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
        stringValue: this.strategy,
      },
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

  /**
   * Don't do anything for the given quote.
   */
  async skip(time: Date, ticker: string, priceInDollar: number) {
    await this.insert([
      {
        stringValue: this.strategy,
      },
      {},
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

  close() {
    this.writer.close();
  }

  private async insert(values: Value[]) {
    const seqNo = this.seqNo;
    this.seqNo += 1;
    await this.writer.write({
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

export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp.seconds! * 1000 + timestamp.nanos! / 1000000);
}

export class GrpcWriter {
  private readonly client: GrpcClient & IngestService;

  static async new(port: number): Promise<GrpcWriter> {
    const protoPath = new URL("./ingest.proto", import.meta.url);
    const protoFile = await Deno.readTextFile(protoPath);

    const client = getClient<IngestService>({
      port,
      root: protoFile,
      serviceName: "IngestService",
    });

    return new GrpcWriter(client);
  }

  constructor(client: GrpcClient & IngestService) {
    this.client = client;
  }

  async write(data: object) {
    await this.client.ingest(data);
  }

  close() {
    this.client.close();
  }
}

class FileWriter {
  static new(path: string): Promise<FileWriter> {
    const file = Deno.openSync(path, {
      create: true,
      write: true,
    });
    return new FileWriter(file);
  }

  constructor(readonly file: Deno.FsFile) {}

  async write(data: object) {
    this.file.writeSync(new TextEncoder().encode(JSON.stringify(data) + "\n"));
  }

  close() {
    this.file.close();
  }
}

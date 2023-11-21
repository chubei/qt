import {
  ActionClient,
  timestampToDate,
} from "../../strategy/common/action_client.ts";
import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";

async function ingestFromFile(path: string) {
  const file = await Deno.open(path);

  let client: ActionClient | null = null;

  for await (const lineBytes of readline(file)) {
    const line = new TextDecoder().decode(lineBytes);
    if (line.length === 0) {
      break;
    }

    const data = JSON.parse(line);
    if (client === null) {
      client = await ActionClient.newGrpc(data.new[0].stringValue, 12345);
      client.deposit(timestampToDate(data.new[4].timestampValue), 100_000);
    }

    await client.writer.write(data);
  }

  client?.close();
}

for (const path of Deno.args) {
  await ingestFromFile(path);
}

import { ActionClient } from "../strategy/common/action_client.ts";

const client = await ActionClient.newGrpc(12345);
await client.deposit(new Date(0, 0, 0, 0, 0, 0, 0), 100_000);
client.close();

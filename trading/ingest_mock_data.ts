import { ActionClient } from "../strategy/common/action_client.ts";

const client = await ActionClient.new(12345);
await client.deposit(new Date(), 100);
await client.buy(new Date(), "AAPL", 100);
await client.sell(new Date(), "AAPL", 200);
await client.close();

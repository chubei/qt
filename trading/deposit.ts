import { ActionClient } from "../strategy/common/action_client.ts";

for (const strategy of Deno.args) {
    const client = await ActionClient.newGrpc(strategy, 12345);
    await client.deposit(new Date(0, 0, 0, 0, 0, 0, 0), 100_000);
    client.close();
}

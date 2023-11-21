import { GrpcWriter } from "../../strategy/common/action_client.ts";
import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";

const file = await Deno.open(Deno.args[0]);
const writer = await GrpcWriter.new(12345);
for await (const lineBytes of readline(file)) {
    const line = new TextDecoder().decode(lineBytes);
    if (line.length === 0) {
        break;
    }
    await writer.write(JSON.parse(line));
}
writer.close();

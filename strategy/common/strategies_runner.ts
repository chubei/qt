import {} from "./init_lambda.ts";
import {Basic} from "./strategies/basic.ts";
import {Value} from "./strategies/interface.ts";


const strategies = [new Basic()];

const run = async (v: { new: { value: Value } }) => {
    for (const strategy of strategies) {
        await strategy.run(v);
    }
}

export default run;
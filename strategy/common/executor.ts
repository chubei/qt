import {ActionClient} from "../../strategy/common/action_client.ts";

let currentBalance = 0;

let client: ActionClient = await ActionClient.new(12345);

const run = (obj: any) => {
    // console.log("Running strategy");
    console.log(obj);

    if (obj.new.action === 'Deposit') {
        currentBalance += obj.new.amount_in_dollar;
    } else if (obj.new.action === 'Buy') {
        currentBalance -= obj.new.price_in_dollar;
    } else if (obj.new.action === 'Sell') {
        currentBalance += obj.new.price_in_dollar;
    }

    return currentBalance;
    // console.log("Current balance: ", currentBalance);
}

export default run;
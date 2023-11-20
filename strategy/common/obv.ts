import {ActionClient} from "./action_client.ts";
import {} from "./init_lambda.ts";

let client: ActionClient = await ActionClient.new(12345);

/*
 Enter position when one of conditions is met:
 - OBV > 0

 Exit position when one of conditions is met:
 - OBV < 0
 - 5% profit
 - 60 days
*/

const PROFIT_MARGIN = 0.05;
const MAX_DAYS = 60;

let previousDayPrice = null;
let obv = 0;

let entryPoint = {
    price: 0,
    date: null,
};

let testEntryCondition = () => {
    if (obv > 0) {
        return true;
    }
};

let testExitCondition = (obj) => {
    if (obv < 0) {
        return true;
    }

    if (entryPoint.price && obj.new.Close > entryPoint.price * (1 + PROFIT_MARGIN)) {
        return true;
    }


    if (entryPoint.date) {
        const diffTime = Math.abs(new Date(obj.new.Date) - new Date(entryPoint.date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > MAX_DAYS) {
            return true;
        }
    }
};

let balance = 1000;

const run = async (obj: any) => {
    if (previousDayPrice !== null) {
        if (obj.new.Close > previousDayPrice) {
            obv += obj.new.Volume;
        } else if (obj.new.Close === previousDayPrice) {
            obv = obj.new.Volume;
        } else {
            obv -= obj.new.Volume;
        }
    }

    previousDayPrice = obj.new.Close;

    console.log(`${obj.new.Date} OBV ${obv}`);

    if (entryPoint.date === null) {
        if (testEntryCondition()) {
            entryPoint.price = obj.new.Close;
            entryPoint.date = obj.new.Date;
            console.log(`Entry point ${entryPoint.price} ${entryPoint.date}`);
            await client.buy(new Date(obj.new.Date), "AAPL", obj.new.Close);
        }
    } else {
        if (testExitCondition(obj)) {
            balance *= obj.new.Close / entryPoint.price;

            console.log(`Exit point ${obj.new.Close} ${obj.new.Date}`);
            console.log(`Balance ${balance}`);

            entryPoint.price = 0;
            entryPoint.date = null;

            await client.sell(new Date(obj.new.Date), "AAPL", obj.new.Close);
        }
    }
}

export default run;
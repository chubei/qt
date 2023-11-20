
import {ActionClient} from "./action_client.ts";
import {} from "./init_lambda.ts";

//
// let currentBalance = 0;
//
let client: ActionClient = await ActionClient.new(12345);

// Very basic strategy - try to buy everyday (if there is any money in wallet)
// and sell 10 days later

const sellDates = {};

const run = async (obj: any) => {
 let newDate = new Date(obj.new.Date);

 newDate.setDate(newDate.getDate() + 10);
 sellDates[newDate.toISOString().split('T')[0]] = true;

 console.log('buy date', obj.new.Date);
 console.log('sell date', newDate.toISOString().split('T')[0]);

 // Indicate buy
 await client.buy(new Date(obj.new.Date), "AAPL", obj.new.Close);

 if (sellDates[obj.new.Date] === true) {
  await client.sell(new Date(obj.new.Date), "AAPL", obj.new.Close);
 }
}

export default run;
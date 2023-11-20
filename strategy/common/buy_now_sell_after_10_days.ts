import {ActionClient} from "./action_client.ts";
//
// let currentBalance = 0;
//
let client: ActionClient = await ActionClient.new(12345);

// Very basic strategy - try to buy everyday (if there is any money in wallet)
// and sell 10 days later

const sellDates = {};

const run = (obj: any) => {
 let newDate = new Date(obj.new.Date);

 newDate.setDate(newDate.getDate() + 10);
 sellDates[newDate.toISOString().split('T')[0]] = true;

 console.log('buy date', obj.new.Date);
 console.log('sell date', newDate.toISOString().split('T')[0]);

 // Indicate buy
 console.log('buying');

 if (sellDates[obj.new.Date] === true) {
   // Indicate sell
  console.log('selling');
 }
}

export default run;
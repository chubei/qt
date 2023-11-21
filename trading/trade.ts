let cashInDollar: number = 0;

interface Holding {
  ticker: string;
  numShares: number;
  priceInDollar: number;
}

let holding: Holding | null = null;

interface InsertOperation<T> {
  type: "Insert";
  new: T;
}

interface UpdateOperation<T> {
  type: "Update";
  old: T;
  new: T;
}

interface DeleteOperation<T> {
  type: "Delete";
  old: T;
}

type Operation<T> =
  | InsertOperation<T>
  | UpdateOperation<T>
  | DeleteOperation<T>;

interface DepositAction {
  action: "Deposit";
  time: string;
  amount_in_dollar: number;
}

interface BuyAction {
  action: "Buy";
  time: string;
  ticker: string;
  price_in_dollar: number;
}

interface SellAction {
  action: "Sell";
  time: string;
  ticker: string;
  price_in_dollar: number;
}

interface SkipAction {
  action: null;
  time: string;
  ticker: string;
  price_in_dollar: number;
}

type Action = DepositAction | BuyAction | SellAction | SkipAction;

interface NetWorth {
  time: string;
  cash_in_dollar: number;
  asset_value_in_dollar: number;
}

export default function (operation: Operation<Action>): Operation<NetWorth> {
  if (operation.type === "Insert") {
    const action = operation.new;
    switch (action.action) {
      case "Deposit":
        cashInDollar += action.amount_in_dollar;
        break;
      case "Buy":
        if (cashInDollar > 0) {
          const numShares = cashInDollar / action.price_in_dollar;
          holding = {
            ticker: action.ticker,
            numShares,
            priceInDollar: action.price_in_dollar,
          };
          cashInDollar = 0;
        }
        break;
      case "Sell":
        if (holding && action.ticker === holding.ticker) {
          cashInDollar = assetValueInDollar(holding);
          holding = null;
        }
        break;
      case null:
        if (holding && action.ticker === holding.ticker) {
          holding.priceInDollar = action.price_in_dollar;
        }
        break;
    }
    return {
      type: "Insert",
      new: {
        time: action.time,
        cash_in_dollar: cashInDollar,
        asset_value_in_dollar: holding ? assetValueInDollar(holding) : 0,
      },
    };
  } else {
    throw new Error(`unimplemented operation type ${operation.type}`);
  }
}

function assetValueInDollar(holding: Holding): number {
  return holding.numShares * holding.priceInDollar;
}

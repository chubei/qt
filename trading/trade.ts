class Holding {
  ticker: string;
  numShares: number;
  priceInDollar: number;

  constructor(ticker: string, numShares: number, priceInDollar: number) {
    this.ticker = ticker;
    this.numShares = numShares;
    this.priceInDollar = priceInDollar;
  }

  assetValueInDollar(): number {
    return this.numShares * this.priceInDollar;
  }
}

interface Account {
  cashInDollar: number;
  holding: Holding | null;
}

const accounts: Map<string, Account> = new Map();

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

export type Operation<T> =
  | InsertOperation<T>
  | UpdateOperation<T>
  | DeleteOperation<T>;

interface ActionCommon {
  strategy: string;
  time: string;
}

interface DepositAction {
  action: "Deposit";
  amount_in_dollar: number;
}

interface BuyAction {
  action: "Buy";
  ticker: string;
  price_in_dollar: number;
}

interface SellAction {
  action: "Sell";
  ticker: string;
  price_in_dollar: number;
}

interface SkipAction {
  action: null;
  ticker: string;
  price_in_dollar: number;
}

export type Action =
  & ActionCommon
  & (DepositAction | BuyAction | SellAction | SkipAction);

interface NetWorth {
  strategy: string;
  time: string;
  cash_in_dollar: number;
  asset_value_in_dollar: number;
}

export default function (operation: Operation<Action>): Operation<NetWorth> {
  if (operation.type === "Insert") {
    const action = operation.new;
    let account = accounts.get(action.strategy);
    switch (action.action) {
      case "Deposit":
        if (account === undefined) {
          account = {
            cashInDollar: 0,
            holding: null,
          };
          accounts.set(action.strategy, account);
        }
        account.cashInDollar += action.amount_in_dollar;
        break;
      case "Buy":
        if (account && account.cashInDollar > 0) {
          const numShares = account.cashInDollar / action.price_in_dollar;
          account.holding = new Holding(
            action.ticker,
            numShares,
            action.price_in_dollar,
          );
          account.cashInDollar = 0;
        }
        break;
      case "Sell":
        if (
          account && account.holding && action.ticker === account.holding.ticker
        ) {
          account.holding.priceInDollar = action.price_in_dollar;
          account.cashInDollar = account.holding.assetValueInDollar();
          account.holding = null;
        }
        break;
      case null:
        if (
          account && account.holding && action.ticker === account.holding.ticker
        ) {
          account.holding.priceInDollar = action.price_in_dollar;
        }
        break;
    }
    return {
      type: "Insert",
      new: {
        strategy: action.strategy,
        time: action.time,
        cash_in_dollar: account?.cashInDollar || 0,
        asset_value_in_dollar: account?.holding?.assetValueInDollar() || 0,
      },
    };
  } else {
    throw new Error(`unimplemented operation type ${operation.type}`);
  }
}

const mode = Deno.env.get("MODE") ?? "history";
async function fetchDataAndIngest() {
  if (mode === "realtime") {
    // Fetch data from API
    const url = "http://api.coincap.io/v2/assets";
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;

    const snapshot_msg = {
      typ: "SnapshottingDone",
      old_val: null,
      new_val: null,
    };
    await Deno[Deno.internal].core.ops.ingest(snapshot_msg);

    for (const record of data) {
      const msg = {
        typ: "Insert",
        old_val: null,
        new_val: {
          ticker: record.symbol,
          price_in_dollar: record.priceUsd,
          volume: record.volumeUsd24Hr,
          time: Date.now(),
          asset_type: "Crypto",
        },
      };
      await Deno[Deno.internal].core.ops.ingest(msg);
    }
  } else if (mode === "history") {
    const tickers = ["AAPL", "MSFT", "AMZN", "GOOG", "BABA"];

    for (const ticker of tickers) {
      const url =
        "http://api.marketstack.com/v1/eod?access_key=3b0b27edd5fcea60cf6b6245af317e87&sort=ASC&limit=1000&symbols=" +
        ticker;
      console.log(url);
      const response = await fetch(url);
      const result = await response.json();
      const data = result.data;

      const snapshot_msg = {
        typ: "SnapshottingDone",
        old_val: null,
        new_val: null,
      };
      await Deno[Deno.internal].core.ops.ingest(snapshot_msg);
      console.log("Ingested");
      for (const record of data) {
        const msg = {
          typ: "Insert",
          old_val: null,
          new_val: {
            ticker: record.symbol,
            price_in_dollar: record.close,
            volume: record.volume,
            time: record.date,
            asset_type: "Stocks",
          },
        };
        await Deno[Deno.internal].core.ops.ingest(msg);
      }
    }
  }
}

fetchDataAndIngest();

if (mode === "realtime") {
  setInterval(fetchDataAndIngest, 5000);
}

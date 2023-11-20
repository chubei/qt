async function fetchDataAndIngest() {
    const url = 'http://api.coincap.io/v2/assets';
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;


    const snapshot_msg = { typ: "SnapshottingDone", old_val: null, new_val: null };
    await Deno[Deno.internal].core.ops.ingest(snapshot_msg);

    for (const record of data) {
        const msg = {
            typ: "Insert",
            old_val: null,
            new_val: { ticker: record.symbol, price_in_dollar: record.priceUsd, volume: record.volumeUsd24Hr, time: Date.now(), asset_type: "Crypto" },
        };
        await Deno[Deno.internal].core.ops.ingest(msg);

    }


}

fetchDataAndIngest();

setInterval(fetchDataAndIngest, 5000);
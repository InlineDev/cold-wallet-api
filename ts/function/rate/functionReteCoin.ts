import CoinGecko from "coingecko-api";

const CoinGeckoClient = new CoinGecko();

interface ObjectCoinGeckoPrice {
    data: {
        tether: { usd: number, rub: number, eur: number },
        tron: { usd: number, rub: number, eur: number },
        bitcoin: { usd: number, rub: number, eur: number },
        ethereum: { usd: number, rub: number, eur: number },
    }
}

async function getPrice(): Promise<void> {
    const dataWall: ObjectCoinGeckoPrice = await CoinGeckoClient.simple.price({
        ids: ["tether", "tron", "bitcoin", "ethereum"],
        vs_currencies: ["usd", "rub", "eur"]
    });

    dataRate = dataWall;
}

let dataRate: ObjectCoinGeckoPrice;

export {
    getPrice,
    dataRate,
}
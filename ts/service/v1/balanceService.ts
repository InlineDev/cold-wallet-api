import BalanceUser from '../../model/v1/modelBalance.js';
import { dataRate } from "../../function/rate/functionReteCoin.js";

class WalletService {
    async balance(reqUser) {
        try {
            const balance = await BalanceUser.findOne({ mnemonic: reqUser.mnemonic });

            const data = [
                {
                    coin: "btc",
                    status: true,
                    amount: balance.main.btc,
                    amountCommission: 0.0008,
                    network: "BTC-Bitcoin",
                    minimumAmountReplenishment: 0.00025,
                    minimumWithdrawalAmount: 0.0009,
                    coinComission: "btc",
                    priceToUsd: dataRate.data.bitcoin.usd,
                    priceBalanceInCurrency: {
                        usd: balance.main.btc * dataRate.data.bitcoin.usd,
                        rub: balance.main.btc * dataRate.data.bitcoin.rub,
                        eur: balance.main.btc * dataRate.data.bitcoin.eur,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.bitcoin.usd,
                        rub: dataRate.data.bitcoin.rub,
                        eur: dataRate.data.bitcoin.eur,
                    },
                },
                {
                    coin: "eth",
                    status: true,
                    amount: balance.main.eth,
                    amountCommission: 0.01,
                    network: "ERC20",
                    minimumAmountReplenishment: 0.015,
                    minimumWithdrawalAmount: 0.015,
                    coinComission: "eth",
                    priceToUsd: dataRate.data.ethereum.usd,
                    priceBalanceInCurrency: {
                        usd: balance.main.eth * dataRate.data.ethereum.usd,
                        rub: balance.main.eth * dataRate.data.ethereum.rub,
                        eur: balance.main.eth * dataRate.data.ethereum.eur,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.ethereum.usd,
                        rub: dataRate.data.ethereum.rub,
                        eur: dataRate.data.ethereum.eur,
                    },
                },


                {
                    coin: "usdt(erc20)",
                    status: false,
                    amount: balance.main.usdt_erc20,
                    amountCommission: 0.01,
                    network: "ERC20",
                    minimumAmountReplenishment: 1,
                    minimumWithdrawalAmount: 1,
                    coinComission: "eth",
                    priceToUsd: dataRate.data.tether.usd,
                    priceBalanceInCurrency: {
                        usd: balance.main.usdt_erc20 * dataRate.data.tether.usd,
                        rub: balance.main.usdt_erc20 * dataRate.data.tether.rub,
                        eur: balance.main.usdt_erc20 * dataRate.data.tether.eur,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.tether.usd,
                        rub: dataRate.data.tether.rub,
                        eur: dataRate.data.tether.eur,
                    },
                },

                {
                    coin: "usdt",
                    status: false,
                    amount: balance.main.usdt,
                    amountCommission: 0,
                    coinComission: "tron",
                    network: "TRC-20",
                    minimumAmountReplenishment: 1,
                    minimumWithdrawalAmount: 1,
                    priceToUsd: dataRate.data.tether.usd,
                    priceBalanceInCurrency: {
                        usd: balance.main.usdt * dataRate.data.tether.usd,
                        rub: balance.main.usdt * dataRate.data.tether.rub,
                        eur: balance.main.usdt * dataRate.data.tether.eur,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.tether.usd,
                        rub: dataRate.data.tether.rub,
                        eur: dataRate.data.tether.eur,
                    },
                },
                {
                    coin: "tron",
                    status: true,
                    amount: balance.main.tron,
                    amountCommission: 20,
                    coinComission: "tron",
                    network: "TRC-20",
                    minimumAmountReplenishment: 1,
                    minimumWithdrawalAmount: 5,
                    priceToUsd: dataRate.data.tron.usd,
                    priceBalanceInCurrency: {
                        usd: balance.main.tron * dataRate.data.tron.usd,
                        rub: balance.main.tron * dataRate.data.tron.rub,
                        eur: balance.main.tron * dataRate.data.tron.eur,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.tron.usd,
                        rub: dataRate.data.tron.rub,
                        eur: dataRate.data.tron.eur,
                    },
                },

                {
                    coin: "test_coin",
                    status: true,
                    amount: 1000,
                    amountCommission: 0.00039,
                    network: "Test Coin",
                    minimumAmountReplenishment: 0.00021,
                    minimumWithdrawalAmount: 0.00049,
                    coinComission: "test_coin",
                    priceToUsd: 10,
                    priceBalanceInCurrency: {
                        usd: 1000 * 1,
                        rub: 2000 * 1,
                        eur: 3000 * 1,
                    },
                    priceInCurrency: {
                        usd: dataRate.data.tron.usd,
                        rub: dataRate.data.tron.rub,
                        eur: dataRate.data.tron.eur,
                    },
                },
            ];
            return {
                status: "OK",
                data: {
                    data,
                    dataCurrencyList:
                        [
                            {
                                name: "usd",
                                symbol: "$",
                            },
                            {
                                name: "eur",
                                symbol: "€",
                            },
                            {
                                name: "rub",
                                symbol: "₽",
                            },
                        ],
                },
                error: {},
            };
        } catch (err) {
            return {
                status: "error",
                data: {},
                error: {
                    message: "unforeseen!"
                },
                logErr: err
            }
        }
    }

    async balanceMainEdit(user, coin, amount) {
        await BalanceUser.updateOne({ mnemonic: user.mnemonic }, JSON.parse(`{ "$inc": { "main.${coin}": ${amount} } }`)).catch(() => console.log("ERROR balanceMainEdit"));
    }
}

export default new WalletService();
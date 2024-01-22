import axios from "axios";
import config from "../../config.js";
import WalletUser from "../../model/v1/modelWallet.js";
import balanceService from "../../service/v1/balanceService.js";
import transactionService from "../../service/v1/transactionService.js";
import { sendEth } from "../../function/wallet/functionSendCoinWallet.js";
import { sendErc20 } from '../../function/wallet/functionSendCoinWallet.js';
import { getBalanceEth } from "../../function/wallet/functionBalanceWallet.js";
import { Replenishment, ReplenishmentHash, ReplenishmentСommission } from "../../model/v1/modelReplenishment.js";


interface ObjectTransactionsListUser {
    hash: string,
    time: number,
    amount: number,
    to: string,
    from: string,
}

class Eth_UsdtService {
    async WalletBalanceCheck(idUser: number, privateKey: string, address: string): Promise<void> {
        try {
            const transactionsListUser = await this.transactionsUser(address);

            for (let i = 0; i < transactionsListUser.length; i++) {
                //Проверка сумма транзакции
                if (transactionsListUser[i].amount < 1) return;
                console.log(`Сумма транзакции ${transactionsListUser[i].amount} usdt_erc20`);
                const totalAmountEthUsdt: number = Math.trunc((transactionsListUser[i].amount) * 1e6) / 1e6;

                const balanceUserEth: number = await getBalanceEth(privateKey);

                //Проверка баланса пользователя для оплаты комисии за траназкцию
                if (balanceUserEth < 0.0035) {
                    await sendEth(config.wallet.eth.privateKey, address, 0.0035)
                        .then(async (transferSendEthСommissionHash) => {
                            console.log("Отправка средств для оплаты комиисии");

                            //проверка создания транзакции
                            if (typeof transferSendEthСommissionHash != "string") return;

                            //создание заявки на проверку первода
                            return await ReplenishmentСommission.create({
                                idUser: idUser,
                                hashTransferСommission: transferSendEthСommissionHash,
                                coinSend: "eth",
                                coin: "usdt_erc20",
                                time: transactionsListUser[i].time,
                                amount: totalAmountEthUsdt,
                                status: "admin_send_coin",
                            }).then(async (r) => {
                                console.log("Создана заявка на проверку превода средств для оплаты комисии (ETH(USDT). Hash: " + r.hashTransferСommission);
                                await ReplenishmentHash.create({ hash: transactionsListUser[i].hash }).then(() => console.log("Сохранение хеша транзакции(ETH(USDT))"));
                            });
                        });
                    return;
                }

                //отправка при наличии средств для оплаты комисиии
                const sendCoin: string = await sendErc20(privateKey, config.wallet.eth.address, totalAmountEthUsdt, "0xdAC17F958D2ee523a2206206994597C13D831ec7");

                //проверка создания транзакции
                if (typeof sendCoin != "string") return;

                //создание заявки на проверку транзакции
                await Replenishment.create({
                    idUser,
                    hash: sendCoin,
                    coin: "usdt_erc20",
                    time: transactionsListUser[i].time,
                    amount: transactionsListUser[i].amount,
                    status: "user_send_coin",
                }).then(async (r) => {
                    console.log("Создана заявка на проверку транзакции(BTC). Hash: " + sendCoin);
                    await ReplenishmentHash.create({ hash: transactionsListUser[i].hash }).then(() => console.log("Сохранение хеша транзакции(ETH(USDT))"));
                });
                break;
            }
        } catch (e) {
            console.log("error WalletBalanceCheck(ETH): " + e);
        }
    }

    async CheckReplenishmentСommissionRequests(replenishmentСommission, privateKey: string) {
        try {
            if (replenishmentСommission.processed || replenishmentСommission.status === "Done" || replenishmentСommission.status === "Fail") return;
            console.log("Check hash ReplenishmentСommission ETH(USDT): " + replenishmentСommission.hashTransferСommission);
            const checkTransaction = await axios({
                method: "GET",
                timeout: 15000,
                url: `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${replenishmentСommission.hashTransferСommission}&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX`
            });
            if (checkTransaction.data.result.blockNumber) {
                switch (replenishmentСommission.coin) {
                    case "usdt_erc20":
                        //создание траназкции
                        const sendCoin: string = await sendErc20(privateKey, config.wallet.eth.address, replenishmentСommission.amount, "0xdAC17F958D2ee523a2206206994597C13D831ec7");

                        //проверка создания транзакции
                        if (typeof sendCoin != "string") return;

                        //создание заявки на проверку транзакции
                        await Replenishment.create({
                            idUser: replenishmentСommission.idUser,
                            hash: sendCoin,
                            coin: "usdt_erc20",
                            time: replenishmentСommission.time,
                            amount: replenishmentСommission.amount,
                            status: "user_send_coin",
                        }).then(async (r) => {
                            console.log("Создана заявка на проверку транзакции(ETH(USDT)). Hash: " + r.hash);
                            await ReplenishmentСommission.updateMany({ hashTransferСommission: replenishmentСommission.hashTransferСommission }, { $set: { processed: true, status: "Done" } });
                        });
                        break;

                    default:
                        break;
                }
            } else {
                //изменение статуса траназакции
                //await Replenishment.updateOne({ hash: replenishment.hash }, { $set: { processed: true, status: "Fail" } }); 
            }
        } catch (e) {
            console.log("error CheckReplenishmentСommissionRequests(MPX): " + e);
        }
    }

    async CheckReplenishmentRequests(replenishment): Promise<void> {
        try {
            if (replenishment.processed || replenishment.status === "Done" || replenishment.status === "Fail") return;
            console.log("Check hash ETH(USDT): " + replenishment.hash);
            const checkTransaction = await axios({
                method: "GET",
                timeout: 15000,
                url: `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${replenishment.hash}&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX`
            });
            if (checkTransaction.data.result.blockNumber) {
                const user = await WalletUser.findOne({ id: replenishment.idUser });
                //начисление средств пользователю
                await balanceService.balanceMainEdit(user, replenishment.coin, replenishment.amount)
                    .then(async () => {
                        //изменение статуса траназакции
                        await Replenishment.updateOne({ hash: replenishment.hash }, { $set: { processed: true, status: "Done" } }).then(() => console.log(`Баланс пользователя ${replenishment.idUser} пополнен на ${replenishment.amount} ${replenishment.coin}`));

                        await transactionService.save(user, {
                            hash: replenishment.hashStartTransaction,
                            coin: 'usdt(erc20)',
                            amount: replenishment.amount,
                            date: replenishment.time,
                            type: "get",
                        });
                    });
            } else {
                //изменение статуса траназакции
                //await Replenishment.updateOne({ hash: replenishment.hash }, { $set: { processed: true, status: "Fail" } }); 
            }
        } catch (e) {
            console.log("error CheckReplenishmentRequests(ETH): " + e);
        }
    }

    async transactionsUser(address): Promise<ObjectTransactionsListUser[]> {
        try {
            const getTxEth_Usdt = await axios({
                method: "GET",
                url: `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX`
            });

            const transactionsListUser: ObjectTransactionsListUser[] = [];
            const transactionsList = getTxEth_Usdt.data.result;

            await Promise.all(transactionsList.map(async (e) => {
                if (e.from != address && !await ReplenishmentHash.findOne({ hash: e.hash })) {
                    transactionsListUser.push({
                        hash: e.hash,
                        time: e.timeStamp,
                        amount: e.value / 1e6,
                        to: e.to,
                        from: e.from,
                    });
                }
            }));
            return transactionsListUser;
        } catch (error) {
            console.error(`Ошибка отправики запроса [https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX]`);
            return [];
        }
    }
}

export default new Eth_UsdtService();
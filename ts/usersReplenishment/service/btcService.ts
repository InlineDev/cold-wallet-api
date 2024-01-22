import axios from "axios";
import config from "../../config.js";
import WalletUser from "../../model/v1/modelWallet.js";
import balanceService from "../../service/v1/balanceService.js";
import { Replenishment } from "../../model/v1/modelReplenishment.js";
import transactionService from "../../service/v1/transactionService.js";
import { sendBitcoin } from "../../function/wallet/functionSendCoinWallet.js";

interface ObjectTransactionsListUser {
    hash: string;
    time: number;
    amount: number;
}

class BtcService {
    async WalletBalanceCheck(idUser: number, privateKey: string, address: string): Promise<void> {
        try {
            const transactionsListUser = await this.transactionsUser(address);

            for (let i = 0; i < transactionsListUser.length; i++) {
                //Проверка сумма транзакции
                if (transactionsListUser[i].amount < 0.00021) return;
                console.log(`Сумма транзакции ${transactionsListUser[i].amount} btc`);

                const totalAmountBtc: number = Math.trunc((transactionsListUser[i].amount) * 1e8) / 1e8;
                const sendCoin: string = await sendBitcoin(privateKey, totalAmountBtc, config.wallet.btc.address, true);

                //проверка создания транзакции
                if (typeof sendCoin != "string") return;

                //создание заявки на проверку транзакции
                await Replenishment.create({
                    idUser,
                    hash: sendCoin,
                    hashStartTransaction: transactionsListUser[i].hash,
                    coin: "btc",
                    time: transactionsListUser[i].time,
                    amount: transactionsListUser[i].amount,
                    status: "user_send_coin",
                }).then((r) => console.log("Создана заявка на проверку транзакции(BTC). Hash: " + r.hash));
                break;
            }
        } catch (e) {
            console.log("error WalletBalanceCheck(BTC): " + e);
        }
    }

    async CheckReplenishmentRequests(replenishment): Promise<void> {
        try {
            if (replenishment.processed || replenishment.status === "Done" || replenishment.status === "Fail") return;
            console.log("Check hash BTC: " + replenishment.hash);
            const checkTransaction = await axios({
                method: "GET",
                timeout: 15000,
                url: `https://api.blockcypher.com/v1/btc/main/txs/${replenishment.hash}`
            });
            if (checkTransaction.data.confirmations >= 3) {
                const user = await WalletUser.findOne({ id: replenishment.idUser });
                //начисление средств пользователю
                await balanceService.balanceMainEdit(user, replenishment.coin, replenishment.amount)
                    .then(async () => {
                        //изменение статуса траназакции
                        await Replenishment.updateOne({ hash: replenishment.hash }, { $set: { processed: true, status: "Done" } }).then(() => console.log(`Баланс пользователя ${replenishment.idUser} пополнен на ${replenishment.amount} ${replenishment.coin}`));

                        await transactionService.save(user, {
                            hash: replenishment.hashStartTransaction,
                            coin: 'btc',
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
            console.log("error CheckReplenishmentRequests(BTC): " + e);
        }
    }

    async transactionsUser(address): Promise<ObjectTransactionsListUser[]> {
        try {
            const getTxBitcoin = await axios({
                method: "GET",
                url: `https://blockchain.info/rawaddr/${address}`
            });

            const transactionsListUser: ObjectTransactionsListUser[] = [];
            const transactionsList = getTxBitcoin.data.txs;

            await Promise.all(transactionsList.map(async (e) => {
                if (!await Replenishment.findOne({ hashStartTransaction: e.hash })) {
                    const elementOut = e.out.find(e => e.addr === address);
                    if (elementOut) {
                        transactionsListUser.push({
                            hash: e.hash,
                            time: e.time,
                            amount: elementOut.value / 1e8,
                        });
                    }
                }
            }));
            return transactionsListUser;
        } catch (error) {
            console.error(`Ошибка отправики запроса [https://blockchain.info/rawaddr/${address}]`);
            return [];
        }
    }
}

export default new BtcService();
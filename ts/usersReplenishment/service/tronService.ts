import axios from "axios";
import config from "../../config.js";
import WalletUser from "../../model/v1/modelWallet.js";
import balanceService from "../../service/v1/balanceService.js";
import { Replenishment, ReplenishmentHash } from "../../model/v1/modelReplenishment.js";
import transactionService from "../../service/v1/transactionService.js";
import { sendTron } from "../../function/wallet/functionSendCoinWallet.js";

interface ObjectTransactionsListUser {
    hash: string,
    time: number,
    amount: number,
    to: string,
    from: string,
}

class TronService {
    async WalletBalanceCheck(idUser: number, privateKey: string, address: string): Promise<void> {
        try {
            const transactionsListUser = await this.transactionsUser(address);

            for (let i = 0; i < transactionsListUser.length; i++) {
                //Проверка сумма транзакции
                if (transactionsListUser[i].amount < 2.1) return;
                console.log(`Сумма транзакции ${transactionsListUser[i].amount} tron`);

                const totalAmountTron: number = Math.trunc((transactionsListUser[i].amount - 2) * 1e6) / 1e6;
                const sendCoin = await sendTron(privateKey, address, config.wallet.trc.address, totalAmountTron);

                //проверка создания транзакции
                if (typeof sendCoin.txid != "string") return;

                //создание заявки на проверку транзакции
                await Replenishment.create({
                    idUser,
                    hash: sendCoin.txid,
                    hashStartTransaction: transactionsListUser[i].hash,
                    coin: "tron",
                    time: transactionsListUser[i].time,
                    amount: transactionsListUser[i].amount,
                    status: "user_send_coin",
                }).then((r) => console.log("Создана заявка на проверку транзакции(TRON). Hash: " + r.hash));
                break;
            }
        } catch (e) {
            console.log("error WalletBalanceCheck(TRON): " + e);
        }
    }

    async CheckReplenishmentRequests(replenishment): Promise<void> {
        try {
            if (replenishment.processed || replenishment.status === "Done" || replenishment.status === "Fail") return;
            console.log("Check hash TRON: " + replenishment.hash);
            const checkTransaction = await axios({
                method: "GET",
                timeout: 15000,
                url: `https://apilist.tronscan.org/api/transaction-info?hash=${replenishment.hash}`
            });
            if (checkTransaction.data.contractRet === "SUCCESS") {
                const user = await WalletUser.findOne({ id: replenishment.idUser });
                //начисление средств пользователю
                await balanceService.balanceMainEdit(user, replenishment.coin, replenishment.amount)
                    .then(async () => {
                        //изменение статуса траназакции
                        await Replenishment.updateOne({ hash: replenishment.hash }, { $set: { processed: true, status: "Done" } }).then(() => console.log(`Баланс пользователя ${replenishment.idUser} пополнен на ${replenishment.amount} ${replenishment.coin}`));

                        await transactionService.save(user, {
                            hash: replenishment.hashStartTransaction,
                            coin: 'eth',
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
            const getTxTron = await axios({
                method: "GET",
                url: `https://apilist.tronscanapi.com/api/transaction?address=${address}`
            });

            const transactionsListUser: ObjectTransactionsListUser[] = [];
            const transactionsList = getTxTron.data.data;

            await Promise.all(transactionsList.map(async (e) => {
                if (e.ownerAddress != address && !await ReplenishmentHash.findOne({ hash: e.hash }) && e.contractRet == "SUCCESS") {
                    transactionsListUser.push({
                        hash: e.hash,
                        time: e.timestamp,
                        amount: Number(e.amount) / 1e6,
                        to: e.toAddress,
                        from: e.ownerAddress,
                    });
                }
            }));
            return transactionsListUser;
        } catch (error) {
            console.error(`Ошибка отправики запроса [https://apilist.tronscanapi.com/api/transaction?address=${address}]`);
            return [];
        }
    }
}

export default new TronService();
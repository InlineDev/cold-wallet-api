import axios from "axios";
import config from "../../config.js";
import WalletUser from "../../model/v1/modelWallet.js";
import balanceService from "../../service/v1/balanceService.js";
import { Replenishment } from "../../model/v1/modelReplenishment.js";
import transactionService from "../../service/v1/transactionService.js";
import { sendEth } from "../../function/wallet/functionSendCoinWallet.js";

interface ObjectTransactionsListUser {
    hash: string,
    time: number,
    amount: number,
    to: string,
    from: string,
}

class EthService {
    async WalletBalanceCheck(idUser: number, privateKey: string, address: string): Promise<void> {
        try {
            const transactionsListUser = await this.transactionsUser(address);

            for (let i = 0; i < transactionsListUser.length; i++) {
                //Проверка сумма транзакции
                if (transactionsListUser[i].amount < 0.015) return;
                console.log(`Сумма транзакции ${transactionsListUser[i].amount} eth`);

                const totalAmountEth: number = Math.trunc((transactionsListUser[i].amount - 0.003) * 1e8) / 1e8;
                const sendCoin: string = await sendEth(privateKey, config.wallet.eth.address, totalAmountEth);

                //проверка создания транзакции
                if (typeof sendCoin != "string") return;

                //создание заявки на проверку транзакции
                await Replenishment.create({
                    idUser,
                    hash: sendCoin,
                    hashStartTransaction: transactionsListUser[i].hash,
                    coin: "eth",
                    time: transactionsListUser[i].time,
                    amount: transactionsListUser[i].amount,
                    status: "user_send_coin",
                }).then((r) => console.log("Создана заявка на проверку транзакции(ETH). Hash: " + r.hash));
                break;
            }
        } catch (e) {
            console.log("error WalletBalanceCheck(ETH): " + e);
        }
    }

    async CheckReplenishmentRequests(replenishment): Promise<void> {
        try {
            if (replenishment.processed || replenishment.status === "Done" || replenishment.status === "Fail") return;
            console.log("Check hash ETH: " + replenishment.hash);
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
            const getTxEth = await axios({
                method: "GET",
                url: `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX`
            });

            const transactionsListUser: ObjectTransactionsListUser[] = [];
            const transactionsList = getTxEth.data.result;

            await Promise.all(transactionsList.map(async (e) => {
                if (e.from != address && !await Replenishment.findOne({ hashStartTransaction: e.hash })) {
                    transactionsListUser.push({
                        hash: e.hash,
                        time: e.timeStamp,
                        amount: e.value / 1e18,
                        to: e.to,
                        from: e.from,
                    });
                }
            }));
            return transactionsListUser;
        } catch (error) {
            console.error(`Ошибка отправики запроса [https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=TCBWGINH1FNVSXNP4P18JGNMG17NJJDGJX]`);
            return [];
        }
    }
}

export default new EthService();
import TransactionUser from '../../model/v1/modelTransaction.js';

type newTransactionObject = {
    hash: string,
    coin: string,
    amount: number,
    date: string,
    type: string,
}

type TransactionsData = {
    hash: string,
    coin: string,
    explolerUrl: string,
    amount: number,
    date: string,
    type: string,
}

class TransactionService {
    async find(user) {
        try {
            const transactionUser = await TransactionUser.findOne({ mnemonic: user.mnemonic });
            const transactionsData: TransactionsData[] = [];

            for (let i = 0; i < transactionUser.transactions.length; i++) {
                if (transactionUser.transactions[i].coin === "btc") transactionsData.push({
                    hash: transactionUser.transactions[i].hash,
                    coin: transactionUser.transactions[i].coin,
                    explolerUrl: `https://blockchair.com/ru/bitcoin/transaction/${transactionUser.transactions[i].hash}`,
                    amount: transactionUser.transactions[i].amount,
                    date: transactionUser.transactions[i].date,
                    type: transactionUser.transactions[i].type,
                });

                else if (transactionUser.transactions[i].coin === "eth") transactionsData.push({
                    hash: transactionUser.transactions[i].hash,
                    coin: transactionUser.transactions[i].coin,
                    explolerUrl: `https://etherscan.io/tx/${transactionUser.transactions[i].hash}`,
                    amount: transactionUser.transactions[i].amount,
                    date: transactionUser.transactions[i].date,
                    type: transactionUser.transactions[i].type,
                });

                else if (transactionUser.transactions[i].coin === "tron") transactionsData.push({
                    hash: transactionUser.transactions[i].hash,
                    coin: transactionUser.transactions[i].coin,
                    explolerUrl: `https://tronscan.org/#/transaction/${transactionUser.transactions[i].hash}`,
                    amount: transactionUser.transactions[i].amount,
                    date: transactionUser.transactions[i].date,
                    type: transactionUser.transactions[i].type,
                });
            }

            return {
                status: "OK",
                data: transactionsData.reverse(),
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

    async save(user, newTransactionObject: newTransactionObject) {
        try {
            const transactionUser = await TransactionUser.findOne({ mnemonic: user.mnemonic });
            await transactionUser.transactions.push(newTransactionObject);
            await transactionUser.save();
            return {
                status: "OK",
                data: newTransactionObject,
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
}

export default new TransactionService();
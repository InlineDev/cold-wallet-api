import config from "../../config.js";
import balanceService from "./balanceService.js";
import transactionService from "./transactionService.js";
import { sendBitcoin, sendErc20, sendEth, sendTron } from "../../function/wallet/functionSendCoinWallet.js";

const amountСompensation: {
    btc: number,
    eth: number,
    tron: number,
} = {
    btc: 0.0003,
    eth: 0.006,
    tron: 4,
}

class WithdrawalService {
    async sendCoin(user, coin: string, amount: number, address: string, date: string) {
        try {
            if (isNaN(amount)) return this.errorResponse("Amount not a number!", `Amount not a number! amount: ${amount}`);
            const balanceUser = (await balanceService.balance(user)).data.data.find(c => c.coin === coin);
            const { amountSend, adminProfit, amountSendAndCommission } = this.calculateAmounts(balanceUser.amountCommission, amountСompensation[coin], amount);
            switch (coin) {
                case "btc":
                    if (balanceUser.amount < amountSendAndCommission) return this.errorResponse("Insufficient funds!", "Insufficient funds!");
                    const sendBtcHash = await sendBitcoin(config.wallet.btc.privateKey, amountSend, address);

                    //проверка создания транзакции
                    if (typeof sendBtcHash != "string") return this.errorResponse("Translation error!", "Translation error!");

                    await this.controlBalance(user, coin, sendBtcHash, amountSend, amountSendAndCommission, adminProfit, date);

                    return this.successResponse(sendBtcHash);
                    break;

                case "eth":
                    if (balanceUser.amount < amountSendAndCommission) return this.errorResponse("Insufficient funds!", "Insufficient funds!");
                    const sendEthHash = await sendEth(config.wallet.eth.privateKey, address, amountSend);

                    //проверка создания транзакции
                    if (typeof sendEthHash != "string") return this.errorResponse("Translation error!", "Translation error!");

                    await this.controlBalance(user, coin, sendEthHash, amountSend, amountSendAndCommission, adminProfit, date);

                    return this.successResponse(sendEthHash);
                    break;

                case "tron":
                    if (balanceUser.amount < amountSendAndCommission) return this.errorResponse("Insufficient funds!", "Insufficient funds!");
                    const sendTronHash = await sendTron(config.wallet.trc.privateKey, config.wallet.trc.address, address, amountSend);

                    //проверка создания транзакции
                    if (typeof sendTronHash.txid != "string") return this.errorResponse("Translation error!", "Translation error!");

                    await this.controlBalance(user, coin, sendTronHash.txid, amountSend, amountSendAndCommission, adminProfit, date);

                    return this.successResponse(sendTronHash.txid);
                    break;

                case "test_coin":
                    return this.successResponse(`${coin}_${amount}_${address}`);
                    break;

                default:
                    return this.errorResponse("Coin not found!", "Coin not found!");
                    break;
            }
        } catch (err) {
            return this.errorResponse("Unforeseen error!", err);
        }
    }

    calculateAmounts(amountCommission: number, compensation: number, amount: number): { amountSend: number, adminProfit: number, amountSendAndCommission: number } {
        const amountSend = Math.trunc(amount * 1e8) / 1e8;
        const adminProfit = Math.trunc((amountCommission - compensation) * 1e8) / 1e8;
        const amountSendAndCommission = Math.trunc((amount + amountCommission) * 1e8) / 1e8;

        return { amountSend, adminProfit, amountSendAndCommission };
    }

    async controlBalance(user, coin: string, hash: string, amountSend: number, amountSendAndCommission: number, adminProfit: number, date: string): Promise<void> {
        try {
            await balanceService.balanceMainEdit(user, coin, -amountSendAndCommission); //снятие средств у пользователя
            await transactionService.save(user, {
                hash,
                coin,
                amount: amountSend,
                date,
                type: "send",
            });

            await balanceService.balanceMainEdit(config.adminUser, coin, adminProfit); // начисления админского профита
            await transactionService.save(config.adminUser, {
                hash: 'admin profit',
                coin,
                amount: adminProfit,
                date,
                type: "get",
            });
        } catch (error) {
            console.error(error);
        }
    }

    successResponse(hash) {
        return {
            status: "OK",
            data: { hash },
            error: {},
        };
    }

    errorResponse(errorMessage, logMessage) {
        return {
            status: "error",
            data: {},
            error: { message: errorMessage },
            logErr: logMessage,
        };
    }

}

export default new WithdrawalService();
import config from "../../config.js";
import balanceService from "./balanceService.js";
import transactionService from "./transactionService.js";
import { sendBitcoin, sendErc20, sendEth } from "../../function/wallet/functionSendCoinWallet.js";

const amountСompensation: {
    btc: number,
    eth: number,
    eth_erc20: number,
} = {
    btc: 0.0003,
    eth: 0.006,
    eth_erc20: 0.006,
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

                case "usdt(erc20)":
                    if (balanceUser.amount < amount) return this.errorResponse("Insufficient funds!", "Insufficient funds!");
                    if ((await balanceService.balance(user)).data.data.find(c => c.coin === "eth").amount < balanceUser.amountCommission) return this.errorResponse("Insufficient funds to pay the fee!", "Insufficient funds to pay the fee!");

                    const sendUsdtErc20Hash = await sendErc20(config.wallet.eth.privateKey, address, amount, "0xdac17f958d2ee523a2206206994597c13d831ec7");

                    //проверка создания транзакции
                    if (typeof sendUsdtErc20Hash != "string") return this.errorResponse("Translation error!", "Translation error!");

                    await this.controlBalanceВifferentСurrencies(user, "usdt_erc20", "eth", sendUsdtErc20Hash, amount, balanceUser.amountCommission, balanceUser.amountCommission - amountСompensation.eth_erc20, date);

                    return this.successResponse(sendUsdtErc20Hash);
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

    async controlBalanceВifferentСurrencies(user, coin: string, coinCommission: string, hash: string, amountSend: number, amountCommission: number, adminProfit: number, date: string): Promise<void> {
        console.log({ user, coin, coinCommission, hash, amountSend, amountCommission, adminProfit, date });
        try {
            await balanceService.balanceMainEdit(user, coin, -amountSend); //снятие средств у пользователя
            await balanceService.balanceMainEdit(user, coinCommission, -amountCommission); //снятие средств у пользователя за перевод
            await transactionService.save(user, {
                hash,
                coin: "usdt(erc20)",
                amount: amountSend,
                date,
                type: "send",
            });

            await balanceService.balanceMainEdit(config.adminUser, coinCommission, adminProfit); // начисления админского профита
            await transactionService.save(config.adminUser, {
                hash: 'admin profit',
                coin: coinCommission,
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
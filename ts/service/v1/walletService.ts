import WalletUser from '../../model/v1/modelWallet.js';

class WalletService {
    async walletAddresses(reqUser) {
        try {
            const wallet = await WalletUser.findOne({ mnemonic: reqUser.mnemonic });
            const data = {
                btc: {
                    address: wallet.btc.address
                },
                eth: {
                    address: wallet.eth.address
                },
                "usdt(erc20)": {
                    address: wallet.eth.address
                },
                trc: {
                    address: wallet.trc.address
                }
            };
            return {
                status: "OK",
                data,
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

export default new WalletService();
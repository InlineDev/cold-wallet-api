import config from '../../config.js';
import UserDto from '../../dtos/userDto.js';
import tokenService from './tokenService.js';
import ModelUser from '../../model/v1/modelUser.js';
import BalanceUser from '../../model/v1/modelBalance.js';
import TransactionUser from '../../model/v1/modelTransaction.js';
import { createWallets } from '../../helpers/wallet/createWalletUser.js';
import { decryptString, encryptString } from '../../helpers/crypto/function.js';

class AuthService {
    async registration(seed?: string) {
        try {
            const idUser = await ModelUser.count() + 1;
            const createWallet = await createWallets(idUser, seed);
            await ModelUser.create({ id: idUser, mnemonic: createWallet.mnemonic });
            await BalanceUser.create({ id: idUser, mnemonic: createWallet.mnemonic });
            await TransactionUser.create({ id: idUser, mnemonic: createWallet.mnemonic });

            //шифруем mnemonic
            const mnemonic = encryptString(createWallet.mnemonic, config.keyEncryption);

            return {
                status: "OK",
                data: { mnemonic },
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

    async login(mnemonic) {
        try {
            //дешифрования мнемоник
            mnemonic = decryptString(mnemonic, config.keyEncryption);

            //регистрация комиссионного кошелька
            if (mnemonic === config.adminUser.mnemonic && !await ModelUser.findOne({ mnemonic })) await this.registration(mnemonic);

            const user = await ModelUser.findOne({ mnemonic });

            if (!user) return { status: "error", data: {}, error: { message: "user not found!" }, logErr: "user not found!" }

            const userDtoData = new UserDto(user)
            const token = tokenService.generateToken({ ...userDtoData })
            return {
                status: "OK",
                data: { token },
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

export default new AuthService();
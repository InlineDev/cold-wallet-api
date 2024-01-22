import bip39 from 'bip39';
import crypto from 'crypto';
import { generateAccount } from "tron-create-address";
import WalletUser from '../../model/v1/modelWallet.js';
import { createBtc, createEth } from '../../function/wallet/functionCreateWallet.js';

interface ObjectWalletStorage {
    mnemonic: string,
    btc: {
        address: string,
        privateKey: string
    },
    eth: {
        address: string,
        privateKey: string
    },
    trc: {
        address: string,
        privateKey: string
    },
}

export async function createWallets(idUser: number, seed?: string): Promise<ObjectWalletStorage> {
    // Создаем новый сид для пользователя
    let mnemonic = seed || bip39.generateMnemonic(256, crypto.randomBytes);

    //создаем кошелек
    const createEthWallet: { address: string, privateKey: string } = await createEth(mnemonic);
    const createBitcoinWallet: { btcAddress: string, privateKey: string } = await createBtc(mnemonic);
    const { address, privateKey }: { address: string, privateKey: string } = await generateAccount();

    const data = {
        id: idUser,
        mnemonic,
        btc: {
            address: createBitcoinWallet.btcAddress,
            privateKey: createBitcoinWallet.privateKey
        },
        eth: {
            address: createEthWallet.address,
            privateKey: createEthWallet.privateKey
        },
        trc: {
            address: address,
            privateKey: privateKey
        },
    };

    await WalletUser.create(data);
    return data;
}
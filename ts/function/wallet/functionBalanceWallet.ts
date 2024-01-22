import CryptoAccount from "send-crypto";

export const getBalanceBitcoin = async (privateKey: string): Promise<number> => {
    const account = new CryptoAccount(privateKey);

    //balance
    const balance = await account.getBalance("BTC");
    return balance;
}

export const getBalanceEth = async (privateKey: string): Promise<number> => {
    const account = new CryptoAccount(privateKey);

    //balance
    const balance = await account.getBalance("ETH");
    return balance;
}
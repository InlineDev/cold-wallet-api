import ethers from "ethers";
import TronWeb from "tronweb";
import { round } from "mathjs";
import CryptoAccount from "send-crypto";

const urlApiTronMainnet = "https://api.trongrid.io";

export const sendBitcoin = async (privateKey: string, amount: number, address: string, subtractFee: boolean = false) => {
    try {
        const account = new CryptoAccount(privateKey);

        // Send BTC
        // Комисия 0.00015000 btc
        const txHash = await account.send(address, amount, "BTC", { fee: 15000, subtractFee });
        console.log("sendBitcoin: " + txHash);
        return txHash;
    } catch (error) {
        console.log("sendBitcoinError: " + error);
    }
}

export const sendEth = async (privateKey: string, toAddress: string, amount: number) => {
    try {
        const account = new CryptoAccount(privateKey);

        // Send ETH
        // Комисия 0.0015 eth
        const txHash = await account.send(toAddress, amount, "ETH");

        console.log("sendEth: " + txHash);
        return txHash;
    } catch (error) {
        console.log("sendEthError: " + error);
    }
}

export const sendErc20 = async (privateKey: string, toAddress: string, amount: number, addressContract: string) => {
    try {
        const account = new CryptoAccount(privateKey);

        // Send ERC20
        // Комисия 0.0015 eth
        const txHash = await account.send(toAddress, amount, {
            type: "ERC20",
            address: addressContract,
        });

        console.log("sendErc20: " + txHash);
        return txHash;
    } catch (error) {
        console.log("sendErc20Error: " + error);
    }
}

export const sendTron = async (privateKey: string, addressFrom: string, addressTo: string, amount: number, urlApi = urlApiTronMainnet) => {
    const HttpProvider = TronWeb.providers.HttpProvider;
    let fullNode = new HttpProvider(urlApi);
    let eventServer = new HttpProvider(urlApi);
    let solidityNode = new HttpProvider(urlApi);
    let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
    try {
        amount = valueToSun(amount);
        const tradeobj = await tronWeb.transactionBuilder.sendTrx(tronWeb.address.toHex(addressTo), amount, tronWeb.address.toHex(addressFrom));
        const signedtxn = await tronWeb.trx.sign(tradeobj, privateKey);
        const receipt = await tronWeb.trx.sendRawTransaction(signedtxn);
        if (!receipt.result)
            return new Error('Непредвиденная ошибка sendTron!');
        return receipt;
    } catch (error) {
        return new Error(error);
    }
};

export function valueToSun(value, decimals = 6) {
    value = round(value, decimals);
    value = ethers.utils.parseUnits(`${value}`, decimals);
    return value;
}
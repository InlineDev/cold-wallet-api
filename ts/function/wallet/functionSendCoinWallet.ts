import CryptoAccount from "send-crypto";

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
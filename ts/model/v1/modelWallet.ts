import mongoose from "mongoose";

interface ObjectWalletUser {
    id: number,
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

const walletSchema = new mongoose.Schema<ObjectWalletUser>({
    id: { type: Number },
    mnemonic: { type: String },
    btc: {
        address: { type: String },
        privateKey: { type: String },
    },
    eth: {
        address: { type: String },
        privateKey: { type: String },
    },
    trc: {
        address: { type: String },
        privateKey: { type: String },
    },
});

const WalletUser = mongoose.model<ObjectWalletUser>("WalletUser", walletSchema);

export default WalletUser;
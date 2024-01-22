import { number } from "bitcoinjs-lib/src/script";
import mongoose from "mongoose";

interface ObjectBalanceUser {
    id: number,
    mnemonic: string,
    main: {
        btc: number,
        eth: number,
        usdt: number,
        usdt_erc20: number,
        tron: number,
    }
}

const balanceUserSchema = new mongoose.Schema<ObjectBalanceUser>({
    id: { type: Number },
    mnemonic: { type: String },
    main: {
        btc: { type: Number, default: 0 },
        eth: { type: Number, default: 0 },
        usdt: { type: Number, default: 0 },
        usdt_erc20: { type: Number, default: 0 },
        tron: { type: Number, default: 0 },
    },
});

const BalanceUser = mongoose.model<ObjectBalanceUser>("BalanceUser", balanceUserSchema);

export default BalanceUser;
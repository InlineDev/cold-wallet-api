import { Schema, model, Document } from "mongoose";

// Определяем схему для типа Transaction
const transactionSchema = new Schema({
    hash: { type: String, required: true },
    coin: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
});

type Transaction = {
    hash: string,
    coin: string,
    amount: number,
    date: string,
    type: string,
};

// Определяем интерфейс для типа TransactionUser
interface TransactionUser extends Document {
    id: number,
    mnemonic: string;
    transactions: Transaction[];
}

const transactionUserSchema = new Schema<TransactionUser>({
    id: { type: Number },
    mnemonic: { type: String, required: true },
    transactions: [transactionSchema], // Используем схему для типа Transaction здесь
});

const TransactionUser = model<TransactionUser>("TransactionUsers", transactionUserSchema);

export default TransactionUser;

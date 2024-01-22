import mongoose from "mongoose";

interface ObjectReplenishment {
    idUser: number,
    hash: string,
    hashStartTransaction: string,
    coin: string,
    amount: number,
    time: string,
    senderAddress: string,
    status: string,
    processed: boolean,
}

interface ObjectReplenishmentHash {
    hash: string,
}

interface ObjectReplenishmentСommission {
    idUser: string,
    hashTransferСommission: string,
    amount: number,
    time: string,
    coinSend: string,
    coin: string,
    status: string,
    processed: boolean,
}


const replenishmentSchema = new mongoose.Schema<ObjectReplenishment>({
    idUser: { type: Number, required: true },
    hash: { type: String, required: true },
    hashStartTransaction: { type: String },
    coin: { type: String, required: true },
    amount: { type: Number, required: true },
    senderAddress: { type: String },
    time: { type: String },
    status: { type: String, required: true },
    processed: { type: Boolean, default: false },
});


const replenishmentHashSchema = new mongoose.Schema<ObjectReplenishmentHash>({
    hash: { type: String, required: true },
});

const replenishmentСommissionSchema = new mongoose.Schema<ObjectReplenishmentСommission>({
    idUser: { type: String, required: true },
    hashTransferСommission: { type: String, required: true },
    coinSend: { type: String, required: true },
    coin: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    time: { type: String, required: true },
    processed: { type: Boolean, default: false },
});

const Replenishment = mongoose.model<ObjectReplenishment>("Replenishments", replenishmentSchema);
const ReplenishmentHash = mongoose.model<ObjectReplenishmentHash>("ReplenishmentHashs", replenishmentHashSchema);
const ReplenishmentСommission = mongoose.model<ObjectReplenishmentСommission>("ReplenishmentСommissions", replenishmentСommissionSchema);



export { Replenishment, ReplenishmentHash, ReplenishmentСommission };
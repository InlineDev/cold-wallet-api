import { Schema, model } from "mongoose";

interface ModelUser {
    id: number,
    mnemonic: string,
}

const modelUserSchema = new Schema<ModelUser>({
    id: { type: Number },
    mnemonic: { type: String, required: true },
});

const ModelUser = model<ModelUser>("ModelUsers", modelUserSchema);

export default ModelUser;
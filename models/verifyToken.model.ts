import mongoose from "mongoose";

export enum VerifyTokenType {
    EMAIL = "email",
    PASSWORD_RESET = "password_reset",
}

const verifyTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    type: {
        enum: Object.values(VerifyTokenType),
        required: true
    } as unknown as VerifyTokenType
}, {
    timestamps: true
});

verifyTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type VerifyToken =  mongoose.InferSchemaType<typeof verifyTokenSchema>;

export default mongoose.model("verifyToken", verifyTokenSchema);
import mongoose from "mongoose";

const verifyTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

verifyTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type VerifyToken =  mongoose.InferSchemaType<typeof verifyTokenSchema>;

export default mongoose.model("verifyToken", verifyTokenSchema);
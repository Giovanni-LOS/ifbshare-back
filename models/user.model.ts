import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
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

userSchema.index(
    { createdAt: 1 }, 
    { 
        partialFilterExpression: { verified: false },
        expireAfterSeconds: 60 * 60 * 24 * 365  
    }
);

export type User = mongoose.InferSchemaType<typeof userSchema>;

export default mongoose.model('User', userSchema);
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    content: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    subject: {
        type: String
    },
}, {
    timestamps: true
});

export type User = mongoose.InferSchemaType<typeof postSchema>;

export default mongoose.model('Post', postSchema);
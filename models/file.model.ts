import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    data: {
        type: Buffer,
        required: true
    }
}, {
    timestamps: true
})

export type File = mongoose.InferSchemaType<typeof fileSchema>

export default mongoose.model("file", fileSchema)
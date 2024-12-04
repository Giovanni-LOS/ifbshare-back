import mongoose, { InferSchemaType } from "mongoose";

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    contentType: {
        type: String,
        require: true
    },
    size: {
        type: String,
        require: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    data: {
        type: Buffer,
        require: true
    }
}, {
    timestamps: true
})

export type File = InferSchemaType<typeof fileSchema>

export default mongoose.model("file", fileSchema)
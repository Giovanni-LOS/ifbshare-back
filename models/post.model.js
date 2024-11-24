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
    file: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;
import mongoose, { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    conversations: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'conversations'
        }],
        required: true
    }
})

const User = model('user', userSchema);

export default User;
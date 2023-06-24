import { InferSchemaType, Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const conversationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    },
    conversation: {
        type: [{
            prompt: {
                type: String,
                required: true
            },
            response: {
                type: String,
                required: true
            }
        }],
        required: true, 
        _id: false
    }
});

conversationSchema.plugin(mongooseAggregatePaginate);

const Conversation = model('conversation', conversationSchema);

export type ConversationType = InferSchemaType<typeof conversationSchema>;

export default Conversation;

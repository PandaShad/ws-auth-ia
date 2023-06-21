import { ObjectId } from "mongodb";

export interface IUser {
    _id: ObjectId;
    userName: string;
    email: string;
    password: string;
    conversations: ObjectId[];
}
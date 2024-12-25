import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "./user.schema";
import { Thread } from "./thread.schema";
import { Course } from "./course.schema";


enum PostType {
    REPLY = 'reply',
    QUESTION = 'question',
    ANNOUNCEMENT = 'announcement',
}

@Schema()
export class Post {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    user_id: mongoose.Schema.Types.ObjectId;

    @Prop({type: String, enum: PostType})
    type: string

    
    @Prop({type: String})
    content: string

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => Thread})
    thread_id: mongoose.Schema.Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => Course})
    course_id: mongoose.Schema.Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post)
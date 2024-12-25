import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "./user.schema";
import { Post } from "./post.schema";
import { Course } from "./course.schema";


@Schema()
export class Thread {

    @Prop({type: String})
    title: string;

    @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Post})
    posts: mongoose.Schema.Types.ObjectId[];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    instructor_id: mongoose.Schema.Types.ObjectId;
    
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    createdBy: mongoose.Schema.Types.ObjectId;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => Course})
    course_id: mongoose.Schema.Types.ObjectId;

    @Prop({type: [mongoose.Schema.Types.ObjectId], ref: () => User, default: []})
    EnvolvedUsers_ids: mongoose.Schema.Types.ObjectId[];
    
}

export const ThreadSchema = SchemaFactory.createForClass(Thread)
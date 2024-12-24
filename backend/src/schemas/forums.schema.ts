import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "./user.schema";
import { Thread } from "./thread.schema";
import { Course } from "./course.schema";


@Schema()
export class Forum {

    @Prop({type: String})
    title: string;

    @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Thread})
    threads: mongoose.Schema.Types.ObjectId[];

    @Prop({default: [], type: mongoose.Schema.Types.ObjectId, ref: () => Course})
    course_id: mongoose.Schema.Types.ObjectId


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    instructor_id: mongoose.Schema.Types.ObjectId

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    createdby: mongoose.Schema.Types.ObjectId
}

export const ForumSchema = SchemaFactory.createForClass(Forum)
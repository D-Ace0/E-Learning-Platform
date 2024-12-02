import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { User } from "./user.schema";
import { Post } from "./post.schema";


@Schema()
export class Thread {
    @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Post})
    posts: mongoose.Schema.Types.ObjectId[];

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    instructor_id: string
}

export const ThreadSchema = SchemaFactory.createForClass(Thread)
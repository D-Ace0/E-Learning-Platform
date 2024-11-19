import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type CourseDocument = Course & Document;

enum difficulty_levels{
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}

@Schema()
export class Course{

    @Prop({required:true,unique:true})
    course_id: string

    @Prop({required:true})
    title:string

    @Prop({required:true})
    description:string

    @Prop({required:true})
    category:string

    @Prop({required:true,enum: difficulty_levels})
    difficulty_level:string

    @Prop({type:mongoose.Schema.Types.ObjectId, ref: User})
    created_by:string

    @Prop({required:true,default:Date.now})
    created_at:Date
}

export const CourseSchema = SchemaFactory.createForClass(Course);

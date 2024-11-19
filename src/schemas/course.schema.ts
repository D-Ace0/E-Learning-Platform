<<<<<<< HEAD
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
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

enum difficulty_levels {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

@Schema()
export class Course {
  @Prop({ unique: true })
  course_id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ enum: difficulty_levels })
  difficulty_level: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  created_by: string;

  @Prop({ default: Date.now })
  created_at: Date;
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9
}

export const CourseSchema = SchemaFactory.createForClass(Course);

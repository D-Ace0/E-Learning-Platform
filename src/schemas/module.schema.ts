<<<<<<< HEAD
import {Schema, Prop, SchemaFactory} from '@nestjs/mongoose'
import { Course } from './course.schema'
import mongoose, { Document } from 'mongoose'
=======
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Course } from './course.schema';
import { Document } from 'mongoose';
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

export type ModuleDocument = Module & Document;

@Schema()
export class Module {
<<<<<<< HEAD
    @Prop({required:true,unique: true})
    module_id:string
=======
  @Prop({ unique: true })
  module_id: string;
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course })
  course_id: string;

<<<<<<< HEAD
    @Prop({required:true})
    title:string

    @Prop({required:true})
    content:string

    @Prop({required:true})
    resources?:string[]

    @Prop({required:true,default:Date.now})
    created_at:Date
=======
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  resources?: string[];

  @Prop({ default: Date.now })
  created_at: Date;
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

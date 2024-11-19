<<<<<<< HEAD
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose, { Document } from 'mongoose'
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Module } from './module.schema';
import { Document } from 'mongoose';
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

export type QuizDocument = Quiz & Document;

@Schema()
export class Quiz {
  @Prop({ unique: true })
  quiz_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Module })
  module_id: string;

<<<<<<< HEAD
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Module})
    module_id:string

    @Prop({required:true})
    questions:string[]

    @Prop({required:true,default:Date.now})
    created_at:Date
=======
  @Prop()
  questions: string[];
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

  @Prop({ default: Date.now })
  created_at: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose from 'mongoose'
import { Course } from './courses.schema';

export type QuizDocument = Quiz & Document

@Schema()
export class Quiz {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Module } as PropOptions)
  module_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId
  @Prop({ required: true, type: [String] })
  questions: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date
}

export const QuizSchema = SchemaFactory.createForClass(Quiz)

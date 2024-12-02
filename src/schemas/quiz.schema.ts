import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose from 'mongoose'
import { Question } from './question.schema'

export type QuizDocument = Quiz & Document

@Schema()
export class Quiz {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Module})
  module_id: mongoose.Types.ObjectId

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: () => Question })
  questions: Question[]

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date
}

export const QuizSchema = SchemaFactory.createForClass(Quiz)
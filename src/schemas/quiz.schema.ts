import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose from 'mongoose'

//export type QuizDocument = quiz & Document

@Schema()
export class quiz {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Module })
  module_id: mongoose.Types.ObjectId

  @Prop({ required: true })
  questions: string[]

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date
}

export const QuizSchema = SchemaFactory.createForClass(quiz)

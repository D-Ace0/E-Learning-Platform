import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from 'src/module/models/module.schema'
import mongoose, { HydratedDocument } from 'mongoose'

export type QuizDocument = HydratedDocument<Quiz>

@Schema()
export class Quiz {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Module } as PropOptions)
  module_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: [String] })
  questions: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date
}

export const QuizSchema = SchemaFactory.createForClass(Quiz)

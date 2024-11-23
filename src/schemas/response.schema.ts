import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Quiz } from './quiz.schema'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type ResponseDocument = Response & Document

@Schema()
export class Respose {
  @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
  response_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Quiz })
  quiz_id: mongoose.Types.ObjectId

  @Prop({ unique: true })
  answers: string[]

  @Prop({ unique: true })
  score: string

  @Prop({ required: true, type: Date, default: Date.now })
  submitted_at: Date
}

export const ResponseSchema = SchemaFactory.createForClass(Response)

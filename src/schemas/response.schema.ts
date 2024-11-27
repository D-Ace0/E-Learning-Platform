import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Quiz } from './quiz.schema'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type ResponseDocument = Response & Document

@Schema()
export class Response {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Quiz } as PropOptions)
  quiz_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: [Object]})
  answers: Object[]

  @Prop({required: true, type: Number})
  score: number

  @Prop({ required: false, type: Date, default: Date.now })
  submitted_at?: Date
}

export const ResponseSchema = SchemaFactory.createForClass(Response)

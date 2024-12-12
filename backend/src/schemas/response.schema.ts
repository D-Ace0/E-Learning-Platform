import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Quiz } from './quiz.schema'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type ResponseDocument = Response & Document

@Schema()
export class Response {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Schema.Types.ObjectId

  @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Quiz})
  quiz_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: [Object]})
  answers: Object[]

  @Prop({required: true, type: Number})
  score: number

  @Prop({ required: false, type: Date, default: Date.now })
  submitted_at?: Date
}

export const ResponseSchema = SchemaFactory.createForClass(Response)

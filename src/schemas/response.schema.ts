import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Quiz } from './quiz.schema'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'

export type ResponseDocument = Response & Document

@Schema()
export class Respose {
  @Prop({ unique:true })
  response_id:string

  @Prop({ type:mongoose.Schema.Types.ObjectId, ref:User })
  user_id:string

  @Prop({ type:mongoose.Schema.Types.ObjectId, ref:Quiz })
  quiz_id:string

  @Prop({ unique: true })
  answers:string[]

  @Prop({ unique: true })
  score:string

  @Prop({ unique:true, default:Date.now })
  submitted_at:Date
}

export const ResponseSchema = SchemaFactory.createForClass(Response)

import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import { Course } from './course.schema'
import mongoose, { Document } from 'mongoose'
import { Question } from './question.schema'

export type ModuleDocument = Module & Document

@Schema()
export class Module {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: String })
  title: string

  @Prop({ required: true, type: String})
  content: string

  @Prop({ required: true, type: [String]})
  resources?: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }] })
  questions?: Question[]
}

export const ModuleSchema = SchemaFactory.createForClass(Module)


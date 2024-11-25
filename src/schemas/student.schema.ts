import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose'
import { User } from './user.schema'
import { Course } from './course.schema'

export type StudentSchemaDocument = Student & Document

@Schema()
export class Student {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId

  @Prop()
  StudentName: string

  @Prop()
  StudentEmail: string
}

export const StudentSchema =
  SchemaFactory.createForClass(Student)

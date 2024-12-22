import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose';
import { Course } from './course.schema'



export type UserDocument = User & Document

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

@Schema()
export class User {

  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password_hash: string

  @Prop({ required: true, enum: UserRole })
  role: string
 
  @Prop({ required: false })
  profile_picture_url?: string

  @Prop({required: true})
  age: number

  @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Course})
  courses: Course[];

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date

  @Prop({ required: false })
  mfa_secret?: string

  @Prop({ required: false, default: false })
  mfa_enabled?: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)

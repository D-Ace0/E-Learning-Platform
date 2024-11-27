import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose';
import { Course } from './courses.schema'

export type UserDocument = User & Document

export enum user_role {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

@Schema()
export class User {

  @Prop({ required: true, type: String  })
  name: string

  @Prop({ required: true, type: String })
  email: string

  @Prop({ required: true, type: String })
  password_hash: string

  @Prop({ required: true, type: String, enum: user_role })
  role: string

  @Prop({ required: false, type: String})
  profile_picture_url?: string

  @Prop({ required: true, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ required: false, default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Course} as PropOptions)
  courses?: mongoose.Schema.Types.ObjectId[]

  @Prop({ required: false, type: String })
  mfa_secret?: string

  @Prop({ required: false, default: false, type: Boolean })
  mfa_enabled?: boolean

  @Prop({ required: true, type: [String] })
  Interested?: string[]
}

export const UserSchema = SchemaFactory.createForClass(User)

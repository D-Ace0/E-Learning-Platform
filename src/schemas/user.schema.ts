import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document

export enum user_role {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

@Schema()
export class User {

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  password_hash: string

  @Prop({ required: true, enum: user_role })
  role: string

  @Prop({ required: false })
  profile_picture_url?: string

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date

  @Prop({ required: false })
  mfa_secret?: string

  @Prop({ required: false, default: false })
  mfa_enabled?: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)

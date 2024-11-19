import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose';

export type AuthenticationLogDocument = AuthenticationLog & Document;

export enum AuthenticationStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

@Schema()
export class AuthenticationLog {
  @Prop({ required:true })
  log_id: string

  @Prop({ required:true })
  user_id: string

  @Prop({ required:true })
  event: string

  @Prop({ default:Date.now })
  timestamp: Date

  @Prop({ required:true, enum:AuthenticationStatus })
  status: AuthenticationStatus
}

export const AuthenticationLogSchema =
  SchemaFactory.createForClass(AuthenticationLog)

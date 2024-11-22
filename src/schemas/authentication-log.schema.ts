import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type AuthenticationLogDocument = AuthenticationLog & Document;

export enum AuthenticationStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

@Schema()
export class AuthenticationLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
  log_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true })
  event: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ required: true, enum: AuthenticationStatus })
  status: AuthenticationStatus;
}

export const AuthenticationLogSchema =
  SchemaFactory.createForClass(AuthenticationLog);

import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { User } from '../user/models/user.schema'

export type AuthenticationLogDocument = HydratedDocument<AuthenticationLog>

export enum AuthenticationStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

@Schema()
export class AuthenticationLog {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: String })
  event: string

  @Prop({ required: false, type: Date, default: Date.now })
  timestamp?: Date

  @Prop({ required: true, enum: AuthenticationStatus, type: String })
  status: string
}

export const AuthenticationLogSchema = SchemaFactory.createForClass(AuthenticationLog)

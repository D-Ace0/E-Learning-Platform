import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type AuthenticationLogDocument = AuthenticationLog & Document;

export enum AuthenticationStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
  PENDING_MFA = 'Pending MFA',
  FAILED = 'Failed',
}

@Schema()
export class AuthenticationLog {

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user_id: mongoose.Types.ObjectId | null;  // Made optional (nullable)

  @Prop({ required: true, type: String })
  email: string;  // Email for identification (optional)

  @Prop({ required: true, type: String })
  event: string;  // Event description (e.g., 'Login', 'MFA', etc.)

  @Prop({ required: false, type: Date, default: Date.now })
  timestamp?: Date;  // Timestamp of the log entry

  @Prop({ required: true, enum: AuthenticationStatus, type: String })
  status: AuthenticationStatus;  // Status of the event (Success, Failure, Pending MFA)

  @Prop({ required: true, type: String })
  message: string;  // Detailed message (e.g., 'Login successful', 'Invalid MFA token', etc.)
}

export const AuthenticationLogSchema = SchemaFactory.createForClass(AuthenticationLog);

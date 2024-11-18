import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

@Schema()
export class User {
  @Prop({ unique: true })
  user_id: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password_hash: string;

  @Prop({ enum: UserRole })
  role: string;

  @Prop()
  profile_picture_url?: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

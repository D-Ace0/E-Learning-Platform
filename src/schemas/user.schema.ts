import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

enum UserRole {
<<<<<<< HEAD
    STUDENT = "student",
    INSTRUCTOR = "instructor",
    ADMIN = "admin"
}

@Schema()
export class User{
    
    @Prop({required:true,unique:true})
    user_id:string

    @Prop({required:true})
    name:string

    @Prop({required:true})
    email:string

    @Prop({required:true})
    password_hash:string

    @Prop({required:true,enum:UserRole})
    role:string

    @Prop({required:true})
    profile_picture_url?:string

    @Prop({required:true,default:Date.now})
    created_at:Date
=======
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
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9
}

export const UserSchema = SchemaFactory.createForClass(User);

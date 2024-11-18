import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose"

export type UserDocument = User & Document;

enum UserRole {
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
}

export const UserSchema = SchemaFactory.createForClass(User)
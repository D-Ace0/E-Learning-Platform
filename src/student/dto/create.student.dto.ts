
import { IsString, IsNotEmpty, IsArray, IsDate, IsOptional, IsMongoId } from 'class-validator'
import mongoose from 'mongoose'

export class createStudentDto {

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  password_hash: string

  @IsOptional()
  @IsString()
  profile_picture_url?: string

  @IsOptional()
  @IsDate()
  created_at?: Date

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  courses_taking?: mongoose.Schema.Types.ObjectId[]
  
}

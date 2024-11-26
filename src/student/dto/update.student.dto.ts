import { IsString, IsOptional, IsUrl, IsDate, IsEmail, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'


export class updateStudentDto {

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  password_hash?: string

  @IsOptional()
  @IsString()
  @IsUrl()
  profile_picture_url?: string

  @IsOptional()
  @IsDate()
  created_at?: Date

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  courses_taking?: mongoose.Schema.Types.ObjectId[]
  
}


import { IsString, IsNotEmpty, IsArray, IsDate, IsOptional, IsMongoId } from 'class-validator'
import mongoose from 'mongoose'

export class createUserDto {

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
  courses?: mongoose.Schema.Types.ObjectId[]
  
}

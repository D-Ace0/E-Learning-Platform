
import { IsString, IsNotEmpty, IsEnum, IsArray, IsDate, IsOptional, IsBoolean, IsMongoId } from 'class-validator'
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

  @IsNotEmpty()
  @IsEnum(['student', 'instructor', 'admin'])
  role: string

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

  @IsOptional()
  @IsString()
  mfa_secret?: string

  @IsOptional()
  @IsBoolean()
  mfa_enabled?: boolean
  
}

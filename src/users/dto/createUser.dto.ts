
import { IsString, IsNotEmpty, IsEnum, IsMongoId, IsDate, IsOptional, IsBoolean } from 'class-validator'
import mongoose from 'mongoose'

export class createUserDto {
  
  @IsOptional()
  @IsMongoId()
  user_id?: mongoose.Types.ObjectId

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
  @IsString()
  mfa_secret?: string

  @IsOptional()
  @IsBoolean()
  mfa_enabled?: boolean
}

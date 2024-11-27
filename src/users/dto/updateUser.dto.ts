import { IsString, IsOptional, IsUrl, IsEnum, IsDate, IsEmail, IsBoolean, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'


export class updateUserDto {

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
  @IsEnum(['student', 'instructor', 'admin'])
  role?: string

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
  courses?: mongoose.Schema.Types.ObjectId[]

  @IsOptional()
  @IsString()
  mfa_secret?: string

  @IsOptional()
  @IsBoolean()
  mfa_enabled?: boolean
}

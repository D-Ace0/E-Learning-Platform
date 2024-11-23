import { IsString, IsOptional, IsUrl, IsEnum, IsDate, IsEmail, IsBoolean } from 'class-validator'

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
  @IsEnum(['student', 'instructor', 'admin'])
  role?: string

  @IsOptional()
  @IsUrl()
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

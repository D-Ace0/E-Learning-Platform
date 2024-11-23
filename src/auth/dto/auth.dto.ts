import { IsEmail, IsOptional, IsString } from 'class-validator'

export class AuthPayloadDTO {
  @IsEmail()
  email: string

  @IsString()
  password: string
  
  @IsOptional() 
  mfaToken?: string
}
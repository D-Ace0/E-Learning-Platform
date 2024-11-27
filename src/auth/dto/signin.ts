import { IsEmail, IsOptional, IsString } from 'class-validator'

export class SignInDTO {
  @IsEmail()
  email: string

  @IsString()
  password: string
  
  @IsOptional() 
  mfaToken?: string
}
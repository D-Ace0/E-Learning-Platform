import { IsEmail, IsString } from 'class-validator';

export class AuthPayloadDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

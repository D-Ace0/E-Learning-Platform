import { IsEmail, IsString, MinLength, IsIn, MaxLength } from 'class-validator';

export class SignupDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['student', 'instructor', 'admin'])
  role: string;

  @IsString()
  @MaxLength(10)
  user_id: string;
}

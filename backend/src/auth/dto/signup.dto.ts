import { IsEmail, IsString, MinLength, IsIn, MaxLength, IsNotEmpty, isNumber, IsNumber } from 'class-validator'

export class SignupDTO {
  @IsString()
  name: string

  @IsEmail()
  email: string

  courses?: string[]=[]

  @IsNumber()
  age: number

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @IsIn(['student', 'instructor'])
  role?: string='student'
}

import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator'
import { Types } from 'mongoose'

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  quiz_id: string

  @IsString()
  @IsNotEmpty()
  module_id: Types.ObjectId

  @IsArray()
  @IsNotEmpty({ each: true })
  questions: string[]

  @IsNotEmpty()
  user_id: Types.ObjectId

  @IsNotEmpty()
  course_id: Types.ObjectId
}

export class UpdateQuizDto {
  @IsString()
  @IsNotEmpty()
  readonly quiz_id: string

  @IsArray()
  @IsNotEmpty({ each: true })
  readonly questions: string[]
}
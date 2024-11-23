import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId, IsDate } from 'class-validator'
import mongoose from 'mongoose'

export class createQuizDto{

  @IsOptional()
  @IsMongoId()
  quiz_id?: mongoose.Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  module_id: mongoose.Types.ObjectId

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  questions: string[]

  @IsOptional()
  @IsDate()
  created_at?: Date
}

import { IsString, IsOptional, IsDate, IsNotEmpty, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'

export class updateQuizDto{

  @IsOptional()
  @IsMongoId()
  module_id?: mongoose.Types.ObjectId

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[]

  @IsNotEmpty()
  @IsDate()
  created_at?: Date

}
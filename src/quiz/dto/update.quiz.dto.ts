import { IsString, IsOptional, IsDate, IsNotEmpty, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'

export class UpdateQuizDto{

  @IsOptional()
  @IsMongoId()
  module_id?: mongoose.Types.ObjectId

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[]

  @IsOptional()
  @IsDate()
  created_at?: Date

}
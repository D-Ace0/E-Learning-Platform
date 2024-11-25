import { IsString, IsOptional, IsDate, IsNotEmpty, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'

export class UpdateModuleDto{

  @IsOptional()
  @IsMongoId()
  course_id?: mongoose.Types.ObjectId

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[]

  @IsOptional()
  @IsDate()
  created_at?: Date
}
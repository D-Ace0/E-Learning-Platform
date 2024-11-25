import { IsString, IsOptional, IsEnum, IsArray, IsMongoId, IsDate } from 'class-validator'
import mongoose from 'mongoose'

export class UpdateCourseDto {

  @IsOptional()
  @IsString()
  code?: string
  
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  category?: string
  
  @IsOptional()
  @IsString()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: string


  @IsOptional()
  @IsString()
  created_by?: string

  @IsOptional()
  @IsMongoId()
  created_by_id?: mongoose.Types.ObjectId

  @IsOptional()
  @IsDate()
  created_at?: Date

  @IsOptional()
  @IsString()
  video?: string

  @IsOptional()
  @IsString()
  pdf?: string

  @IsOptional()
  @IsMongoId()
  parent_course_id?: mongoose.Types.ObjectId
  
}

import { IsString, IsOptional, IsEnum, IsArray, IsMongoId, IsDate } from 'class-validator'
import mongoose from 'mongoose'

export class updateCourseDto {
  
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
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: string

  @IsOptional()
  @IsMongoId()
  created_by?: mongoose.Types.ObjectId

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

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  enrolled_students?: mongoose.Schema.Types.ObjectId[]
}

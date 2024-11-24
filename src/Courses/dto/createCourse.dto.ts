
import { IsString, IsNotEmpty, IsEnum, IsUrl, IsMongoId, IsDate, IsArray, IsOptional } from 'class-validator'
import mongoose from 'mongoose'

export class createCourseDto {
  
  @IsNotEmpty()
  @IsString()
  code: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsString()
  category: string

  @IsNotEmpty()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level: string

  @IsNotEmpty()
  @IsString()
  created_by: string

  @IsNotEmpty()
  @IsMongoId()
  created_by_id: mongoose.Types.ObjectId

  @IsOptional()
  @IsDate()
  created_at?: Date

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  video: string

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  pdf: string

  @IsOptional()
  @IsMongoId()
  parent_course_id?: mongoose.Types.ObjectId

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  enrolled_students?: mongoose.Schema.Types.ObjectId[]

}

import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId, IsDate } from 'class-validator';
import mongoose from 'mongoose';

export class createModuleDto{

  @IsNotEmpty()
  @IsMongoId()
  module_id: mongoose.Types.ObjectId

  @IsNotEmpty()
  @IsMongoId()
  course_id: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsString({ each: true })
  title: string

  @IsNotEmpty()
  @IsString()
  content: string

  @IsArray()
  @IsString({ each: true })
  resources?: string[]

  @IsNotEmpty()
  @IsDate()
  created_at: Date
}

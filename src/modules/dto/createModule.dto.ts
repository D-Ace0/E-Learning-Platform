import { IsNotEmpty, IsString, IsArray, IsMongoId, IsDate, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class createModuleDto{

  @IsOptional()
  @IsMongoId()
  module_id?: mongoose.Types.ObjectId

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
  @IsArray()
  @IsString({ each: true })
  resources?: string[]

  @IsOptional()
  @IsDate()
  created_at?: Date
}

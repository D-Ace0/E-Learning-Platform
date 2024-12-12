import { IsNotEmpty, IsString, IsArray, IsMongoId, IsDate, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class createModuleDto{

  @IsNotEmpty()
  @IsMongoId()
  course_id: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  content: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[]

  @IsOptional()
  @IsDate()
  created_at?: Date
}

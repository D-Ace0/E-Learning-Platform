import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class createModuleDto{

  @IsNotEmpty()
  @IsMongoId()
  quiz_id: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  module_id: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  questions: string[];

  @IsNotEmpty()
  created_at: Date;
}

import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId, IsDate, IsNumber, IsIn, IsPositive } from 'class-validator'
import mongoose from 'mongoose'

export class createQuizDto{

  @IsNotEmpty()
  @IsMongoId()
  module_id: mongoose.Types.ObjectId

  @IsNumber()
  @IsPositive()
  questionCount: number;

  @IsIn(['MCQ', 'True/False'])
  questionType: string; 

  @IsOptional()
  @IsDate()
  created_at?: Date
}

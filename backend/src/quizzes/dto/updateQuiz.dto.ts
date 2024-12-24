import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn, IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class updateQuizDto {
  @IsOptional()
  @IsMongoId()
  module_id?: mongoose.Types.ObjectId; // Optional, as it might not always change

  @IsOptional()
  @IsNumber()
  questionCount?: number; // Number of questions to include in the quiz

  @IsOptional()
  @IsIn(['MCQ', 'True/False'])
  questionType?: string; // Type of questions for the quiz (MCQ or True/False)

}

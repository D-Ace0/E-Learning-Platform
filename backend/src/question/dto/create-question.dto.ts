import { IsNotEmpty, IsString, IsIn, IsArray, IsOptional } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  answer: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsNotEmpty()
  @IsString()
  @IsIn(['MCQ', 'True/False'])
  type: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: string;

  @IsNotEmpty()
  @IsString()
  module_id: string;
} 
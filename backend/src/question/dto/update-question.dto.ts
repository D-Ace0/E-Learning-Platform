import { IsOptional, IsString, IsIn, Matches, IsArray } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;
}

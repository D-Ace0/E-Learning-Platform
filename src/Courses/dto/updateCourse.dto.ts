import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  newContent?: string;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: string

  @IsString()
  video?: string

  @IsString()
  pdf?: string
}
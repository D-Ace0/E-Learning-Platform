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

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level?: string

  @IsOptional()
  @IsString()
  video?: string

  @IsOptional()
  @IsString()
  pdf?: string

  @IsOptional()
  isOutdated: boolean;
}
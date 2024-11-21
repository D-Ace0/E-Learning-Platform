
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty_level: string;
}

import { IsArray, IsString, ValidateNested, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SubmittedAnswer {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayNotEmpty() // Ensures the array is not empty
  @ArrayMinSize(1) // Ensures at least one answer is provided
  @ValidateNested({ each: true }) // Validates each object in the array
  @Type(() => SubmittedAnswer) // Transform array elements into `SubmittedAnswer` objects
  answers: SubmittedAnswer[];
}

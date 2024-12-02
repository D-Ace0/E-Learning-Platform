import { IsArray, IsString, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitQuizDto {
  @IsArray()
//   @ArrayNotEmpty()
//   @ArrayMinSize(1) 
//   @Type(() => String)
  answers: string[];
}

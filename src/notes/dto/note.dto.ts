import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteDTO {
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsOptional()
  course_id?: Types.ObjectId;
}

export class UpdateNoteDTO {
  @IsString()
  readonly content: string;
}

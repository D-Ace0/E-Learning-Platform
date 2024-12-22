import { IsString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteDTO {
  @IsString()
  @IsNotEmpty()
  module_id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateNoteDTO {
  @IsString()
  content: string;
}

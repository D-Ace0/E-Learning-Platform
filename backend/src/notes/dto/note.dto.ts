import { Types } from 'mongoose';
import { IsMongoId, IsString, IsNotEmpty } from 'class-validator';


export class CreateNoteDTO {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string; // Add this field to represent the user

  @IsMongoId()
  @IsNotEmpty()
  module_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}



export class UpdateNoteDTO {
  @IsString()
  content: string;
}

import { IsString } from 'class-validator';

export class CreateNoteDTO {
  @IsString()
  readonly module_id: string;

  @IsString()
  readonly content: string;
}

export class UpdateNoteDTO {
  @IsString()
  readonly content: string;
}

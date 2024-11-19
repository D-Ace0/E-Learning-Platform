import { IsString, IsOptional } from 'class-validator';

export class CreateNoteDTO {
  @IsString()
  readonly module_id: string;

  @IsString()
  readonly content: string;

  @IsString()
  readonly user_id: string;

  @IsString()
  @IsOptional()
  readonly course_id?: string;
}

export class UpdateNoteDTO {
  @IsString()
  readonly content: string;
}

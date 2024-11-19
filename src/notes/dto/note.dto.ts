export class CreateNoteDTO {
  readonly module_id: string;
  readonly content: string;
}

export class UpdateNoteDTO {
  readonly content: string;
}

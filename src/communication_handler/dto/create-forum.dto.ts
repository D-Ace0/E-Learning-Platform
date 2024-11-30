import { IsNotEmpty, IsString } from 'class-validator';

export class CreateForumDto {
  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}

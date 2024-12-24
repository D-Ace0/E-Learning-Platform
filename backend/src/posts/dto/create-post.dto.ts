import { IsString, IsNotEmpty, IsEnum, IsMongoId } from 'class-validator';

enum PostType {
  REPLY = 'reply',
  QUESTION = 'question',
  ANNOUNCEMENT = 'announcement',
}

export class CreatePostDto {

  @IsEnum(PostType)
  @IsNotEmpty()
  type: PostType;

  @IsString()
  @IsNotEmpty()
  content: string;
}

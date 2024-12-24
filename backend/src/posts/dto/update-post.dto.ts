import { IsString, IsNotEmpty, IsEnum, IsMongoId, IsOptional } from 'class-validator';

enum PostType {
  REPLY = 'reply',
  QUESTION = 'question',
  ANNOUNCEMENT = 'announcement',
}

export class UpdatePostDto {

@IsEnum(PostType)
@IsOptional()
type?: PostType;

@IsString()
@IsOptional()
content?: string;
}

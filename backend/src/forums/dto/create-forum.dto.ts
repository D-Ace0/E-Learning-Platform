import { IsString, IsNotEmpty, IsEnum, IsUrl, IsMongoId, IsOptional } from 'class-validator';

export class CreateForumDto {
    
      @IsString()
      @IsOptional()
      threads?: string;

      @IsString()
      title: string;
}

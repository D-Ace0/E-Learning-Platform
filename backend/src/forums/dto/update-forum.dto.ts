import { IsString, IsNotEmpty, IsEnum, IsUrl, IsMongoId, IsOptional } from 'class-validator';

export class UpdateForumDto {
    
      @IsString()
      @IsOptional()
      threads: string;
}

import { IsString, IsNotEmpty, IsEnum, IsUrl, IsMongoId, IsOptional } from 'class-validator';

export class CreateThreadDto {
    
      @IsString()
      @IsOptional()
      posts?: string;

      @IsString()
      title: string;

      
}

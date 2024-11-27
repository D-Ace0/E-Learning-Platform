// update-profile.dto.ts
import { IsOptional, IsString, IsEmail, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  profile_picture_url?: string;
}

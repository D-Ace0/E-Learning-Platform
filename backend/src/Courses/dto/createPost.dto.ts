import { IsEnum, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDTO {

    @IsString()
    @IsEnum(['reply', 'question', 'announcement'])
    type: string

    @IsString()
    content: string

}

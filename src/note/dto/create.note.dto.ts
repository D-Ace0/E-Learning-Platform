import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsDate } from 'class-validator'
import mongoose, { Document } from 'mongoose'

export class CreateNoteDto {

    @IsNotEmpty()
    @IsMongoId()
    user_id: mongoose.Schema.Types.ObjectId

    @IsOptional()
    @IsMongoId()
    course_id?: mongoose.Schema.Types.ObjectId
    
    @IsNotEmpty()
    @IsString()
    content: string
  
    @IsOptional()
    @IsDate()
    created_at?: Date

    @IsOptional()
    @IsDate()
    last_updated?: Date

}
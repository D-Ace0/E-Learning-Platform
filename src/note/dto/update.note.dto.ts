import { IsString, IsDate, IsOptional, IsMongoId } from 'class-validator'
import mongoose, { Document } from 'mongoose'

export class UpdateNoteDto {

    @IsOptional()
    @IsMongoId()
    user_id: mongoose.Schema.Types.ObjectId

    @IsOptional()
    @IsMongoId()
    course_id?: mongoose.Schema.Types.ObjectId
    
    @IsOptional()
    @IsString()
    content: string
  
    @IsOptional()
    @IsDate()
    created_at?: Date

    @IsOptional()
    @IsDate()
    last_updated?: Date
  }
  
import { IsNotEmpty, IsString, IsArray, IsOptional, IsMongoId, IsDate } from 'class-validator'
import mongoose from 'mongoose'

export class createQuizDto{

  @IsNotEmpty()
  @IsMongoId()
  module_id: mongoose.Types.ObjectId

  @IsOptional()
  @IsDate()
  created_at?: Date
}

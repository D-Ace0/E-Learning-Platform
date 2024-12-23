import { IsString, IsOptional, IsDate, IsNotEmpty, IsMongoId, IsArray } from 'class-validator'
import mongoose from 'mongoose'

export class updateQuizDto{

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  questions?: string[]

}
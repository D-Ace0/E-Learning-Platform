import { IsString, IsNotEmpty, IsEnum, IsUrl, IsArray, IsMongoId, IsEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateThreadDTO {

    posts?: string[]

}
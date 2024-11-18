import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose, { Document } from 'mongoose'

export type QuizDocument = Quiz & Document;

@Schema()
export class Quiz{

    @Prop({unique:true})
    quiz_id:string 

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Module})
    module_id:string

    @Prop({required:true})
    questions:string[]

    @Prop({required:true,default:Date.now})
    created_at:Date

}

export const QuizSchema = SchemaFactory.createForClass(Quiz)



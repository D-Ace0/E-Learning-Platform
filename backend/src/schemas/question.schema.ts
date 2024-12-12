import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose from 'mongoose'

export type QuestionDocument = Question & Document


enum DifficultyLevel {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
  }

@Schema()
export class Question {

    @Prop({type: String, required: true})
    question: string

    @Prop({type: String, required: true})
    answer: string

    @Prop({ type: String, required: true, enum: DifficultyLevel })
    difficulty: DifficultyLevel;
}

export const QuestionSchema = SchemaFactory.createForClass(Question)
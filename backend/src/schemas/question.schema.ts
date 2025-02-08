import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Module } from './module.schema'
import mongoose from 'mongoose'
import { User } from './user.schema'

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

    @Prop({ required: false, type: [String] }) // Optional for 'MCQ' questions
    options?: string[];

    @Prop({ required: true, type: String }) // e.g., 'MCQ' or 'True/False'
    type: string;

    @Prop({ type: String, required: true, enum: DifficultyLevel })
    difficulty: DifficultyLevel;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => User})
    created_by: mongoose.Schema.Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question)
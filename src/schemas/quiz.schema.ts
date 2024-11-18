import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Module } from './module.schema';
import { Document } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema()
export class Quiz {
  @Prop({ unique: true })
  quiz_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Module })
  module_id: string;

  @Prop()
  questions: string[];

  @Prop({ default: Date.now })
  created_at: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

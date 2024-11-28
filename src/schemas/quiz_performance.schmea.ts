import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'

export type QuizPerformanceDocument = QuizPerformance & Document


@Schema()
export class QuizPerformance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
  quiz_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  student_id: mongoose.Types.ObjectId

  @Prop({ type: Number, required: true })
  score: number // for examplew 80%

  @Prop({ type: [String], required: true })
  answers: string[] // User's submitted answers

  @Prop({ required: true, type: Date, default: Date.now })
  attempted_at: Date
}

export const QuizPerformanceSchema =
  SchemaFactory.createForClass(QuizPerformance);

import { Prop, PropOptions, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { Student } from './student.schema'
import { Quiz } from './quiz.schema'
import { Question } from './question.schema'

export type QuizSelectionDocument = QuizSelection & Document


@Schema()
export class QuizSelection {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Student })
    student_id: mongoose.Types.ObjectId

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Quiz })
    quiz_id: mongoose.Types.ObjectId

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: () => Question })
    questions: Question[]
}

export const QuizSelectionSchema = SchemaFactory.createForClass(QuizSelection)
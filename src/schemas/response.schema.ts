import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Quiz } from './quiz.schema';
import { User } from './user.schema';
import { Document } from 'mongoose';

export type ResponseDocument = Response & Document;

@Schema()
export class Respose {
  @Prop({ unique: true })
  response_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  user_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Quiz })
  quiz_id: string;

  @Prop()
  answers: string[];

  @Prop()
  score: string;

  @Prop({ default: Date.now })
  submitted_at: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);

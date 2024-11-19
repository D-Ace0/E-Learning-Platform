<<<<<<< HEAD
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Quiz } from './quiz.schema'
import { User } from './user.schema'
import mongoose, { Document } from 'mongoose'
=======
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Quiz } from './quiz.schema';
import { User } from './user.schema';
import { Document } from 'mongoose';
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

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

<<<<<<< HEAD
    @Prop({unique:true})
    answers:string[]

    @Prop({unique:true})
    score:string

    @Prop({unique:true,default:Date.now})
    submitted_at:Date
=======
  @Prop()
  score: string;
>>>>>>> ab0118602bca050b8f1bd42c51f9966b1c1254c9

  @Prop({ default: Date.now })
  submitted_at: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Course } from './course.schema';
import { Document } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema()
export class Module {
  @Prop({ unique: true })
  module_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course })
  course_id: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  resources?: string[];

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

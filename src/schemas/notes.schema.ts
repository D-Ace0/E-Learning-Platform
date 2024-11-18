import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema()
export class Note {
  @Prop({ required: true })
  module_id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

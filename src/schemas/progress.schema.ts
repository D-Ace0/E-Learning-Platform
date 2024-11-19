import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'progress' }) // Optional: Specify the collection name
export class Progress extends Document {
  @Prop({ required: true, unique: true }) // Ensures the ID is unique
  progressId: string;

  @Prop({ required: true }) // Required field
  userId: string;

  @Prop({ required: true }) // Required field
  courseId: string;

  @Prop({ required: true, type: Number, min: 0, max: 100 }) // Float value with range
  completionPercentage: number;

  @Prop({ required: true, type: Date, default: Date.now }) // Default to current time
  lastAccessed: Date;
}

// Generate the schema
export const ProgressSchema = SchemaFactory.createForClass(Progress);
